import test from 'node:test';
import assert from 'node:assert/strict';
import { saleQuantity, saleUpdates, serviceCommission, commissionStats } from '../src/utils/commission.js';
import { mergeImported } from '../src/utils/ecom.js';
test('rates, multiple sales, and legacy marks', () => {
 assert.equal(serviceCommission({plus:true,aksesuar:true,bakim:true}),470);
 assert.equal(serviceCommission({plusQuantity:2,aksesuarQuantity:3,bakim:true}),790);
 assert.equal(serviceCommission({status:'done'}),0);
 assert.equal(saleQuantity({plus:true,plusQuantity:0},'plus'),0);
});
test('editing replaces quantity, zero removes it, invalid quantities are rejected', () => {
 let s={...saleUpdates('plus',2),...saleUpdates('plus',3)};
 assert.equal(serviceCommission(s),360);
 s={...s,...saleUpdates('plus',0)}; assert.equal(serviceCommission(s),0); assert.equal(s.plus,false);
 for(const value of [-1,1.5,NaN,Infinity]) assert.throws(()=>saleUpdates('plus',value));
});
test('earned vs pending, cancelled excluded, completion and undo', () => {
 const pending={id:'a',status:'pending',aksesuarQuantity:3,plusQuantity:2,bakim:true};
 const cancelled={...pending,id:'b',status:'cancelled'};
 let stats=commissionStats([pending,cancelled]); assert.equal(stats.totalPrime,0); assert.equal(stats.pendingPrime,790);
 stats=commissionStats([{...pending,status:'done'},cancelled]); assert.equal(stats.totalPrime,790); assert.equal(stats.pendingPrime,0); assert.deepEqual(stats.quantities,{plus:2,aksesuar:3,bakim:1}); assert.equal(stats.prime,790);
 assert.equal(commissionStats([pending]).totalPrime,0);
 assert.equal(commissionStats([{...pending,status:'postponed'},cancelled]).cancelRate,50);
});
test('reimport retains sale quantities and history calculates same rates', () => {
 const saved={id:'a',receiptNo:'123456789',status:'done',plus:true,plusQuantity:3,aksesuarQuantity:2};
 const merged=mergeImported([saved],[],[{receiptNo:'123456789',name:'Updated'}],()=> 'new',Date.now(),false);
 assert.equal(merged.length,1); assert.equal(serviceCommission(merged[0]),560);
 assert.equal(commissionStats([saved]).totalPrime,560);
});
