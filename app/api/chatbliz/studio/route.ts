import {identity,clean,list,save} from '@/lib/zuxuru';
export const dynamic='force-dynamic';
export async function GET(){
 try{const user=await identity();return Response.json({assets:await list(user.userId,'chatbliz_studio_asset')},{headers:{'Cache-Control':'private, no-store'}})}
 catch(e){return Response.json({error:(e as Error).message},{status:401})}
}
export async function POST(req:Request){
 try{
  if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Invalid origin'},{status:403});
  const user=await identity(),b=await req.json();
  const brand=clean(b.brand,120),description=clean(b.description,1500),audience=clean(b.audience,300),type=clean(b.type,20);
  if(!['image','video'].includes(type)||!brand||description.length<20)return Response.json({error:'Enter a brand, business description and image or video type.'},{status:400});
  const prompt=type==='image'?`Create a professional brand campaign image for ${brand}. Business: ${description}. Target customers: ${audience||'general customers'}. High-quality editorial composition, authentic product depiction, clear brand mood, accessible visual hierarchy. Do not invent product claims or render unverified logos.`:`Create a 15-second storyboard for ${brand}. Business: ${description}. Target customers: ${audience||'general customers'}. Scene 1 (0-4s): relatable customer problem. Scene 2 (4-9s): show brand solution. Scene 3 (9-13s): benefit and trust. Scene 4 (13-15s): clear call to action. Include captions and vertical 9:16 framing. Avoid unverified claims.`;
  const asset=await save(user.userId,'chatbliz_studio_asset',{brand,description,audience,type,prompt,status:'Brief ready — media not rendered',source:'My Brand',renderedUrl:null});
  return Response.json({asset},{headers:{'Cache-Control':'private, no-store'}});
 }catch(e){return Response.json({error:(e as Error).message},{status:500})}
}
