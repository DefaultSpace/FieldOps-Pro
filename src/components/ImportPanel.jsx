import { useMemo,useState } from 'react';
import { useServiceStore } from '../store/useServiceStore';
import { parseEcom,groupVisits } from '../utils/ecom';
import { reviewImport } from '../utils/importReview';
import { dayKey } from '../utils/workflow';
export function ImportPanel({onClose,onImported}) {
    const {services,archive,importServices}=useServiceStore();
    const [text,setText]=useState(''),[expected,setExpected]=useState(''),[ack,setAck]=useState(false);
    const parsed=useMemo(()=>parseEcom(text),[text]);
    const review=reviewImport(parsed,services,archive,expected);
    const oldDate=parsed.sourceDate && parsed.sourceDate!==dayKey();
    return <div className="modal-backdrop"><section className="field-modal" role="dialog" aria-modal="true" aria-labelledby="import-title">
        <button className="close-btn" aria-label="Kapat" onClick={onClose}>×</button><h2 id="import-title">eCom aktarımını kontrol et</h2>
        <p>Aktif fişlerin notları ve durumları korunur. Arşivden gelen fişler geçmişiyle yeniden açılır.</p>
        <textarea autoFocus aria-label="eCom servis listesi" value={text} onChange={e=>{setText(e.target.value);setAck(false);}} placeholder="eCom listesinin tamamını yapıştır…"/>
        <label>eCom ekranındaki toplam fiş sayısı (isteğe bağlı)<input type="number" min="1" step="1" value={expected} onChange={e=>{setExpected(e.target.value);setAck(false);}}/></label>
        <small>Yalnızca yapıştırılan metin denetlenebilir. Eksik kopyalamayı yakalamak için eCom ekranındaki sayıyı gir.</small>
        {parsed.sourceDate&&<p className={oldDate?'date-warning':''}>Liste tarihi: {parsed.sourceDate}{oldDate?' · Bugünün listesi değil.':''}</p>}
        <div className="import-summary"><strong>{parsed.sourceReceiptCount} fiş adayı</strong><span>{parsed.records.length} okunabilen · {parsed.rejectedReceiptCount} atlanan · {groupVisits(parsed.records).length} ziyaret</span></div>
        <p>{review.added} yeni · {review.updated} güncellenecek · {review.restored} arşivden dönecek</p>
        {review.mismatch&&<p role="alert" className="date-warning">eCom toplamı ile metindeki fiş adayı sayısı uyuşmuyor.</p>}
        {review.conflicts.map(c=><p key={c.receiptNo}>Fiş {c.receiptNo}: elle seçilen {c.local} korunacak; eCom saati {c.source}.</p>)}
        <div className="import-warnings">{text&&parsed.warnings.map((w,i)=><p key={i}>{w}</p>)}</div>
        {parsed.rejected.map((r,i)=><details key={i}><summary>{r.receiptNo} · {r.reason}</summary><pre className="raw-record">{r.raw}</pre></details>)}
        {parsed.records.length>0&&<details><summary>Aktarılacak fişleri göster</summary>{parsed.records.map(r=><p key={r.receiptNo}>{r.receiptNo} · {r.name} · {r.timeSlot}</p>)}</details>}
        {(review.needsReview||oldDate)&&<label className="check-line"><input type="checkbox" checked={ack} onChange={e=>setAck(e.target.checked)}/>Uyarıları inceledim; yalnızca okunabilen fişleri aktar.</label>}
        <button className="primary-btn" disabled={!parsed.records.length || ((review.needsReview||oldDate)&&!ack)} onClick={()=>{onImported(importServices(parsed.records));onClose();}}>Listeyi aktar</button>
        <small>Metin sunucuya gönderilmez. Aktarım öncesinde bu tarayıcıda kurtarma kopyası tutulur.</small>
    </section></div>;
}
