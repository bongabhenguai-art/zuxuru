'use strict';
(()=>{
 const q=s=>document.querySelector(s);
 function read(key){try{return JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{return {};}}
 function el(tag,text){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;}
 function analyze(){
  const work=read('bonga-omni-route-v1'),business=read('bonga-business-dashboard-v1'),sourcing=read('bonga-suppliers-v1');
  const leads=Array.isArray(work.leads)?work.leads:[],tasks=Array.isArray(work.tasks)?work.tasks:[],profiles=Array.isArray(business.profiles)?business.profiles:[],campaigns=Array.isArray(business.campaigns)?business.campaigns:[],skills=Array.isArray(business.skills)?business.skills:[],suppliers=Array.isArray(sourcing.suppliers)?sourcing.suppliers:[];
  const open=leads.filter(l=>!['Won','Closed'].includes(l.stage));const unlinked=['Instagram','TikTok','X / Twitter'].filter(name=>!profiles.some(p=>p.platform===name&&p.url));
  const ideas=[];
  open.slice(0,2).forEach(l=>ideas.push({module:'sales',title:'Follow up: '+String(l.name||'customer').slice(0,80),deliverable:String(l.next||'Confirm the customer brief, budget and timing.').slice(0,350),evidence:'Your saved customer record · '+String(l.stage||'New lead'),target:'#pipeline-title'}));
  if(!leads.length)ideas.push({module:'sales',title:'Record your first real fashion enquiry',deliverable:'Add one actual customer conversation, relevant offer and next step. Do not invent a customer.',evidence:'No customer records saved on this device',target:'#pipeline-title'});
  if(unlinked.length)ideas.push({module:'visibility_seo',title:'Complete your social profile links',deliverable:'Add your actual '+unlinked.join(', ')+' URLs and check that the Bonga name, bio and website are consistent.',evidence:unlinked.length+' existing channel links still missing from this dashboard',target:'#social-management'});
  if(!campaigns.some(c=>c.status!=='Published'))ideas.push({module:'marketing',title:'Prepare a fashion offer campaign',deliverable:'Draft one post showing your design direction, intended customer and enquiry action. Review before publishing.',evidence:'No campaign drafts saved',target:'#campaign-planner'});
  if(!skills.some(s=>s.proof))ideas.push({module:'ai_skills',title:'Add evidence of your AI design skill',deliverable:'Save one genuine fashion image, video or branding project link and explain what you created. AI learning began in 2023.',evidence:'No portfolio proof links saved',target:'#skills-portfolio'});
  const partner=suppliers.find(s=>s.stage==='Sample approved'||s.stage==='Active supplier');
  if(suppliers.length&&!partner)ideas.push({module:'products',title:'Validate one production partner',deliverable:'Confirm a supplier sample, branding, destination shipping, costs and return terms before promising a product.',evidence:'No sample-approved or active supplier recorded',target:'#supplier-workspace'});
  if(!ideas.length)ideas.push({module:'branding',title:'Review your next growth experiment',deliverable:'Use your latest measured enquiries and orders to choose one offer or campaign improvement.',evidence:'Your core profile, portfolio and planning records are present',target:'#measurement-title'});
  q('#intelligence-summary').textContent='Your saved records show '+open.length+' open customer conversations, '+tasks.filter(t=>!t.done).length+' unfinished tasks and '+campaigns.filter(c=>c.status!=='Published').length+' campaign drafts. '+(work.measurements?.length?'A measured growth snapshot is available.':'Traffic, revenue and conversion are unknown until you record them.');
  q('#intelligence-actions').replaceChildren(...ideas.slice(0,5).map((idea,i)=>{
   const card=el('article');card.className='intelligence-action';card.append(el('span','PRIORITY '+(i+1)),el('h3',idea.title),el('p',idea.deliverable),el('small',idea.evidence));const controls=el('div');controls.className='business-toolbar';const add=el('button','Add to my work');add.className='button primary';add.type='button';add.addEventListener('click',()=>{q('#import-plan').value=JSON.stringify({tasks:[{id:'intelligence-'+new Date().toISOString().slice(0,10)+'-'+idea.module+'-'+i,module:idea.module,title:idea.title,deliverable:idea.deliverable,minutes:25,priority:'high'}]});q('#import-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));q('#intelligence-status').textContent=q('#import-status').textContent||'Check your work queue for the imported task.';});const a=el('a','Open work area');a.href=idea.target;a.className='button secondary';controls.append(add,a);card.append(controls);return card;
  }));
  q('#intelligence-status').textContent='Review complete. Based on records saved on this device; no live AI inference or internet research was performed.';
 }
 q('#run-intelligence').addEventListener('click',analyze);analyze();
})();
