import {jarvisKey} from './jarvis-connection.mjs';
export async function jarvisTest(request,env,send=fetch){
  const reply=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
  if(request.method!=='POST')return reply({error:'Method not allowed'},405);
  if(!request.headers.get('oai-authenticated-user-id')||!env.JARVIS_OWNER_EMAIL||request.headers.get('oai-authenticated-user-email')?.toLowerCase()!==env.JARVIS_OWNER_EMAIL.toLowerCase())return reply({error:'Sign in with the website owner account.'},403);
  if(request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'Open this test from your dashboard.'},403);
  let key;try{key=await jarvisKey(env);}catch{return reply({error:'Private connection could not be read. Reconnect your key.'},503);}
  if(!key)return reply({error:'No key is saved. Connect your full API key first.'},409);
  try{
    const r=await send('https://api.openai.com/v1/responses',{method:'POST',headers:{authorization:'Bearer '+key,'content-type':'application/json'},body:JSON.stringify({model:env.OPENAI_MODEL||'gpt-5-mini',input:'Reply briefly: Jarvis connection is working.',max_output_tokens:256}),signal:AbortSignal.timeout(45000)});
    if(!r.ok)return reply({error:r.status===401?'The saved key was rejected. Reconnect it.':r.status===429?'OpenAI usage or billing allowance blocked the test. Check your API account.':r.status===403||r.status===404?'This API key cannot access the configured model. Check its model permissions.':'The AI provider could not complete the test.'},r.status===429?429:502);
    const data=await r.json();const answered=data.output?.some(item=>item.content?.some(c=>c.type==='output_text'&&typeof c.text==='string'&&c.text.trim()));
    if(!answered)return reply({error:'The provider returned no answer. Try again; no successful response is claimed.'},502);
    return reply({verified:true,message:'Jarvis answered successfully. Your key and model access worked for this test.',checkedAt:new Date().toISOString()});
  }catch{return reply({error:'The AI response test timed out or could not reach the provider. Try again.'},504);}
}
