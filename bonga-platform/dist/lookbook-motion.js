(()=>{
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),cards=[...document.querySelectorAll('.collection-card')];
  if('IntersectionObserver' in window&&!reduced.matches){
    const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.remove('lookbook-motion-pending');observer.unobserve(entry.target);}},{threshold:.08});
    for(const card of cards){card.classList.add('lookbook-motion-pending');observer.observe(card);}
    reduced.addEventListener?.('change',()=>{if(reduced.matches){cards.forEach(card=>card.classList.remove('lookbook-motion-pending'));observer.disconnect();}});
  }
  for(const card of cards){
    const figure=card.querySelector('figure');if(!figure)continue;
    const tag=document.createElement('span');tag.className='lookbook-tag';tag.textContent='SPECIFICATION_DATA_VIEW';tag.setAttribute('aria-hidden','true');figure.append(tag);
    let frame=0,x=12,y=12,targetX=12,targetY=12;
    const draw=()=>{x+=(targetX-x)*.16;y+=(targetY-y)*.16;tag.style.transform='translate('+x+'px,'+y+'px)';if(Math.abs(x-targetX)+Math.abs(y-targetY)>.5)frame=requestAnimationFrame(draw);else frame=0;};
    figure.addEventListener('pointermove',event=>{if(reduced.matches||event.pointerType==='touch')return;const bounds=figure.getBoundingClientRect();targetX=Math.max(8,Math.min(event.clientX-bounds.left+12,bounds.width-190));targetY=Math.max(8,Math.min(event.clientY-bounds.top+12,bounds.height-34));if(!frame)frame=requestAnimationFrame(draw);});
    figure.addEventListener('pointerleave',()=>{cancelAnimationFrame(frame);frame=0;});
  }
  const video=document.getElementById('workspace-ad-video'),button=document.getElementById('workspace-ad-toggle');if(!video||!button)return;
  let visible=false,manualPaused=reduced.matches,autoPausing=false;const pauseAuto=()=>{if(!video.paused){autoPausing=true;video.pause();}};
  const play=()=>{if(visible&&!document.hidden&&!manualPaused)video.play().catch(()=>{});};
  const update=()=>button.textContent=video.paused?'Play banner':'Pause banner';
  video.addEventListener('play',()=>{manualPaused=false;update();});video.addEventListener('pause',()=>{if(autoPausing)autoPausing=false;else manualPaused=true;update();});const sound=document.getElementById('workspace-ad-sound');if(sound){const soundState=()=>{const on=!video.muted&&video.volume!==0;sound.setAttribute('aria-pressed',String(on));sound.textContent=on?'Mute sound':'Turn sound on';};sound.addEventListener('click',()=>{const on=!video.muted&&video.volume!==0;video.muted=on;if(!on){if(video.volume===0)video.volume=1;manualPaused=false;video.play().catch(()=>{});}soundState();});video.addEventListener('volumechange',soundState);soundState();}
  button.addEventListener('click',()=>{if(video.paused){manualPaused=false;video.play().catch(()=>{});}else{manualPaused=true;pauseAuto();}});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)play();else pauseAuto();},{threshold:.1}).observe(video);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseAuto();else play();});
  reduced.addEventListener?.('change',()=>{if(reduced.matches){manualPaused=true;pauseAuto();}});
})();
