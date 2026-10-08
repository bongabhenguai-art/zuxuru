// Owner-only adapter. Muxshed credentials remain in runtime secrets.
export async function studioMultistream(request,env){
 const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
 if(!request.headers.get('oai-authenticated-user-id'))return reply({error:'Sign in to use broadcast controls'},401);
 if(!env.JARVIS_OWNER_EMAIL||request.headers.get('oai-authenticated-user-email')?.toLowerCase()!==env.JARVIS_OWNER_EMAIL.toLowerCase())return reply({error:'Only the website owner can control this broadcast server'},403);
 if(!['GET','POST'].includes(request.method))return reply({error:'Method not allowed'},405);
 if(request.method==='POST'&&request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'Open broadcast controls on this website'},403);
 if(!env.MUXSHED_URL||!env.MUXSHED_API_KEY)return reply({connected:false,message:'Connect your broadcast server before going live.'});
 let base;try{base=new URL(env.MUXSHED_URL);if(base.protocol!=='https:'||base.username||base.password||base.search||base.hash)throw 0;}catch{return reply({error:'Broadcast server requires a valid HTTPS address'},503);}
 const upstream=async(path,method='GET')=>{const r=await fetch(new URL('/api/v1/'+path,base),{method,headers:{'X-API-Key':env.MUXSHED_API_KEY},redirect:'error',signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('upstream');return r;};
 try{
 if(request.method==='POST'){
 const body=await request.json();if(!['start','stop'].includes(body.action)||body.confirmed!==true)return reply({error:'Review your server destinations and confirm this action'},400);
 await upstream('stream/'+body.action,'POST');return reply({accepted:true,message:'Broadcast '+body.action+' accepted by the server. Refresh to check its status.'});
 }
 const [status,dests]=await Promise.all([upstream('status').then(r=>r.json()),upstream('destinations').then(r=>r.json())]);
 if(!Array.isArray(dests))throw Error('schema');
 const p=status.pipeline;const state=typeof p==='string'?p: p&&typeof p==='object'?Object.keys(p)[0]:'Unknown';
 return reply({connected:true,checkedAt:new Date().toISOString(),state:String(state||'Unknown').slice(0,80),console:base.origin,destinations:dests.slice(0,100).map(d=>({name:String(d.name||'Destination').slice(0,120),enabled:d.enabled===true}))});
 }catch{return reply({connected:false,error:'Broadcast server could not be reached or rejected the request. Check its connection and console.'},502);}
}
