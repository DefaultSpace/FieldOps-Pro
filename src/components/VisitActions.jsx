import { useState } from 'react'
import { useServiceStore } from '../store/useServiceStore'
export function VisitActions({ visit }) {
    const { updateService, removeVisit, restoreVisit } = useServiceStore();
    const [action, setAction] = useState(''), [reason, setReason] = useState('');
    const pending = visit.items.filter(s => ['pending','postponed'].includes(s.status));
    const changed = visit.items.filter(s => ['cancelled','postponed'].includes(s.status));
    const save = e => {
        e.preventDefault();
        if (action === 'remove') removeVisit(visit.items.map(s => s.id));
        else pending.forEach(s => updateService(s.id, { status:action === 'cancel' ? 'cancelled' : 'postponed', actionReason:reason.trim(), reminderAt:null, reminderNotifiedAt:null }));
        setAction(''); setReason('');
    };
    return <div className="visit-management">
        {changed.length > 0 && <p className="visit-management-status">{visit.items.every(s => s.status === 'cancelled') ? 'İptal edildi' : visit.items.some(s => s.status === 'postponed') ? 'Ertelenen kayıt var' : 'İptal edilen kayıt var'}{changed.find(s => s.actionReason)?.actionReason && ` · ${changed.find(s => s.actionReason).actionReason}`} <button className="undo-btn" onClick={() => changed.forEach(s => updateService(s.id,{status:'pending',actionReason:''}))}>Geri al</button></p>}
        <div className="visit-management-buttons">{pending.length > 0 && <><button className="quiet-btn" onClick={() => { setAction('cancel'); setReason(''); }}>İptal</button><button className="quiet-btn" onClick={() => { setAction('postpone'); setReason(''); }}>Ertele</button></>}<button className="undo-btn" onClick={() => { setAction('remove'); setReason(''); }}>Listeden kaldır</button></div>
        {action && <div className="modal-backdrop"><form className="field-modal" onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="visit-action-title"><h2 id="visit-action-title">{action === 'cancel' ? 'Ziyareti iptal et' : action === 'postpone' ? 'Ziyareti ertele' : 'Listeden kaldır'}</h2><p>{visit.name} · {visit.items.length} fiş</p>{action === 'remove' ? <p>Kayıtlar aktif listeden kalkar ve arşive taşınır. Notlar ve malzeme bilgileri korunur. Arşivde “Listeye geri getir” ile geri alabilirsin.</p> : <><label>Neden? (İsteğe bağlı)<input autoFocus value={reason} onChange={e => setReason(e.target.value)} placeholder={action === 'cancel' ? 'Müşteri istemiyor' : 'Müşteri evde değil'}/></label><p>{action === 'cancel' ? 'Ziyaret kalan işlerden çıkar. Kapananlar sekmesinden geri alınabilir.' : 'Ziyaret ertelendi olarak kalan listede durur. Bugün tekrar gideceksen “Sonra gel” ile saat seçebilirsin.'}</p></>}<button className="primary-btn" type="submit">{action === 'remove' ? 'Arşive taşı' : action === 'cancel' ? 'İptal et' : 'Ertele'}</button><button className="quiet-btn" type="button" onClick={() => setAction('')}>Vazgeç</button></form></div>}
    </div>;
}
