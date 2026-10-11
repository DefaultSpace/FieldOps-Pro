import { useState } from 'react'
import { useServiceStore } from '../store/useServiceStore'
export function VisitNote({ visit }) {
    const updateService = useServiceStore(s => s.updateService);
    const saved = visit.items.find(s => s.visitNote)?.visitNote || '';
    const [draft, setDraft] = useState(saved), [editing, setEditing] = useState(false);
    const [message, setMessage] = useState('');
    const save = e => {
        e.preventDefault();
        visit.items.forEach(s => updateService(s.id, { visitNote:draft.trim() }));
        setEditing(false); setMessage('Not kaydedildi.');
    };
    return <div className="visit-note"><div className="visit-note-heading"><strong>Malzeme ve iş notu</strong>{!editing && <button className="quiet-btn" onClick={() => { setDraft(saved); setEditing(true); setMessage(''); }}>{saved ? 'Notu düzenle' : 'Not ekle'}</button>}</div>
        {saved && !editing && <p className="saved-visit-note">{saved}</p>}
        {editing && <form onSubmit={save}><label>Malzeme kodu, yapılacak iş ve fiyat<textarea autoFocus aria-label={`${visit.name} malzeme ve iş notu`} placeholder="576101 pompa motoru takılacak — 7000 TL" value={draft} onChange={e => { setDraft(e.target.value); setMessage(''); }}/></label><div><button className="primary-btn" type="submit">Notu kaydet</button><button type="button" className="quiet-btn" onClick={() => setEditing(false)}>Vazgeç</button></div></form>}
        {message && <small role="status">{message}</small>}
    </div>;
}
