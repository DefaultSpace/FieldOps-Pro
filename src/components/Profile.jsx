import { useState } from 'react'
import { useServiceStore } from '../store/useServiceStore'
import { REGIONS } from '../utils/profile'

export function Profile() {
    const { technicianName, region, saveProfile } = useServiceStore();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(technicianName || '');
    const [selected, setSelected] = useState(region || '');
    if (technicianName && region && !editing) return <div className="field-shell profile-summary"><span>Teknisyen {technicianName} · {region}</span><button className="quiet-btn" onClick={() => setEditing(true)}>İsim / bölge değiştir</button></div>;
    return <div className="modal-backdrop"><form className="field-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title" onSubmit={e => { e.preventDefault(); if (!name.trim() || !REGIONS[selected]) return; saveProfile(name.trim(), selected); setEditing(false); }}>
        <h2 id="profile-title">Seni tanıyalım</h2>
        <label>Teknisyen ismi<input autoFocus required maxLength={80} value={name} onChange={e => setName(e.target.value)} placeholder="Örneğin Veysel" /></label>
        <label>Hangi bölgeye çıkıyorsun?<select required value={selected} onChange={e => setSelected(e.target.value)}><option value="">Bölge seç</option>{Object.keys(REGIONS).map(value => <option key={value}>{value}</option>)}</select></label>
        {selected && <p>Mahalleler: {REGIONS[selected]?.join(', ')}</p>}
        <p>İsmin hazır mesajlara otomatik eklenir. Seçimlerin bu tarayıcıda hatırlanır.</p>
        <button className="primary-btn" type="submit" disabled={!name.trim() || !selected}>Kişiyi kaydet</button>
        {technicianName && region && <button className="quiet-btn" type="button" onClick={() => setEditing(false)}>Vazgeç</button>}
    </form></div>;
}
