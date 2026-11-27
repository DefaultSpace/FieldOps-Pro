import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
const assets=process.env.FIELDOPS_MINI_ASSETS==='1';
const port=4188,base=`http://127.0.0.1:${port}${assets?'/assets/web/':'/FieldOps-Pro/'}`;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port',String(port),'--strictPort',...(assets?['--outDir','dist-mini','--base','/assets/web/']:[])],{stdio:'pipe'});
let browser;
try{
    await new Promise((resolve,reject)=>{server.stdout.on('data',d=>{if(String(d).includes(String(port)))resolve();});server.on('error',reject);});
    browser=await chromium.launch({headless:true,...(process.env.FIELDOPS_CHROME?{executablePath:process.env.FIELDOPS_CHROME}:{})});
    const context=await browser.newContext({viewport:{width:390,height:844}});
    await context.addInitScript(()=>{
        const epoch='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
        if(!localStorage.getItem('routex-persist-v1'))localStorage.setItem('routex-persist-v1',JSON.stringify({version:1,state:{technicianName:'Test',region:'Avcılar',services:[{id:'one',name:'Mini Test',receiptNo:'123456789',address:'Test sok 1',timeSlot:'10/12',status:'pending',availability:'later',reminderAt:Date.now()+600000,createdAt:Date.now(),history:[]}],archive:[],activity:[],miniSync:{epoch,receipts:{}}}}));
        window.nativeMessages=[];
        window.FieldOpsMini={postMessage(raw){const m=JSON.parse(raw);window.nativeMessages.push(m);if(m.type==='poll')queueMicrotask(()=>window.FieldOpsMini.onmessage?.({data:JSON.stringify({type:'operations',value:[]})}));}};
    });
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base);
    if(assets)assert.match(await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content'),/connect-src 'none'/);
    await page.getByText('FieldOps Mini ·',{exact:false}).waitFor();
    await page.waitForFunction(()=>window.nativeMessages.some(m=>m.type==='snapshot'));
    const initial=await page.evaluate(()=>window.nativeMessages.find(m=>m.type==='snapshot').value);
    assert.equal(initial.records[0].name,'Mini Test');
    assert.deepEqual(initial.postponeReasons,['Müşteri evde yok','Telefona cevap vermiyor']);
    assert.equal(await page.evaluate(()=>window.nativeMessages.find(m=>m.type==='reminders').value.length),1);
    const op={v:1,opId:crypto.randomUUID(),epoch:initial.epoch,id:'one',base:initial.records[0].revision,status:'done',reason:''};
    await page.evaluate(op=>window.FieldOpsMini.onmessage({data:JSON.stringify({type:'operations',value:[op,op]})}),op);
    await page.waitForFunction(()=>window.nativeMessages.filter(m=>m.type==='ack').length===2);
    await page.waitForFunction(()=>window.nativeMessages.some(m=>m.type==='reminders'&&m.value.length===0));
    let state=await page.evaluate(()=>JSON.parse(localStorage.getItem('routex-persist-v1')).state);
    assert.equal(state.services[0].status,'done');assert.equal(state.services[0].history.length,1);
    await page.reload();
    await page.waitForFunction(()=>window.nativeMessages.some(m=>m.type==='snapshot'));
    await page.evaluate(op=>window.FieldOpsMini.onmessage({data:JSON.stringify({type:'operations',value:[op]})}),op);
    await page.waitForFunction(()=>window.nativeMessages.some(m=>m.type==='ack'));
    state=await page.evaluate(()=>JSON.parse(localStorage.getItem('routex-persist-v1')).state);assert.equal(state.services[0].history.length,1);
    // Native export uses the original version-3 data format without sync receipts.
    await page.getByRole('navigation',{name:'Ana gezinme'}).getByText('Ayarlar',{exact:true}).click();
    await page.getByRole('button',{name:'Yedek indir',exact:true}).click();
    const backup=await page.evaluate(()=>JSON.parse(window.nativeMessages.find(m=>m.type==='export').data));assert.equal(backup.version,3);assert.equal(backup.s[0].status,'done');assert.equal(backup.miniSync,undefined);assert.equal(backup.preferences.library.length,8);
    assert.deepEqual(errors,[]);
    console.log('PASS: native bridge snapshot, status update, duplicate delivery, reload recovery and compatible JSON backup, reminder scheduling and completion cancellation.');
}finally{await browser?.close();server.kill();}
