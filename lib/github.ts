import {list,save,remove,vault} from './zuxuru';

const licenses=new Set(['MIT','Apache-2.0','BSD-2-Clause','BSD-3-Clause','ISC','MPL-2.0','GPL-2.0','GPL-3.0','GPL-2.0-only','GPL-3.0-only','GPL-2.0-or-later','GPL-3.0-or-later','AGPL-3.0','AGPL-3.0-only','AGPL-3.0-or-later','LGPL-2.1','LGPL-3.0','LGPL-2.1-only','LGPL-3.0-only','Unlicense','CC0-1.0','EPL-2.0']);
const encode=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes));
const decode=(value:string)=>Uint8Array.from(atob(value),c=>c.charCodeAt(0));
async function request(token:string,path:string,optional=false){
 let r:Response;
 try{r=await fetch('https://api.github.com'+path,{headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'Zuxuru'},redirect:'error',signal:AbortSignal.timeout(15000)});}catch{throw Error('Source Unavailable: GitHub could not be reached.');}
 if(optional&&r.status===404)return null;
 if(!r.ok)throw Error(r.status===401?'Authorization Failed: reconnect GitHub.':r.status===403?'Permission Missing: GitHub denied access or its rate limit was reached.':r.status===404?'Permission Missing: repository is unavailable to this connection.':'Source Unavailable: GitHub returned '+r.status+'.');
 return r.json() as Promise<any>;
}
async function tokenFor(owner:string){
 const row=(await list(owner,'github_connection'))[0];if(!row)throw Error('Disconnected: connect GitHub first.');
 try{return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(row.iv)},await vault(),decode(row.ciphertext)));}catch{throw Error('Authorization Failed: reconnect GitHub.');}
}
export async function githubStatus(owner:string){
 const row=(await list(owner,'github_connection'))[0];
 return row?{configured:true,account:row.account,verifiedAt:row.verifiedAt,status:'Previously verified · refresh to check current access'}:{configured:false,status:'Disconnected'};
}
export async function connectGitHub(owner:string,token:string){
 if(!token||token.length>500||/\s/.test(token))throw Error('Enter a valid GitHub token.');
 const user=await request(token,'/user');if(typeof user.login!=='string'||!Number.isInteger(user.id))throw Error('Source Unavailable: invalid GitHub identity.');
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const ciphertext=encode(new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await vault(),new TextEncoder().encode(token))));
 const existing=(await list(owner,'github_connection'))[0],verifiedAt=new Date().toISOString();
 await save(owner,'github_connection',{account:user.login,githubId:user.id,iv:encode(iv),ciphertext,verifiedAt},existing?.id);
 return {account:user.login,status:'Connected · GitHub identity verified',verifiedAt};
}
export async function disconnectGitHub(owner:string){for(const row of await list(owner,'github_connection'))await remove(owner,'github_connection',row.id);return {status:'Disconnected'};}
export async function githubRepositories(owner:string){
 const token=await tokenFor(owner),user=await request(token,'/user');
 const rows=await request(token,'/user/repos?per_page=100&sort=updated');if(!Array.isArray(rows))throw Error('Source Unavailable: invalid repository response.');
 return {status:'Connected · live repository read verified',account:user.login,retrievedAt:new Date().toISOString(),limit:100,repositories:rows.filter((r:any)=>!r.private&&licenses.has(r.license?.spdx_id)).map((r:any)=>({name:r.full_name,url:'https://github.com/'+r.full_name,license:r.license.spdx_id,defaultBranch:r.default_branch,description:r.description||'',writePermissionReported:r.permissions?.push===true})),excluded:rows.filter((r:any)=>r.private||!licenses.has(r.license?.spdx_id)).length};
}
export async function inspectGitHub(owner:string,fullName:string){
 if(!/^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9_.-]+$/.test(fullName)||['.','..'].includes(fullName.split('/')[1]))throw Error('Use owner/repository or select an accessible repository.');
 const token=await tokenFor(owner),path='/repos/'+fullName;
 const repo=await request(token,path);if(repo.private)throw Error('Permission Missing: only public open-source repositories are allowed.');
 const license=await request(token,path+'/license',true);
 if(!license||!licenses.has(license.license?.spdx_id))throw Error('Permission Missing: a recognized open-source license is required.');
 const [readme,files]=await Promise.all([request(token,path+'/readme',true),request(token,path+'/contents',true)]);
 const verifiedAt=new Date().toISOString();
 const result={name:repo.full_name,url:'https://github.com/'+repo.full_name,license:license.license.spdx_id,licenseUrl:license.html_url,defaultBranch:repo.default_branch,writePermissionReported:repo.permissions?.push===true,writeVerified:false,status:'Repository read verified · module not installed',verifiedAt,readme:readme?.encoding==='base64'?new TextDecoder().decode(decode(readme.content.replace(/\s/g,''))).slice(0,20000):'',files:Array.isArray(files)?files.slice(0,100).map((f:any)=>({name:f.name,path:f.path,type:f.type})):[]};
 const previous=(await list(owner,'github_repository'))[0];await save(owner,'github_repository',result,previous?.id);
 return result;
}
