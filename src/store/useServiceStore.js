import { fieldRecord, fieldState } from '../utils/fieldRecords'
import { safeStorage } from '../utils/storage'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { importWithArchive, importSummary } from '../utils/ecom'
import { archiveFinishedDays, restoreKnownLocations } from '../utils/fieldTools'
import { normalizePhone } from '../utils/contacts'
import { closeDay, completeRecords, dayKey, uniqueRecords } from '../utils/workflow'
import { mergeBackup } from '../utils/backup'
import { recordEvent, reopenRecord } from '../utils/history'
import { saveCheckpoint } from '../utils/storage'
export { normalizePhone } from '../utils/contacts'
const generateUUID = () => globalThis.crypto?.randomUUID?.() || `field-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const useServiceStore = create(persist((set,get) => ({
    technicianName:'',region:'',services:[],archive:[],activity:[],lastImport:null,lastDeleted:null,lastBackupAt:null,
    saveProfile:(technicianName,region)=>set({technicianName:technicianName.trim(),region}),
    importServices:records=> {
        const state=get(); saveCheckpoint(state);
        const current=archiveFinishedDays(state.services,state.archive);
        const summary=importSummary(current.services,current.archive,records);
        const next=importWithArchive(current.services,current.archive,restoreKnownLocations(records,[...current.services,...current.archive]),generateUUID);
        const missing=records.filter(r=>!next.services.some(s=>s.receiptNo===r.receiptNo)).map(r=>r.receiptNo);
        const report={...summary,at:Date.now(),before:state.services.length,after:next.services.length,processed:new Set(records.map(r=>r.receiptNo)).size,missing};
        set({...next,lastImport:report});
        return report;
    },
    completeVisit:ids=>set(state=>({services:completeRecords(state.services,ids)})),
    undoVisit:ids=>set(state=>({
        services:uniqueRecords([...state.services.map(s=>ids.includes(s.id)&&s.status==='done'?reopenRecord(s):s),...state.archive.filter(s=>ids.includes(s.id)&&s.status==='done').map(s=>reopenRecord(s))]),
        archive:state.archive.filter(s=>!(ids.includes(s.id)&&s.status==='done')),
    })),
    removeVisit:ids=>set(state=>{
        saveCheckpoint(state);
        const removed=[...state.services,...state.archive].filter(s=>ids.includes(s.id));
        return {activity:[...(state.activity||[]),...removed.flatMap(s=>recordEvent(s,'deleted').history.map(e=>({...e,name:s.name,receiptNo:s.receiptNo})))],lastDeleted:{services:state.services.filter(s=>ids.includes(s.id)),archive:state.archive.filter(s=>ids.includes(s.id))},services:state.services.filter(s=>!ids.includes(s.id)),archive:state.archive.filter(s=>!ids.includes(s.id))};
    }),
    undoDelete:()=>set(state=>{
        if(!state.lastDeleted)return {};
        const restored=mergeBackup(state,{s:state.lastDeleted.services,a:state.lastDeleted.archive});
        const ids=[...state.lastDeleted.services,...state.lastDeleted.archive].map(s=>s.id);
        return {services:restored.services.map(s=>ids.includes(s.id)?recordEvent(s,'restored'):s),archive:restored.archive.map(s=>ids.includes(s.id)?recordEvent(s,'restored'):s),lastDeleted:null};
    }),
    restoreVisit:ids=>set(state=>{
        const selected=state.archive.filter(s=>ids.includes(s.id)).map(s=>reopenRecord(s));
        return {services:uniqueRecords([...state.services,...selected]),archive:state.archive.filter(s=>!ids.includes(s.id))};
    }),
    startNewDay:()=>set(state=>{saveCheckpoint(state);return closeDay(state.services,state.archive);}),
    clearDay:()=>get().removeVisit(get().services.map(s=>s.id)),
    addService:data=>{
        const state=get(), receiptNo=String(data.receiptNo||'').trim();
        if(receiptNo && [...state.services,...state.archive].some(s=>s.receiptNo===receiptNo)) return {error:'Bu fiş zaten kayıtlı. Fiş numarasıyla arayın veya eCom listesini yeniden aktarın.'};
        const record=recordEvent({...data,receiptNo,id:generateUUID(),phone:normalizePhone(data.phone),createdAt:Date.now(),status:'pending'},'added');
        set({services:[record,...state.services]});return {id:record.id};
    },
    updateService:(id,updates)=>set(state=>{
        const update=s=>{
            if(s.id!==id)return s;
            const merged={...s,...updates};
            const type=updates.status && updates.status!==s.status?updates.status:
                updates.timeSlot!==undefined && updates.timeSlot!==s.timeSlot?'schedule':
                (updates.visitNote!==undefined && updates.visitNote!==s.visitNote)||(updates.notes!==undefined && updates.notes!==s.notes)?'note':null;
            return type?recordEvent(merged,type):merged;
        };
        return {services:state.services.map(update),archive:state.archive.map(update)};
    }),
    restoreBackup:backup=>{
        saveCheckpoint(get());const result=mergeBackup(get(),backup);set({services:result.services,archive:result.archive,activity:result.activity || get().activity});return result;
    },
    exportData:()=>{
        const state=get(),now=Date.now();
        const blob=new Blob([JSON.stringify({version:3,exportedAt:now,s:state.services,a:state.archive,activity:state.activity})],{type:'application/json'});
        const url=URL.createObjectURL(blob),link=document.createElement('a');
        link.href=url;link.download=`fieldops-${dayKey(now)}.json`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);set({lastBackupAt:now});
    },
}),{name:'routex-persist-v1',version:1,migrate:state=>fieldState(state),merge:(saved,current)=>({...current,...fieldState(saved||{})}),storage:createJSONStorage(()=>safeStorage),partialize:state=>({technicianName:state.technicianName,region:state.region,services:state.services.map(fieldRecord),archive:state.archive.map(fieldRecord),activity:state.activity,lastImport:state.lastImport,lastBackupAt:state.lastBackupAt})}));
