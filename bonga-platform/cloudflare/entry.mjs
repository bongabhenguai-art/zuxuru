import app from '../worker/index.mjs';
import {verifiedIdentity,trustedRequest} from './identity.mjs';
import {dropboxStorage} from './dropbox-storage.mjs';
import {cloudflareNavigation} from './navigation.mjs';
const privatePage=p=>['/workspace','/workspace.html','/fashion-service.html','/digital-studio.html','/signin-with-chatgpt'].includes(p);
export default {
  async fetch(request,env,ctx){
    const storage=dropboxStorage(env);if(storage)env={...env,MEDIA:storage};
    const url=new URL(request.url),identity=await verifiedIdentity(request,env);
    request=trustedRequest(request,identity);
    if(privatePage(url.pathname)&&!identity)return new Response('Dashboard login needs Cloudflare Access setup. Your existing Bonga Bhengu dashboard remains available on its current website.',{status:401,headers:{'content-type':'text/plain;charset=utf-8','cache-control':'no-store'}});
    const navigation=cloudflareNavigation(url);if(navigation)return navigation;
    const result=await app.fetch(request,env,ctx);
    if(result.status!==404||url.pathname.startsWith('/api/')||url.pathname==='/mcp'||!['GET','HEAD'].includes(request.method))return result;
    if(url.pathname.startsWith('/server/')||url.pathname.startsWith('/.'))return result;
    if(['/workspace','/workspace.html'].includes(url.pathname))url.pathname='/workspace.html';
    const asset=await env.ASSETS.fetch(new Request(url,request));
    const headers=new Headers(asset.headers);headers.set('x-content-type-options','nosniff');headers.set('referrer-policy',url.pathname==='/phone-camera.html'?'no-referrer':'strict-origin-when-cross-origin');headers.set('permissions-policy','camera=(self), microphone=(self), display-capture=(self)');
    if(privatePage(url.pathname)||url.pathname.endsWith('.html'))headers.set('cache-control','no-store');
    return new Response(asset.body,{status:asset.status,headers});
  }
};
