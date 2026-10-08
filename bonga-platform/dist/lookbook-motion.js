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

  // Editorial technical metadata: describe presentation, not unverified garment specifications.
  for(const card of cards){
    const info=card.querySelector('.collection-card-info');if(!info||info.querySelector('.bonga-spec-list'))continue;
    const title=card.querySelector('h3')?.textContent?.trim()||'Fashion concept';
    const specs=document.createElement('div');specs.className='bonga-spec-list';specs.setAttribute('aria-label','Design presentation details');
    for(const [key,value] of [['FORMAT','Digital fashion concept'],['COLLECTION',title],['NEXT STEP','Request a design consultation']]){
      const row=document.createElement('div');row.className='bonga-spec-row';
      const label=document.createElement('span');label.textContent=key;
      const detail=document.createElement('span');detail.textContent=value;
      row.append(label,detail);specs.append(row);
    }
    info.append(specs);
  }
  // Reveal the editorial cards as they enter view, including keyboard navigation.
  for(const card of cards){
    card.addEventListener('focusin',()=>card.classList.remove('lookbook-motion-pending'));
  }
  const collectionGrid=document.querySelector('.collection-grid');
  if(collectionGrid&&'IntersectionObserver' in window&&!reduced.matches){
    const detailObserver=new IntersectionObserver(entries=>{
      for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('bonga-in-view');detailObserver.unobserve(entry.target);}}
    },{threshold:.12});
    for(const card of cards)detailObserver.observe(card);
    reduced.addEventListener?.('change',()=>{if(reduced.matches){detailObserver.disconnect();cards.forEach(card=>card.classList.add('bonga-in-view'));}});
  }else cards.forEach(card=>card.classList.add('bonga-in-view'));
  // Accessible editorial preview: uses the real collection artwork and existing enquiry action.
  if(cards.length&&typeof HTMLDialogElement!=='undefined'){
    const dialog=document.createElement('dialog');dialog.className='bonga-look-dialog';dialog.setAttribute('aria-label','Fashion collection preview');
    const inner=document.createElement('div');inner.className='bonga-look-dialog-inner';
    const close=document.createElement('button');close.type='button';close.className='bonga-look-close';close.textContent='Close preview ×';
    const image=document.createElement('img');image.className='bonga-look-image';image.alt='';
    const detail=document.createElement('div');detail.className='bonga-look-detail';
    const eyebrow=document.createElement('p');eyebrow.className='bonga-look-eyebrow';eyebrow.textContent='BONGA BHENGU / DESIGN EDIT';
    const heading=document.createElement('h2');heading.id='bonga-look-title';
    const description=document.createElement('p');
    const enquiry=document.createElement('button');enquiry.type='button';enquiry.textContent='Enquire about this design →';
    detail.append(eyebrow,heading,description,enquiry);inner.append(image,detail);dialog.append(close,inner);
    dialog.setAttribute('aria-labelledby',heading.id);document.body.append(dialog);
    let activeCard=null,returnFocus=null;
    const hide=()=>{if(dialog.open)dialog.close();};
    close.addEventListener('click',hide);
    dialog.addEventListener('click',event=>{if(event.target===dialog)hide();});
    dialog.addEventListener('close',()=>{image.removeAttribute('src');if(returnFocus?.isConnected)returnFocus.focus();});
    enquiry.addEventListener('click',()=>{const action=activeCard?.querySelector('.collection-enquire');hide();if(action)action.click();});
    for(const card of cards){
      const art=card.querySelector('figure img');if(!art)continue;
      const open=document.createElement('button');open.type='button';open.className='bonga-look-preview';open.textContent='View design details';
      open.addEventListener('click',()=>{activeCard=card;returnFocus=open;image.src=art.currentSrc||art.src;image.alt=art.alt||'Fashion concept';heading.textContent=card.querySelector('h3')?.textContent||'Fashion concept';description.textContent=card.querySelector('.collection-card-info p')?.textContent||'Concept artwork';if(typeof dialog.showModal==='function')dialog.showModal();});
      const info=card.querySelector('.collection-card-info');if(info)info.append(open);
    }
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
