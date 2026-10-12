import {identity,list,save,clean} from '@/lib/zuxuru';
export const dynamic='force-dynamic';
function script(name:string,description:string,audience:string){
 return [
  `Welcome to the Chatbliz Brand Story interview. Today we're meeting the people behind ${name}.`,
  `What inspired you to start ${name}?`,
  `What problem does your business solve for ${audience||'your customers'}?`,
  'Tell us about a challenge you overcame while building the business.',
  'What makes your products or services different?',
  'Can you share a real customer experience, without revealing private information?',
  'What do you want customers to remember about your brand?',
  'What should someone do next if they want to support your business?'
 ];
}
export async function GET(){try{const u=await identity();const [stories,brands]=await Promise.all([list(u.userId,'chatbliz_story'),list(u.userId,'chatbliz_brand')]);return Response.json({stories,brands},{headers:{'Cache-Control':'private, no-store'}})}catch(e){return Response.json({error:(e as Error).message},{status:401})}}
export async function POST(req:Request){
 try{
  if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Invalid origin'},{status:403});
  const u=await identity(),b=await req.json(),brandId=clean(b.brandId,100);
  const brand=(await list(u.userId,'chatbliz_brand')).find(x=>x.id===brandId);
  if(!brand)return Response.json({error:'Select one of your saved brands.'},{status:400});
  if(b.recordingConsent!==true)return Response.json({error:'Participant recording consent is required before preparing a recording session.'},{status:400});
  const questions=script(brand.name,brand.description,brand.audience);
  const story=await save(u.userId,'chatbliz_story',{brandId:brand.id,brand:brand.name,description:brand.description,audience:brand.audience,questions,host:'AI host — must be disclosed to audience',recordingConsent:true,consentAt:new Date().toISOString(),state:'Interview prepared — recording not started',recordingUrl:null,transcript:null,outputs:['Founder story','Website About copy','Podcast episode outline','Short social clips','Marketing captions'],publishApproved:false});
  return Response.json({story},{headers:{'Cache-Control':'private, no-store'}});
 }catch(e){return Response.json({error:(e as Error).message},{status:500})}
}
