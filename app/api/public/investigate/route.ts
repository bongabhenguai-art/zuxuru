import {clean,investigate,runtime,safeUrl} from '@/lib/zuxuru';
import {publicSearxForApp} from '@/lib/growth';
export const dynamic='force-dynamic';
export async function POST(req:Request){
 const headers={'Cache-Control':'private, no-store'};
 try{
  if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Invalid request origin'},{status:403,headers});
  if(Number(req.headers.get('content-length'))>4096)return Response.json({error:'Request too large'},{status:413,headers});
  const body:any=await req.json();const name=clean(body.name,180),location=clean(body.location,200),website=clean(body.website,1000);
  if(name.length<2)throw Error('Enter a business name with at least two characters.');if(website)safeUrl(website);
  const bucket=Math.floor(Date.now()/300000),ip=req.headers.get('cf-connecting-ip')||'unknown';
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip+':'+bucket)))).map(n=>n.toString(16).padStart(2,'0')).join('');
  const id='public-search-'+hash,now=new Date().toISOString();
  const row=await runtime().DB.prepare("INSERT INTO records (id,owner,kind,data,created_at,updated_at) VALUES (?, 'public-search-limit', 'rate-limit', '{\"attempts\":1}', ?, ?) ON CONFLICT(id) DO UPDATE SET data=json_set(data, '$.attempts', json_extract(data, '$.attempts')+1), updated_at=excluded.updated_at WHERE json_extract(data, '$.attempts')<3 RETURNING id").bind(id,now,now).first();
  if(!row)return Response.json({error:'Search limit reached. Try again in five minutes.'},{status:429,headers:{...headers,'Retry-After':'300'}});
  await runtime().DB.prepare("DELETE FROM records WHERE owner='public-search-limit' AND kind='rate-limit' AND updated_at < ?").bind(new Date(Date.now()-3600000).toISOString()).run();
  const result=await investigate(name,location,website,null,await publicSearxForApp());
  return Response.json({result},{headers});
 }catch(e){return Response.json({error:(e as Error).message},{status:400,headers});}
}
