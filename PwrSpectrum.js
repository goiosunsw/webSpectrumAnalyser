registerProcessor('power-specrum', class extends AudioWorkletProcessor {

    _buffer
    _bufferSize
    _fftSize
    _blockPos

    constructor () {
      super();
      this._bufferSize = 2048;
      this._fftSize = 256;
      this._hopSize = 128;
      this._buffer = new Float32Array(this._blockSize);
      this._bufferPos = 0;
    }

    _powerSpectrum()
    {
        let nFrames = (this._bufferSize-this._fftSize)/this._hopSize;
        let avpwr = new Float32Array(this._fftSize/2);
        let frame = new Float32Array(this._fftSize)
        for (let i=0; i<nFrames; ++i)
        {
            iStart = i*this._hopSize;
            for (let j=iStart; j<iStart+this._fftSize; ++j)
            {
                frIndex = j-iStart;
                frame[frIndex] = this._buffer[j];
            }
            // how do we do an FFT?
            // import library?
            f = fft(frame);
            
        }

    }
  
    process (inputs, outputs, parameters) {
      const allchan = inputs[0];
      const input = allchan[0];
      let i = 0;
  
      // write to buffer 
      for( i=0; i < input.length; ++i)
        {
            this._buffer[this._bufferPos+i] = input[i];
            this._bufferPos ++;
            if this._bufferPos >= this._bufferSize
            {
                this._bufferPos = 0;
                pSpec = this._powerSpectrum()
                this.port.postMessage({spec: pSpec})
            }

        }

      // do a new analysis
      return true;
    }
});

