import { FFT } from "./ext/fft.js";
console.log(FFT);
registerProcessor('single-fft', class extends AudioWorkletProcessor {

    _fftSize

    constructor () {
      super();
      this._fftSize = 1024;
      this._fourier = new FFT(this._fftSize);
      this._timeSignal = new Float32Array(this._fftSize);
      this._windowedSignal = new Float32Array(this._fftSize);
      this._fourierTransf = this._fourier.createComplexArray();
      this._spectrum = new Float32Array(Math.floor(this._fftSize/2));
      this._window = new Float32Array(this._fftSize);
      for( var i=0; i < this._fftSize; ++i)
      {
        this._window[i] = .5-.5*Math.cos(6.283*i/(this._fftSize-1));
      }
    }

    _powerSpectrum()
    {
      this._fourier.realTransform(this._fourierTransf,
                                  this._windowedSignal)
      // calculate log power
      for(var i=0; i<=this._spectrum.length; i++)
      {
        this._spectrum[i] = Math.log(this._fourierTransf[i*2]*this._fourierTransf[i*2] + this._fourierTransf[i*2+1]*this._fourierTransf[i*2+1]);
      }

    }
  
    process (inputs, outputs, parameters) {
      const allchan = inputs[0];
      const input = allchan[0];
      let i = 0;
  
      // write to buffer 
      for( i=0; i < input.length; ++i)
        {
            this._timeSignal[i] = input[i];
            this._windowedSignal[i] = input[i]*this._window[i];
        }

      // do a new analysis
      this._powerSpectrum()
      this.port.postMessage({spectrum: this._spectrum, n:this._spectrum.length})

      return true;
    }
});

