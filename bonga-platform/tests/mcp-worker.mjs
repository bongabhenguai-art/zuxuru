import assert from 'node:assert/strict';
import worker from '../dist/server/index.js';
const original=globalThis.Function;
globalThis.Function=new Proxy(original,{construct(){throw new Error('Dynamic compilation disabled like Workers');},apply(){throw new Error('Dynamic compilation disabled like Workers');}});
try{
  const request=(method,params={})=>new Request('https://test/mcp',{method:'POST',headers:{'content-type':'application/json',accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})});
  const init=await worker.fetch(request('initialize',{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'test',version:'1'}}),{});
  assert.equal((await init.json()).result.serverInfo.name,'Bonga Bhengu business workspace');
  const discovery=await worker.fetch(request('tools/list'),{});
  assert.equal((await discovery.json()).result.tools.length,4);
  assert.equal((await worker.fetch(request('tools/call',{name:'bonga_list_work',arguments:{}}),{})).status,401);
  console.log('PASS bundled MCP initialization and discovery without runtime code generation; private access requires sign-in.');
}finally{globalThis.Function=original;}
