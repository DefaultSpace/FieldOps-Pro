import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { acceptOperation, revision, snapshot, validOperation, STORAGE_KEY } from '../src/mini/protocol.js';
import { readBackup, mergeBackup } from '../src/utils/backup.js';

let disk=new Map(),fail=false;
globalThis.localStorage={getItem:key=>disk.get(key)||null,setItem:(key,value)=>{if(fail)throw new Error('disk full');disk.set(key,value);},removeItem:key=>disk.delete(key)};
const {outputFiles}=await build({entryPoints:['src/store/useServiceStore.js'],bundle:true,platform:'node',format:'esm',write:false});
const {useServiceStore:store}=await import('data:text/javascript;base64,'+Buffer.from(outputFiles[0].text).toString('base64'));
const epoch='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const fixture=()=>({id:'one',name:'Test Müşteri',receiptNo:'123456789',address:'Test sokak 1',mahalle:'Ambarlı',district:'Avcılar',timeSlot:'10/12',status:'pending',createdAt:Date.now(),phone:'905551234567',visitNote:'Saklanacak not',materialPrepared:{pump:2},history:[]});
const saved=()=>JSON.parse(disk.get(STORAGE_KEY)).state;
async function operation(overrides={}){return {v:1,opId:crypto.randomUUID(),epoch,id:'one',base:await revision(store.getState().services[0],epoch),status:'done',reason:'',...overrides};}
beforeEach(()=>{fail=false;disk=new Map();store.setState({services:[fixture()],archive:[],activity:[],miniSync:{epoch,receipts:{}}});});

