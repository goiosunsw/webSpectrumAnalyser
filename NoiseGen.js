registerProcessor('noise-generator', class extends AudioWorkletProcessor {


  constructor () {
    super();
  }

  static get parameterDescriptors () {
    return [{
      name: 'gain',
      defaultValue: 1,
      minValue: 0,
      maxValue: 1,
      automationRate: 'a-rate'
    }]
  }

  process (inputs, outputs, parameters) {
    const output = outputs[0];

    let nsam = output[0].length;
      for (let i=0; i<nsam; ++i) {
          let s = Math.random()*2-1;
          for (let chno=0; chno<output.length; ++chno)
          {
                output[chno][i]=s*(parameters['gain'].length > 1 ? parameters['gain'][i] : parameters['gain'][0]);
          }
      }

  return true;

  }
});

registerProcessor('dent-generator', class extends AudioWorkletProcessor {

  _curFreq
  _curTime
  _dentTime
  _fftSize
  _curPhase
  _fMin
  _fMax

  constructor () {
    super();
    this._fMin = 200.0;
    this._fMax = 4000.0;
    this._curPhase = 0.0;
    this._curTime = 0.0;
    this._dentTime = 0.1;
    this._sr = 44100.0;
    this._dt = 1/this._sr;
    this.setNewFreq();
  }

    setNewFreq () {
        this._curFreq = Math.random()*(this._fMax - this._fMin)+this._fMin;
        this._curPhase = 0.0;
        this._curTime = 0.0;
        this._dph = this._curFreq/this._sr*6.28;
    }

  process (inputs, outputs, parameters) {
    const output = outputs[0];

    let nsam = output[0].length;
    let phase = this._curPhase;
    let ampl = 0.0;
      for (let i=0; i<nsam; ++i) {
          ampl = this._curTime / this._dentTime * 2;
          if (ampl>1.0)
          {
              ampl = (2.0-ampl);
          }
          phase = phase + this._dph;
          let s = Math.sin(phase)*ampl;
          for (let chno=0; chno<output.length; ++chno)
          {
                output[chno][i]=s;
          }
          this._curTime = this._curTime + this._dt;
          if (this._curTime > this._dentTime)
          {
              this.setNewFreq();
          }
          
      }
      this._curPhase = phase;

  return true;

  }
});

