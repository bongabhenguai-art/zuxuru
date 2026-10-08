import {audioLevel} from './studio-audio-levels.js';
const meter=document.getElementById('studio-sound-meter'),status=document.getElementById('studio-sound-status'),button=document.getElementById('studio-sound-test'),stop=document.getElementById('studio-sound-stop');
let context=null,source=null,analyser=null,gain=null,timer=null,generation=0;
async function end(message='Sound check stopped. Microphones remain available for recording.'){
  generation++;clearInterval(timer);timer=null;
  source?.disconnect();gain?.disconnect();analyser?.disconnect();
  const previous=context;context=source=analyser=gain=null;
  meter.value=0;stop.disabled=true;button.disabled=false;
  status.textContent=typeof message==='string'?message:'Sound check stopped. Microphones remain available for recording.';
  await previous?.close().catch(()=>{});
}
button.onclick=async()=>{
  if(button.disabled)return;
  const closing=end(),attempt=generation;button.disabled=true;stop.disabled=false;
  status.textContent='Starting sound check. Allow microphone access if asked, or stop this check.';
  try{
    await closing;if(attempt!==generation)return;
    const selected=document.getElementById('studio-audio').value;
    if(selected==='none')throw Error('Choose a microphone or shared-screen audio first.');
    let stream=window.studioSelectedAudioStream?.();
    if(selected==='host'&&!stream){await window.connectStudioMicrophone?.();if(attempt!==generation)return;stream=window.studioSelectedAudioStream?.();}
    const tracks=stream?.getAudioTracks().filter(t=>t.readyState==='live')||[];
    if(!tracks.length)throw Error('The selected audio source is not connected. Enable microphone audio on the phone, or connect your microphone.');
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio)throw Error('Audio analysis is unavailable in this browser.');
    const activeContext=new Audio();context=activeContext;
    await activeContext.resume();if(attempt!==generation)return;
    source=activeContext.createMediaStreamSource(new MediaStream(tracks));analyser=activeContext.createAnalyser();analyser.fftSize=2048;
    gain=activeContext.createGain();gain.gain.value=0;source.connect(analyser);analyser.connect(gain);gain.connect(activeContext.destination);
    const samples=new Float32Array(analyser.fftSize);
    timer=setInterval(()=>{
      if(attempt!==generation)return;
      if(!tracks.some(t=>t.readyState==='live')){end('Audio source disconnected. Connect it and check sound again.');return;}
      if(activeContext.state!=='running'){meter.value=0;status.textContent='Audio check paused by browser. Stop and restart sound check.';return;}
      analyser.getFloatTimeDomainData(samples);const result=audioLevel(samples);meter.value=result.peak;status.textContent=result.state;
    },100);
  }catch(error){if(attempt===generation)await end(error.message);}
};
stop.onclick=()=>end();document.getElementById('studio-audio').addEventListener('change',()=>end());window.addEventListener('pagehide',()=>end());
