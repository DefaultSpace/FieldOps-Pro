import { useRef, useState } from 'react'
import { useServiceStore } from '../store/useServiceStore'
import { readBackup } from '../utils/backup'
export function BackupPanel() {
    const {exportData,restoreBackup,lastBackupAt}=useServiceStore();const input=useRef(null),[backup,setBackup]=useState(null),[notice,setNotice]=useState('');
    return <div className="backup-panel"><button className="quiet-btn" onClick={exportData}>Yedek indir</button><button className="quiet-btn" onClick={()=>input.current.click()}>Yedekten geri yükle</button>
    <input ref={input} type="file" accept=".json,application/json" hidden onChange={async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;try{if(file.size>5_000_000)throw new Error('En fazla 5 MB yedek seç.');setBackup(readBackup(await file.text()));setNotice('');}catch(error){setNotice(error.message);}}}/>
    <small>Son yedek indirme isteği: {lastBackupAt?new Date(lastBackupAt).toLocaleString('tr-TR'):'Henüz yok'}. Dosyanın indirildiğini kontrol et. Kayıtlar bu tarayıcıda tutulur; eCom ile otomatik eşleşmez.</small>
    {notice&&<p role="status">{notice}</p>}{backup&&<div className="modal-backdrop"><section className="field-modal" role="dialog" aria-modal="true" aria-label="Yedek geri yükle"><h2>Yedeği birleştir</h2><p>{backup.s.length} aktif, {backup.a.length} arşiv kaydı bulundu. Mevcut fişlerin korunur; yalnızca bulunmayan kayıtlar eklenir.</p><button className="primary-btn" onClick={()=>{const result=restoreBackup(backup);setNotice(`${result.added} kayıt eklendi, ${result.skipped} mevcut kayıt korundu.`);setBackup(null);}}>Eksik kayıtları ekle</button><button className="quiet-btn" onClick={()=>setBackup(null)}>Vazgeç</button></section></div>}</div>;
}
