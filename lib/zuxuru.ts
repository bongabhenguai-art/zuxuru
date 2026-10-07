import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
export const runtime=()=>env as unknown as {DB:D1Database;BUCKET:R2Bucket;OPENAI_API_KEY?:string;TAVILY_API_KEY?:string;SEARCH_VAULT_KEY?:string};
export async function vault(){const value=runtime().SEARCH_VAULT_KEY;if(!value)throw Error('Connection storage is not configured.');return crypto.subtle.importKey('raw',Uint8Array.from(atob(value),c=>c.charCodeAt(0)),{name:'AES-GCM'},false,['encrypt','decrypt']);}
export async function searchKeyForOwner(owner:string){
 const globalKey=runtime().TAVILY_API_KEY;if(globalKey)return globalKey;
 const rows=await list(owner,'search_connection');if(!rows[0])return null;
 try{const row=rows[0],key=await vault();const value=await crypto.subtle.decrypt({name:'AES-GCM',iv:Uint8Array.from(atob(row.iv),c=>c.charCodeAt(0))},key,Uint8Array.from(atob(row.ciphertext),c=>c.charCodeAt(0)));return new TextDecoder().decode(value);}catch{throw Error('Search connection needs to be reconnected.');}
}
export async function connectSearch(owner:string,apiKey:string){
 if(!apiKey||apiKey.length>500)throw Error('Enter a valid Tavily API key.');
 const r=await fetch('https://api.tavily.com/search',{method:'POST',headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},body:JSON.stringify({query:'Tavily',max_results:1,search_depth:'basic',include_answer:false}),signal:AbortSignal.timeout(20000)});
 if(!r.ok)throw Error('Authorization Failed: Tavily returned '+r.status+'.');const result:any=await r.json();if(!Array.isArray(result.results))throw Error('Source Unavailable: provider response was invalid.');
 const key=await vault(),iv=crypto.getRandomValues(new Uint8Array(12));const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(apiKey));
 const bytes=new Uint8Array(encrypted),encoded=btoa(String.fromCharCode(...bytes));const existing=(await list(owner,'search_connection'))[0];
 await save(owner,'search_connection',{provider:'Tavily',iv:btoa(String.fromCharCode(...iv)),ciphertext:encoded,verifiedAt:new Date().toISOString()},existing?.id);
 return {provider:'Tavily',status:'Connected · API authorization verified',verifiedAt:new Date().toISOString()};
}
const normalized=(s:string)=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function matchesName(name:string,result:{title?:string;excerpt?:string;url?:string}){
 const expected=normalized(name);if(!expected)return false;
 const text=' '+normalized((result.title||'')+' '+(result.excerpt||''))+' ';
 let url='';try{url=normalized(decodeURIComponent(result.url||''));}catch{url=normalized(result.url||'');}
 return text.includes(' '+expected+' ')||expected.split(' ').every(word=>(' '+text+' '+url+' ').includes(' '+word+' '))||(expected.replace(/ /g,'').length>=5&&url.replace(/ /g,'').includes(expected.replace(/ /g,'')));
}
export function validatedProfile(p:any){
 const name=p.searchName||p.name;
 const evidence=(p.evidence||[]).filter((e:any)=>!String(e.state).startsWith('Candidate')||matchesName(name,e));
 const suppressed=(p.evidence||[]).length-evidence.length;
 const selectedValid=!!p.selectedEvidenceId&&evidence.some((e:any)=>e.id===p.selectedEvidenceId);
 return {...p,evidence,suppressedResults:(p.suppressedResults||0)+suppressed,...(suppressed?{validationNotice:suppressed+' unrelated search results hidden. These are not evidence for '+name+'.'}:{}),...(!selectedValid?{selectedEvidenceId:null,selectedSourceUrl:null,selectedSourceTitle:null,identityConfirmed:false}:{} )};
}
export const clean=(x:unknown,max=2000)=>typeof x==='string'?x.trim().slice(0,max):'';
export const isOwner=(email:string)=>email.toLowerCase()==='donlegendwear@gmail.com';
export async function identity(){const user=await getChatGPTUser();if(!user)throw Error('Sign in with ChatGPT to open your private workspace.');return user;}
export async function list(owner:string,kind:string){
 const r=await runtime().DB.prepare('SELECT * FROM records WHERE owner = ? AND kind = ? ORDER BY updated_at DESC, id DESC LIMIT 40').bind(owner,kind).all();
 return r.results.map((x:any)=>({...JSON.parse(x.data),id:x.id,createdAt:x.created_at,updatedAt:x.updated_at}));
}
export async function get(owner:string,kind:string,id:string){
 const x=await runtime().DB.prepare('SELECT * FROM records WHERE id = ? AND owner = ? AND kind = ?').bind(id,owner,kind).first<any>();
 if(!x)throw Error('Record not found or Permission Missing.');
 return {...JSON.parse(x.data),id:x.id,createdAt:x.created_at,updatedAt:x.updated_at};
}
export async function save(owner:string,kind:string,data:Record<string,any>,id?:string){
 const now=new Date().toISOString();
 if(id){await get(owner,kind,id);await runtime().DB.prepare('UPDATE records SET data = ?, updated_at = ? WHERE id = ? AND owner = ? AND kind = ?').bind(JSON.stringify(data),now,id,owner,kind).run();}
 else{id=crypto.randomUUID();await runtime().DB.prepare('INSERT INTO records (id,owner,kind,data,created_at,updated_at) VALUES (?,?,?,?,?,?)').bind(id,owner,kind,JSON.stringify(data),now,now).run();}
 return get(owner,kind,id);
}
export async function remove(owner:string,kind:string,id:string){const existing=await get(owner,kind,id);if(existing.filePath)await runtime().BUCKET.delete(existing.filePath);await runtime().DB.prepare('DELETE FROM records WHERE id = ? AND owner = ? AND kind = ?').bind(id,owner,kind).run();}
export function safeUrl(v:string){const u=new URL(v);if(u.protocol!=='https:'||u.username||u.password||(u.port&&u.port!=='443')||!u.hostname.includes('.')||u.hostname.includes(':')||/^(\d+\.)/.test(u.hostname)||/localhost|\.local$|\.internal$/.test(u.hostname))throw Error('Use a public HTTPS website.');return u.href;}
const decode=(v:string)=>v.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
export function sourcePlatform(url:string){
 const host=new URL(url).hostname.replace(/^www\./,'');
 for(const [d,n] of [['facebook.com','Facebook'],['instagram.com','Instagram'],['linkedin.com','LinkedIn'],['tiktok.com','TikTok'],['youtube.com','YouTube'],['x.com','X'],['pinterest.com','Pinterest']])if(host===d||host.endsWith('.'+d))return n;return 'Website';
}
export async function readPublic(url:string){
 let current=safeUrl(url);
 for(let n=0;n<4;n++){
  const response=await fetch(current,{redirect:'manual',signal:AbortSignal.timeout(12000)});
  if(response.status>=300&&response.status<400){current=safeUrl(new URL(response.headers.get('location')||'',current).href);continue;}
  if(!response.ok)throw Error('Source Unavailable: returned '+response.status);
  if(!/text|xml|json/i.test(response.headers.get('content-type')||''))throw Error('Source is not a readable page.');
  const reader=response.body?.getReader();if(!reader)throw Error('Empty response.');
  let size=0,raw='';const decoder=new TextDecoder();
  while(true){const p=await reader.read();if(p.done)break;size+=p.value.length;if(size>500000){await reader.cancel();break;}raw+=decoder.decode(p.value,{stream:true});}
  return {url:current,raw};
 }throw Error('Source Unavailable: redirect limit.');
}
export async function investigate(name:string,location:string,website:string,providerKey?:string|null,searxEndpoint?:string|null){
 const evidence:any[]=[],sources:any[]=[];
 const queries=['"'+name+'" '+location,'"'+name+'" '+location+' (facebook OR instagram OR linkedin OR maps)',...(searxEndpoint?['"'+name+'" '+location+' (youtube OR tiktok OR pinterest OR twitter)','"'+name+'" '+location+' (directory OR reviews OR contact OR address)']:[])];
 const provider=searxEndpoint?'SearXNG':providerKey||runtime().TAVILY_API_KEY?'Tavily':'Bing RSS';
 let suppressedResults=0;
 const key=providerKey||runtime().TAVILY_API_KEY;
 await Promise.all(queries.map(async query=>{
  const url=searxEndpoint?searxEndpoint+'/search?format=json&q='+encodeURIComponent(query):key?'https://api.tavily.com/search':'https://www.bing.com/search?format=rss&q='+encodeURIComponent(query);
  try{
   let results:{title:string;excerpt:string;url:string}[]=[];
   if(searxEndpoint){
    const page=await readPublic(url);const payload=JSON.parse(page.raw);if(!Array.isArray(payload.results))throw Error('Invalid SearXNG search response');
    results=payload.results.slice(0,20).map((r:any)=>({title:clean(r.title,400),excerpt:clean(r.content,2000),url:clean(r.url,2000)}));
   }else if(key){
    const response=await fetch(url,{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({query,search_depth:'advanced',max_results:10,include_answer:false}),signal:AbortSignal.timeout(20000)});
    if(!response.ok)throw Error('Search provider returned '+response.status);
    const payload:any=await response.json();if(!Array.isArray(payload.results))throw Error('Invalid provider result');
    results=payload.results.map((r:any)=>({title:clean(r.title,400),excerpt:clean(r.content,2000),url:clean(r.url,2000)}));
   }else{
    const r=await readPublic(url);if(!r.raw.includes('<rss'))throw Error('Search returned no readable result feed');
    for(const m of r.raw.matchAll(/<item>([\s\S]*?)<\/item>/g)){
     const field=(k:string)=>decode(m[1].match(new RegExp('<'+k+'>([\\s\\S]*?)<\\/'+k+'>'))?.[1]||'');
     results.push({title:field('title'),excerpt:field('description').slice(0,2000),url:field('link')});
    }
   }
   let count=0,rejected=0;
   for(const result of results){try{
    const proofUrl=safeUrl(result.url);if(!matchesName(name,{...result,url:proofUrl})){rejected++;continue;}
    if(!evidence.some(e=>e.url===proofUrl)){evidence.push({id:crypto.randomUUID(),url:proofUrl,title:result.title,excerpt:result.excerpt,platform:sourcePlatform(proofUrl),query,provider,state:'Candidate · name matched · identity unverified',retrievedAt:new Date().toISOString()});count++;}
   }catch{rejected++;}}
   suppressedResults+=rejected;
   sources.push({url,query,provider,status:count?'Name-matching results retrieved':rejected?'Source Unavailable · returned unrelated results':'No name-matching results returned',accepted:count,rejected});
  }catch(e){sources.push({url,query,provider,status:'Source Unavailable',message:(e as Error).message});}
 }));
 let score:any=null,contacts:string[]=[],physicalLocation:any=null;
 if(website){try{
  const page=await readPublic(website);const visible=decode(page.raw.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' '));
  const title=decode(page.raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||name);
  evidence.unshift({id:crypto.randomUUID(),url:page.url,title,excerpt:visible.slice(0,2000),platform:'Website',state:'Retrieved · identity requires confirmation',retrievedAt:new Date().toISOString()});
  contacts=[...new Set(visible.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}|\+?\d[\d ()-]{8,}/gi)||[])].slice(0,8);
  for(const m of page.raw.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
   try{const p=JSON.parse(m[1]);const objects=Array.isArray(p)?p:[p,...(p['@graph']||[])];const address=objects.find((x:any)=>x?.address)?.address;if(address&&typeof address==='object')physicalLocation={value:[address.streetAddress,address.addressLocality,address.addressRegion,address.postalCode,address.addressCountry].filter(Boolean).join(', '),sourceUrl:page.url,state:'Published address · not independently verified'};}catch{}
  }
  for(const m of page.raw.matchAll(/href=["']([^"']+)["']/gi)){try{const href=safeUrl(new URL(m[1],page.url).href),platform=sourcePlatform(href);if(platform!=='Website'&&!evidence.some(e=>e.url===href))evidence.push({id:crypto.randomUUID(),url:href,title:platform+' linked from website',excerpt:'Exact href observed on '+page.url,platform,state:'Website-linked profile · ownership unverified',retrievedAt:new Date().toISOString()});}catch{}}
  const checks=[
   {name:'Readable business page',points:25,observed:visible.length>=100,excerpt:visible.slice(0,180)},
   {name:'Public contact',points:25,observed:contacts.length>0,excerpt:contacts.join(' · ')},
   {name:'Enquiry / action path',points:25,observed:/contact|book|enquir|order|shop|quote|whatsapp/i.test(visible),excerpt:visible.match(/.{0,50}(contact|book|enquir|order|shop|quote|whatsapp).{0,100}/i)?.[0]||''},
   {name:'Identity / location signal',points:25,observed:/address|located|location|about us|our story/i.test(visible),excerpt:physicalLocation?.value||visible.match(/.{0,50}(address|located|location|about us|our story).{0,100}/i)?.[0]||''}
  ];score={value:checks.reduce((s,c)=>s+(c.observed?c.points:0),0),checks,version:'website-signals-v1',scope:'Inspected website only',provisional:true,sourceUrl:page.url};sources.push({url:page.url,status:'Retrieved'});
 }catch(e){sources.push({url:website,status:e instanceof Error?e.message:'Source Unavailable'});}}
 return {name,suppressedResults,searchProvider:provider,searchConfigured:Boolean(key||searxEndpoint),locationInput:location,website,physicalLocation,contacts,evidence:evidence.slice(0,40),sources,score,identityConfirmed:false,investigatedAt:new Date().toISOString(),coverage:(searxEndpoint?'SearXNG public metasearch':key?'Tavily public search':'Limited Bing RSS search; production search provider not configured')+' and supplied website. Name-matching results require identity confirmation. Platform APIs and reviews are not independently verified.'};
}
export async function generate(prompt:string){
 const key=runtime().OPENAI_API_KEY;if(!key)throw Error('AI provider not configured. Create or edit the draft manually.');
 const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-4.1-mini',input:prompt,max_output_tokens:1000})});
 if(!response.ok)throw Error('AI provider request failed: '+response.status);const r:any=await response.json();
 const result=(r.output||[]).flatMap((x:any)=>x.content||[]).filter((x:any)=>x.type==='output_text').map((x:any)=>x.text).join('\n');if(!result)throw Error('AI returned no draft.');return result;
}
