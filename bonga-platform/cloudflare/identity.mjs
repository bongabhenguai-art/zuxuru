import {createRemoteJWKSet,jwtVerify} from 'jose';
const keys=new Map();
export async function verifiedIdentity(request,env,verify=jwtVerify){
  const issuer=env.CF_ACCESS_ISSUER,audience=env.CF_ACCESS_AUD;
  if(!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer||'')||!audience)return null;
  const token=request.headers.get('cf-access-jwt-assertion');if(!token)return null;
  try{
    if(!keys.has(issuer))keys.set(issuer,createRemoteJWKSet(new URL(issuer+'/cdn-cgi/access/certs')));
    const {payload}=await verify(token,keys.get(issuer),{issuer,audience,algorithms:['RS256'],requiredClaims:['exp','iat','sub','email']});
    if(typeof payload.sub!=='string'||!payload.sub||typeof payload.email!=='string'||!payload.email.includes('@'))return null;
    return {id:'cloudflare:'+payload.sub,email:payload.email.toLowerCase()};
  }catch{return null;}
}
export function trustedRequest(request,identity){
  const headers=new Headers(request.headers);
  for(const key of [...headers.keys()])if(key.startsWith('oai-authenticated-'))headers.delete(key);
  if(identity){headers.set('oai-authenticated-user-id',identity.id);headers.set('oai-authenticated-user-email',identity.email);}
  return new Request(request,{headers});
}
