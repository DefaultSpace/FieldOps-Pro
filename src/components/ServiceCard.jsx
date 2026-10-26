import { FieldControls } from './FieldControls'
import { useState } from 'react'
import { ContactActions } from './ContactActions'
import { useServiceStore } from '../store/useServiceStore'
import { copyText } from '../utils/contacts'
import { isOpen, statusLabel } from '../utils/workflow'
import { VisitActions } from './VisitActions'
export function ServiceCard({service,completedView=false}) {
    const completeVisit=useServiceStore(s=>s.completeVisit),[notice,setNotice]=useState('');
    return <section className="service-detail"><div className="service-detail-heading"><h3>{service.name}</h3><span>{statusLabel(service.status)}</span></div>
        <p>{service.device || 'Cihaz belirtilmemiş'} · {service.jobType || 'İşlem belirtilmemiş'}</p><p>Fiş {service.receiptNo || '—'} · {service.warranty || 'Garanti bilgisi yok'}</p>
        <button className="address-copy" onClick={async()=>setNotice(await copyText([service.address,service.mahalle,service.district].filter(Boolean).join(', '))?'Adres kopyalandı.':'Kopyalanamadı. Adresi seçerek kopyala.')}>{service.address} · {service.mahalle}<small>Adresi kopyala</small></button>
        <button className="quiet-btn" disabled={!service.receiptNo} onClick={async()=>setNotice(await copyText(service.receiptNo)?'Fiş numarası kopyalandı.':'Kopyalanamadı.')}>Fiş numarasını kopyala</button><FieldControls visit={{...service,items:[service]}}/><ContactActions service={service}/>{service.notes&&<p className="saved-visit-note">{service.notes}</p>}
        {service.status==='done'&&<ContactActions service={service} survey/>}
        {!completedView&&isOpen(service)&&<button className="primary-btn" onClick={()=>{if(!confirm('Resimleri eCom’a yükledin mi?\nBu işlem yalnızca FieldOps kaydını tamamlar. eCom fişini ayrıca kapatmalısın.'))return;completeVisit([service.id]);}}>Bu fişi tamamla</button>}
        {!completedView&&<VisitActions visit={{...service,key:service.id,items:[service]}}/>}{notice&&<p role="status">{notice}</p>}
    </section>;
}
