import {identity,list,save,clean} from '@/lib/zuxuru';
export const dynamic='force-dynamic';
const plans=[{id:'starter',name:'Starter',monthlyZar:199,features:['Business profile','Brand asset library','Website and store briefs','AI assistant task board']},{id:'growth',name:'Growth',monthlyZar:499,features:['Starter features','Marketing and sales plans','Content briefs','Tenant workspace']},{id:'partner',name:'Business Partner',monthlyZar:999,features:['Growth features','Negotiation and coaching workflows','Priority planning','App and store launch checklists']}];
export async function GET(){
 try{const u=await identity();const [brands,studio,tenants]=await Promise.all([list(u.userId,'chatbliz_brand'),list(u.userId,'chatbliz_studio_asset'),list(u.userId,'chatbliz_tenant')]);return Response.json({brands,studio,tenants,plans,prices:'Proposed ZAR monthly prices; billing not enabled'},{headers:{'Cache-Control':'private, no-store'}})}
 catch(e){return Response.json({error:(e as Error).message},{status:401})}
}
export async function POST(req:Request){
 try{if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Invalid origin'},{status:403});
 const u=await identity(),b=await req.json(),name=clean(b.name,120),brandId=clean(b.brandId,100),plan=clean(b.plan,20);
 if(!name||!plans.some(p=>p.id===plan))return Response.json({error:'Enter a business and choose a package.'},{status:400});
 const brands=await list(u.userId,'chatbliz_brand'),studio=await list(u.userId,'chatbliz_studio_asset');
 const brand=brands.find(x=>x.id===brandId)||brands.find(x=>x.name===name)||null;
 const relevant=studio.filter(x=>x.brand===name||(brand&&x.brand===brand.name));
 const tasks=['Review business identity and audience','Approve brand positioning','Review Studio image/video briefs','Draft website pages and calls to action','Plan store products and checkout requirements','Define app features and user roles','Connect official accounts with authorization','Review marketing and sales plan'];
 const tenant=await save(u.userId,'chatbliz_tenant',{name,plan,brandId:brand?.id||null,studioAssetIds:relevant.map(x=>x.id),website:{status:'Planning',pages:['Home','About','Products or Services','Contact']},app:{status:'Planning'},store:{status:'Planning',products:[]},profile:{description:brand?.description||'',audience:brand?.audience||''},assistants:['Mentor','Coach','Adviser','Sales','Marketing','Negotiator','Builder'],tasks:tasks.map(title=>({title,done:false})),status:'Draft workspace — no site or app deployed'});
 return Response.json({tenant},{headers:{'Cache-Control':'private, no-store'}});
 }catch(e){return Response.json({error:(e as Error).message},{status:500})}
}
