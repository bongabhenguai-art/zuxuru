import {aiStatus,connectAI,disconnectAI,runAI} from '@/lib/ai-engine';
import {analyzeBusiness} from '@/lib/intelligence';
import {postizStatus,connectPostiz,disconnectPostiz,postizChannels,postizAuthorize,publishPostiz,verifyPublication} from '@/lib/postiz';
import {searxForOwner,publicSearxForApp,connectSearx,businessDetails,addRelationship,rescore,growthPlan,approvePlan,runGrowthCycle} from '@/lib/growth';
import {githubStatus,connectGitHub,disconnectGitHub,githubRepositories,inspectGitHub} from '@/lib/github';
import { identity, list, get, save, remove, investigate, clean, runtime, isOwner, validatedProfile, searchKeyForOwner, connectSearch } from '@/lib/zuxuru';
export const dynamic = 'force-dynamic';
const kinds = ['profile','lead','asset','task','package','report','plan','relationship','history','measurement','workflow','publication','intelligence','agent_run','memory'];
export async function GET() {
 try { const u = await identity(); const searchKey=await searchKeyForOwner(u.userId);const searx=await searxForOwner(u.userId); const entries = await Promise.all(kinds.map(async k=>[k,(await list(u.userId,k)).map(p=>k==='profile'?validatedProfile(p):p)])); return Response.json({user:{name:u.displayName,email:u.email,ceo:isOwner(u.email)},...Object.fromEntries(entries),aiConfigured:(await aiStatus(u.userId)).configured,ai:await aiStatus(u.userId),postiz:await postizStatus(u.userId),github:isOwner(u.email)?await githubStatus(u.userId):null,searchService:{provider:searx?'SearXNG':searchKey?'Tavily':'Bing RSS (limited)',endpoint:searx,publicEnabled:isOwner(u.email)&&Boolean(searx)&&searx===await publicSearxForApp(),configured:Boolean(searx||searchKey),status:searx||searchKey?'Previously verified · run investigation to check live access':'Production search provider not configured'}},{headers:{'Cache-Control':'private, no-store'}}); }
 catch(e){return Response.json({error:String((e as Error).message)},{status:401,headers:{'Cache-Control':'private, no-store'}});}
}
export async function POST(req:Request) {
 try {
 if(req.headers.get('origin')!==new URL(req.url).origin) return Response.json({error:'Invalid request origin'},{status:403});
 const u=await identity(), owner=u.userId;
 if(Number(req.headers.get('content-length'))>4000000)throw Error('File exceeds upload limit.');
 const b:any=await req.json(); if(!b || typeof b!=="object" || Array.isArray(b))throw Error("Invalid request"); const id=clean(b.id,100); let result;
 if(String(b.action).startsWith('github_')&&!isOwner(u.email))return Response.json({error:'CEO builder access required'},{status:403,headers:{'Cache-Control':'private, no-store'}});
 switch(b.action){
 case 'ai_connect': {result=await connectAI(owner,clean(b.base,2000),clean(b.apiKey,501),clean(b.model,200));break;}
 case 'ai_disconnect': {result=await disconnectAI(owner);break;}
 case 'ai_analyze': {result=await runAI(owner,id,clean(b.task,100),b.consent===true);break;}
 case 'intelligence_analyze': {result=await analyzeBusiness(owner,id);break;}
 case 'memory_save': {const profileId=clean(b.profileId,100);const p=validatedProfile(await get(owner,'profile',profileId));if(!p.identityConfirmed)throw Error('Confirm identity before adding business memory.');const text=clean(b.text,4000),title=clean(b.title,180);if(!text||!title)throw Error('Enter a memory title and note.');result=await save(owner,'memory',{profileId,title,text,sourceType:'Owner-provided',state:'Not independently verified'},id||undefined);await save(owner,'history',{profileId,action:'Business memory saved',actor:'Account owner',memoryId:result.id});break;}

 case 'postiz_connect': {result=await connectPostiz(owner,clean(b.base,2000),clean(b.apiKey,501));break;}
 case 'postiz_disconnect': {result=await disconnectPostiz(owner);break;}
 case 'postiz_channels': {result=await postizChannels(owner);break;}
 case 'postiz_authorize': {result=await postizAuthorize(owner,clean(b.provider,100),clean(b.profileId,100),clean(b.evidenceId,100));break;}
 case 'publication_verify': {result=await verifyPublication(owner,id);break;}
 case 'github_connect': {result=await connectGitHub(owner,clean(b.token,501));break;}
 case 'github_disconnect': {result=await disconnectGitHub(owner);break;}
 case 'github_repositories': {result=await githubRepositories(owner);break;}
 case 'github_inspect': {result=await inspectGitHub(owner,clean(b.repository,180));break;}
 case 'connect_searx': {result=await connectSearx(owner,clean(b.endpoint,2000),isOwner(u.email)&&b.allowPublic===true);break;}
 case 'disconnect_searx': {for(const c of await list(owner,'searx_connection'))await remove(owner,'searx_connection',c.id);if(isOwner(u.email))for(const c of await list('site-public-search','searx_connection'))await remove('site-public-search','searx_connection',c.id);result={status:'Disconnected'};break;}
 case 'business_details': {result=await businessDetails(owner,id,b);break;}
 case 'business_relationship': {result=await addRelationship(owner,b);break;}
 case 'rescore': {result=await rescore(owner,id);break;}
 case 'approve_plan': {result=await approvePlan(owner,id);break;}
 case 'growth_cycle': {result=await runGrowthCycle(owner,id);break;}
 case 'connect_search': {result=await connectSearch(owner,clean(b.apiKey,500));break;}
 case 'disconnect_search': {for(const c of await list(owner,'search_connection'))await remove(owner,'search_connection',c.id);result={status:'Disconnected'};break;}
 case 'investigate': {const name=clean(b.name,180);if(!name)throw Error('Enter a business name.');result=await save(owner,'profile',await investigate(name,clean(b.location,200),clean(b.website,1000),await searchKeyForOwner(owner),await searxForOwner(owner)));await save(owner,'history',{profileId:result.id,action:'Business investigation',actor:'Account owner'});break;}
 case 'select_match': {const p=validatedProfile(await get(owner,'profile',id));const match=p.evidence.find((e:any)=>e.id===clean(b.evidenceId,100));if(!match)throw Error('Select a returned source result.');result=await save(owner,'profile',{...p,searchName:p.searchName||p.name,selectedEvidenceId:match.id,selectedSourceUrl:match.url,selectedSourceTitle:match.title,identityConfirmed:false},id);break;}
 case 'confirm_profile': {const p=validatedProfile(await get(owner,'profile',id));if(b.confirmed&&!p.selectedEvidenceId)throw Error('Select a matching internet result first.');result=await save(owner,'profile',{...p,identityConfirmed:Boolean(b.confirmed)},id);break;}
 case 'lead_save': {if(!clean(b.name))throw Error('Enter the lead name.');result=await save(owner,'lead',{name:clean(b.name,180),contact:clean(b.contact,300),notes:clean(b.notes),stage:'New'});break;}
 case 'lead_stage': {if(!['New','Contacted','Qualified','Won','Lost'].includes(b.stage))throw Error('Invalid stage');result=await save(owner,'lead',{...await get(owner,'lead',id),stage:b.stage},id);break;}
 case 'delete': {if(!['lead','asset','task','memory'].includes(b.kind))throw Error('Invalid record kind');await remove(owner,b.kind,id);result={deleted:true};break;}
 case 'asset_save': {
 const previous=id?await get(owner,'asset',id):null;const title=clean(b.title,180);if(!title)throw Error('Enter a draft title.');
 const profileId=clean(b.profileId,100)||previous?.profileId||null;if(profileId)await get(owner,'profile',profileId);
 let filePath=previous?.filePath||null,mime=previous?.mime||null;
 if(b.fileData){if(typeof b.fileData!=='string'||b.fileData.length>2800000||!['image/jpeg','image/png','image/webp','video/webm','audio/webm','text/plain'].includes(b.mime))throw Error('Use a supported file smaller than 2 MB.');const bytes=Uint8Array.from(atob(b.fileData),c=>c.charCodeAt(0));filePath='private/'+owner+'/'+crypto.randomUUID();mime=b.mime;await runtime().BUCKET.put(filePath,bytes,{httpMetadata:{contentType:mime}});}
 if(previous)await save(owner,'asset_version',{assetId:id,title:previous.title,content:previous.content,state:previous.state,version:previous.version});
 result=await save(owner,'asset',{title,profileId,content:clean(b.content,20000),filePath,mime,state:b.approved===true?'Approved':'Draft',version:(previous?.version||0)+1},id||undefined);break;}
 case 'asset_versions': {await get(owner,'asset',id);result=(await list(owner,'asset_version')).filter(x=>x.assetId===id);break;}
 case 'publish': {if(b.publishApproved!==true)throw Error('Approve the exact destination and content before publishing.');result=await publishPostiz(owner,id,clean(b.channelId,200),clean(b.date,100));break;}
 case 'package': {result=await growthPlan(owner,clean(b.profileId,100));break;}
 case 'task_complete': {const t=await get(owner,'task',id);if(!clean(b.receipt,1000))throw Error('Add a completion note or proof URL.');result=await save(owner,'task',{...t,state:'Completed by user',receipt:clean(b.receipt,1000),evidenceState:'Owner-reported completion · external outcome not independently verified',confirmedAt:new Date().toISOString()},id);break;}
 case 'plan': {if(![299,499,699,999].includes(b.price))throw Error('Invalid package');result=await save(owner,'plan',{price:b.price,state:'Selected · payment not verified'});break;}
 case 'report': {if(!isOwner(u.email))return Response.json({error:'CEO access required'},{status:403});const counts=Object.fromEntries(await Promise.all(['profile','lead','asset','task'].map(async k=>[k,(await list(owner,k)).length])));result=await save(owner,'report',{title:'Jarvis operations report',counts,summary:'Saved workspace records reviewed. External publishing, platform authorization and autonomous scheduling are not connected.',generatedBy:'Deterministic workspace review'});break;}
 default: throw Error('Unknown action');
 }return Response.json({result},{headers:{'Cache-Control':'private, no-store'}});
 }catch(e){return Response.json({error:(e as Error).message},{status:400,headers:{'Cache-Control':'private, no-store'}});}
}
