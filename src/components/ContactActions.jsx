import { useState } from 'react'
import { contactPhones, localPhone, copyText } from '../utils/contacts'
import { MessageModal } from './MessageModal'
export function ContactActions({ service, survey = false, compact = false }) {
    const phones=contactPhones(service), [selected,setSelected]=useState(''), [message,setMessage]=useState(''),[open,setOpen]=useState(false);
    const phone=phones.includes(selected)?selected:phones[0]||'';
    if(compact)return <div className="compact-contact">
        {phones.length>1?<select aria-label="Müşteri telefonu" value={phone} onChange={e=>setSelected(e.target.value)}>{phones.map(p=><option key={p} value={p}>{localPhone(p)}</option>)}</select>:<span className="compact-phone">{localPhone(phone)||'Telefon yok'}</span>}
        <button className="quiet-btn" disabled={!phone} aria-label="Numarayı kopyala" onClick={async()=>setMessage(await copyText(localPhone(phone))?'Telefon kopyalandı.':'Telefon kopyalanamadı.')}>Kopyala</button>
        <button className="quiet-btn" disabled={!phone} onClick={()=>setOpen(true)}>WhatsApp</button>
        {message&&<small role="status">{message}</small>}{open&&<MessageModal service={{...service,phone}} survey={survey} onClose={()=>setOpen(false)}/>}
    </div>;
    return <div className="contact-actions">{phones.length>1 ? <label>Telefon seç<select aria-label="Müşteri telefonu" value={phone} onChange={e=>setSelected(e.target.value)}>{phones.map(p=><option key={p} value={p}>{localPhone(p)}</option>)}</select></label>:<span>{localPhone(phone)||'Telefon bulunamadı'}</span>}
        <button className="quiet-btn" disabled={!phone} onClick={async()=>setMessage(await copyText(localPhone(phone))?'Telefon kopyalandı. Santrale yapıştırabilirsin.':'Kopyalanamadı. Numarayı seçerek kopyala.')}>Numarayı kopyala</button>
        <button className="quiet-btn" disabled={!phone} onClick={()=>setOpen(true)}>{survey?'Anket mesajı':'WhatsApp mesajı'}</button>
        {message&&<small role="status">{message}</small>}{open&&<MessageModal service={{...service,phone}} survey={survey} onClose={()=>setOpen(false)}/>}</div>;
}
