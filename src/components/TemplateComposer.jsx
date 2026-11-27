import { useState } from 'react';
import { useServiceStore } from '../store/useServiceStore';
import { knownBrand, renderMessage, variables } from '../utils/messageLibrary';
import { copyText, localPhone, whatsappUrl } from '../utils/contacts';

export function TemplateComposer({service,onClose}) {
    const library=useServiceStore(s=>s.preferences.library);
    const [category,setCategory]=useState(''),[template,setTemplate]=useState(''),[brand,setBrand]=useState(knownBrand(service));
    const [intro,setIntro]=useState(true),[values,setValues]=useState({}),[draft,setDraft]=useState(null),[notice,setNotice]=useState('');
    const group=library.find(g=>g.id===category), selected=group?.templates.find(t=>t.id===template);
    const fields=selected?variables(selected.body):[];
    const generate=()=>{
        const result=renderMessage(selected.body,values,brand,intro);
        if(result.missing.length){setNotice('Doldurulması gereken alanlar: '+result.missing.join(', '));return;}
        setDraft(result.text);setNotice('');
    };
    const valid=!!draft?.trim() && !/[{}]/.test(draft);
    return <div className="modal-backdrop"><section className="field-modal" role="dialog" aria-modal="true" aria-label="Hazır mesaj oluştur">
        <button className="close-btn" aria-label="Kapat" onClick={onClose}>✕</button><h2>Hazır mesaj oluştur</h2><p>{service.name} · {localPhone(service.phone)}</p>
        <label>Cihaz kategorisi<select aria-label="Cihaz kategorisi" value={category} onChange={e=>{setCategory(e.target.value);setTemplate('');setDraft(null);setValues({});}}><option value="">Kategori seç</option>{library.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
        <label>Şikâyet / işlem<select value={template} onChange={e=>{setTemplate(e.target.value);setDraft(null);setValues({cihaz:group?.name==='Genel servis işlemleri'?'Cihazınız':group?.name});}}><option value="">Şablon seç</option>{group?.templates.filter(t=>t.enabled).map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
        <label className="checkbox-label"><input type="checkbox" checked={intro} onChange={e=>{setIntro(e.target.checked);setDraft(null);}}/>İlk iletişim: servis tanıtımı ekle</label>
        {intro&&<><label>Marka<input list="service-brands" value={brand} onChange={e=>{setBrand(e.target.value);setDraft(null);}} placeholder="Markayı seç veya yaz"/></label><datalist id="service-brands"><option>Bosch</option><option>Siemens</option><option>Profilo</option></datalist></>}
        {fields.map(field=><label key={field}>{field}<input value={values[field]||''} onChange={e=>{setValues({...values,[field]:e.target.value});setDraft(null);}}/></label>)}
        {selected?.technicalReview&&<p className="notice">Teknik açıklamayı modele göre doğrula. Bu yeni taslak kesin teşhis veya işlem onayı içermez.</p>}
        {selected&&<><small>Parça, fiyat, sipariş ve ziyaret bilgilerini yalnızca doğruladığın bilgilerle doldur.</small><button className="primary-btn" onClick={generate}>Mesajı hazırla</button></>}
        {draft!==null&&<><label>Mesaj önizlemesi<textarea rows={9} value={draft} onChange={e=>setDraft(e.target.value)}/></label>{!valid&&<p role="alert">Mesajı tamamla; boş alan veya değişken bırakma.</p>}<button className="quiet-btn" disabled={!valid} onClick={async()=>setNotice(await copyText(draft)?'Mesaj kopyalandı.':'Kopyalanamadı. Metni seçerek kopyala.')}>Metni kopyala</button>{valid&&<a className="primary-btn" href={whatsappUrl(service.phone,draft)} target="_blank" rel="noopener noreferrer">WhatsApp’ta aç</a>}<small>Mesaj otomatik gönderilmez.</small></>}
        {notice&&<p role="status">{notice}</p>}<button className="quiet-btn" onClick={onClose}>Kapat</button>
    </section></div>;
}
