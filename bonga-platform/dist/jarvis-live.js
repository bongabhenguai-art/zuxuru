'use strict';
(() => {
  const q=s=>document.querySelector(s);let result=null,ready=false;
  const status=q('#live-ai-status'),send=q('#live-ai-send');
  async function connection(){
    try{const r=await fetch('/api/jarvis/status',{credentials:'same-origin',cache:'no-store'});if(!r.ok)throw Error();const d=await r.json();ready=d.ready;send.disabled=!ready;q('#live-ai-login').hidden=d.owner;status.textContent=d.ready?'AI connected · owner workspace':!d.configured?'AI connection needs setup · daily task routing is available':d.signed_in?'Use the website owner account to open Jarvis.':'Sign in to use your private AI assistant.';}catch{send.disabled=true;status.textContent='Connection unavailable. Your task workspace still works.';}
  }
  connection();
  document.querySelectorAll('[data-ai-request]').forEach(button=>button.addEventListener('click',()=>{q('#live-ai-prompt').value=button.dataset.aiRequest;q('#live-ai-mode').value=button.dataset.aiMode||'plan';q('#live-ai-prompt').focus();}));
  q('#live-ai-form').addEventListener('submit',async event=>{
    event.preventDefault();send.disabled=true;send.textContent='Working…';status.textContent=q('#live-ai-mode').value==='research'?'Researching public sources…':'Preparing your draft…';q('#live-ai-add').disabled=true;
    try{
      const body={prompt:q('#live-ai-prompt').value,mode:q('#live-ai-mode').value};
      if(q('#live-ai-context').checked){try{body.tasks=JSON.parse(localStorage.getItem('bonga-omni-route-v1')||'{}').tasks||[];}catch{body.tasks=[];}}
      const r=await fetch('/api/jarvis/chat',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw Error(data.error||'Jarvis could not complete the request.');result=data;
      q('#live-ai-answer').textContent=data.answer;q('#live-ai-result').hidden=false;q('#live-ai-sources').replaceChildren();
      for(const source of data.sources||[]){if(!/^https?:\/\//.test(source.url))continue;const a=document.createElement('a');a.href=source.url;a.textContent=source.title;a.target='_blank';a.rel='noopener noreferrer';q('#live-ai-sources').append(a);}
      q('#live-ai-add').disabled=!(data.tasks||[]).length;q('#live-ai-copy').disabled=false;status.textContent='Draft ready for your review. Nothing has been posted or sent.';
    }catch(error){status.textContent=error.message;}finally{send.textContent='Ask Jarvis';send.disabled=!ready;}
  });
  q('#live-ai-add').addEventListener('click',()=>{if(!result?.tasks?.length)return;q('#import-plan').value=JSON.stringify({tasks:result.tasks});q('#import-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));q('#task-list').scrollIntoView({behavior:'smooth',block:'start'});});
  q('#live-ai-copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(result.answer);status.textContent='Draft copied.';}catch{status.textContent='Select the draft text to copy it.';}});
})();
