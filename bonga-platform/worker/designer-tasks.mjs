export async function designerTasks(request,env){
  const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
  const user=request.headers.get('oai-authenticated-user-id');
  if(!user)return reply({error:'Sign in required'},401);
  if(!env.DB)return reply({error:'Workflow database unavailable'},503);
  if(request.method!=='POST')return reply({error:'Method not allowed'},405);
  if(request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'Open your own dashboard'},403);
  try{
    const raw=await request.text();if(raw.length>8000)return reply({error:'Task update too large'},413);
    let body;try{body=JSON.parse(raw);}catch{return reply({error:'Invalid task update'},400);}
    if(!body||typeof body.id!=='string'||!body.id||body.id.length>200||!Number.isSafeInteger(body.revision)||body.revision<1||!['Proposed','In progress','Review','Completed'].includes(body.status)||typeof body.note!=='string'||body.note.length>3000)return reply({error:'Choose a valid task, status, revision and progress note'},400);
    if(['Review','Completed'].includes(body.status)&&!body.note.trim())return reply({error:'Add the actual deliverable or result before review or completion'},400);
    const row=await env.DB.prepare('SELECT payload,revision FROM designer_workspaces WHERE user_id = ?').bind(user).first();
    if(!row)return reply({error:'Workspace not found'},404);
    if(row.revision!==body.revision)return reply({error:'Your workspace changed. Read the current task list before saving progress.'},409);
    const payload=JSON.parse(row.payload),work=payload['zuxuru-designer-work-v1'];
    const task=work?.tasks?.find(t=>t.id===body.id);
    if(!task)return reply({error:'Task not found in your workspace'},404);
    const updatedAt=new Date().toISOString();
    Object.assign(task,{status:body.status,done:body.status==='Completed',progressNote:body.note.trim(),progressUpdatedAt:updatedAt,progressMethod:'Owner-entered progress; result not independently verified'});
    const saved=await env.DB.prepare('UPDATE designer_workspaces SET payload = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND revision = ?').bind(JSON.stringify(payload),updatedAt,user,row.revision).run();
    if(!saved.meta?.changes)return reply({error:'Another update won the save. Read the latest tasks and retry.'},409);
    return reply({saved:true,revision:row.revision+1,task,url:new URL(request.url).origin+'/fashion-service.html#my-work'});
  }catch{return reply({error:'Progress could not be saved. Read the latest tasks before retrying.'},503);}
}
