import assert from 'node:assert/strict';
import {cloudflareNavigation,returnDestination} from '../cloudflare/navigation.mjs';
const url=value=>new URL('https://app.example.com/signin-with-chatgpt?return_to='+encodeURIComponent(value));
for(const p of ['/workspace','/digital-studio.html','#bad','https://evil.example/','//evil.example','/\\evil.example','/api/designer/workspace'])assert.equal(returnDestination(url(p)),p==='/workspace'||p==='/digital-studio.html'?p:'/fashion-service.html');
assert.equal(returnDestination(url('/workspace#intelligence-center')),'/workspace#intelligence-center');
assert.equal(cloudflareNavigation(url('/workspace')).headers.get('location'),'https://app.example.com/workspace');
assert.equal(cloudflareNavigation(new URL('https://app.example.com/signout-with-chatgpt')).headers.get('location'),'https://app.example.com/cdn-cgi/access/logout');
assert.equal(cloudflareNavigation(url('/workspace')).headers.get('cache-control'),'no-store');
console.log('Cloudflare login destinations, open-redirect protection and logout routing passed.');
