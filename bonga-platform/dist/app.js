'use strict';
const navigation = document.querySelector('#navigation');
const menu = document.querySelector('.menu-toggle');
function closeMenu() { navigation.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open navigation'); }
menu.addEventListener('click', () => { const opened = navigation.classList.toggle('is-open'); menu.setAttribute('aria-expanded', String(opened)); menu.setAttribute('aria-label', opened ? 'Close navigation' : 'Open navigation'); });
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if(event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
document.querySelector('#year').textContent = String(new Date().getFullYear());

const practices = {
  fashion: {category:'THE FASHION PRACTICE',word:'DON',second:'LEGEND.',note:'AFRICAN IDENTITY. CONTEMPORARY EXPRESSION.',eyebrow:'FASHION · COLLECTION DEVELOPMENT',title:'From an idea\nto a garment with identity.',description:'Contemporary African fashion, expressive denim and streetwear grounded in garment construction. My practice connects concepts, patterns, materials, styling and the finished collection.',tags:['Denim & mixed materials','Collection development','Creative direction'],cta:'Discuss a fashion project',service:'Fashion & creative direction',sourceLabel:'View the public DONLEGEND listing',source:'https://www.cylex.net.za/company/fukulisane-23781958.html'},
  ai: {category:'INNOVATIVE AI DESIGN',word:'CRAFT',second:'× AI.',note:'HUMAN CREATIVITY. NEW TOOLS.',eyebrow:'AI VISUALS · BRAND STORYTELLING',title:'Give your next idea\nroom to take shape.',description:'Innovative AI Design brings my fashion perspective to image and video exploration, campaign concepts and brand storytelling. My self-taught AI journey began in 2023, with practical learning at its heart.',tags:['Fashion concept visuals','Campaign visuals','Brand storytelling'],cta:'Discuss an AI project',service:'AI visuals & content',sourceLabel:'',source:''},
  systems: {category:'THE FOUNDER’S NEXT CHAPTER',word:'ZUX',second:'URU.',note:'BUSINESS GROWTH SYSTEM · IN DEVELOPMENT',eyebrow:'ZUXURU · FOUNDER VISION',title:'Helping skilled owners\nsee new possibilities.',description:'I’m building Zuxuru, a business growth operating system for skilled small-business owners. It helps skilled business owners find opportunities and build a stronger business. Product development is ongoing.',tags:['Evidence-led visibility','Business connections','Creative business thinking'],cta:'Talk about your business',service:'Brand strategy & visual identity',sourceLabel:'',source:''}
};
const tabs = [...document.querySelectorAll('[data-practice]')];
function selectPractice(key, focusTab = false) {
  const data = practices[key];
  tabs.forEach(tab => { const active = tab.dataset.practice === key; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; if(active && focusTab) tab.focus(); });
  const panel = document.querySelector('#practice-panel'); panel.className = 'practice-panel ' + key + '-panel'; panel.setAttribute('aria-labelledby', 'tab-' + key);
  document.querySelector('#panel-category').textContent = data.category;
  const word = document.querySelector('#panel-word'); word.replaceChildren(document.createTextNode(data.word),document.createElement('br')); const span = document.createElement('span'); span.textContent = data.second; word.append(span);
  document.querySelector('#panel-note').textContent = data.note;
  document.querySelector('#panel-eyebrow').textContent = data.eyebrow;
  const title = document.querySelector('#panel-title'); title.replaceChildren(); data.title.split('\n').forEach((line,i) => { if(i) title.append(document.createElement('br')); title.append(document.createTextNode(line)); });
  document.querySelector('#panel-description').textContent = data.description;
  const tagsList = document.querySelector('#panel-tags'); tagsList.replaceChildren(...data.tags.map(tag => { const li = document.createElement('li'); li.textContent = tag; return li; }));
  const cta = document.querySelector('#panel-cta'); cta.textContent = data.cta; cta.dataset.service = data.service;
  const source = document.querySelector('#panel-source'); source.replaceChildren(); if(data.source) { const a = document.createElement('a'); a.href = data.source; a.textContent = data.sourceLabel; a.target = '_blank'; a.rel = 'noopener noreferrer'; source.append(a); } source.hidden = !data.source;
}
tabs.forEach((tab, index) => { tab.addEventListener('click',()=>selectPractice(tab.dataset.practice)); tab.addEventListener('keydown',event=>{ let next; if(event.key==='ArrowRight') next=(index+1)%tabs.length; else if(event.key==='ArrowLeft') next=(index+tabs.length-1)%tabs.length; else if(event.key==='Home') next=0; else if(event.key==='End') next=tabs.length-1; else return; event.preventDefault(); selectPractice(tabs[next].dataset.practice,true); }); });
selectPractice('fashion');

const form = document.querySelector('#brief-form');
const result = document.querySelector('#brief-result');
const status = document.querySelector('#brief-status');
let currentBrief = '';
function editBrief(focus = false) { form.hidden = false; result.hidden = true; status.textContent = ''; if(focus) document.querySelector('#brief-name').focus(); }
document.addEventListener('click', event => { const trigger = event.target.closest('[data-service]'); if(!trigger) return; document.querySelector('#brief-service').value = trigger.dataset.service; editBrief(); if(trigger.tagName === 'BUTTON') document.querySelector('#contact').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}); });
form.addEventListener('submit', event => {
  event.preventDefault();
  const name = document.querySelector('#brief-name').value.trim();
  const goal = document.querySelector('#brief-goal').value.trim();
  if(!name || !goal) { status.textContent = 'Please add your name and a few words about your idea.'; return; }
  currentBrief = 'PROJECT BRIEF FOR BONGA BHENGU\n\nName / brand: ' + name + '\nCreative direction: ' + document.querySelector('#brief-service').value + '\n\nWhat I want to create or improve:\n' + goal + '\n\nPrepared on: ' + new Date().toLocaleDateString('en-ZA') + '\n\nPlease contact Bonga to discuss scope, timing and a quote.';
  document.querySelector('#brief-text').textContent = currentBrief;
  document.querySelector('#email-brief').href = 'mailto:bongabhengu@yahoo.com?subject=' + encodeURIComponent('Project brief — ' + name) + '&body=' + encodeURIComponent(currentBrief);
  document.querySelector('#whatsapp-brief').href = 'https://wa.me/?text=' + encodeURIComponent(currentBrief);
  form.hidden = true; result.hidden = false; status.textContent = 'Your brief is ready. Copy or download it to share with Bonga.'; document.querySelector('#brief-text').focus();
});
document.querySelector('#edit-brief').addEventListener('click',()=>editBrief(true));
document.querySelector('#copy-brief').addEventListener('click',async()=>{ try { await navigator.clipboard.writeText(currentBrief); status.textContent='Brief copied. You can paste it into your message.'; } catch { const selection = window.getSelection(); const range = document.createRange(); range.selectNodeContents(document.querySelector('#brief-text')); selection.removeAllRanges(); selection.addRange(range); status.textContent='Your browser could not copy automatically. The brief is selected; use Copy.'; } });
document.querySelector('#download-brief').addEventListener('click',()=>{ const blob = new Blob([currentBrief],{type:'text/plain;charset=utf-8'}); const url=URL.createObjectURL(blob); const link=document.createElement('a'); link.href=url; link.download='Bonga-Bhengu-project-brief.txt'; document.body.append(link); link.click(); link.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000); status.textContent='Brief downloaded. Share the file when you contact Bonga.'; });
