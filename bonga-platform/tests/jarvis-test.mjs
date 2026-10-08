import assert from 'node:assert/strict';
import {jarvisTest} from '../worker/jarvis-test.mjs';
const env={OPENAI_API_KEY:'test-secret',JARVIS_OWNER_EMAIL:'owner@example.com'};
const req=(changes={})=>new Request('https://app.example.com/api/jarvis/test',{method:'POST',headers:{origin:'https://app.example.com','oai-authenticated-user-id':'owner','oai-authenticated-user-email':'owner@example.com',...changes}});
let calls=0;
const send=async()=>{calls++;return new Response(JSON.stringify({output:[{content:[{type:'output_text',text:'Connected'}]}]}));};
assert.equal((await jarvisTest(req({'oai-authenticated-user-id':''}),env,send)).status,403);
assert.equal((await jarvisTest(req({origin:'https://evil.example'}),env,send)).status,403);
assert.equal((await jarvisTest(req(),{JARVIS_OWNER_EMAIL:env.JARVIS_OWNER_EMAIL},send)).status,409);
assert.equal(calls,0);
const success=await jarvisTest(req(),env,send);assert.equal((await success.json()).verified,true);assert.equal(calls,1);
for(const status of [401,403,404,429,500]){const r=await jarvisTest(req(),env,async()=>new Response('provider-secret-error',{status}));assert.equal(r.status,status===429?429:502);assert.ok(!(await r.text()).includes('provider-secret-error'));}
assert.equal((await jarvisTest(req(),env,async()=>new Response(JSON.stringify({output:[]})))).status,502);
assert.equal((await jarvisTest(req(),env,async()=>{throw Error('secret-error')})).status,504);
console.log('PASS real-response verification, owner/origin protection, missing keys, provider failures and secret-safe errors');
