import { useState } from 'react'
import { useServiceStore } from '../store/useServiceStore'
import { REGION } from '../config/region'
import { normalizePhone } from '../utils/contacts'
const empty={receiptNo:'',name:'',phone:'',mahalle:'',district:REGION.name,timeSlot:'Saatsiz',address:'',notes:'',device:'',jobType:'Onarım'};
export function ServiceForm({onClose}) {
 const {addService}=useServiceStore();const [data,setData]=useState({...empty}),[error,setError]=useState('');
 const change=e=>setData({...data,[e.target.name]:e.target.value});
 return <div className="modal-backdrop"><form className="field-modal" role="dialog" aria-modal="true" aria-label="Tek fiş ekle" onSubmit={e=>{e.preventDefault();if(data.phone&&!normalizePhone(data.phone)){setError('Telefonu 05xx veya alan koduyla birlikte yaz.');return;}if(data.receiptNo&&!/^\d{7,12}$/.test(data.receiptNo)){setError('Fiş numarası 7–12 rakam olmalı.');return;}const result=addService(Object.fromEntries(Object.entries(data).map(([k,v])=>[k,v.trim()])));if(result.error){setError(result.error);return;}onClose?.();}}>
 <h2>Tek fiş ekle</h2><p>eCom listesinden eksik kalan veya sonradan gelen iş için.</p>
 {[['receiptNo','Fiş numarası (varsa)'],['name','Müşteri adı'],['phone','Telefon (varsa)'],['device','Cihaz'],['address','Sokak, bina, kat ve daire']].map(([key,label])=><label key={key}>{label}<input name={key} value={data[key]} onChange={change} required={['name','address'].includes(key)} inputMode={['receiptNo','phone'].includes(key)?'numeric':undefined}/></label>)}
 <p>İlçe: {REGION.name} / {REGION.city}</p>
 <label>Mahalle<select aria-label="Mahalle" name="mahalle" required value={data.mahalle} onChange={change}><option value="">Mahalle seç</option>{REGION.neighborhoods.map(m=><option key={m} value={m}>{m}</option>)}</select></label>
 <label>Saat<select name="timeSlot" value={data.timeSlot} onChange={change}>{['Saatsiz','10/12','12/14','14/16','16/18','18/20'].map(t=><option key={t}>{t}</option>)}</select></label>
 <label>İşlem<select name="jobType" value={data.jobType} onChange={change}>{['Onarım','Montaj','Bakım','Kontrol','Aksesuar Teslimi'].map(t=><option key={t}>{t}</option>)}</select></label>
 <label>İş notu<textarea name="notes" value={data.notes} onChange={change}/></label>{error&&<p role="alert">{error}</p>}<button className="primary-btn">Kaydet</button><button className="quiet-btn" type="button" onClick={onClose}>Vazgeç</button></form></div>;
}
