const vaultObject='private/jarvis/owner-api-key-v1';
const vaultReply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const vaultOwner=(request,env)=>!!request.headers.get('oai-authenticated-user-id')&&!!env.JARVIS_OWNER_EMAIL&&request.headers.get('oai-authenticated-user-email')?.toLowerCase()===env.JARVIS_OWNER_EMAIL.toLowerCase();
async function vaultCipher(env){if(!/^[a-f0-9]{64}$/.test(env.JARVIS_VAULT_KEY||''))throw Error('vault');return crypto.subtle.importKey('raw',Uint8Array.from(env.JARVIS_VAULT_KEY.match(/../g),v=>parseInt(v,16)),{name:'AES-GCM'},false,['encrypt','decrypt']);}
const vaultAAD=env=>new TextEncoder().encode('bonga-jarvis-owner:'+env.JARVIS_OWNER_EMAIL.toLowerCase());
export async function jarvisKey(env){if(env.OPENAI_API_KEY)return env.OPENAI_API_KEY;if(!env.MEDIA||!env.JARVIS_VAULT_KEY)return '';const stored=await env.MEDIA.get(vaultObject);if(!stored)return '';const envelope=JSON.parse(await stored.text());const decode=v=>Uint8Array.from(atob(v),c=>c.charCodeAt(0));const raw=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(envelope.iv),additionalData:vaultAAD(env)},await vaultCipher(env),decode(envelope.ciphertext));return new TextDecoder().decode(raw);}
export async function jarvisConnection(request,env){
 if(!vaultOwner(request,env))return vaultReply({error:'Sign in with the website owner account to connect Jarvis.'},403);
 if(!['GET','POST','DELETE'].includes(request.method))return vaultReply({error:'Method not allowed'},405);
 if(request.method!=='GET'&&request.headers.get('origin')!==new URL(request.url).origin)return vaultReply({error:'Open the connection form on this website.'},403);
 if(!env.MEDIA||!env.JARVIS_VAULT_KEY)return vaultReply({error:'Private connection storage is unavailable.'},503);
 try{
 if(request.method==='GET')return vaultReply({configured:!!await jarvisKey(env),runtimeManaged:!!env.OPENAI_API_KEY});
 if(request.method==='DELETE'){if(env.OPENAI_API_KEY)return vaultReply({error:'This key is managed in hosting settings and cannot be removed here.'},409);await env.MEDIA.delete(vaultObject);return vaultReply({configured:false});}
 if(env.OPENAI_API_KEY)return vaultReply({error:'A hosting-managed key is active. Change it in hosting settings.'},409);
 const body=await request.text();if(body.length>4000)return vaultReply({error:'Connection request too long.'},413);let data;try{data=JSON.parse(body);}catch{return vaultReply({error:'Invalid connection request.'},400);}
 const key=typeof data.key==='string'?data.key.trim():'';if(!/^sk-[A-Za-z0-9_-]{20,350}$/.test(key))return vaultReply({error:'Enter the full OpenAI secret key, not its name or masked value.'},400);
 const check=await fetch('https://api.openai.com/v1/models',{headers:{authorization:'Bearer '+key},signal:AbortSignal.timeout(15000)});
 if(!check.ok)return vaultReply({error:check.status===401?'OpenAI rejected this key. Check the full secret value.':'OpenAI could not validate this key. Check its permissions or try again.'},check.status===401?400:502);
 const iv=crypto.getRandomValues(new Uint8Array(12)),encrypted=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:vaultAAD(env)},await vaultCipher(env),new TextEncoder().encode(key)));const encode=v=>btoa(String.fromCharCode(...v));await env.MEDIA.put(vaultObject,JSON.stringify({version:1,iv:encode(iv),ciphertext:encode(encrypted)}),{httpMetadata:{contentType:'application/json'}});
 return vaultReply({configured:true,message:'Key validated and encrypted. Ask Jarvis to check model access and account allowance.'});
 }catch{return vaultReply({error:'Could not complete the private connection. Try again; no secret value is displayed.'},503);}
}
