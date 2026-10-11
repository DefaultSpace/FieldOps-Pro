import { useState } from 'react'
import { useServiceStore } from '../store/useServiceStore'
import { COMMISSION_RATES, SALE_LABELS, saleQuantity, saleUpdates, serviceCommission } from '../utils/commission'
export function SalesEditor({ service }) {
    const updateService = useServiceStore(state => state.updateService);
    const [type, setType] = useState('');
    const [draft, setDraft] = useState('1');
    const quantity = Number(draft);
    const valid = draft.trim() !== '' && Number.isSafeInteger(quantity) && quantity >= 0;
    const save = (event) => {
        event.preventDefault();
        if (!valid) return;
        updateService(service.id, saleUpdates(type, quantity));
        setType('');
    };
    return <div className="sales-editor"><div className="sales-buttons">{Object.keys(COMMISSION_RATES).map(key => <button type="button" key={key} className="quiet-btn" aria-pressed={saleQuantity(service, key) > 0} onClick={() => {
        if (key === 'bakim') { updateService(service.id, saleUpdates(key, saleQuantity(service, key) ? 0 : 1)); return; }
        setType(key); setDraft(String(saleQuantity(service, key) || 1));
    }}>{SALE_LABELS[key]}{saleQuantity(service, key) > 0 ? ` · ${saleQuantity(service, key)} adet` : ''} · {COMMISSION_RATES[key]} TL</button>)}</div><p className="sale-total">Fiş primi: {serviceCommission(service)} TL · {service.status === 'done' ? 'Kazanılan prime dahil' : service.status === 'cancelled' ? 'İptal: prime dahil değil' : 'İş tamamlanınca kazanılan prime eklenir'}</p>
    {type && <div className="modal-backdrop"><form className="field-modal" role="dialog" aria-modal="true" aria-label={`${SALE_LABELS[type]} satış adedi`} onSubmit={save}><h2>{SALE_LABELS[type]} kaç adet?</h2><p>Fiş {service.receiptNo || '—'} · {service.name}</p><label>Toplam satış adedi<input autoFocus type="number" inputMode="numeric" min="0" step="1" required value={draft} onChange={e => setDraft(e.target.value)}/></label><p>0 yazarsan satış kaydı kaldırılır. Bu sayı mevcut adedin yerine kaydedilir.</p><strong>{valid ? quantity * COMMISSION_RATES[type] : 0} TL prim</strong><button className="primary-btn" type="submit" disabled={!valid}>Adedi kaydet</button><button className="quiet-btn" type="button" onClick={() => { updateService(service.id, saleUpdates(type, 0)); setType(''); }}>Satışı kaldır</button><button className="quiet-btn" type="button" onClick={() => setType('')}>Vazgeç</button></form></div>}</div>;
}