test('mini only exposes minimum daily fields and Istanbul date, including today’s archived completions',async()=>{
    const now=Date.parse('2026-11-11T22:05:00Z');
    store.setState({archive:[{...fixture(),id:'archive',receiptNo:'999',status:'done',completedAt:now},{...fixture(),id:'old',receiptNo:'888',status:'done',completedAt:now-86400000}]});
    const s=await snapshot(store.getState(),now);assert.equal(s.day,'2026-11-12');assert.equal(s.records.length,2);assert.equal(s.records[1].actionable,false);
    assert.deepEqual(Object.keys(s.records[0]).sort(),['id','name','address','timeSlot','receiptNo','status','actionable','revision'].sort());
    assert.ok(!JSON.stringify(s).includes('905551234567'));assert.ok(!JSON.stringify(s).includes('Saklanacak not'));
});
test('completion is durable, repeat delivery does not add history or rewrite a later phone change',async()=>{
    const op=await operation();assert.equal((await acceptOperation(store,op)).result,'applied');
    assert.equal(saved().services[0].status,'done');assert.equal(saved().services[0].visitNote,'Saklanacak not');assert.deepEqual(saved().services[0].materialPrepared,{pump:2});
    store.getState().undoVisit(['one']);const events=store.getState().services[0].history.length;
    assert.equal((await acceptOperation(store,op)).result,'applied');assert.equal(saved().services[0].status,'pending');assert.equal(saved().services[0].history.length,events);
});
test('postponement uses existing phone fields and keeps all unrelated fields',async()=>{
    await acceptOperation(store,await operation({status:'postponed',reason:'Müşteri evde değil'}));
    const s=saved().services[0];assert.equal(s.status,'postponed');assert.equal(s.actionReason,'Müşteri evde değil');assert.equal(s.actionReceiptNo,'123456789');assert.equal(s.history[0].type,'postponed');assert.equal(s.phone,'905551234567');
});
test('phone edit wins over a stale watch operation, even for a non-status field',async()=>{
    const op=await operation();store.getState().updateService('one',{visitNote:'Telefonda değişti'});
    assert.equal((await acceptOperation(store,op)).result,'conflict');assert.equal(saved().services[0].status,'pending');assert.equal(saved().services[0].visitNote,'Telefonda değişti');
});
test('a phone edit during asynchronous revision calculation is not overwritten',async()=>{
    const op=await operation(),promise=acceptOperation(store,op);store.getState().updateService('one',{timeSlot:'14/16'});
    assert.equal((await promise).result,'conflict');assert.equal(saved().services[0].timeSlot,'14/16');
});
test('deleted or archived records are never resurrected by the watch',async()=>{
    const op=await operation();store.getState().removeVisit(['one']);assert.equal((await acceptOperation(store,op)).result,'missing');assert.equal(saved().services.length,0);
});
test('a new dataset epoch rejects an old offline operation',async()=>{
    const op=await operation();store.setState({miniSync:{epoch:crypto.randomUUID(),receipts:{}}});assert.equal((await acceptOperation(store,op)).result,'reset');assert.equal(saved().services[0].status,'pending');
});
test('cancelled and already completed records cannot be changed from the watch',async()=>{
    for(const status of ['cancelled','done']){store.getState().updateService('one',{status});assert.equal((await acceptOperation(store,await operation())).result,'conflict');assert.equal(saved().services[0].status,status);}
});
test('quota failure never yields an acknowledgement; retry persists once and survives restart',async()=>{
    const op=await operation();fail=true;await assert.rejects(acceptOperation(store,op),/kaydedilemedi/);assert.equal(saved().services[0].status,'pending');
    fail=false;assert.equal((await acceptOperation(store,op)).result,'applied');assert.equal(saved().services[0].history.length,1);
    await store.persist.rehydrate();assert.equal((await acceptOperation(store,op)).result,'applied');assert.equal(saved().services[0].history.length,1);
});
test('same operation id with different contents is rejected',async()=>{
    const op=await operation();await acceptOperation(store,op);await assert.rejects(acceptOperation(store,{...op,status:'postponed',reason:'different'}),/kimliği/);
});
test('unsupported or malformed operations leave the store untouched',async()=>{
    const op=await operation(),before=JSON.stringify(saved());
    for(const change of [{v:2},{opId:'__proto__'},{status:'cancelled'},{status:'postponed',reason:''},{base:'bad'},{epoch:'bad'},{reason:'x'.repeat(201)},{id:12}]){assert.equal(validOperation({...op,...change}),false);await assert.rejects(acceptOperation(store,{...op,...change}));}
    assert.equal(JSON.stringify(saved()),before);
});
test('JSON backup remains version 3 compatible and merge preserves phone records',async()=>{
    await acceptOperation(store,await operation());const state=saved();
    const backup=readBackup(JSON.stringify({version:3,s:state.services,a:state.archive,activity:state.activity}));
    assert.equal(backup.s[0].status,'done');assert.equal(backup.miniSync,undefined);
    const current={services:[{...fixture(),visitNote:'Daha yeni'}],archive:[],activity:[]};assert.equal(mergeBackup(current,backup).services[0].visitNote,'Daha yeni');
});
test('two offline changes to the same revision cannot silently replace each other',async()=>{
    const a=await operation(),b=await operation({status:'postponed',reason:'Başka işlem'});
    assert.equal((await acceptOperation(store,a)).result,'applied');assert.equal((await acceptOperation(store,b)).result,'conflict');assert.equal(saved().services[0].status,'done');
});
test('old completed active rows are excluded from today’s watch list',async()=>{
    const now=Date.now();store.setState({services:[fixture(),{...fixture(),id:'old',receiptNo:'old',status:'done',completedAt:now-86400000}]});
    assert.equal((await snapshot(store.getState(),now)).records.length,1);
});
test('journal compaction rotates epoch so discarded commands can never apply again',async()=>{
    const receipts={};for(let i=0;i<2000;i++)receipts[crypto.randomUUID()]={request:'old',ack:{result:'applied'}};
    store.setState({miniSync:{epoch,receipts}});const op=await operation();assert.equal((await acceptOperation(store,op)).result,'applied');
    assert.notEqual(saved().miniSync.epoch,epoch);assert.equal(Object.keys(saved().miniSync.receipts).length,1000);
    assert.equal((await acceptOperation(store,op)).result,'applied');
    store.setState({services:[fixture()]});assert.equal((await acceptOperation(store,await operation())).result,'reset');assert.equal(saved().services[0].status,'pending');
});
