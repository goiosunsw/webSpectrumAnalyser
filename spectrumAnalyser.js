// Set up the AudioContext.

const nbrel = document.getElementById("nbr");
const canvas = document.getElementById("spec")
const height = canvas.height;
const width = canvas.width;
const cctx = canvas.getContext("2d")
let FirstClick = true;

async function onMicrophoneGranted(stream) {
    if (FirstClick) {
    const audioCtx = new AudioContext();
    await audioCtx.audioWorklet.addModule('NoiseGen.js')
    audioCtx.audioWorklet.addModule('InputProviderWorklet.js').then(() => {
        let mic = audioCtx.createMediaStreamSource(stream);
        const node = new AudioWorkletNode(audioCtx,'input-provider');
        //mic.connect(node).connect(audioCtx.destination);
        mic.connect(node);
        node.port.onmessage = event => {
            // draw_waveform(event.data)
            nbrel.innerHTML = "K"
            if (event.data.samples)
            {
                nbrel.innerHTML = event.data.n;
                cctx.clearRect(0,0,width,height)
                cctx.beginPath();
                cctx.moveTo(0,height/2)
                for (let i=0; i<event.data.n; ++i)
                {
                    x = i/event.data.n*width;
                    y = event.data.samples[i]*height/2+height/2;
                    cctx.lineTo(x,y);
                }
                //cctx.closePath();
                cctx.stroke()
                
            }
        }

        const noiseNode = new AudioWorkletNode(audioCtx,'dent-generator');
        noiseNode.connect(audioCtx.destination);
        


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


