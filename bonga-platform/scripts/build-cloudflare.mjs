import fs from 'node:fs';
import {build} from 'esbuild';
const output='.cloudflare-build';
fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(output+'/public',{recursive:true});
fs.cpSync('dist',output+'/public',{recursive:true,filter:path=>!path.split('/').includes('server')&&!path.split('/').includes('.openai')});
await build({entryPoints:['cloudflare/entry.mjs'],outfile:output+'/worker.mjs',bundle:true,format:'esm',platform:'browser',target:'es2022',conditions:['workerd','browser'],minify:true});
console.log('Cloudflare app built with separate storefront assets and verified dashboard identity.');
