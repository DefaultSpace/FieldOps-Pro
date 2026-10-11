import { useState } from 'react'
import { useServiceStore } from '../store/useServiceStore'
const postponeText = (receipt, reason) => `Fiş No: ${receipt.trim() || '—'}\nErteleme sebebi: ${reason.trim() || '—'}`;
async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch {
        const area = document.createElement('textarea'); area.value = text;
        area.style.position = 'fixed'; area.style.opacity = '0';
        const focused = document.activeElement; document.body.appendChild(area); area.select();
        let copied = false; try { copied = document.execCommand('copy'); } catch { copied = false; }
        area.remove(); focused?.focus(); return copied;
    }
}
export function VisitActions({ visit }) {
    const { updateService, removeVisit } = useServiceStore();
    const [action, setAction] = useState(''), [reason, setReason] = useState('');
    const [receipt, setReceipt] = useState(''), [copyStatus, setCopyStatus] = useState('');
    const pending = visit.items.filter(s => ['pending','postponed'].includes(s.status));
    const changed = visit.items.filter(s => ['cancelled','postponed'].includes(s.status));
    const postponed = visit.items.find(s => s.status === 'postponed');
    const report = postponeText(receipt,reason);
    const open = value => {
        setAction(value); setReason(value === 'postpone' ? postponed?.actionReason || '' : '');
        setReceipt(postponed?.actionReceiptNo || pending.map(s => s.receiptNo).filter(Boolean).join(', ')); setCopyStatus('');
    };
    const copy = async text => { setCopyStatus(await copyText(text) ? 'Metin kopyalandı. WhatsApp’a yapıştırabilirsin.' : 'Kopyalama yapılamadı. Metni seçip elle kopyalayabilirsin.'); };
    const save = e => {
        e.preventDefault();
        if (action === 'remove') removeVisit(visit.items.map(s => s.id));
        else pending.forEach(s => updateService(s.id, { status:action === 'cancel' ? 'cancelled' : 'postponed', actionReason:reason.trim(), ...(action === 'postpone' ? { actionReceiptNo:receipt.trim() } : {}), reminderAt:null, reminderNotifiedAt:null }));
        setAction(''); setReason(''); setCopyStatus('');
    };
    return <div className="visit-management">
        {changed.length > 0 && <p className="visit-management-status">{visit.items.every(s => s.status === 'cancelled') ? 'İptal edildi' : visit.items.some(s => s.status === 'postponed') ? 'Ertelenen kayıt var' : 'İptal edilen kayıt var'}{changed.find(s => s.actionReason)?.actionReason && ` · ${changed.find(s => s.actionReason).actionReason}`} <button className="undo-btn" onClick={() => changed.forEach(s => updateService(s.id,{status:'pending',actionReason:''}))}>Geri al</button></p>}
        <div className="visit-management-buttons">{pending.length > 0 && <><button className="quiet-btn" onClick={() => open('cancel')}>İptal</button><button className="quiet-btn" onClick={() => open('postpone')}>Ertele</button></>}<button className="undo-btn" onClick={() => open('remove')}>Listeden kaldır</button>{postponed && <button className="quiet-btn" onClick={() => copy(postponeText(postponed.actionReceiptNo || visit.items.filter(s => s.status === 'postponed').map(s => s.receiptNo).filter(Boolean).join(', '),postponed.actionReason || ''))}>Erteleme metnini kopyala</button>}</div>
        {!action && copyStatus && <small className="copy-report-status" role="status">{copyStatus}</small>}
        {action && <div className="modal-backdrop"><form className="field-modal" onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="visit-action-title"><h2 id="visit-action-title">{action === 'cancel' ? 'Ziyareti iptal et' : action === 'postpone' ? 'Ziyareti ertele' : 'Listeden kaldır'}</h2><p>{visit.name} · {visit.items.length} fiş</p>{action === 'remove' ? <p>Kayıtlar aktif listeden kalkar ve arşive taşınır. Notlar ve malzeme bilgileri korunur. Arşivde “Listeye geri getir” ile geri alabilirsin.</p> : <>
        {action === 'postpone' && <label>Fiş numarası<input autoFocus required value={receipt} onChange={e => { setReceipt(e.target.value); setCopyStatus(''); }} placeholder="159630038"/></label>}
        <label>{action === 'postpone' ? 'Erteleme sebebi' : 'Neden? (İsteğe bağlı)'}<textarea autoFocus={action === 'cancel'} required={action === 'postpone'} value={reason} onChange={e => { setReason(e.target.value); setCopyStatus(''); }} placeholder={action === 'cancel' ? 'Müşteri istemiyor' : 'Müşteri evde değil'} className="action-reason"/></label>
        {action === 'postpone' && <div className="postpone-report"><label>WhatsApp için metin<textarea readOnly aria-label="Kopyalanacak erteleme metni" value={report}/></label><button className="quiet-btn" type="button" disabled={!receipt.trim() || !reason.trim()} onClick={() => copy(report)}>Metni kopyala</button>{copyStatus && <small role="status">{copyStatus}</small>}</div>}
        <p>{action === 'cancel' ? 'Ziyaret kalan işlerden çıkar. Kapananlar sekmesinden geri alınabilir.' : 'Ziyaret ertelendi olarak kalan listede durur. Bugün tekrar gideceksen “Sonra gel” ile saat seçebilirsin.'}</p></>}<button className="primary-btn" type="submit">{action === 'remove' ? 'Arşive taşı' : action === 'cancel' ? 'İptal et' : 'Ertele'}</button><button className="quiet-btn" type="button" onClick={() => setAction('')}>Vazgeç</button></form></div>}
    </div>;
}
