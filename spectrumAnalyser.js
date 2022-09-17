import { FFT } from "./ext/fft.js";
// Set up the AudioContext.


const nbrel = document.getElementById("nbr");
const canvas = document.getElementById("spec")
const height = canvas.height;
const width = canvas.width;
const cctx = canvas.getContext("2d")
let FirstClick = true;
var noiseOn = true;

async function onMicrophoneGranted(stream) {
  if (FirstClick) {
    const audioCtx = new AudioContext();
    await audioCtx.audioWorklet.addModule('NoiseGen.js')
    audioCtx.audioWorklet.addModule('PwrSpectrum.js').then(() => {
        let mic = audioCtx.createMediaStreamSource(stream);
        const node = new AudioWorkletNode(audioCtx,'power-spectrum');
        //node.port.postMessage({fft: new FFT})
        
        var fMin = 100;
        var fMax = 10000;
        var df = audioCtx.sampleRate/2048;
        var iMin = Math.floor(fMin/df); 
        var iMax = Math.ceil(fMax/df); 
        var logiMin = Math.log(iMin);
        var logiMax = Math.log(iMax)
        var iMult = width/(logiMax-logiMin);

        //mic.connect(node).connect(audioCtx.destination);
        mic.connect(node);
        node.port.onmessage = event => {
            // draw_waveform(event.data)
            nbrel.innerHTML = "K"
            if (event.data.spectrum)
            {
                nbrel.innerHTML = event.data.n;
                var sMin = Math.min(...event.data.spectrum);
                var sMax = Math.max(...event.data.spectrum);
                
                // console.log(event.data.spectrum)
                var sMult = height/(sMax-sMin);
                cctx.clearRect(0,0,width,height)
                cctx.beginPath();
                cctx.moveTo(0,height/2)
                for (let i=iMin; i<iMax; ++i)
                {
                  // x = i/event.data.n*width;
                  var logi = Math.log(i);
                  var x = (logi-logiMin)*iMult;
                  var y = height-(event.data.spectrum[i]-sMin)*sMult;
                    cctx.lineTo(x,y);
                }
                //cctx.closePath();
                cctx.stroke()
                
            }
        }

        const noiseNode = new AudioWorkletNode(audioCtx,'noise-generator');
        noiseNode.connect(audioCtx.destination);
        
      const noiseBtn = document.getElementById('exc')
        document.getElementById('exc').addEventListener('click', () => {
            const gainParam = noiseNode.parameters.get('gain');
          if (noiseOn)
          {
            noiseOn = false;
            gainParam.setValueAtTime(0, audioCtx.currentTime);
            noiseBtn.style.backgroundColor = 'Red';

          }
          else
          {

            noiseOn = true;
            gainParam.setValueAtTime(1, audioCtx.currentTime);
            noiseBtn.style.backgroundColor = 'Green';
          }
            
        })

        FirstClick = false;
        
        console.log("done setting up audio")
        
    })
           
}}

function onMicrophoneDenied() {
    console.log("no mic")
}

function activateSound () {
    // Tell user that this
    // program wants to use
    // the microphone
    try {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        
        navigator.getUserMedia(
            { audio: true, video: false },
            onMicrophoneGranted,
            onMicrophoneDenied
        );
    } catch(e) {
        alert(e)
    }
}

document.getElementById('start').addEventListener('click', () => {
    activateSound();
})

export { activateSound };



