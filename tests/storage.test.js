import test from 'node:test';
import assert from 'node:assert/strict';
import {safeStorage,saveCheckpoint,readCheckpoint,storageProblem} from '../src/utils/storage.js';
const values=new Map();
let blocked='';
globalThis.localStorage={getItem:key=>values.get(key)||null,setItem:(key,value)=>{if(key===blocked)throw new Error('Storage full');values.set(key,value);},removeItem:key=>values.delete(key)};
test('checkpoint failure remains visible after a successful regular save',()=>{
 const state={services:[{id:'old',notes:'Keep'}],archive:[]};
 saveCheckpoint(state);const original=readCheckpoint();
 blocked='fieldops-checkpoint';saveCheckpoint({services:[],archive:[]});
 safeStorage.setItem('routex-persist-v1',JSON.stringify(state));
 assert.match(storageProblem(),/kurtarma kopyası kaydedilemedi/);
 assert.equal(readCheckpoint(),original);
 blocked='';saveCheckpoint(state);assert.equal(storageProblem(),'');
});
test('failed persistence retains saved data and reports the error',()=>{
 const original=values.get('routex-persist-v1');blocked='routex-persist-v1';
 safeStorage.setItem('routex-persist-v1','{}');
 assert.equal(values.get('routex-persist-v1'),original);assert.match(storageProblem(),/kaydedilemedi/);
 blocked='';safeStorage.setItem('routex-persist-v1',original);assert.equal(storageProblem(),'');
});
test('unreadable stored data is not overwritten by later saves or checkpoints',()=>{
 values.set('routex-persist-v1','broken-json');const original=readCheckpoint();
 assert.equal(safeStorage.getItem('routex-persist-v1'),null);
 safeStorage.setItem('routex-persist-v1','{}');saveCheckpoint({services:[],archive:[]});
 assert.equal(values.get('routex-persist-v1'),'broken-json');assert.equal(readCheckpoint(),original);
 assert.match(storageProblem(),/üzerine yazılmıyor/);
});
