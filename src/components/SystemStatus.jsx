import { storageProblem } from '../utils/storage'
import { useEffect,useState } from 'react'
import { useServiceStore } from '../store/useServiceStore'
export function SystemStatus(){
 const [storageError,setStorageError]=useState(storageProblem);
 const [online,setOnline]=useState(navigator.onLine);const {lastDeleted,undoDelete}=useServiceStore();
 useEffect(()=>{const storageUpdate=()=>setStorageError(storageProblem());window.addEventListener('fieldops-storage',storageUpdate);const update=()=>setOnline(navigator.onLine);window.addEventListener('online',update);window.addEventListener('offline',update);return()=>{window.removeEventListener('fieldops-storage',storageUpdate);window.removeEventListener('online',update);window.removeEventListener('offline',update);};},[]);
 return <>{storageError&&<p className="system-notice date-warning" role="alert">{storageError}</p>}{!online&&<p className="system-notice" role="status">İnternet yok. Açık sayfada kayıtlarını düzenleyebilirsin. WhatsApp ve harita için bağlantı gerekir; sayfayı kapatma.</p>}{lastDeleted&&<div className="system-notice" role="status">{lastDeleted.services.length+lastDeleted.archive.length} fiş silindi. <button className="undo-btn" onClick={undoDelete}>Son silmeyi geri al</button><small>Bu seçenek sayfa kapanana kadar kullanılabilir.</small></div>}</>;
}
