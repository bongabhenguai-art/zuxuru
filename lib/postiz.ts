import {list,get,save,remove,vault,safeUrl,runtime,clean,validatedProfile} from './zuxuru';
const providers:Record<string,string[]>={facebook:['facebook.com'],instagram:['instagram.com','facebook.com'],'instagram-standalone':['instagram.com'],linkedin:['linkedin.com'],'linkedin-page':['linkedin.com'],youtube:['accounts.google.com'],tiktok:['tiktok.com'],gmb:['accounts.google.com'],x:['x.com','twitter.com']};
async function call(base:string,key:string,path:string,init:RequestInit={}){
 let response:Response;
 try{response=await fetch(base+path,{...init,headers:{Authorization:key,...init.headers},redirect:'error',signal:AbortSignal.timeout(20000)});}catch{throw Error('Source Unavailable: Postiz did not confirm completion. Check the provider before retrying any write.');}
 if(!response.ok)throw Error(response.status===401?'Authorization Failed: reconnect Postiz.':response.status===403?'Permission Missing: Postiz denied access.':response.status===429?'Source Unavailable: Postiz rate limit reached.':'Source Unavailable: Postiz returned '+response.status+'.');
 try{return await response.json() as any;}catch{throw Error('Source Unavailable: invalid Postiz response. Check the provider before retrying any write.');}
}
async function connection(owner:string){
 const row=(await list(owner,'postiz_connection'))[0];if(!row)throw Error('Disconnected: connect your Postiz server through CIA.');
 let key:string;try{key=new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:Uint8Array.from(atob(row.iv),c=>c.charCodeAt(0)),additionalData:new TextEncoder().encode('postiz:'+owner)},await vault(),Uint8Array.from(atob(row.ciphertext),c=>c.charCodeAt(0))));}catch{throw Error('Authorization Failed: reconnect Postiz.');}
 return {base:row.base,key};
}
export async function postizStatus(owner:string){const row=(await list(owner,'postiz_connection'))[0];return row?{configured:true,base:row.base,verifiedAt:row.verifiedAt,status:'Previously verified · refresh channels for current access'}:{configured:false,status:'Disconnected'};}
export async function connectPostiz(owner:string,input:string,key:string){
 const url=new URL(safeUrl(input));if(!['/public/v1','/api/public/v1'].includes(url.pathname.replace(/\/$/,''))||url.search||url.hash)throw Error('Enter your Postiz HTTPS API base ending in /public/v1 or /api/public/v1.');
 if(!key||key.length>500||/\s/.test(key))throw Error('Enter your Postiz API key.');
 const base=url.origin+url.pathname.replace(/\/$/,'');const health=await call(base,key,'/is-connected');if(health?.connected!==true)throw Error('Authorization Failed: Postiz did not verify the key.');
 const channels=await call(base,key,'/integrations');if(!Array.isArray(channels))throw Error('Source Unavailable: invalid channel response.');
 const iv=crypto.getRandomValues(new Uint8Array(12)),encrypted=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode('postiz:'+owner)},await vault(),new TextEncoder().encode(key)));
 const previous=(await list(owner,'postiz_connection'))[0],verifiedAt=new Date().toISOString();await save(owner,'postiz_connection',{base,iv:btoa(String.fromCharCode(...iv)),ciphertext:btoa(String.fromCharCode(...encrypted)),verifiedAt},previous?.id);
 await save(owner,'history',{action:'Postiz authorization verified',actor:'Account owner',provider:'Postiz',channelsReturned:channels.length});return {status:'Connected · API authorization verified',verifiedAt};
}
export async function disconnectPostiz(owner:string){for(const c of await list(owner,'postiz_connection'))await remove(owner,'postiz_connection',c.id);return {status:'Disconnected'};}
export async function postizChannels(owner:string){const c=await connection(owner),rows=await call(c.base,c.key,'/integrations');if(!Array.isArray(rows))throw Error('Source Unavailable: invalid channel response.');return {status:'Live channel read verified',retrievedAt:new Date().toISOString(),channels:rows.slice(0,100).filter(r=>typeof r.id==='string'&&typeof r.identifier==='string').map(r=>({id:clean(r.id,200),name:clean(r.name,200),provider:clean(r.identifier,100),profile:clean(r.profile,200),disabled:r.disabled!==false}))};}
export async function postizAuthorize(owner:string,provider:string,profileId:string,evidenceId:string){
 if(!providers[provider])throw Error('Permission Missing: this authorization provider is not supported by the adapter.');
 if(profileId){const p=await get(owner,'profile',profileId);if(evidenceId&&!p.evidence.some((e:any)=>e.id===evidenceId))throw Error('Evidence does not belong to this business.');}
 const c=await connection(owner),result=await call(c.base,c.key,'/social/'+provider);const url=new URL(safeUrl(result?.url||''));
 if(!providers[provider].some(host=>url.hostname===host||url.hostname.endsWith('.'+host)))throw Error('Source Unavailable: unexpected authorization destination.');
 await save(owner,'history',{profileId:profileId||null,evidenceId:evidenceId||null,provider,action:'Platform authorization requested',actor:'Account owner',state:'Pending · refresh channels after authorization'});
 return {url:url.href,status:'Authorization pending'};
}
const supported=new Set(['facebook','linkedin','linkedin-page','x','threads','bluesky','mastodon','gmb','instagram','instagram-standalone']);
export async function publishPostiz(owner:string,assetId:string,channelId:string,dateInput:string){
 const asset=await get(owner,'asset',assetId);if(asset.state!=='Approved')throw Error('Approve this exact asset version before publishing.');
 if(!asset.profileId)throw Error('Assign a confirmed business to the Studio asset before publishing.');
 const profile=validatedProfile(await get(owner,'profile',asset.profileId));if(!profile.identityConfirmed)throw Error('Confirm the business identity before publishing.');
 const c=await connection(owner),channels=await postizChannels(owner),channel=channels.channels.find((x:any)=>x.id===channelId&&!x.disabled);if(!channel)throw Error('Permission Missing: select a live enabled channel returned by your connection.');
 if(!supported.has(channel.provider))throw Error('Permission Missing: publishing settings for this provider need configuration. Its authorization and channel reads remain available.');
 const isInstagram=channel.provider.startsWith('instagram');if(isInstagram&&(!asset.filePath||!String(asset.mime).startsWith('image/')))throw Error('Instagram photo publishing requires an approved image attachment.');
 if(asset.filePath&&!String(asset.mime).startsWith('image/'))throw Error('This adapter currently delivers text and images. Video/audio publishing requires provider-specific media settings.');
 const date=dateInput?new Date(dateInput):new Date();if(!Number.isFinite(date.getTime())||(dateInput&&date.getTime()<Date.now()+60000))throw Error('Choose a scheduled time at least one minute in the future.');
 const fingerprint=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(owner+':'+c.base+':'+assetId+':'+asset.version+':'+channelId)))).map(x=>x.toString(16).padStart(2,'0')).join('');
 const id='publication-'+fingerprint,now=new Date().toISOString(),attempt={assetId,profileId:asset.profileId,assetVersion:asset.version,title:asset.title,channelId,channelName:channel.name,provider:channel.provider,base:c.base,state:'Sending · completion not confirmed',scheduledAt:date.toISOString(),approval:'Explicit publish form submission',startedAt:now};
 const inserted=await runtime().DB.prepare('INSERT OR IGNORE INTO records (id,owner,kind,data,created_at,updated_at) VALUES (?,?,?,?,?,?)').bind(id,owner,'publication',JSON.stringify(attempt),now,now).run();
 if(!inserted.meta?.changes)throw Error('A delivery attempt exists for this asset version and channel. Check its receipt before another submission.');
 try{
  const images:any[]=[];
  if(asset.filePath){const object=await runtime().BUCKET.get(asset.filePath);if(!object)throw Error('Source Unavailable: approved attachment is missing.');const form=new FormData();form.append('file',new Blob([await object.arrayBuffer()],{type:asset.mime}),'zuxuru-asset.'+asset.mime.split('/')[1]);const uploaded=await call(c.base,c.key,'/upload',{method:'POST',body:form});if(typeof uploaded.id!=='string'||typeof uploaded.path!=='string')throw Error('Source Unavailable: media upload was not confirmed.');images.push({id:uploaded.id,path:safeUrl(uploaded.path)});}
  const settings:any={__type:channel.provider};if(channel.provider==='x')settings.who_can_reply_post='everyone';if(isInstagram)settings.post_type='post';if(channel.provider==='gmb')settings.topicType='STANDARD';
  const response=await call(c.base,c.key,'/posts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:dateInput?'schedule':'now',date:date.toISOString(),shortLink:false,tags:[],posts:[{integration:{id:channelId},value:[{content:asset.content,image:images}],settings}]})});
  if(!Array.isArray(response)||!response.length||!response.every(r=>typeof r.postId==='string'&&r.integration===channelId))throw Error('Source Unavailable: Postiz did not return a matching post receipt. Check the provider before retrying.');
  return await save(owner,'publication',{...attempt,state:'Accepted by Postiz · delivery pending verification',postIds:response.map(r=>r.postId),acceptedAt:new Date().toISOString()},id);
 }catch(e){await save(owner,'publication',{...attempt,state:'Unconfirmed · provider review required',error:(e as Error).message},id);throw e;}
}
export async function verifyPublication(owner:string,id:string){
 const receipt=await get(owner,'publication',id);if(!receipt.postIds?.length)throw Error('Source Unavailable: no post IDs were confirmed. Review the attempt in your Postiz server.');
 const c=await connection(owner);if(c.base!==receipt.base)throw Error('Reconnect the original Postiz server to verify this receipt.');
 const date=Date.parse(receipt.scheduledAt),start=new Date(date-86400000).toISOString(),end=new Date(date+86400000).toISOString();
 const result=await call(c.base,c.key,'/posts?startDate='+encodeURIComponent(start)+'&endDate='+encodeURIComponent(end));if(!Array.isArray(result.posts))throw Error('Source Unavailable: invalid publication status response.');
 const posts=result.posts.filter((p:any)=>receipt.postIds.includes(p.id)).map((p:any)=>({id:p.id,state:clean(p.state,100),releaseUrl:p.releaseURL?safeUrl(p.releaseURL):null,publishedAt:p.publishDate||null}));
 if(posts.length!==receipt.postIds.length)throw Error('Source Unavailable: the provider did not return every recorded post.');
 return save(owner,'publication',{...receipt,state:'Provider status read verified',providerResults:posts,verifiedAt:new Date().toISOString()},id);
}
