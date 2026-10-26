import { useId } from 'react';
import { MapPin,Check,ChevronDown } from 'lucide-react';
import { useServiceStore } from '../store/useServiceStore';
import { copyText } from '../utils/contacts';
import { getMapsSearchUrl } from '../utils/maps';
import { appointmentState } from '../utils/ecom';
import { visitSlot } from '../utils/scheduling';
import { isOpen,statusLabel } from '../utils/workflow';
import { ContactActions } from './ContactActions';
import { VisitActions } from './VisitActions';
import { VisitNote } from './VisitNote';
import { VisitHistory } from './VisitHistory';
import { Availability } from './Availability';
import { FieldControls } from './FieldControls';

export function CompactVisit({visit:v,expanded,onToggle,clock,onNotice}) {
    const {completeVisit,undoVisit}=useServiceStore();
    const detailId=useId();
    const pending=v.items.filter(isOpen),slot=visitSlot(v),state=appointmentState(slot,clock);
    const phones=[...new Set(v.items.flatMap(s=>[s.phone,...(s.phones||[])]).filter(Boolean))];
    const finish=ids=>{if(confirm('Resimleri eCom’a yükledin mi?\nFieldOps kaydı tamamlanacak. eCom fişini ayrıca kapatmalısın.'))completeVisit(ids);};
    return <article className={`visit-card compact-visit ${expanded?'expanded':''}`}>
        <div className="visit-title compact-identity"><h2>{v.name}</h2><div className="receipt-badges" aria-label="Fiş numaraları">{v.items.map(s=><button key={s.id} className="receipt-badge" disabled={!s.receiptNo} title="Fiş numarasını kopyala" aria-label={`Fiş ${s.receiptNo || 'numarası yok'} kopyala`} onClick={async()=>onNotice(await copyText(s.receiptNo)?'Fiş numarası kopyalandı.':'Fiş kopyalanamadı.')}>{s.receiptNo || 'Fiş no yok'}</button>)}</div></div>
        <div className="compact-meta"><span className={`slot ${pending.length?state:'complete'}`}>{slot.replace('/','–')}</span><span>{v.mahalle}</span><span>{[...new Set(v.items.map(s=>s.jobType).filter(Boolean))].join(' · ')}</span>{v.items.length>1&&<span>{v.items.length} fiş</span>}{v.items.some(s=>s.status==='postponed')&&<span>Ertelendi</span>}{v.items.some(s=>s.status==='waiting_parts')&&<span>Parça bekleniyor</span>}</div>
        <button className="compact-address" title="Adresi kopyala" onClick={async()=>onNotice(await copyText(v.address)?'Adres kopyalandı.':'Adres kopyalanamadı.')}><MapPin size={16}/><span>{v.address}</span></button>
        <ContactActions compact service={{...v.items[0],phones}}/>
        <div className="compact-actions"><a className="primary-btn" aria-label="Google Maps’te adresi ara" target="_blank" rel="noreferrer" href={getMapsSearchUrl(v.address,v.mahalle,null,v.district)}><MapPin size={16}/>Harita</a>{pending.length>0?<button className="finish-btn" aria-label="Ziyareti tamamla" onClick={()=>finish(pending.map(s=>s.id))}><Check size={16}/>Tamamla</button>:<button className="quiet-btn" disabled={!v.items.some(s=>s.status==='done')} onClick={()=>undoVisit(v.items.map(s=>s.id))}>Geri al</button>}<button className="quiet-btn" aria-expanded={expanded} aria-controls={detailId} onClick={onToggle}>{expanded?'Kapat':'Ayrıntılar'}<ChevronDown size={15}/></button></div>
        {v.items.some(s=>s.addressWarning)&&<small className="compact-warning">Bina numarasını kontrol et</small>}
        <div id={detailId} className="compact-details" hidden={!expanded}>
            <div className="compact-devices">{v.items.map((s,index)=><section key={s.id}><strong>{s.device || 'Cihaz belirtilmemiş'}</strong><p>{s.jobType || 'Servis'} · {statusLabel(s.status)} · {s.warranty || 'Garanti bilgisi yok'}</p>{s.notes&&<p>{s.notes}</p>}{v.items.length>1&&<details><summary>Bu cihazın işlemleri</summary>{isOpen(s)&&<button className="quiet-btn" aria-label={`${index+1}. cihazı tamamla`} onClick={()=>finish([s.id])}>Yalnız bu cihazı tamamla</button>}<FieldControls visit={{...v,items:[s]}}/><VisitActions visit={{...v,items:[s]}}/></details>}</section>)}</div>
            <VisitNote visit={v}/><VisitActions visit={v}/>{pending.length>0&&<Availability visit={v}/>}
            <details className="secondary-actions"><summary>Saat, iletişim ve geçmiş</summary><FieldControls visit={v}/><VisitHistory visit={v}/></details>
        </div>
    </article>;
}
