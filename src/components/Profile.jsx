import { useState } from 'react'
import { useServiceStore } from '../store/useServiceStore'
import { REGION } from '../config/region'

export function Profile() {
    const { technicianName, saveProfile } = useServiceStore();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(technicianName || '');
    if (technicianName && !editing) return <div className="field-shell profile-summary"><span>{technicianName} · {REGION.name}</span><button className="quiet-btn" onClick={() => { setName(technicianName); setEditing(true); }}>İsmini düzenle</button></div>;
    return <div className="modal-backdrop"><form className="field-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title" onSubmit={e => { e.preventDefault(); if (!name.trim()) return; saveProfile(name.trim()); setEditing(false); }}>
        <h2 id="profile-title">Hazır mesajlarda kullanılacak isim</h2>
        <label>Teknisyen ismi<input autoFocus required maxLength={80} value={name} onChange={e => setName(e.target.value)} placeholder="İsmin" /></label>
        <p>{REGION.name} / {REGION.city}: {REGION.neighborhoods.join(', ')}.</p>
        <p>İsmin müşteri mesajlarına eklenir ve bu tarayıcıda saklanır.</p>
        <button className="primary-btn" type="submit" disabled={!name.trim()}>İsmi kaydet</button>
        {technicianName && <button className="quiet-btn" type="button" onClick={() => setEditing(false)}>Vazgeç</button>}
    </form></div>;
}
