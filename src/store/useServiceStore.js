import { safeStorage } from '../utils/storage'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { commissionStats } from '../utils/commission'
import { importWithArchive, importSummary } from '../utils/ecom'
import { archiveFinishedDays, restoreKnownLocations } from '../utils/fieldTools'
import { normalizePhone } from '../utils/contacts'
import { closeDay, completeRecords, dayKey, uniqueRecords } from '../utils/workflow'
import { mergeBackup } from '../utils/backup'
export { normalizePhone } from '../utils/contacts'
const generateUUID = () => globalThis.crypto?.randomUUID?.() || `field-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const useServiceStore = create(persist((set,get) => ({
    technicianName:'',region:'',services:[],archive:[],lastDeleted:null,lastBackupAt:null,
    saveProfile:(technicianName,region)=>set({technicianName:technicianName.trim(),region}),
    importServices:records=> {
        const state=get(), current=archiveFinishedDays(state.services,state.archive);
        const summary=importSummary(current.services,current.archive,records);
        set(importWithArchive(current.services,current.archive,restoreKnownLocations(records,[...current.services,...current.archive]),generateUUID));
        return summary;
    },
    completeVisit:ids=>set(state=>({services:completeRecords(state.services,ids)})),
    undoVisit:ids=>set(state=>({
        services:uniqueRecords([...state.services.map(s=>ids.includes(s.id)&&s.status==='done'?{...s,status:'pending',completedAt:null}:s),...state.archive.filter(s=>ids.includes(s.id)&&s.status==='done').map(s=>({...s,status:'pending',completedAt:null}))]),
        archive:state.archive.filter(s=>!(ids.includes(s.id)&&s.status==='done')),
    })),
    removeVisit:ids=>set(state=>({lastDeleted:{services:state.services.filter(s=>ids.includes(s.id)),archive:state.archive.filter(s=>ids.includes(s.id))},services:state.services.filter(s=>!ids.includes(s.id)),archive:state.archive.filter(s=>!ids.includes(s.id))})),
    undoDelete:()=>set(state=>{
        if(!state.lastDeleted)return {};
        const restored=mergeBackup(state,{s:state.lastDeleted.services,a:state.lastDeleted.archive});
        return {services:restored.services,archive:restored.archive,lastDeleted:null};
    }),
    restoreVisit:ids=>set(state=>{
        const selected=state.archive.filter(s=>ids.includes(s.id)).map(s=>({...s,status:'pending',completedAt:null,removedFromList:false,availability:'',reminderAt:null,reminderNotifiedAt:null}));
        return {services:uniqueRecords([...state.services,...selected]),archive:state.archive.filter(s=>!ids.includes(s.id))};
    }),
    startNewDay:()=>set(state=>closeDay(state.services,state.archive)),
    addService:data=>{
        const state=get(), receiptNo=String(data.receiptNo||'').trim();
        if(receiptNo && [...state.services,...state.archive].some(s=>s.receiptNo===receiptNo)) return {error:'Bu fiş zaten kayıtlı. Fiş numarasıyla arayın veya eCom listesini yeniden aktarın.'};
        const record={...data,receiptNo,id:generateUUID(),phone:normalizePhone(data.phone),createdAt:Date.now(),status:'pending',plus:false,aksesuar:false,bakim:false};
        set({services:[record,...state.services]});return {id:record.id};
    },
    updateService:(id,updates)=>set(state=>({services:state.services.map(s=>s.id===id?{...s,...updates}:s),archive:state.archive.map(s=>s.id===id?{...s,...updates}:s)})),
    calculateStats:commissionStats,
    restoreBackup:backup=>{
        const result=mergeBackup(get(),backup);set({services:result.services,archive:result.archive});return result;
    },
    exportData:()=>{
        const state=get(),now=Date.now();
        const blob=new Blob([JSON.stringify({version:2,exportedAt:now,s:state.services,a:state.archive})],{type:'application/json'});
        const url=URL.createObjectURL(blob),link=document.createElement('a');
        link.href=url;link.download=`fieldops-${dayKey(now)}.json`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);set({lastBackupAt:now});
    },
}),{name:'routex-persist-v1',storage:createJSONStorage(()=>safeStorage),partialize:state=>({technicianName:state.technicianName,region:state.region,services:state.services,archive:state.archive,lastBackupAt:state.lastBackupAt})}));
