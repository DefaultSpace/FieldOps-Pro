import { completeRecords, dayKey, isOpen, todaysCompleted, uniqueRecords } from '../utils/workflow.js';
import { recordEvent } from '../utils/history.js';

export const STORAGE_KEY = 'routex-persist-v1';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function validOperation(op) {
    return op?.v === 1 && uuid.test(op.opId) && uuid.test(op.epoch) &&
        typeof op.id === 'string' && op.id.length > 0 && op.id.length <= 200 &&
        /^[a-f0-9]{64}$/.test(op.base) && ['done', 'postponed'].includes(op.status) &&
        typeof op.reason === 'string' && op.reason.length <= 200 &&
        (op.status !== 'postponed' || op.reason.trim().length > 0);
}
export async function revision(record, epoch) {
    const bytes = new TextEncoder().encode(epoch + JSON.stringify(record));
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
}
export async function snapshot(state, now = Date.now()) {
    const active = state.services.filter(s => isOpen(s) || (s.status === 'cancelled' && dayKey(s.statusChangedAt || s.createdAt) === dayKey(now)));
    const records = uniqueRecords([...active, ...todaysCompleted(state.services, state.archive, now)]).sort((a,b) => {
        const time = s => /^(\d{1,2})/.test(s.timeSlot || s.sourceTimeSlot || '') ? Number((s.timeSlot || s.sourceTimeSlot).match(/^(\d{1,2})/)[1]) : 99;
        return Number(!isOpen(a))-Number(!isOpen(b)) || time(a)-time(b) || String(a.name).localeCompare(String(b.name),'tr');
    });
    if (records.length > 1000) throw new Error('Saat listesi 1000 fiş sınırını aşıyor. Kapanan işleri arşivle.');
    return {v:1, epoch:state.miniSync.epoch, generatedAt:now, day:dayKey(now), records:await Promise.all(records.map(async s => ({
        id:s.id, name:String(s.name || '').slice(0,500),
        address:[s.address,s.mahalle,s.district].filter(Boolean).join(' · ').slice(0,2500),
        timeSlot:String(s.timeSlot || s.sourceTimeSlot || '').slice(0,100),
        receiptNo:String(s.receiptNo || '').slice(0,200), status:s.status,
        actionable:state.services.includes(s) && isOpen(s), revision:await revision(s,state.miniSync.epoch),
    })))};
}

// Called synchronously after the adapter checks the hash. A reference check also
// catches a phone edit made while Web Crypto was calculating the hash.
export function operationPatch(state, op, expected, now = Date.now()) {
    const stored = state.miniSync?.receipts?.[op.opId];
    if (stored) return {};
    const current = state.services.find(s => s.id === op.id);
    let result = 'applied';
    if (op.epoch !== state.miniSync?.epoch) result = 'reset';
    else if (!current) result = 'missing';
    else if (current !== expected || !isOpen(current)) result = 'conflict';
    const ack = {v:1, opId:op.opId, epoch:op.epoch, result};
    let services = state.services;
    if (result === 'applied') {
        services = op.status === 'done' ? completeRecords(services,[op.id],now) : services.map(s => s !== current ? s : recordEvent({
            ...s, status:'postponed', actionReason:op.reason.trim(), actionReceiptNo:s.receiptNo || '',
            actionRecordCount:1, statusChangedAt:now, reminderAt:null, reminderNotifiedAt:null,
        },'postponed',now,'FieldOps Mini'));
    }
    let receipts={...state.miniSync.receipts,[op.opId]:{request:JSON.stringify(op),ack}};
    let epoch=state.miniSync.epoch;
    // Bound the durable journal. A new epoch makes every discarded old command
    // ineligible, even if a deleted receipt is later restored from an old backup.
    if(Object.keys(receipts).length>2000){epoch=crypto.randomUUID();receipts=Object.fromEntries(Object.entries(receipts).slice(-1000));}
    return {services, miniSync:{epoch,receipts}};
}

export async function acceptOperation(store, op, storage = localStorage) {
    if (!validOperation(op)) throw new Error('Geçersiz saat işlemi.');
    const before = store.getState();
    const existing = before.miniSync?.receipts?.[op.opId];
    if (existing && existing.request !== JSON.stringify(op)) throw new Error('İşlem kimliği çakışması.');
    if (!existing) {
        const record = before.services.find(s => s.id === op.id);
        const expected = record && await revision(record, before.miniSync.epoch) === op.base ? record : null;
        store.getState().applyMiniOperation(op, expected);
    } else {
        // Retry persistence after quota/disk failures; never acknowledge memory alone.
        store.setState({miniSync:store.getState().miniSync});
    }
    const persisted = JSON.parse(storage.getItem(STORAGE_KEY) || 'null');
    const receipt = persisted?.state?.miniSync?.receipts?.[op.opId];
    if (!receipt || receipt.request !== JSON.stringify(op)) throw new Error('Saat işlemi henüz telefona kaydedilemedi.');
    return receipt.ack;
}
