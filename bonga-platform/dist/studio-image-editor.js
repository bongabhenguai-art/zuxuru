(()=>{'use strict';let file=null,image=null,rotation=0,opening=false,saving=false,savedCopy=null;const $=id=>document.getElementById(id),dialog=$('image-edit-dialog'),canvas=$('image-edit-canvas');function paint(){if(!image)return;const zoom=Number($('image-edit-zoom').value),ratio=$('image-edit-ratio').value,iw=rotation%180?image.height:image.width,ih=rotation%180?image.width:image.height;let w=iw,h=ih;if(ratio!=='original'){const r=Number(ratio);if(w/h>r)w=h*r;else h=w/r;}w/=zoom;h/=zoom;const factor=Math.min(1,2048/w,2048/h);canvas.width=Math.round(w*factor);canvas.height=Math.round(h*factor);const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.translate(canvas.width/2,canvas.height/2);ctx.scale(factor,factor);ctx.rotate(rotation*Math.PI/180);ctx.drawImage(image,-image.width/2,-image.height/2);}
document.addEventListener('media-edit-image',event=>{if(opening||saving||dialog.open){$('studio-media-status').textContent='Finish or close the current image edit before opening another image.';return;}opening=true;const incoming=event.detail,candidate=new Image();candidate.onload=()=>{opening=false;file=incoming;image=candidate;savedCopy=null;$('image-edit-save').textContent='Save edited copy';for(const id of ['image-edit-ratio','image-edit-zoom','image-edit-rotate'])$(id).disabled=false;$('image-edit-status').textContent='Crop and rotate your image. The original stays unchanged.';rotation=0;$('image-edit-zoom').value=1;$('image-edit-ratio').value='original';paint();dialog.showModal();};candidate.onerror=()=>{opening=false;$('studio-media-status').textContent='Image could not be opened for editing. Try again.';};candidate.src=incoming.url;});$('image-edit-ratio').onchange=paint;$('image-edit-zoom').oninput=paint;$('image-edit-rotate').onclick=()=>{rotation=(rotation+90)%360;paint();};$('image-edit-close').onclick=()=>{if(!saving)dialog.close();};dialog.addEventListener('cancel',event=>{if(saving)event.preventDefault();});
$('image-edit-save').onclick=async()=>{
  if(saving||opening||!file||!dialog.open)return;
  saving=true;const currentFile=file,button=$('image-edit-save');button.disabled=true;$('image-edit-close').disabled=true;
  for(const id of ['image-edit-ratio','image-edit-zoom','image-edit-rotate'])$(id).disabled=true;
  $('image-edit-status').textContent=savedCopy?'Attaching your saved copy…':'Saving edited copy…';
  try{
    if(!savedCopy){
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.92));
      if(!blob)throw Error('Image export failed.');
      const response=await fetch('/api/designer/media',{method:'POST',headers:{'content-type':'image/jpeg','x-file-name':encodeURIComponent(currentFile.name.replace(/\.[^.]+$/,'')+'-edited.jpg')},body:blob}),data=await response.json();
      if(!response.ok)throw Error(data.error);savedCopy=data.file;
    }
    if(currentFile.studioJobId){
      if(!window.attachStudioMedia)throw Error('Job attachment is unavailable. Your edited image is saved in your files.');
      await window.attachStudioMedia(savedCopy.id,currentFile.studioJobId);
    }
    dialog.close();$('studio-media-refresh').click();
    $('studio-media-status').textContent='Edited copy saved'+(currentFile.studioJobId?' and attached to the original creative job.':'.')+' The original file is kept.';
  }catch(error){
    $('image-edit-status').textContent=(savedCopy?'Your edited copy is saved. Retry attaching it to the original job. ':'')+error.message;
    button.textContent=savedCopy?'Retry job attachment':'Retry save';
  }finally{
    saving=false;button.disabled=false;$('image-edit-close').disabled=false;
    for(const id of ['image-edit-ratio','image-edit-zoom','image-edit-rotate'])$(id).disabled=!!savedCopy;
  }
};})();
