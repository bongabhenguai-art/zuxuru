(()=>{'use strict';
const root=document.getElementById('bonga-owner-enquiries');if(!root)return;
const status=root.querySelector('[data-enquiry-status]'),list=root.querySelector('[data-enquiry-list]'),refresh=root.querySelector('[data-enquiry-refresh]');
const cell=(tag,value)=>{const el=document.createElement(tag);el.textContent=String(value??'');return el;};
async function load(){
 refresh.disabled=true;status.textContent='Loading saved customer enquiries…';list.replaceChildren();
 try{
  const response=await fetch('/api/public/enquiries',{credentials:'same-origin',headers:{accept:'application/json'},cache:'no-store'});
  const data=await response.json();if(!response.ok)throw Error(data.error||'Enquiries unavailable');
  const enquiries=Array.isArray(data.enquiries)?data.enquiries:[];status.textContent=enquiries.length+' saved customer '+(enquiries.length===1?'enquiry':'enquiries')+' (latest 100).';
  for(const item of enquiries){
   const article=document.createElement('article');article.className='bonga-inbox-item';
   const header=cell('h3',item.name||'Unnamed customer');const date=cell('time',item.created_at||'');
   const service=cell('p','Service: '+(item.service||'Not specified'));const goal=cell('p',item.goal||'');
   const contact=cell('p','Contact: '+(item.contact||'Not provided'));const ref=cell('small','Reference: '+item.id);
   article.append(header,date,service,goal,contact,ref);list.append(article);
  }
  if(!enquiries.length)list.append(cell('p','No customer enquiries have been saved yet.'));
 }catch(error){status.textContent='Unable to load enquiries: '+error.message+'. Confirm your owner sign-in and Cloudflare database setup.';}
 finally{refresh.disabled=false;}
}
refresh.addEventListener('click',load);load();
})();