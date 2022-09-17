import { FFT } from "./ext/fft.js";

registerProcessor('power-spectrum', class extends AudioWorkletProcessor {

    _buffer
    _bufferSize
    _fftSize
    _blockPos

    constructor () {
      super();
      console.log(['Sample Rate',sampleRate])
      // this should be read from audio ctx?
      this._sr = sampleRate;
      this._bufferSize = 2048;
      this._fftSize = 2048;
      this._hopSize = 512;
      // keep 60 seconds of history
      this._maxFrames = Math.floor(this._sr/this._hopSize*60);
      this._buffer = new Float32Array(this._blockSize);
      this._curFrame = new Float32Array(this._fftSize);
      this._framePos = 0;
      this._fourier = new FFT(this._fftSize);
      this._timeSignal = new Float32Array(this._fftSize);
      this._windowedSignal = new Float32Array(this._fftSize);
      this._fourierTransf = this._fourier.createComplexArray();
      this._fourierHist = new Array();
      this._spectrum = new Float32Array(Math.floor(this._fftSize/2));
      this._window = new Float32Array(this._fftSize);
      for( var i=0; i < this._fftSize; ++i)
      {
        this._window[i] = .5-.5*Math.cos(6.283*i/(this._fftSize-1));
      }
      this._pSpecNFrames = 8;
    }

  getFFTSize()
  {
    return self._fftSize;
  }

  _pushFrame(frame)
  {
    if (this._fourierHist.length >= this._maxFrames)
    {
      this._fourierHist.shift();
    }
    this._fourierHist.push(frame);
  }

    _processFrame()
  {

      const fourierTransf = this._fourier.createComplexArray();
      this._fourier.realTransform(fourierTransf,
                                  this._curFrame);
      // console.log(fourierTransf)
      this._pushFrame(fourierTransf);
      // do a new analysis
      this._powerSpectrum()
      this.port.postMessage({spectrum: this._spectrum, n:this._spectrum.length})
  }

    _powerSpectrum()
    {
      // average last frames
      for (var j=0; j<=this._fftSize/2; ++j)
      {
        var sumFFT = 0.0;
        var nFr = Math.min(this._pSpecNFrames, this._fourierHist.length);
        for(var i=1; i<= nFr; ++i)
        {
          var frameNo = this._fourierHist.length-i;
          var sqVal = this._fourierHist[frameNo][j*2]*this._fourierHist[frameNo][j*2] + this._fourierHist[frameNo][j*2+1]*this._fourierHist[frameNo][j*2+1]; 
          sumFFT = sumFFT + sqVal;
        }
        this._spectrum[j] = Math.log(sumFFT/this._pSpecNFrames);
      }

    }

    _pushIntoFrame(vals)
  {
    for ( var i=0; i<vals.length; ++i)
    {
      ++ this._framePos;
      if (this._framePos >= this._fftSize)
      {
        this._processFrame();
        this._framePos = 0;
      }

      this._curFrame[this._framePos] = vals[i]*this._window[this._framePos];
    }
  }

    process (inputs, outputs, parameters) {
      const allchan = inputs[0];
      const input = allchan[0];
      let i = 0;
  
      // write to buffer 
      this._pushIntoFrame(input);

      return true;
    }
  
});

