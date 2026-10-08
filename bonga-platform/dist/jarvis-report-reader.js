(()=>{const input=document.getElementById('jarvis-report-file');if(!input)return;const text=document.getElementById('jarvis-report-text'),status=document.getElementById('jarvis-report-status');let generation=0;const sourceList=document.getElementById('jarvis-report-sources'),sourceCount=document.getElementById('jarvis-report-source-count');
const prepareTask=(area,title,deliverable)=>{
  const form=document.getElementById('designer-task-form');
  if(!form){status.textContent='Daily work is unavailable. Refresh the dashboard.';return;}
  if(['title','deliverable','due'].some(k=>form.elements.namedItem(k).value)&&!confirm('Replace the unsaved task brief?'))return;
  delete form.dataset.sourceOrderId;form.elements.namedItem('area').value=area;
  form.elements.namedItem('title').value=title.slice(0,200);form.elements.namedItem('deliverable').value=deliverable.slice(0,1000);form.elements.namedItem('due').value='';
  location.hash='my-work';form.scrollIntoView({behavior:'auto'});form.elements.namedItem('title').focus();
  const note=document.getElementById('designer-work-status');if(note)note.textContent='Review this evidence-based draft, choose a due date, then Add to my work. Marketing and branding tasks can open in Studio after saving.';
};
const digest=document.getElementById('jarvis-report-digest'),coverage=document.getElementById('jarvis-report-coverage'),recommendations=document.getElementById('jarvis-report-recommendations');
const showDigest=()=>{
  if(!digest)return;
  const value=text.value,isMorning=value.startsWith('# Bonga Bhengu morning fashion and social report');
  digest.hidden=!isMorning;if(!isMorning)return;
  if(coverage){
    coverage.replaceChildren();
    const section=value.match(/## Collection status\s+([\s\S]*?)(?=\n## |$)/)?.[1]||'';
    for(const line of section.split('\n').filter(line=>line.startsWith('- ')).slice(0,20)){
      const item=document.createElement('li');item.textContent=line.slice(2);coverage.append(item);
    }
    if(!coverage.children.length){const item=document.createElement('li');item.textContent='Collection status not included in this report.';coverage.append(item);}
  }
  if(recommendations){
    const section=value.match(/## Jarvis recommendations[^\n]*\n([\s\S]*?)(?=\n## Next steps|$)/)?.[1];
    recommendations.textContent=section?.trim()||'No AI recommendations in this report. Review the source links and prepare your own task.';
    const editor=document.getElementById('jarvis-recommendation-brief'),button=document.getElementById('jarvis-recommendation-task');
    if(editor)editor.value=(section?.trim()||'').slice(0,700);
    if(button)button.disabled=!section?.trim();
    const note=document.getElementById('jarvis-recommendation-note');if(note)note.textContent=section?.trim().length>700?'This editable brief contains the first 700 characters. Review the full recommendations above and choose the action you want.':'Edit the proposed action before preparing your task. Recommendations are drafts, not verified instructions.';

  }
};
const recommendationTask=document.getElementById('jarvis-recommendation-task');
if(recommendationTask)recommendationTask.onclick=()=>{
  const brief=document.getElementById('jarvis-recommendation-brief').value.trim(),area=document.getElementById('jarvis-recommendation-area').value,title=document.getElementById('jarvis-recommendation-title').value.trim();
  if(!brief||!title){status.textContent='Enter a task title and a recommendation to review.';return;}
  const run=document.getElementById('jarvis-report-run'),source=run&&!run.hidden&&/^https:\/\/github\.com\/bongabhenguai-art\/zuxuru\/actions\/runs\/\d+$/.test(run.href)?'\nReport run: '+run.href:'';
  prepareTask(area,title,'Verify the cited evidence and relevance before acting.\n\n'+brief.slice(0,700)+source);
};
const showSources=()=>{
  showDigest();
  if(!sourceList)return;sourceList.replaceChildren();let title='',count=0;const seen=new Set();
  for(const line of text.value.split('\n')){
    if(/^E\d+: /.test(line))title=line.trim();
    if(!line.startsWith('Source: '))continue;
    try{
      const url=new URL(line.slice(8).trim());
      if(url.protocol!=='https:'||url.username||url.password||seen.has(url.href)||count>=30)continue;
      seen.add(url.href);const item=document.createElement('li'),link=document.createElement('a');
      link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';link.textContent=(title||'Open source')+' · '+url.hostname;item.append(link);
      const area=document.createElement('select');area.setAttribute('aria-label','Work area for '+(title||'this source'));
      for(const [value,label] of [['marketing','Marketing & social'],['branding','Brand identity'],['products','Fashion product discovery'],['visibility','Visibility & SEO'],['opportunities','Opportunity review']]){const option=document.createElement('option');option.value=value;option.textContent=label;area.append(option);}
      area.value='marketing';const sourceTitle=title||'Public fashion source',sourceUrl=url.href;
      const task=document.createElement('button');task.type='button';task.textContent='Prepare task';
      task.onclick=()=>{
        if(sourceUrl.length>750){status.textContent='This source URL is too long for a task brief. Open the source and use its direct article link in daily work.';return;}
        const next={marketing:'Draft a campaign or social post after checking this evidence against our customer and collection.',branding:'Review how this evidence could improve Bonga Bhengu brand positioning.',products:'Investigate a design or product idea. Confirm demand, costing and sourcing before production.',visibility:'Review a relevant visibility or SEO opportunity; confirm the search intent and current website.',opportunities:'Check whether this opportunity is relevant and supported.'}[area.value]||'Review this evidence.';
        prepareTask(area.value,'Review: '+sourceTitle.replace(/^E\d+: /,''),'Source: '+sourceUrl+'\n\n'+next+'\nVerify the source and date before acting. No publishing or customer outreach has been performed.');
      };
      item.append(area,task);sourceList.append(item);count++;
    }catch{}
  }
  if(sourceCount)sourceCount.textContent=count?count+' source links from this report. Check each source before acting.':'No source links in this report yet.';
};
text.addEventListener('input',showSources);
const runLink=document.getElementById('jarvis-report-run');const resetRun=()=>{if(runLink){runLink.hidden=true;runLink.removeAttribute('href');}};const cloud=document.getElementById('jarvis-load-cloud-report');const history=document.getElementById('jarvis-cloud-history'),openHistory=document.getElementById('jarvis-open-cloud-history');
const morning=document.getElementById('jarvis-load-morning-report');let currentKind='';
const openCloud=async(id='',kind='')=>{
  if(text.value.trim()&&!confirm('Replace the report currently open?'))return;
  const attempt=++generation;cloud.disabled=true;if(morning)morning.disabled=true;if(openHistory)openHistory.disabled=true;status.textContent='Opening your cloud report…';
  try{
    const query=new URLSearchParams();if(id)query.set('report',id);if(kind)query.set('kind',kind);
    const r=await fetch('/api/jarvis/cloud/report'+(query.size?'?'+query.toString():'')),d=await r.json();
    if(!r.ok)throw Error(d.error||'Cloud report unavailable');if(attempt!==generation)return;currentKind=kind;
    if(history){history.replaceChildren();for(const entry of d.history||[]){const option=document.createElement('option');option.value=entry.id;option.textContent=new Date(entry.created_at).toLocaleString()+' · Run '+entry.run_id;history.append(option);}if(d.report?.id)history.value=d.report.id;}
    if(!d.report){status.textContent='No matching report received yet. Run the morning report or a task in GitHub first.';return;}
    stopVoice();text.value=d.report.report;showSources();resetRun();if(runLink&&/^\d+$/.test(String(d.report.run_id))){runLink.href='https://github.com/bongabhenguai-art/zuxuru/actions/runs/'+d.report.run_id;runLink.hidden=false;}const received=new Date(d.report.created_at),day=date=>new Intl.DateTimeFormat('en-ZA',{timeZone:'Africa/Johannesburg',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);const freshness=Number.isNaN(received.getTime())?'Date unavailable':day(received)===day(new Date())?'Received today':'Older report — not today’s update';status.textContent=freshness+'. Received '+received.toLocaleString('en-ZA',{timeZone:'Africa/Johannesburg'})+' (South Africa). Review its claims before acting.';
  }catch(e){if(attempt===generation)status.textContent=e.message||'Cloud report unavailable';}
  finally{cloud.disabled=false;if(morning)morning.disabled=false;if(openHistory)openHistory.disabled=!history?.value;}
};
if(cloud)cloud.onclick=()=>openCloud();
if(morning)morning.onclick=()=>openCloud('','morning');
if(openHistory)openHistory.onclick=()=>{if(history.value)openCloud(history.value,currentKind);};
input.onchange=async()=>{const attempt=++generation;try{const file=input.files[0];if(!file)return;if(file.size>200000||!/^.*\.(md|txt)$/i.test(file.name))throw Error('Choose a Markdown or text report under 200 KB. Extract the GitHub ZIP first.');const value=await file.text();if(attempt!==generation)return;if(!value.trim()||value.includes('\u0000'))throw Error('This report is empty or is not a text file.');stopVoice();text.value=value.slice(0,40000);showSources();resetRun();status.textContent='Opened '+file.name+' on this device. Review dates and proof links; importing does not verify the claims.';}catch(e){if(attempt===generation)status.textContent=e.message;}finally{input.value='';}};
const download=document.getElementById('jarvis-report-download');
if(download)download.onclick=()=>{
  if(!text.value.trim()){status.textContent='Open or paste a report first.';return;}
  const url=URL.createObjectURL(new Blob([text.value],{type:'text/markdown;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='bonga-bhengu-jarvis-'+new Date().toISOString().slice(0,10)+'.md';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  status.textContent='Download requested. Your copy includes the edits currently in this report; the saved cloud report remains unchanged.';
};
let voiceGeneration=0;
const stopVoice=()=>{voiceGeneration++;window.speechSynthesis?.cancel();};
const speakBrief=(value,label)=>{
  if(!window.speechSynthesis){status.textContent='Voice readout is unavailable in this browser.';return;}
  if(!value.trim()){status.textContent='Open a report first.';return;}
  stopVoice();const attempt=voiceGeneration,chunks=value.slice(0,16000).match(/[\s\S]{1,1400}/g)||[];let index=0;
  const next=()=>{
    if(attempt!==voiceGeneration)return;
    if(index>=chunks.length){status.textContent=label+' finished.';return;}
    const speech=new SpeechSynthesisUtterance(chunks[index++]);speech.lang='en-ZA';
    const voices=window.speechSynthesis.getVoices?.()||[];speech.voice=voices.find(v=>v.lang==='en-ZA')||voices.find(v=>v.lang.startsWith('en'))||null;
    speech.onend=next;speech.onerror=event=>{if(attempt===voiceGeneration&&event.error!=='canceled'&&event.error!=='interrupted')status.textContent='Voice playback failed. Try your browser voice settings.';};
    window.speechSynthesis.speak(speech);status.textContent='Reading '+label.toLowerCase()+' — part '+index+' of '+chunks.length+'.';
  };next();
};
document.getElementById('jarvis-report-read').onclick=()=>speakBrief(text.value,'Full report');
document.getElementById('jarvis-report-stop').onclick=()=>{stopVoice();status.textContent='Voice stopped.';};
const readMorning=document.getElementById('jarvis-read-morning-brief');
if(readMorning)readMorning.onclick=()=>{
  if(!text.value.startsWith('# Bonga Bhengu morning fashion and social report')){status.textContent='Open a morning fashion report first.';return;}
  const collection=(text.value.match(/## Collection status\s+([\s\S]*?)(?=\n## |$)/)?.[1]||'Collection status unavailable.').replace(/^- /gm,'');
  const actions=(text.value.match(/## Jarvis recommendations[^\n]*\n([\s\S]*?)(?=\n## Next steps|$)/)?.[1]||'No AI recommendations are available. Review the sources manually.');
  const clean=value=>value.replace(/https?:\/\/\S+/g,'source link in dashboard').replace(/[*#`]/g,'');
  speakBrief('Bonga Bhengu morning briefing. Public evidence and AI proposals for your review. Source coverage. '+clean(collection)+' Proposed actions. '+clean(actions)+' Check the linked evidence before acting.','Morning briefing');
};
const stopMorning=document.getElementById('jarvis-stop-morning-brief');if(stopMorning)stopMorning.onclick=()=>{stopVoice();status.textContent='Voice stopped.';};
document.getElementById('jarvis-report-task').onclick=()=>{const selected=text.value.slice(text.selectionStart,text.selectionEnd).trim();if(!selected){status.textContent='Select a finding in the report before preparing a task.';text.focus();return;}prepareTask('opportunities','Review morning report finding','Check source, date, market and relevance before acting.\n\n'+selected);};const delivery=document.getElementById('jarvis-cloud-delivery-status'),refreshDelivery=document.getElementById('jarvis-cloud-delivery-refresh');
const refreshCloudStatus=async()=>{
  if(!delivery||refreshDelivery?.disabled)return;if(refreshDelivery)refreshDelivery.disabled=true;delivery.textContent='Checking last morning report delivery…';
  try{
    const response=await fetch('/api/jarvis/cloud/report?kind=morning',{cache:'no-store',signal:AbortSignal.timeout(15000)}),data=await response.json();
    if(!response.ok)throw Error(data.error||'Report status unavailable');
    if(!data.report){delivery.textContent='No morning report delivered yet. Daily collection is scheduled around 07:00 South Africa time. You can also run a morning report in GitHub.';return;}
    const date=new Date(data.report.created_at),format=new Intl.DateTimeFormat('en-ZA',{timeZone:'Africa/Johannesburg',year:'numeric',month:'2-digit',day:'2-digit'});
    const fresh=!Number.isNaN(date.getTime())&&format.format(date)===format.format(new Date());
    delivery.textContent=(fresh?'Morning report delivered today. ':'Latest morning report is from an earlier day. ')+ 'Last delivery: '+date.toLocaleString('en-ZA',{timeZone:'Africa/Johannesburg'})+' (South Africa). Scheduled around 07:00 daily; task execution is not continuous.';
  }catch(error){delivery.textContent=error.name==='TimeoutError'?'Cloud report status timed out. Refresh to try again.':error.message||'Could not check report delivery. Sign in and refresh.';}
  finally{if(refreshDelivery)refreshDelivery.disabled=false;}
};
if(refreshDelivery)refreshDelivery.onclick=refreshCloudStatus;
refreshCloudStatus();
window.addEventListener('pagehide',stopVoice);})();
