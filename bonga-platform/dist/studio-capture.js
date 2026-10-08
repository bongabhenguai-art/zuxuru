(()=>{'use strict';
const $=id=>document.getElementById(id);
$('studio-capture').onclick=async()=>{
 const button=$('studio-capture'),status=$('studio-capture-status');button.disabled=true;
 const jobId=window.currentStudioJob?.()||null;
 try{
  const blob=await window.captureStudioFrame();
  if(!blob)throw Error('Programme image could not be captured.');
  const url=URL.createObjectURL(blob),name='programme-'+new Date().toISOString().replace(/[:.]/g,'-')+'.jpg';
  const card=document.createElement('article');card.className='record';
  const image=document.createElement('img');image.src=url;image.alt='Captured Programme with current graphics';image.style.maxWidth='100%';
  const note=document.createElement('p');note.textContent='Captured on this device. Download or save it below.';
  const download=document.createElement('a');download.href=url;download.download=name;download.textContent='Download image';
  const save=document.createElement('button');save.textContent='Save image to my files';
  let savedFile=null;
  save.onclick=async()=>{
   save.disabled=true;
   try{
    if(!savedFile){const response=await fetch('/api/designer/media',{method:'POST',headers:{'content-type':'image/jpeg','x-file-name':encodeURIComponent(name)},body:blob}),data=await response.json();if(!response.ok)throw Error(data.error||'Image upload failed.');savedFile=data.file;}
    if(jobId)await window.attachStudioMedia(savedFile.id,jobId);
    note.textContent=jobId?'Saved in your private files and attached to the original creative job.':'Saved in your private image library.';save.textContent='Saved';
    const edit=document.createElement('button');edit.textContent='Edit saved image';edit.onclick=()=>document.dispatchEvent(new CustomEvent('media-edit-image',{detail:{...savedFile,studioJobId:jobId}}));card.append(edit);
   }catch(e){note.textContent=savedFile?'Image saved in your files. Original job attachment failed: '+e.message:e.message+' Download the image to keep it.';save.textContent=savedFile?'Retry job attachment':'Retry save';save.disabled=false;}
  };
  const remove=document.createElement('button');remove.textContent='Close this capture';remove.onclick=()=>{if(!savedFile&&!confirm('Close this unsaved capture? Download or save it first if you want to keep it.'))return;URL.revokeObjectURL(url);card.remove();};
  card.append(image,note,download,save,remove);$('studio-captures').prepend(card);
  status.textContent='Programme image captured. It has not been published.';
 }catch(e){status.textContent=e.message||'Programme capture unavailable.';}finally{button.disabled=false;}
};
})();
