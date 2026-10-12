import {identity,list,save,clean} from '@/lib/zuxuru';
export const dynamic='force-dynamic';
const team=['Business Partner','Mentor','Coach','Adviser','Sales Closer','Negotiator','Marketing','Assistant'];
export async function GET(){try{const u=await identity();const [tasks,meetings,tenants]=await Promise.all([list(u.userId,'chatbliz_partner_task'),list(u.userId,'chatbliz_partner_meeting'),list(u.userId,'chatbliz_tenant')]);return Response.json({tasks,meetings,tenants,team},{headers:{'Cache-Control':'private, no-store'}})}catch(e){return Response.json({error:(e as Error).message},{status:401})}}
export async function POST(req:Request){
 try{if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Invalid origin'},{status:403});
 const u=await identity(),b=await req.json(),type=clean(b.type,20),tenantId=clean(b.tenantId,100);
 const tenant=(await list(u.userId,'chatbliz_tenant')).find(x=>x.id===tenantId);
 if(!tenant)return Response.json({error:'Choose your own business workspace.'},{status:400});
 if(type==='task'){const title=clean(b.title,240);if(!title)return Response.json({error:'Describe the task.'},{status:400});const task=await save(u.userId,'chatbliz_partner_task',{tenantId,title,assignedTo:team.includes(b.assignedTo)?b.assignedTo:'Business Partner',status:'To do',createdAt:new Date().toISOString()});return Response.json({task})}
 if(type==='meeting'){const purpose=clean(b.purpose,240),at=clean(b.at,40),minutes=Number(b.minutes||10);if(!purpose||!at||!Number.isFinite(Date.parse(at))||Date.parse(at)<=Date.now()||![10,15,30,60].includes(minutes))return Response.json({error:'Enter a purpose, future meeting time and duration.'},{status:400});const meeting=await save(u.userId,'chatbliz_partner_meeting',{tenantId,purpose,at,minutes,team:['Business Partner','Assistant','Sales Closer','Negotiator'],status:'Planned — calendar invitation and live copilot not connected',agenda:['Business progress','Customer opportunities','Decisions and next actions'],recordingConsent:false});return Response.json({meeting})}
 return Response.json({error:'Unknown request.'},{status:400});
 }catch(e){return Response.json({error:(e as Error).message},{status:500})}
}
