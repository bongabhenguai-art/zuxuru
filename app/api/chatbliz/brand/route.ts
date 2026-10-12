import {identity,save,clean} from '@/lib/zuxuru';
export const dynamic='force-dynamic';
export async function POST(req:Request){
 try{
  if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Invalid origin'},{status:403});
  const user=await identity();
  const body=await req.json();
  const name=clean(body.name,120),description=clean(body.description,1500),audience=clean(body.audience,300);
  if(!name||description.length<20)return Response.json({error:'Enter a brand name and at least 20 characters describing your business.'},{status:400});
  const brand={name,description,audience:audience||'Audience to be confirmed',positioning:`${name} helps ${audience||'its customers'} through ${description.slice(0,240)}`,mission:`Help ${audience||'customers'} succeed with reliable products and services.`,voice:['Clear','Helpful','Confident'],channels:['Website','WhatsApp','Social media'],nextSteps:['Confirm target customers','Review brand promise','Create visual identity','Prepare first campaign'],status:'Starter draft — owner review required',generator:'Structured template (AI gateway not yet connected)'};
  const saved=await save(user.userId,'chatbliz_brand',{...brand,product:'My Brand'});
  return Response.json({result:saved},{headers:{'Cache-Control':'private, no-store'}});
 }catch(e){return Response.json({error:(e as Error).message},{status:500});}
}
