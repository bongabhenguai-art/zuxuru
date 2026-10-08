(()=>{'use strict';
const root=document.getElementById('bonga-owner-enquiries');if(!root)return;
const status=root.querySelector('[data-enquiry-status]'),list=root.querySelector('[data-enquiry-list]'),refresh=root.querySelector('[data-enquiry-refresh]'),search=root.querySelector('[data-enquiry-search]'),exportButton=root.querySelector('[data-enquiry-export]');
const cell=(tag,value)=>{const el=document.createElement(tag);el.textContent=String(value??'');return el;};
let enquiries=[],loaded=false;
function render(){
 list.replaceChildren();
 const query=search.value.trim().toLocaleLowerCase();
 const shown=enquiries.filter(item=>[item.name,item.contact,item.service,item.goal,item.id].some(value=>String(value||'').toLocaleLowerCase().includes(query)));
 status.textContent=shown.length+' matching '+(shown.length===1?'enquiry':'enquiries')+' of '+enquiries.length+' saved (latest 100).';
 for(const item of shown){
  const article=document.createElement('article');article.className='bonga-inbox-item';
  const header=cell('h3',item.name||'Unnamed customer');const date=cell('time',item.created_at||'');
  const service=cell('p','Service: '+(item.service||'Not specified'));const goal=cell('p',item.goal||'');
  const contact=cell('p','Contact: '+(item.contact||'Not provided'));const ref=cell('small','Reference: '+item.id);
  article.append(header,date,service,goal,contact,ref);list.append(article);
 }
 if(!shown.length)list.append(cell('p',enquiries.length?'No enquiries match your search.':'No customer enquiries have been saved yet.'));
}
async function load(){
 refresh.disabled=true;exportButton.disabled=true;loaded=false;status.textContent='Loading saved customer enquiries…';list.replaceChildren();
 try{
  const response=await fetch('/api/public/enquiries',{credentials:'same-origin',headers:{accept:'application/json'},cache:'no-store'});
  const data=await response.json();if(!response.ok)throw Error(data.error||'Enquiries unavailable');
  enquiries=Array.isArray(data.enquiries)?data.enquiries:[];loaded=true;exportButton.disabled=!enquiries.length;render();
 }catch(error){enquiries=[];status.textContent='Unable to load enquiries: '+error.message+'. Confirm owner sign-in and Cloudflare database setup.';}
 finally{refresh.disabled=false;}
}
search.addEventListener('input',()=>{if(loaded)render();});
exportButton.addEventListener('click',()=>{
 if(!loaded||!enquiries.length)return;
 const fields=['id','created_at','name','contact','service','goal'];
 const safe=value=>{let text=String(value??'');if(/^[\s]*[=+\-@\t\r]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';};
 const csv=[fields.map(safe).join(','),...enquiries.map(item=>fields.map(field=>safe(item[field])).join(','))].join('\r\n');
 const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='bonga-bhengu-enquiries-'+new Date().toISOString().slice(0,10)+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 status.textContent='CSV export prepared. Handle customer contact details securely.';
});
refresh.addEventListener('click',load);load();
})();