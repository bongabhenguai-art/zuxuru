// Dropbox credentials remain in Worker secrets, never in browser code.
export function dropboxStorage(env,send=fetch){
  if(!env.DROPBOX_ACCESS_TOKEN&&!env.DROPBOX_REFRESH_TOKEN)return null;
  let cached='',until=0,pending;
  async function token(){
    if(env.DROPBOX_ACCESS_TOKEN)return env.DROPBOX_ACCESS_TOKEN;
    if(cached&&Date.now()<until)return cached;
    if(!env.DROPBOX_APP_KEY||!env.DROPBOX_APP_SECRET)throw new Error('Dropbox authorization unavailable');
    if(!pending)pending=(async()=>{
      const r=await send('https://api.dropboxapi.com/oauth2/token',{method:'POST',body:new URLSearchParams({grant_type:'refresh_token',refresh_token:env.DROPBOX_REFRESH_TOKEN,client_id:env.DROPBOX_APP_KEY,client_secret:env.DROPBOX_APP_SECRET}),signal:AbortSignal.timeout(15000)});
      if(!r.ok)throw new Error('Dropbox authorization unavailable');
      const data=await r.json();if(!data.access_token)throw new Error('Dropbox authorization unavailable');
      cached=data.access_token;until=Date.now()+Math.max(0,(Number(data.expires_in)||0)-60)*1000;return cached;
    })().finally(()=>{pending=null;});
    return pending;
  }
  function path(key){
    if(!/^(designer\/[a-f0-9]{32}|private\/jarvis\/owner-api-key-v1)$/.test(key))throw new Error('Invalid storage key');
    return '/BongaBhengu/'+key;
  }
  async function call(endpoint,args,body,range){
    const content=['upload','download'].includes(endpoint),headers={Authorization:'Bearer '+await token()};
    if(content)headers['Dropbox-API-Arg']=JSON.stringify(args);
    else headers['Content-Type']='application/json';
    if(endpoint==='upload')headers['Content-Type']='application/octet-stream';
    if(range)headers.Range=range;
    return send((content?'https://content.dropboxapi.com/2/files/':'https://api.dropboxapi.com/2/files/')+endpoint,{method:'POST',headers,body:content?body:JSON.stringify(args),signal:AbortSignal.timeout(60000)});
  }
  async function missing(r){
    if(r.status!==409)return false;
    const data=await r.clone().json().catch(()=>({}));return String(data.error_summary||'').startsWith('path/not_found');
  }
  return {
    async put(key,body){const r=await call('upload',{path:path(key),mode:'overwrite',autorename:false,mute:true},body);if(!r.ok)throw new Error('Dropbox upload failed');return r.json();},
    async delete(key){const r=await call('delete_v2',{path:path(key)});if(!r.ok&&!await missing(r))throw new Error('Dropbox delete failed');},
    async get(key,options={}){
      const range=options.range?.get?.('range');
      if(range&&!/^bytes=\d*-\d*$/.test(range))throw new Error('Invalid media range');
      const r=await call('download',{path:path(key)},undefined,range);
      if(await missing(r))return null;
      if(!r.ok)throw new Error('Dropbox download failed');
      const meta=JSON.parse(r.headers.get('Dropbox-API-Result')||'{}');
      if(!Number.isSafeInteger(meta.size)||meta.size<0)throw new Error('Invalid Dropbox metadata');
      const obj={body:r.body,size:meta.size,text:()=>r.text()};
      if(r.status===206){const m=/^bytes (\d+)-(\d+)\/(\d+)$/.exec(r.headers.get('content-range')||'');if(!m)throw new Error('Invalid Dropbox range');obj.range={offset:Number(m[1]),length:Number(m[2])-Number(m[1])+1};}
      return obj;
    }
  };
}
