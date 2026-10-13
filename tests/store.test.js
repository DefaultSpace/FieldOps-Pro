import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
// Bundle the real store so Node can resolve the app's extensionless imports.
const {outputFiles}=await build({entryPoints:['src/store/useServiceStore.js'],bundle:true,platform:'node',format:'esm',write:false});
let storage=new Map();globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
const {useServiceStore:store}=await import('data:text/javascript;base64,'+Buffer.from(outputFiles[0].text).toString('base64'));
test('actual store: archive import, complete, archive, restore, delete undo, and persisted data',()=>{
 store.setState({services:[],archive:[{id:'archived',receiptNo:'123456789',name:'Örnek',status:'done',createdAt:Date.now()-86400000,notes:'sakla',plusQuantity:2}],lastDeleted:null});
 assert.equal(store.getState().importServices([{receiptNo:'123456789',name:'Örnek'}]).restored,1);
 assert.equal(store.getState().archive.length,0);assert.equal(store.getState().services[0].status,'pending');
 store.getState().completeVisit(['archived']);assert.ok(store.getState().services[0].completedAt);
 store.getState().startNewDay();assert.equal(store.getState().archive[0].status,'done');
 store.getState().undoVisit(['archived']);assert.equal(store.getState().services[0].status,'pending');
 store.getState().removeVisit(['archived']);assert.equal(store.getState().services.length,0);assert.equal(store.getState().archive.length,0);
 store.getState().undoDelete();assert.equal(store.getState().services[0].notes,'sakla');assert.equal(store.getState().services[0].plusQuantity,2);
 assert.ok(store.getState().addService({receiptNo:'123456789',name:'tekrar'}).error);
 const saved=JSON.parse(storage.get('routex-persist-v1'));assert.equal(saved.state.services.length,1);assert.equal(saved.state.lastDeleted,undefined);
 store.getState().updateService('archived',{notes:'düzenlendi'});assert.equal(JSON.parse(storage.get('routex-persist-v1')).state.services[0].notes,'düzenlendi');
});
