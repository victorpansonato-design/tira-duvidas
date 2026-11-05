// Repair rendering of an occluded browser; does not read authentication state.
const ws=new WebSocket(process.argv[2]);
await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});
let seq=0;const pending=new Map();
ws.onmessage=({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}}};
const call=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params,sessionId}));});
const {targetInfos}=await call('Target.getTargets');
const target=targetInfos.find(t=>t.type==='page'&&t.url==='https://app.anchieta.br/anchy/');
if(!target)throw Error('Anchy target not found');
const {sessionId}=await call('Target.attachToTarget',{targetId:target.targetId,flatten:true});
await call('Page.bringToFront',{},sessionId);
await call('Page.setWebLifecycleState',{state:'active'},sessionId);
await call('Emulation.setFocusEmulationEnabled',{enabled:true},sessionId);
const {windowId}=await call('Browser.getWindowForTarget',{targetId:target.targetId});
await call('Browser.setWindowBounds',{windowId,bounds:{windowState:'maximized'}});
await call('Page.bringToFront',{},sessionId);
console.log('Rendering active');ws.close();
