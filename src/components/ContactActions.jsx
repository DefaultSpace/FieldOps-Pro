import { TemplateComposer } from './TemplateComposer'
import { whatsappUrl } from '../utils/contacts'
import { useState } from 'react'
import { contactPhones, localPhone, copyText } from '../utils/contacts'
import { MessageModal } from './MessageModal'
export function ContactActions({ service, survey = false, compact = false }) {
    const phones=contactPhones(service), [selected,setSelected]=useState(''), [message,setMessage]=useState(''),[open,setOpen]=useState(false),[mode,setMode]=useState('');
    const phone=phones.includes(selected)?selected:phones[0]||'';
    const close=()=>setOpen(false);
    const dialog=mode==='template'?<TemplateComposer service={{...service,phone}} onClose={close}/>:mode==='legacy'?<MessageModal service={{...service,phone}} survey={survey} onClose={close}/>:<div className="modal-backdrop"><section className="field-modal" role="dialog" aria-modal="true" aria-label="WhatsApp seçenekleri"><h2>WhatsApp</h2><p>{service.name} · {localPhone(phone)}</p><a className="primary-btn" href={whatsappUrl(phone,'')} target="_blank" rel="noopener noreferrer">Sohbeti aç</a><button className="primary-btn" onClick={()=>setMode('template')}>Hazır mesaj oluştur</button><button className="quiet-btn" onClick={()=>setMode('legacy')}>Mevcut kısa mesajlar</button><button className="quiet-btn" onClick={close}>Kapat</button></section></div>;
    if(compact)return <div className="compact-contact">
        {phones.length>1?<select aria-label="Müşteri telefonu" value={phone} onChange={e=>setSelected(e.target.value)}>{phones.map(p=><option key={p} value={p}>{localPhone(p)}</option>)}</select>:<span className="compact-phone">{localPhone(phone)||'Telefon yok'}</span>}
        <button className="quiet-btn" disabled={!phone} aria-label="Numarayı kopyala" onClick={async()=>setMessage(await copyText(localPhone(phone))?'Telefon kopyalandı.':'Telefon kopyalanamadı.')}>Kopyala</button>
        <button className="quiet-btn" disabled={!phone} onClick={()=>{setMode(survey?'legacy':'');setOpen(true);}}>WhatsApp</button>
        {message&&<small role="status">{message}</small>}{open&&dialog}
    </div>;
    return <div className="contact-actions">{phones.length>1 ? <label>Telefon seç<select aria-label="Müşteri telefonu" value={phone} onChange={e=>setSelected(e.target.value)}>{phones.map(p=><option key={p} value={p}>{localPhone(p)}</option>)}</select></label>:<span>{localPhone(phone)||'Telefon bulunamadı'}</span>}
        <button className="quiet-btn" disabled={!phone} onClick={async()=>setMessage(await copyText(localPhone(phone))?'Telefon kopyalandı. Santrale yapıştırabilirsin.':'Kopyalanamadı. Numarayı seçerek kopyala.')}>Numarayı kopyala</button>
        <button className="quiet-btn" disabled={!phone} onClick={()=>{setMode(survey?'legacy':'');setOpen(true);}}>{survey?'Anket mesajı':'WhatsApp mesajı'}</button>
        {message&&<small role="status">{message}</small>}{open&&dialog}</div>;
}
