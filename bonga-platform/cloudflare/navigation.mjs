const destinations=new Set(['/workspace','/workspace.html','/fashion-service.html','/digital-studio.html']);
export function returnDestination(url){
  const value=url.searchParams.get('return_to');
  if(!value||!value.startsWith('/')||value.startsWith('//')||value.includes('\\'))return '/fashion-service.html';
  try{const target=new URL(value,url.origin);return target.origin===url.origin&&destinations.has(target.pathname)?target.pathname+target.search+target.hash:'/fashion-service.html';}catch{return '/fashion-service.html';}
}
export function cloudflareNavigation(url){
  if(url.pathname==='/signout-with-chatgpt')return new Response(null,{status:302,headers:{location:url.origin+'/cdn-cgi/access/logout','cache-control':'no-store'}});
  if(url.pathname==='/signin-with-chatgpt')return new Response(null,{status:302,headers:{location:url.origin+returnDestination(url),'cache-control':'no-store'}});
  return null;
}
