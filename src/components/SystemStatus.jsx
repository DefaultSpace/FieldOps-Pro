import { storageProblem } from '../utils/storage'
import { useEffect,useState } from 'react'
import { useServiceStore } from '../store/useServiceStore'
import { offlineState,applyOfflineUpdate } from '../utils/offline'
export function SystemStatus(){
 const [storageError,setStorageError]=useState(storageProblem);
 const [offline,setOffline]=useState(offlineState);
 useEffect(()=>{const update=()=>setOffline(offlineState());window.addEventListener('fieldops-offline',update);return()=>window.removeEventListener('fieldops-offline',update);},[]);
 const [online,setOnline]=useState(navigator.onLine);const {lastDeleted,undoDelete}=useServiceStore();
 useEffect(()=>{const storageUpdate=()=>setStorageError(storageProblem());window.addEventListener('fieldops-storage',storageUpdate);const update=()=>setOnline(navigator.onLine);window.addEventListener('online',update);window.addEventListener('offline',update);return()=>{window.removeEventListener('fieldops-storage',storageUpdate);window.removeEventListener('online',update);window.removeEventListener('offline',update);};},[]);
 return <>{storageError&&<p className="system-notice date-warning" role="alert">{storageError}</p>}
 {offline.waiting&&<div className="system-notice">Yeni sürüm hazır. Açık not ve formları kaydettikten sonra güncelle. <button className="quiet-btn" onClick={applyOfflineUpdate}>Güncelle ve yeniden aç</button></div>}
 <p className="system-notice" role="status">{!online?'İnternet yok. ':''}{offline.ready?'Çevrimdışı açılış hazır. Kayıt ve notlar bu cihazda kullanılabilir.':offline.error?'Çevrimdışı açılış hazırlanamadı. İnternet varken yeniden açmayı dene.':'Çevrimdışı açılış henüz hazır değil; bağlantısızken sayfayı kapatma.'} {!online&&'WhatsApp ve Google Maps bağlantı gerektirir.'}</p>
 {lastDeleted&&<div className="system-notice" role="status">{lastDeleted.services.length+lastDeleted.archive.length} fiş silindi. <button className="undo-btn" onClick={undoDelete}>Son silmeyi geri al</button><small>Sayfa kapandıktan sonra işlem öncesi kopyadan eksikleri kurtarabilirsin.</small></div>}</>;
}
