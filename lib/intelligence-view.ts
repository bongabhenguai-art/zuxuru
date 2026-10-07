export const intelligenceVersion='evidence-priority-v1';
export function prioritize(impact:number,confidence:number,relevance:number,effort:number){
 if(![impact,confidence,relevance,effort].every(Number.isFinite)||impact<0||impact>5||confidence<0||confidence>1||relevance<0||relevance>5||effort<=0)throw Error('Invalid priority inputs');
 return Math.round(impact*confidence*relevance/effort*100)/100;
}
export function businessIntelligence(profile:any){
 const p=profile,evidence=p.evidence||[],date=Date.now();
 const stale=!p.investigatedAt||!Number.isFinite(Date.parse(p.investigatedAt))||date-Date.parse(p.investigatedAt)>7*86400000;
 const website=evidence.find((e:any)=>e.url===p.score?.sourceUrl);
 const measured=Boolean(p.identityConfirmed&&p.score&&website);
 const findings=measured?(p.score.checks||[]).map((c:any,i:number)=>({id:'website-'+i,title:c.name,state:c.observed?'Observed':'Not observed on inspected page',observation:c.excerpt||'This signal was not detected by the website rubric.',evidenceIds:[website.id],sourceUrl:website.url,retrievedAt:website.retrievedAt,stale,scope:'Inspected website only'})):[];
 const weights:any={'Readable business page':[5,5,3],'Public contact':[5,5,1],'Enquiry / action path':[4,5,2],'Identity / location signal':[4,4,2]};
 const opportunities=findings.filter((f:any)=>f.state.startsWith('Not observed')).map((f:any)=>{
  const [impact,relevance,effort]=weights[f.title]||[3,3,2],confidence=stale?0.3:0.7;
  return {...f,title:'Improve '+f.title,impact,relevance,effort,confidence,priority:prioritize(impact,confidence,relevance,effort),basis:'Deterministic heuristic, not predicted revenue. Non-detection is not proof that the feature does not exist.',measurement:'Reinspect the same confirmed website and rubric',approval:'Owner approval required'};
 }).sort((a:any,b:any)=>b.priority-a.priority);
 const platforms=['Website','Google Business','Facebook','Instagram','LinkedIn','TikTok','YouTube','X','Pinterest','Directories','Reviews'].map(name=>{
  const matches=evidence.filter((e:any)=>e.platform===name);
  return {name,state:matches.length?'Public evidence · ownership not independently verified':'Unknown · no evidence in this investigation',score:name==='Website'&&measured?p.score.value:null,evidence:matches,connected:false};
 });
 return {profileId:p.id,name:p.name,version:intelligenceVersion,identityConfirmed:Boolean(p.identityConfirmed),state:!p.identityConfirmed?'Confirm identity':stale?'Stale':'Evidence reviewed',analyzedAt:new Date().toISOString(),basisAt:p.investigatedAt,scope:'Public evidence and inspected website; connected platform performance remains unmeasured',score:measured?p.score:null,findings,opportunities,platforms,unknowns:['Search ranking','Platform reach and engagement','Review sentiment','Customer conversions','Revenue impact'],sourceIds:evidence.map((e:any)=>e.id)};
}
