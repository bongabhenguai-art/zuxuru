import {createRemoteJWKSet,jwtVerify} from 'jose';
const issuer='https://token.actions.githubusercontent.com';
const keys=createRemoteJWKSet(new URL(issuer+'/.well-known/jwks'));
const repository='bongabhenguai-art/zuxuru';
const workflow=repository+'/.github/workflows/jarvis-open-source.yml@refs/heads/main';
export function compareReports(current,previous){
  if(!previous)return null;
  const links=value=>new Set((value.match(/^Source: https:\/\/\S+/gm)||[]).map(line=>line.slice(8).trim()));
  const currentLinks=links(current.report),oldLinks=links(previous.report);
  const coverage=value=>{
    const block=value.match(/## Collection status\s+([\s\S]*?)(?=\n## |$)/)?.[1]||'';
    const results={};for(const line of block.split('\n')){const match=line.match(/^- (.+?): (Fetched|Unavailable)/);if(match)results[match[1]]=match[2];}return results;
  };
  const now=coverage(current.report),before=coverage(previous.report);
  return {previous_created_at:previous.created_at,new_links:[...currentLinks].filter(link=>!oldLinks.has(link)),current_count:currentLinks.size,previous_count:oldLinks.size,coverage_changes:Object.keys(now).filter(key=>before[key]&&now[key]!==before[key]).map(key=>({source:key,before:before[key],now:now[key]}))};
}
export async function cloudReports(request,env,verify=jwtVerify){
  const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
  if(request.method==='GET'){
    if(!request.headers.get('oai-authenticated-user-id')||request.headers.get('oai-authenticated-user-email')?.toLowerCase()!==env.JARVIS_OWNER_EMAIL?.toLowerCase())return reply({error:'Sign in with the website owner account.'},403);
    try{
      const params=new URL(request.url).searchParams,owner=env.JARVIS_OWNER_EMAIL.toLowerCase(),id=params.get('report'),kind=params.get('kind');
      if(kind&&kind!=='morning')return reply({error:'Invalid report type.'},400);
      const filter=kind==='morning'?" AND report LIKE '# Bonga Bhengu morning fashion and social report%'":'';
      if(id&&(!/^[A-Za-z0-9_-]{1,200}$/.test(id)))return reply({error:'Invalid report selection.'},400);
      const report=id
        ? await env.DB.prepare('SELECT id,report,run_id,created_at FROM jarvis_cloud_reports WHERE owner_email = ? AND id = ?'+filter+' LIMIT 1').bind(owner,id).first()
        : await env.DB.prepare('SELECT id,report,run_id,created_at FROM jarvis_cloud_reports WHERE owner_email = ?'+filter+' ORDER BY created_at DESC LIMIT 1').bind(owner).first();
      const history=await env.DB.prepare('SELECT id,run_id,created_at FROM jarvis_cloud_reports WHERE owner_email = ?'+filter+' ORDER BY created_at DESC LIMIT 10').bind(owner).all();
      if(id&&!report)return reply({error:'Report not found in your workspace.'},404);
      let comparison=null;
      if(report?.report.startsWith('# Bonga Bhengu morning fashion and social report')){
        const previous=await env.DB.prepare("SELECT report,created_at FROM jarvis_cloud_reports WHERE owner_email = ? AND report LIKE '# Bonga Bhengu morning fashion and social report%' AND created_at < ? ORDER BY created_at DESC LIMIT 1").bind(owner,report.created_at).first();
        comparison=compareReports(report,previous);
      }
      return reply({report:report||null,history:history.results||[],comparison});
    }catch{return reply({error:'Cloud report storage unavailable.'},503);}
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
