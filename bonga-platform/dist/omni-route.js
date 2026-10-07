'use strict';
(async () => {
  const q = selector => document.querySelector(selector);
  const storageKey = 'bonga-omni-route-v1';
  const dateParts = () => Object.fromEntries(new Intl.DateTimeFormat('en-CA', {timeZone:'Africa/Johannesburg', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(new Date()).map(p => [p.type,p.value]));
  const today = () => { const p=dateParts(); return p.year + '-' + p.month + '-' + p.day; };
  let registry;
  try {
    const response = await fetch('assets/omni-modules.json');
    if (!response.ok) throw new Error('Module definitions unavailable');
    registry = await response.json();
  } catch {
    q('#route-status').textContent = 'The module definitions could not load. Refresh this page to try again.';
    return;
  }
  const modules = registry.modules;
  const byId = Object.fromEntries(modules.map(m => [m.id,m]));
  let state = {version:1,tasks:[],leads:[],measurements:[]};
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.tasks) && Array.isArray(saved.leads) && Array.isArray(saved.measurements)) state = saved;
  } catch { /* A fresh workspace remains available if storage is unavailable. */ }
  let filter = 'all';
  const text = (value, limit) => typeof value === 'string' ? value.trim().slice(0,limit) : '';
  const hash = value => { let h=0; for(const char of value) h=Math.imul(31,h)+char.charCodeAt(0)|0; return (h>>>0).toString(36); };
  function persist() {
    try { localStorage.setItem(storageKey,JSON.stringify(state)); }
    catch { q('.workspace-storage').textContent='This browser could not save your records. Export a backup before leaving this page.'; }
  }
  function el(tag, content, className) {
    const node=document.createElement(tag);
    if(content!==undefined) node.textContent=content;
    if(className) node.className=className;
    return node;
  }
  function normalizeTask(input, prefix='task') {
    if (!byId[input.module]) throw new Error('Each task needs one of the eight known module identifiers.');
    const title=text(input.title,180);
    if(!title) throw new Error('Each task needs a title.');
    const due=/^\d{4}-\d{2}-\d{2}$/.test(input.due||'') ? input.due : today();
    return {id:text(input.id,100)||prefix+'-'+due+'-'+input.module+'-'+hash(title),module:input.module,title,deliverable:text(input.deliverable,500)||byId[input.module].deliverable,minutes:Math.max(5,Math.min(120,Number(input.minutes)||byId[input.module].minutes)),priority:['high','medium','low'].includes(input.priority)?input.priority:byId[input.module].priority,due,done:input.done===true,completed_at:text(input.completed_at,40)};
  }
  state.tasks = state.tasks.flatMap(task => { try { return [normalizeTask(task)]; } catch { return []; } });
  function routeModule(title) {
    const value=title.toLowerCase();
    let best='career',score=0;
    for(const module of modules) {
      const matches=module.signals.filter(signal=>value.includes(signal)).length;
      if(matches>score) {best=module.id;score=matches;}
    }
    return best;
  }
  function queueModule(id, prefix='daily') {
    const module=byId[id];
    const task=normalizeTask({module:id,title:module.task,deliverable:module.deliverable,minutes:module.minutes,priority:module.priority},prefix);
    if(state.tasks.some(t=>t.id===task.id)) return false;
    state.tasks.push(task); return true;
  }
  function dailyRoute() {
    const day=new Date(today()+'T12:00:00Z').getUTCDay();
    const rotations=[['branding','career'],['marketing','ai_skills'],['visibility_seo','products'],['branding','opportunities'],['marketing','career'],['visibility_seo','ai_skills'],['products','opportunities']];
    let count=0;
    for(const id of ['sales',...rotations[day]]) if(queueModule(id)) count++;
    persist();renderTasks();
    q('#route-status').textContent=count ? count+' focused tasks added for today.' : 'Today’s route is already in your workspace.';
  }
  function setFilter(id) {
    filter=id;
    document.querySelectorAll('[data-filter]').forEach(button=>{
      const active=button.dataset.filter===id;
      button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));
    });
    renderTasks();
  }
  function renderTasks() {
    q('#open-count').textContent=String(state.tasks.filter(t=>!t.done).length);
    q('#done-count').textContent=String(state.tasks.filter(t=>t.done).length);
    const priorities={high:0,medium:1,low:2};
    const tasks=state.tasks.filter(t=>filter==='all'||t.module===filter).sort((a,b)=>Number(a.done)-Number(b.done)||a.due.localeCompare(b.due)||priorities[a.priority]-priorities[b.priority]);
    q('#task-list').replaceChildren(...tasks.map(task=>{
      const row=el('article',undefined,'task-row'+(task.done?' done':''));
      const check=el('button',task.done?'✓':'','task-check');check.type='button';check.setAttribute('aria-pressed',String(task.done));check.setAttribute('aria-label',(task.done?'Reopen: ':'Complete: ')+task.title);
      check.addEventListener('click',()=>{task.done=!task.done;task.completed_at=task.done?new Date().toISOString():'';persist();renderTasks();});
      const content=el('div');content.append(el('span',byId[task.module].name.toUpperCase(),'task-module'),el('h3',task.title),el('p',task.deliverable));
      const time=el('div',task.minutes+' MIN · '+task.due,'task-time');time.append(el('span',task.priority.toUpperCase()+' PRIORITY','task-priority'));
      row.append(check,content,time);return row;
    }));
    if(!tasks.length) q('#task-list').append(el('p','No tasks in this view yet. Add a goal or queue work from a module below.','omni-empty'));
  }
  const stages=['New lead','Conversation','Brief received','Quote / proposal','Won','Closed'];
  function renderLeads() {
    q('#lead-count').textContent=String(state.leads.filter(x=>x.stage!=='Won'&&x.stage!=='Closed').length);
    q('#pipeline-list').replaceChildren(...state.leads.map(lead=>{
      const row=el('article',undefined,'pipeline-row');const identity=el('div');identity.append(el('h3',lead.name),el('small',lead.service));
      const stage=el('select');stage.setAttribute('aria-label','Stage for '+lead.name);
      stages.forEach(name=>{const option=el('option',name);option.value=name;stage.append(option);});stage.value=lead.stage;
      stage.addEventListener('change',()=>{lead.stage=stage.value;persist();renderLeads();});
      const nextStep=el('input');nextStep.value=lead.next;nextStep.maxLength=180;nextStep.setAttribute('aria-label','Next step for '+lead.name);
      nextStep.addEventListener('change',()=>{const next=text(nextStep.value,180);if(!next){nextStep.value=lead.next;return;}lead.next=next;persist();q('#pipeline-status').textContent='Next step updated on this device.';});
      row.append(identity,nextStep,stage);return row;
    }));
    if(!state.leads.length) q('#pipeline-list').append(el('p','No customer records entered yet. Start with a real contact or enquiry.','omni-empty'));
  }
  function renderMeasurements() {
    q('#measurement-history').replaceChildren(...state.measurements.slice(-5).reverse().map(record=>el('p',record.date+' · Visits: '+(record.visits??'unknown')+' · Enquiries: '+(record.enquiries??'unknown')+' · Orders: '+(record.orders??'unknown'),'measurement-row')));
    if(!state.measurements.length) q('#measurement-history').append(el('p','No measurements entered. Your business results are currently unknown.','measurement-row'));
  }
  q('#workspace-date').textContent='BONGA BHENGU · '+new Intl.DateTimeFormat('en-ZA',{timeZone:'Africa/Johannesburg',day:'numeric',month:'long',year:'numeric'}).format(new Date());
  const moduleFilters=q('#module-filters');const moduleOptions=q('#task-module');
  modules.forEach(module=>{
    const button=el('button',module.name,'module-filter');button.type='button';button.dataset.filter=module.id;button.setAttribute('aria-pressed','false');button.append(el('span',module.code));button.addEventListener('click',()=>setFilter(module.id));moduleFilters.append(button);
    const option=el('option',module.name);option.value=module.id;moduleOptions.append(option);
    const card=el('article',undefined,'module-card');card.append(el('span',module.code+' / MODULE'),el('h3',module.name),el('p',module.purpose));
    const capabilities=el('ul',undefined,'module-capabilities');module.capabilities.forEach(name=>capabilities.append(el('li',name)));card.append(capabilities);
    const queue=el('button','Queue this module’s task','text-link');queue.type='button';queue.addEventListener('click',()=>{const added=queueModule(module.id);persist();setFilter(module.id);q('#route-status').textContent=added?'Module task added.':'This module’s task is already queued for today.';q('.daily-route').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});card.append(queue);q('#module-library').append(card);
  });
  q('[data-filter="all"]').addEventListener('click',()=>setFilter('all'));
  q('#generate-route').addEventListener('click',dailyRoute);
  q('#task-form').addEventListener('submit',event=>{
    event.preventDefault();const title=q('#task-title').value.trim();if(!title)return;
    const module=q('#task-module').value==='auto'?routeModule(title):q('#task-module').value;
    const task=normalizeTask({module,title,deliverable:q('#task-deliverable').value},'manual');
    if(state.tasks.some(t=>t.id===task.id)) {q('#route-status').textContent='That task is already in your workspace.';return;}
    state.tasks.push(task);persist();setFilter('all');q('#task-form').reset();q('#route-status').textContent='Task routed to '+byId[module].name+'.';
  });
  q('#import-form').addEventListener('submit',event=>{
    event.preventDefault();
    try {
      const raw=q('#import-plan').value.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'');const payload=JSON.parse(raw);
      if(!Array.isArray(payload.tasks)||payload.tasks.length>200) throw new Error('Use a JSON object with a tasks array, containing at most 200 tasks.');
      const tasks=payload.tasks.map(input=>normalizeTask(input,'import'));let added=0;
      const backup=payload.version===1&&Array.isArray(payload.leads)&&Array.isArray(payload.measurements);
      for(const task of tasks) {
        const existing=state.tasks.find(t=>t.id===task.id||(t.module===task.module&&t.title===task.title&&t.due===task.due));
        if(existing&&backup) Object.assign(existing,task);
        else if(!existing) {state.tasks.push(task);added++;}
      }
      if(Array.isArray(payload.leads)) for(const input of payload.leads.slice(0,500)) {
        if(!input||typeof input!=='object')continue;const name=text(input.name,100),next=text(input.next,180);if(!name||!next)continue;
        const lead={id:text(input.id,100)||'lead-'+hash(name+next),name,service:text(input.service,100),next,stage:stages.includes(input.stage)?input.stage:'New lead'};
        if(!state.leads.some(x=>x.id===lead.id))state.leads.push(lead);
      }
      if(Array.isArray(payload.measurements)) for(const input of payload.measurements.slice(0,100)) {
        if(!/^\d{4}-\d{2}-\d{2}$/.test(input.date||''))continue;
        const record={date:input.date};for(const key of ['visits','enquiries','orders'])record[key]=Number.isInteger(input[key])&&input[key]>=0?input[key]:null;
        if(!state.measurements.some(x=>JSON.stringify(x)===JSON.stringify(record)))state.measurements.push(record);
      }
      persist();setFilter('all');renderLeads();renderMeasurements();q('#import-status').textContent=added+' tasks imported. Backup records restored when included.';
    } catch(error) {q('#import-status').textContent='Import could not complete: '+error.message;}
  });
  q('#export-workspace').addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify({...state,exported_at:new Date().toISOString()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='Bonga-Bhengu-Omni-Route-'+today()+'.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);q('#import-status').textContent='Workspace backup download started. Keep it private if it contains customer records.';
  });
  q('#lead-form').addEventListener('submit',event=>{
    event.preventDefault();const name=text(q('#lead-name').value,100),next=text(q('#lead-next').value,180);if(!name||!next)return;
    const lead={id:'lead-'+hash(name+next),name,service:q('#lead-service').value,next,stage:'New lead'};
    if(state.leads.some(x=>x.id===lead.id)){q('#pipeline-status').textContent='That customer record is already saved.';return;}
    state.leads.push(lead);persist();renderLeads();q('#lead-form').reset();q('#pipeline-status').textContent='Customer record saved on this device.';
  });
  q('#measurement-form').addEventListener('submit',event=>{
    event.preventDefault();const record={date:today()};
    for(const [key,id] of [['visits','#metric-visits'],['enquiries','#metric-enquiries'],['orders','#metric-orders']]) {
      const value=q(id).value;record[key]=value===''?null:Number(value);
      if(record[key]!==null&&(!Number.isInteger(record[key])||record[key]<0||record[key]>100000000)){q('#measurement-status').textContent='Use whole numbers of zero or more, or leave the field empty.';return;}
    }
    state.measurements.push(record);persist();renderMeasurements();q('#measurement-status').textContent='Snapshot saved from your entered values.';
  });
  if(!state.tasks.length) dailyRoute(); else renderTasks();
  renderLeads();renderMeasurements();
})();
