import { useState } from 'react'
import { useServiceStore } from '../store/useServiceStore'
import { actionMessage, firstReceipt } from '../utils/actionMessage'
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
    const cancelled = visit.items.find(s => s.status === 'cancelled');
    const report = actionMessage(receipt,pending.length,reason);
    const open = value => {
        const previous = value === 'postpone' ? postponed : cancelled;
        setAction(value); setReason(previous?.actionReason || '');
        setReceipt(firstReceipt(previous?.actionReceiptNo || pending.find(s => s.receiptNo)?.receiptNo || '')); setCopyStatus('');
    };
    const copy = async text => { setCopyStatus(await copyText(text) ? 'Metin kopyalandı. WhatsApp’a yapıştırabilirsin.' : 'Kopyalama yapılamadı. Metni seçip elle kopyalayabilirsin.'); };
    const save = e => {
        e.preventDefault();
        if (action === 'remove') removeVisit(visit.items.map(s => s.id));
        else pending.forEach(s => updateService(s.id, { status:action === 'cancel' ? 'cancelled' : 'postponed', actionReason:reason.trim(), actionReceiptNo:firstReceipt(receipt), actionRecordCount:pending.length, reminderAt:null, reminderNotifiedAt:null }));
        setAction(''); setReason(''); setCopyStatus('');
    };
    return <div className="visit-management">
        {changed.length > 0 && <p className="visit-management-status">{visit.items.every(s => s.status === 'cancelled') ? 'İptal edildi' : visit.items.some(s => s.status === 'postponed') ? 'Ertelenen kayıt var' : 'İptal edilen kayıt var'}{changed.find(s => s.actionReason)?.actionReason && ` · ${changed.find(s => s.actionReason).actionReason}`} <button className="undo-btn" onClick={() => changed.forEach(s => updateService(s.id,{status:'pending',actionReason:''}))}>Geri al</button></p>}
        <div className="visit-management-buttons">{pending.length > 0 && <><button className="quiet-btn" onClick={() => open('cancel')}>İptal</button><button className="quiet-btn" onClick={() => open('postpone')}>Ertele</button></>}<button className="undo-btn" onClick={() => open('remove')}>Listeden kaldır</button>{postponed && <button className="quiet-btn" onClick={() => copy(actionMessage(postponed.actionReceiptNo || postponed.receiptNo,postponed.actionRecordCount || visit.items.filter(s => s.status === 'postponed').length,postponed.actionReason || ''))}>Erteleme metnini kopyala</button>}{cancelled && <button className="quiet-btn" onClick={() => copy(actionMessage(cancelled.actionReceiptNo || cancelled.receiptNo,cancelled.actionRecordCount || visit.items.filter(s => s.status === 'cancelled').length,cancelled.actionReason || ''))}>İptal metnini kopyala</button>}</div>
        {!action && copyStatus && <small className="copy-report-status" role="status">{copyStatus}</small>}
        {action && <div className="modal-backdrop"><form className="field-modal" onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="visit-action-title"><h2 id="visit-action-title">{action === 'cancel' ? 'Ziyareti iptal et' : action === 'postpone' ? 'Ziyareti ertele' : 'Listeden kaldır'}</h2><p>{visit.name} · {visit.items.length} fiş</p>{action === 'remove' ? <p>Kayıtlar aktif listeden kalkar ve arşive taşınır. Notlar ve malzeme bilgileri korunur. Arşivde “Listeye geri getir” ile geri alabilirsin.</p> : <>
        {action !== 'remove' && <label>Fiş numarası<input autoFocus required pattern="[0-9]+" inputMode="numeric" value={receipt} onChange={e => { setReceipt(e.target.value); setCopyStatus(''); }} placeholder="159630038"/></label>}
        <label>{action === 'postpone' ? 'Erteleme sebebi' : 'İptal sebebi'}<textarea required value={reason} onChange={e => { setReason(e.target.value); setCopyStatus(''); }} placeholder={action === 'cancel' ? 'Müşteri istemiyor' : 'Müşteri evde değil'} className="action-reason"/></label>
        {action !== 'remove' && <div className="postpone-report"><label>WhatsApp için metin<textarea readOnly aria-label="Kopyalanacak işlem metni" value={report}/></label><button className="quiet-btn" type="button" disabled={!receipt.trim() || !reason.trim()} onClick={() => copy(report)}>Metni kopyala</button>{copyStatus && <small role="status">{copyStatus}</small>}</div>}
        <p>{action === 'cancel' ? 'Ziyaret kalan işlerden çıkar. Kapananlar sekmesinden geri alınabilir.' : 'Ziyaret ertelendi olarak kalan listede durur. Bugün tekrar gideceksen “Sonra gel” ile saat seçebilirsin.'}</p></>}<button className="primary-btn" type="submit">{action === 'remove' ? 'Arşive taşı' : action === 'cancel' ? 'İptal et' : 'Ertele'}</button><button className="quiet-btn" type="button" onClick={() => setAction('')}>Vazgeç</button></form></div>}
    </div>;
}
