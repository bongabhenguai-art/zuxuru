'use strict';
(() => {
 const q=s=>document.querySelector(s), key='bonga-business-dashboard-v1';
 const platforms=['Instagram','TikTok','X / Twitter','Facebook','LinkedIn','YouTube','Pinterest','Threads'];
 const known={Facebook:'https://www.facebook.com/bonga.bhengu/',LinkedIn:'https://za.linkedin.com/in/bonga-bhengu-3574588a',YouTube:'https://youtube.com/@bonga.bhengu'};
 let data={profiles:platforms.map(platform=>({platform,url:known[platform]||'',followers:null})),campaigns:[],skills:[]};
 const short=(v,n=500)=>typeof v==='string'?v.trim().slice(0,n):'';
 function url(v){try{const u=new URL(v);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password?u.href:'';}catch{return '';}}
 function normalize(input){
  if(!input||!Array.isArray(input.profiles)||!Array.isArray(input.campaigns)||!Array.isArray(input.skills))throw Error('Choose a Bonga business dashboard backup.');
  return {profiles:platforms.map(platform=>{const p=input.profiles.find(x=>x.platform===platform)||{};return {platform,url:url(p.url),followers:Number.isInteger(p.followers)&&p.followers>=0?p.followers:null};}),campaigns:input.campaigns.slice(0,200).map(c=>({id:short(c.id,100),title:short(c.title,180),platform:platforms.includes(c.platform)?c.platform:'Instagram',date:/^\d{4}-\d{2}-\d{2}$/.test(c.date)?c.date:'',caption:short(c.caption,2000),status:['Draft','Ready for review','Published'].includes(c.status)?c.status:'Draft'})).filter(c=>c.id&&c.title),skills:input.skills.slice(0,200).map(s=>({id:short(s.id,100),name:short(s.name,180),tool:short(s.tool,100),proof:url(s.proof),note:short(s.note,500)})).filter(s=>s.id&&s.name)};
 }
 try{const saved=JSON.parse(localStorage.getItem(key));if(saved)data=normalize(saved);}catch{}
 function status(text){q('#business-status').textContent=text;}
 function save(){try{localStorage.setItem(key,JSON.stringify(data));}catch{status('This browser could not save. Export a backup before leaving.');}render();}
 function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
 function action(text,fn){const b=el('button',text,'button secondary');b.type='button';b.addEventListener('click',fn);return b;}
 function remove(kind,id){data[kind]=data[kind].filter(x=>x.id!==id);save();status('Record removed.');}
 function overview(){
  let work={tasks:[],leads:[],measurements:[]};try{work=JSON.parse(localStorage.getItem('bonga-omni-route-v1'))||work;}catch{}
  const latest=work.measurements?.at(-1);
  const values=[['Open tasks',(work.tasks||[]).filter(t=>!t.done).length],['Customer records',(work.leads||[]).length],['Confirmed orders',latest?.orders??'Unknown'],['Profile links',data.profiles.filter(p=>p.url).length],['Campaign drafts',data.campaigns.filter(c=>c.status!=='Published').length],['Skills with proof',data.skills.filter(s=>s.proof).length]];
  q('#business-overview').replaceChildren(...values.map(([label,value])=>{const x=el('div');x.append(el('span',label),el('strong',String(value)));return x;}));
 }
 function render(){
  overview();
  q('#profile-records').replaceChildren(...data.profiles.map(p=>{
   const card=el('article',undefined,'business-record');card.append(el('h3',p.platform),el('p',p.url?'Profile link saved · account connection not configured':'Add your existing profile link or plan a new profile'));
   if(p.url){const a=el('a','Open profile');a.href=p.url;a.target='_blank';a.rel='noopener noreferrer';card.append(a);}
   const form=el('form');const label=el('label','Profile URL');const input=el('input');input.type='url';input.placeholder='https://…';input.value=p.url;input.setAttribute('aria-label',p.platform+' profile URL');label.append(input);
   const flabel=el('label','Follower count from your account');const count=el('input');count.type='number';count.min='0';count.max='100000000';count.step='1';count.placeholder='Unknown';count.value=p.followers??'';count.setAttribute('aria-label',p.platform+' followers');flabel.append(count);
   const b=el('button','Save profile','button secondary');b.type='submit';form.append(label,flabel,b);form.addEventListener('submit',e=>{e.preventDefault();const clean=input.value.trim()?url(input.value):'';if(input.value.trim()&&!clean){status('Use a valid public HTTP(S) profile URL.');return;}p.url=clean;p.followers=count.value===''?null:Number(count.value);save();status(p.platform+' profile saved on this device.');});card.append(form);
   const prepare=action('Prepare my profile',()=>{q('#social-platform').value=p.platform;makeBio();q('#profile-composer').scrollIntoView({behavior:'smooth'});});card.append(prepare);return card;
  }));
  q('#campaign-records').replaceChildren(...data.campaigns.map(c=>{const card=el('article',undefined,'business-record');card.append(el('h3',c.title),el('p',c.platform+' · '+(c.date||'Date not set')),el('p',c.caption));const label=el('label','Progress');const select=el('select');['Draft','Ready for review','Published'].forEach(x=>{const o=el('option',x);o.value=x;select.append(o);});select.value=c.status;select.addEventListener('change',()=>{c.status=select.value;save();status(c.status==='Published'?'Marked published from your own record; this dashboard did not publish it.':'Campaign updated.');});label.append(select);card.append(label,action('Remove',()=>remove('campaigns',c.id)));return card;}));
  if(!data.campaigns.length)q('#campaign-records').append(el('p','No campaigns yet. Prepare a post or offer below.'));
  q('#skill-records').replaceChildren(...data.skills.map(s=>{const card=el('article',undefined,'business-record');card.append(el('h3',s.name),el('p',s.tool+' · Self-taught AI learning since 2023'),el('p',s.note));if(s.proof){const a=el('a','View my work');a.href=s.proof;a.target='_blank';a.rel='noopener noreferrer';card.append(a);}else card.append(el('p','Add a public portfolio link when your work is ready.'));card.append(action('Remove',()=>remove('skills',s.id)));return card;}));
  if(!data.skills.length)q('#skill-records').append(el('p','Record a fashion concept, image, video or branding project you created using AI.'));
 }
 function makeBio(){const platform=q('#social-platform').value;const bio=platform==='TikTok'||platform==='X / Twitter'?'Bonga Bhengu | Fashion designer. Self-taught AI creative since 2023. Durban. Healing • Learn • Rebuild.':'Bonga Bhengu — Fashion Designer & AI Creative\nDONLEGEND • Innovative AI Design\nDurban, South Africa\nSelf-taught AI learning since 2023\nHealing • Learn • Rebuild';q('#profile-draft').textContent=bio+'\n\nWebsite: https://bonga-bhengu.donlegendwear.chatgpt.site\n\nSuggested profile name: Bonga Bhengu\nSuggested handle: @bongabhengu — check availability\nProfile image: your portrait or Bonga monogram\nFirst post: Welcome to my next creative chapter. Fashion, African identity and self-taught AI design. Follow my work and enquire about your next design.';status(platform+' profile draft prepared. Review before adding it to your account.');}
 ['social-platform','campaign-platform'].forEach(id=>platforms.forEach(p=>{const o=el('option',p);o.value=p;q('#'+id).append(o);}));
 q('#prepare-profile').addEventListener('click',makeBio);
 q('#copy-profile').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(q('#profile-draft').textContent);status('Profile draft copied.');}catch{status('Copy the text from the profile draft manually.');}});
 q('#campaign-form').addEventListener('submit',e=>{e.preventDefault();data.campaigns.unshift({id:crypto.randomUUID(),title:q('#campaign-title').value.trim(),platform:q('#campaign-platform').value,date:q('#campaign-date').value,caption:q('#campaign-caption').value.trim(),status:'Draft'});save();e.target.reset();status('Campaign draft saved. Nothing was published.');});
 q('#skill-form').addEventListener('submit',e=>{e.preventDefault();const proof=q('#skill-proof').value.trim();if(proof&&!url(proof)){status('Use a valid public portfolio URL.');return;}data.skills.unshift({id:crypto.randomUUID(),name:q('#skill-name').value.trim(),tool:q('#skill-tool').value.trim(),proof:url(proof),note:q('#skill-note').value.trim()});save();e.target.reset();status('Your skill and project record was saved.');});
 q('#business-export').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=el('a');a.href=u;a.download='Bonga-Bhengu-business-dashboard.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);status('Business dashboard backup exported. Export the work queue separately for its customer and task records.');});
 q('#business-import').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1000000)throw Error('Backup must be under 1 MB.');const incoming=normalize(JSON.parse(await file.text()));data=incoming;save();status('Business dashboard backup restored.');}catch(error){status(error.message||'Backup could not be restored.');}e.target.value='';});
 q('#business-refresh').addEventListener('click',()=>{overview();status('Overview refreshed from your saved records.');});
 render();makeBio();
 ['#task-list','#pipeline-list','#measurement-history'].forEach(selector=>{const target=q(selector);if(target)new MutationObserver(overview).observe(target,{childList:true,subtree:true});});
})();
