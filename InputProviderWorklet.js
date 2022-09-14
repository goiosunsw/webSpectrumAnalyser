registerProcessor('input-provider', class extends AudioWorkletProcessor {

  _updateIntervalInMS
  _nextUpdateFrame

  constructor () {
    super();
    this._blockSize = 2048;
    this._fftSize = 1024;
    this._buffer = new Float32Array(this._blockSize);
    this._counter = 0;
    this._count_post = 1;
  }

  process (inputs, outputs, parameters) {
    const allchan = inputs[0];
    const input = allchan[0];
    let i = 0;

    this._counter ++;
    for( i=0; i < input.length; ++i)
      {
          this._buffer[i] = input[i];
      }
    if (this._counter >= this._count_post)
    {
      this._counter =0;
      this.port.postMessage({samples: this._buffer, n: input.length});
    }
    return true;
  }
});

