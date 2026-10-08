(()=>{
  window.addStudioMediaReview=(details,job,selectFinal)=>{
    const panel=document.createElement('div');panel.className='studio-media-review';details.append(panel);
    let loaded=false,busy=false;
    details.addEventListener('toggle',async()=>{
      if(!details.open||loaded||busy)return;
      busy=true;panel.textContent='Loading your saved media…';
      try{
        const response=await fetch('/api/designer/media'),data=await response.json();
        if(!response.ok)throw Error(data.error||'Could not load saved media. Close and reopen to retry.');
        panel.replaceChildren();
        if(!job.mediaIds.length){panel.textContent='No media attached yet. Record, capture or attach a file before review.';loaded=true;return;}
        for(const id of job.mediaIds){
          const file=data.files.find(f=>f.id===id),card=document.createElement('article'),heading=document.createElement('h3');
          card.className='studio-media-card';heading.textContent=file?.name||'File no longer available';card.append(heading);
          if(!file){panel.append(card);continue;}
          const url='/api/designer/media/'+encodeURIComponent(id),type=file.content_type||'';
          let preview;
          if(type.startsWith('image/')){preview=document.createElement('img');preview.alt=file.name;preview.loading='lazy';}
          else if(type.startsWith('video/')||type.startsWith('audio/')){preview=document.createElement(type.startsWith('video/')?'video':'audio');preview.controls=true;preview.preload='metadata';if(type.startsWith('video/'))preview.playsInline=true;}
          if(preview){preview.src=url;preview.addEventListener('error',()=>{const warning=document.createElement('p');warning.textContent='Preview unavailable. Open the saved file to check it.';card.append(warning);},{once:true});card.append(preview);}
          if(!job.archived&&(type.startsWith('image/')||type.startsWith('video/'))){
            const edit=document.createElement('button');edit.textContent=type.startsWith('image/')?'Edit image':'Trim video';
            edit.onclick=()=>{
              for(const media of panel.querySelectorAll('video,audio'))media.pause();
              document.dispatchEvent(new CustomEvent(type.startsWith('image/')?'media-edit-image':'media-edit-video',{detail:{...file,url,studioJobId:job.id}}));
            };
            card.append(edit);
          }
          const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener';link.textContent='Open saved file';card.append(link);
          if(type.startsWith('image/')||type.startsWith('video/')){
            const button=document.createElement('button');button.textContent=job.finalMediaId===id?'Selected campaign media':'Use this file for campaign';button.disabled=!!job.archived||job.finalMediaId===id;
            button.onclick=()=>selectFinal(id,job);card.append(button);
          }
          panel.append(card);
        }
        loaded=true;
      }catch(error){panel.textContent=error.message;}finally{busy=false;}
    });
    details.addEventListener('toggle',()=>{if(!details.open)for(const media of panel.querySelectorAll('video,audio'))media.pause();});
  };
})();
