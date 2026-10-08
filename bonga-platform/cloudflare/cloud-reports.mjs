import {createRemoteJWKSet,jwtVerify} from 'jose';
const issuer='https://token.actions.githubusercontent.com';
const keys=createRemoteJWKSet(new URL(issuer+'/.well-known/jwks'));
const repository='bongabhenguai-art/zuxuru';
const workflow=repository+'/.github/workflows/jarvis-open-source.yml@refs/heads/main';
export async function cloudReports(request,env,verify=jwtVerify){
  const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
  if(request.method==='GET'){
    if(!request.headers.get('oai-authenticated-user-id')||request.headers.get('oai-authenticated-user-email')?.toLowerCase()!==env.JARVIS_OWNER_EMAIL?.toLowerCase())return reply({error:'Sign in with the website owner account.'},403);
    try{const report=await env.DB.prepare('SELECT report,run_id,created_at FROM jarvis_cloud_reports WHERE owner_email = ? ORDER BY created_at DESC LIMIT 1').bind(env.JARVIS_OWNER_EMAIL.toLowerCase()).first();return reply({report:report||null});}catch{return reply({error:'Cloud report storage unavailable.'},503);}
  }
  if(request.method!=='POST')return reply({error:'Method not allowed'},405);
  const token=request.headers.get('authorization')?.match(/^Bearer ([A-Za-z0-9_.-]+)$/)?.[1];if(!token)return reply({error:'GitHub job authorization required.'},401);
  let claims;try{const {payload}=await verify(token,keys,{issuer,audience:new URL(request.url).origin,algorithms:['RS256'],requiredClaims:['exp','iat','sub','jti']});claims=payload;}catch{return reply({error:'GitHub job authorization failed.'},403);}
  if(claims.repository!==repository||claims.ref!=='refs/heads/main'||claims.workflow_ref!==workflow||claims.sub!=='repo:bongabhenguai-art@338063297/zuxuru@1408377011:ref:refs/heads/main'||!/^\d+$/.test(String(claims.run_id)))return reply({error:'This GitHub workflow is not permitted.'},403);
  if(Number(request.headers.get('content-length')||0)>45000)return reply({error:'Report too large.'},413);
  let body;try{const text=await request.text();if(text.length>45000)return reply({error:'Report too large.'},413);body=JSON.parse(text);}catch{return reply({error:'Invalid report'},400);}
  if(typeof body.report!=='string'||!body.report.trim()||body.report.length>40000||body.report.includes('\u0000'))return reply({error:'Invalid report'},400);
  try{await env.DB.prepare('INSERT INTO jarvis_cloud_reports (id,owner_email,report,run_id,created_at) VALUES (?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(claims.jti,env.JARVIS_OWNER_EMAIL.toLowerCase(),body.report,String(claims.run_id),new Date().toISOString()).run();return reply({saved:true});}catch{return reply({error:'Cloud report could not be saved.'},503);}
}
