import { useServiceStore } from '../store/useServiceStore';
import { isOpen } from '../utils/workflow';
export function FieldControls({visit}) {
    const update=useServiceStore(s=>s.updateService);const items=visit.items.filter(isOpen);
    if(!items.length)return null;
    return <div className="field-controls">
        <label>Randevu saati<select aria-label={`${visit.name} randevu saati`} value={items[0].timeSlot || 'Saatsiz'} onChange={e=>items.forEach(s=>update(s.id,{timeSlot:e.target.value,manualTimeSlot:true}))}>{[...new Set(['Saatsiz','10/12','12/14','14/16','16/18','18/20',...items.map(s=>s.timeSlot).filter(Boolean)])].map(t=><option key={t}>{t}</option>)}</select></label>
        {items.some(s=>s.manualTimeSlot)&&<><p>Elle seçilen saat korunur.{items.filter(s=>s.sourceTimeSlot && s.sourceTimeSlot!==s.timeSlot).map(s=><span key={s.id}> Fiş {s.receiptNo}: eCom {s.sourceTimeSlot}.</span>)}</p><button className="undo-btn" onClick={()=>items.filter(s=>s.sourceTimeSlot).forEach(s=>update(s.id,{timeSlot:s.sourceTimeSlot,manualTimeSlot:false}))}>eCom saatine dön</button></>}
    </div>;
}
