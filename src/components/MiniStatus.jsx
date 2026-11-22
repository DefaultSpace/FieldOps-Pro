import { useEffect, useState } from 'react';
import { miniNotice, startMiniBridge } from '../mini/bridge.js';
export function MiniStatus() {
    const [notice,setNotice]=useState(miniNotice);
    useEffect(()=>{const update=()=>setNotice(miniNotice());window.addEventListener('fieldops-mini',update);const stop=startMiniBridge();return()=>{window.removeEventListener('fieldops-mini',update);stop?.();};},[]);
    if (!window.FieldOpsMini) return null;
    return <p className="system-notice" role="status">FieldOps Mini · Android {import.meta.env.VITE_ANDROID_VERSION || 'geliştirme'} · {notice || 'Saat bağlantısı hazırlanıyor.'} Bu uygulama APK güncellemesiyle yenilenir; web sitesindeki değişiklikler otomatik yüklenmez.</p>;
}
