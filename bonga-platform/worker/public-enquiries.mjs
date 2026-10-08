const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json;charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const clean=(value,max)=>typeof value==='string'?value.trim().slice(0,max):'';
export async function publicEnquiries(request,env){
  const url=new URL(request.url);
  if(!env.DB)return reply({error:'Enquiry storage is not configured.'},503);
  const owner=!!env.JARVIS_OWNER_EMAIL&&request.headers.get('oai-authenticated-user-email')?.toLowerCase()===env.JARVIS_OWNER_EMAIL.toLowerCase();
  if(request.method==='GET'&&!owner)return reply({error:'Owner sign-in required.'},403);
  if(request.method!=='GET'&&request.method!=='POST')return reply({error:'Method not allowed.'},405);
  if(request.method==='POST'&&request.headers.get('origin')!==url.origin)return reply({error:'Open the enquiry form on this website.'},403);
  try{
    await env.DB.prepare('CREATE TABLE IF NOT EXISTS bonga_public_enquiries (id TEXT PRIMARY KEY, name TEXT NOT NULL, contact TEXT NOT NULL, service TEXT NOT NULL, goal TEXT NOT NULL, created_at TEXT NOT NULL, sender_hash TEXT NOT NULL)').run();
    if(request.method==='GET'){
      const rows=await env.DB.prepare('SELECT id,name,contact,service,goal,created_at FROM bonga_public_enquiries ORDER BY created_at DESC LIMIT 100').all();
      return reply({enquiries:rows.results||[]});
    }
    if(Number(request.headers.get('content-length')||0)>7000)return reply({error:'Enquiry too long.'},413);
    const raw=await request.text();if(raw.length>7000)return reply({error:'Enquiry too long.'},413);
    let data;try{data=JSON.parse(raw);}catch{return reply({error:'Invalid enquiry data.'},400);}
    if(data.website)return reply({received:true});
    const name=clean(data.name,100),contact=clean(data.contact,200),service=clean(data.service,120),goal=clean(data.goal,2000);
    if(!name||!contact||!service||!goal||data.consent!==true)return reply({error:'Please provide your name, contact, service, project details and consent.'},400);
    const ip=request.headers.get('cf-connecting-ip')||'unknown';
    const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip+'|bonga-public-enquiries'));
    const hash=[...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');
    const since=new Date(Date.now()-3600000).toISOString();
    const count=await env.DB.prepare('SELECT COUNT(*) AS total FROM bonga_public_enquiries WHERE sender_hash=? AND created_at>?').bind(hash,since).first();
    if(Number(count?.total||0)>=5)return reply({error:'Too many enquiries. Please try again later.'},429);
    const id=crypto.randomUUID();
    await env.DB.prepare('INSERT INTO bonga_public_enquiries (id,name,contact,service,goal,created_at,sender_hash) VALUES (?,?,?,?,?,?,?)').bind(id,name,contact,service,goal,new Date().toISOString(),hash).run();
    return reply({received:true,reference:id,message:'Your enquiry has been saved for the website owner to review.'},201);
  }catch{return reply({error:'The enquiry service is temporarily unavailable. Please use the email option.'},503);}
}
