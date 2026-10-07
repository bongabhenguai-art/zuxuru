import {businessIntelligence} from './intelligence-view';
import {list,get,save,remove,clean,safeUrl,readPublic,validatedProfile,investigate,searchKeyForOwner} from './zuxuru';

export async function searxForOwner(owner:string){return (await list(owner,'searx_connection'))[0]?.endpoint||null;}
export async function publicSearxForApp(){return (await list('site-public-search','searx_connection'))[0]?.endpoint||null;}
export async function connectSearx(owner:string,input:string,allowPublic=false){
 const url=new URL(safeUrl(input));if(url.pathname!=='/'||url.search||url.hash)throw Error('Enter the HTTPS origin of your SearXNG server, without a path.');
 const endpoint=url.origin,page=await readPublic(endpoint+'/search?format=json&q=Zuxuru');let payload:any;
 try{payload=JSON.parse(page.raw);}catch{throw Error('Source Unavailable: enable JSON search on the SearXNG server.');}
 if(!Array.isArray(payload.results))throw Error('Source Unavailable: the server did not return SearXNG search results.');
 const previous=(await list(owner,'searx_connection'))[0];const verifiedAt=new Date().toISOString();
 await save(owner,'searx_connection',{provider:'SearXNG',endpoint,verifiedAt},previous?.id);
 const shared=(await list('site-public-search','searx_connection'))[0];
 if(allowPublic)await save('site-public-search','searx_connection',{provider:'SearXNG',endpoint,verifiedAt,configuredBy:owner},shared?.id);
 else if(shared?.configuredBy===owner)await remove('site-public-search','searx_connection',shared.id);
 return {status:'Connected · search endpoint verified',provider:'SearXNG',endpoint,verifiedAt};
}
export async function businessDetails(owner:string,id:string,body:any){
 const p=validatedProfile(await get(owner,'profile',id));if(!p.identityConfirmed)throw Error('Confirm the business identity before editing its graph.');
 const details=Object.fromEntries(['legalName','registration','founder','industry','history','foundedDate','products','locations','contacts','website'].map(k=>[k,clean(body[k],k==='history'?4000:1000)]));
 if(details.website)details.website=safeUrl(details.website);
 const result=await save(owner,'profile',{...p,details:{...details,state:'Provided by account owner · not independently verified',updatedAt:new Date().toISOString()}},id);
 await save(owner,'history',{profileId:id,action:'Business profile edited',actor:'Account owner',sourceType:'Owner-provided',fields:Object.keys(details).filter(k=>details[k])});
 return result;
}
export async function addRelationship(owner:string,body:any){
 const parent=validatedProfile(await get(owner,'profile',clean(body.parentId,100))),child=validatedProfile(await get(owner,'profile',clean(body.childId,100)));
 if(!parent.identityConfirmed||!child.identityConfirmed)throw Error('Confirm both business identities first.');
 if(parent.id===child.id)throw Error('Choose two different businesses.');
 if(!['Branch','Mall tenant','Brand'].includes(body.relationship))throw Error('Choose a supported relationship.');
 const sourceUrl=safeUrl(clean(body.sourceUrl,2000));
 const known=(await list(owner,'relationship')).find(x=>x.parentId===parent.id&&x.childId===child.id&&x.relationship===body.relationship);
 if(known)return known;
 const result=await save(owner,'relationship',{parentId:parent.id,childId:child.id,parentName:parent.name,childName:child.name,relationship:body.relationship,sourceUrl,state:'Declared by account owner · public proof supplied · not independently verified'});
 await save(owner,'history',{profileId:parent.id,action:'Business relationship added',actor:'Account owner',sourceUrl,relationshipId:result.id});return result;
}
export function comparable(before:any,after:any){return Boolean(before?.score&&after?.score&&before.identityConfirmed&&after.identityConfirmed&&before.selectedSourceUrl===after.selectedSourceUrl&&before.score.version===after.score.version&&before.score.scope===after.score.scope&&before.score.sourceUrl===after.score.sourceUrl);}
export async function rescore(owner:string,id:string){
 const previous=validatedProfile(await get(owner,'profile',id));if(!previous.identityConfirmed)throw Error('Confirm the business identity first.');
 const website=previous.details?.website||previous.website;
 if(!website)throw Error('Add the official website in Business Graph before rescoring.');
 const next=await investigate(previous.searchName||previous.name,previous.locationInput||'',website,await searchKeyForOwner(owner),await searxForOwner(owner));
 if(!next.score)throw Error('Source Unavailable: the official website could not be inspected. The previous score is retained.');
 const match=next.evidence.find((e:any)=>e.url===previous.selectedSourceUrl);
 const updated={...previous,...next,details:previous.details,selectedEvidenceId:match?.id||null,selectedSourceUrl:match?.url||null,selectedSourceTitle:match?.title||null,identityConfirmed:Boolean(match),searchName:previous.searchName||previous.name};
 const canCompare=comparable(previous,updated),change=canCompare?updated.score.value-previous.score.value:null;
 const measurement=await save(owner,'measurement',{profileId:id,name:previous.name,before:previous.score||null,after:updated.score,comparable:canCompare,change,scope:updated.score.scope,sourceUrl:updated.score.sourceUrl,measuredAt:next.investigatedAt,explanation:canCompare?'Same confirmed identity, website, scope and rubric.':'Baseline or scope/identity changed; no growth delta inferred.',beforeEvidence:previous.evidence,afterEvidence:updated.evidence});
 await save(owner,'profile',updated,id);
 await save(owner,'history',{profileId:id,action:'Visibility rescore',actor:'Account owner',measurementId:measurement.id,sourceUrl:updated.score.sourceUrl});return {profile:updated,measurement};
}
export async function growthPlan(owner:string,id:string){
 const p=validatedProfile(await get(owner,'profile',id));if(!p.identityConfirmed)throw Error('Confirm the business identity first.');
 const proposals=businessIntelligence(p).opportunities.map((o:any)=>({...o,need:o.title,evidence:'Signal not observed on the inspected page',expectedResult:o.measurement,state:'Proposed · approval required'}));
 if(!proposals.length)proposals.push({title:p.score?'Review wider platform evidence':'Add an official website for measurement',need:p.score?'Connected platform analysis':'Website evidence',sourceUrl:p.selectedSourceUrl,evidence:p.score?'All four inspected website signals are present; wider business visibility remains unmeasured.':'No readable official website has been measured.',expectedResult:'Add independently inspectable evidence',state:'Proposed · approval required'});
 const existing=(await list(owner,'package')).find(x=>x.profileId===id&&x.basisAt===p.investigatedAt);
 if(existing)return existing;
 const result=await save(owner,'package',{profileId:id,name:p.name,actions:proposals.map((p:any)=>p.title),proposals,sourceLinks:[...new Set(proposals.map((x:any)=>x.sourceUrl))],basisAt:p.investigatedAt,generatedBy:'Deterministic evidence rules',approval:'Awaiting owner approval'});
 await save(owner,'history',{profileId:id,action:'Growth plan proposed',actor:'Evidence rules',packageId:result.id});return result;
}
export async function approvePlan(owner:string,id:string){
 const plan=await get(owner,'package',id);if(plan.approval==='Approved')return plan;
 const p=validatedProfile(await get(owner,'profile',plan.profileId));if(!p.identityConfirmed)throw Error('Confirm business identity before approving the plan.');
 if(!plan.proposals)throw Error('Create a new evidence-backed plan before approval.');
 for(const proposal of plan.proposals){const existing=(await list(owner,'task')).find(t=>t.packageId===id&&t.title===proposal.title);if(!existing)await save(owner,'task',{...proposal,packageId:id,profileId:plan.profileId,state:'Pending',approval:'Approved by account owner'});}
 const result=await save(owner,'package',{...plan,approval:'Approved',approvedAt:new Date().toISOString()},id);
 await save(owner,'history',{profileId:plan.profileId,action:'Growth plan approved',actor:'Account owner',packageId:id});return result;
}
export async function runGrowthCycle(owner:string,id:string){
 await get(owner,'profile',id);
 let run=await save(owner,'workflow',{profileId:id,title:'Evidence growth cycle',state:'Running',steps:[],startedAt:new Date().toISOString(),actor:'Account owner'});
 try{
  const measured=await rescore(owner,id);
  run=await save(owner,'workflow',{...run,steps:[{action:'Inspect official website and rescore',state:'Completed',measurementId:measured.measurement.id}]},run.id);
  const plan=await growthPlan(owner,id);
  return await save(owner,'workflow',{...run,state:'Awaiting approval',packageId:plan.id,finishedAt:new Date().toISOString(),steps:[...run.steps,{action:'Create evidence-backed growth plan',state:'Completed',packageId:plan.id},{action:'Execute external changes',state:'Permission Missing · authorization and approval required'}]},run.id);
 }catch(e){await save(owner,'workflow',{...run,state:'Failed',error:(e as Error).message,finishedAt:new Date().toISOString()},run.id);throw e;}
}
