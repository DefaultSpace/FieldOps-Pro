import { useState } from 'react'
import { useServiceStore } from '../store/useServiceStore'
import { messageTemplates, whatsappUrl, copyText, localPhone } from '../utils/contacts'
import { surveyMessage } from '../utils/profile'
export function MessageModal({service,onClose,survey=false}) {
    const name=useServiceStore(s=>s.technicianName);
    const templates=survey?[{id:'survey',name:'Anket mesajı',text:surveyMessage(service,name)}]:messageTemplates(service,name);
    const [selected,setSelected]=useState(templates[0].id),[draft,setDraft]=useState(templates[0].text),[notice,setNotice]=useState('');
    return <div className="modal-backdrop"><section className="field-modal" role="dialog" aria-modal="true" aria-label="Hazır mesaj"><button className="close-btn" aria-label="Kapat" onClick={onClose}>✕</button><h2>{survey?'Anket mesajı':'Müşteriye mesaj'}</h2><p>{service.name} · {localPhone(service.phone)}</p>
    <label>Mesaj türü<select value={selected} onChange={e=>{setSelected(e.target.value);setDraft(templates.find(t=>t.id===e.target.value).text);}}>{templates.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
    <label>Göndermeden önce düzenleyebilirsin<textarea value={draft} onChange={e=>setDraft(e.target.value)}/></label>
    <a className="primary-btn" href={whatsappUrl(service.phone,draft)} target="_blank" rel="noopener noreferrer">WhatsApp’ta aç</a><button className="quiet-btn" onClick={async()=>setNotice(await copyText(draft)?'Mesaj kopyalandı.':'Kopyalanamadı. Metni seçerek kopyala.')}>Metni kopyala</button><button className="quiet-btn" onClick={onClose}>Kapat</button>
    <small>Mesaj otomatik gönderilmez. WhatsApp’ta alıcıyı kontrol edip Gönder’e bas.</small>{notice&&<p role="status">{notice}</p>}</section></div>;
}
