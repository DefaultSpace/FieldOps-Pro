import { useState } from 'react';
import { useServiceStore } from '../store/useServiceStore';
import { statistics } from '../utils/statistics';
export function Statistics() {
    const {services,archive}=useServiceStore(),[period,setPeriod]=useState('week');
    const data=statistics(services,archive,period);
    return <div className="field-shell statistics-page"><p className="eyebrow">SERVİS GEÇMİŞİ</p><h1>İstatistikler</h1><div className="tabs">{[['day','Bugün'],['week','Bu hafta'],['month','Bu ay'],['all','Tüm zamanlar']].map(([key,label])=><button key={key} aria-pressed={period===key} className={period===key?'selected':''} onClick={()=>setPeriod(key)}>{label}</button>)}</div>
        <div className="metrics stats-metrics">{[['Tamamlanan ziyaret',data.visits],['Tamamlanan fiş',data.receipts],['Erteleme işlemi',data.postponements],['Günlük ortalama ziyaret',data.average.toLocaleString('tr-TR',{maximumFractionDigits:1})]].map(([label,value])=><div className="metric" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
        <section className="settings-card"><h2>Mahalle dağılımı</h2>{data.neighborhoods.length?<><p>En yoğun mahalle: {data.neighborhoods[0][0]}</p>{data.neighborhoods.map(([name,count])=><div className="distribution" key={name}><span>{name}</span><strong>{count} ziyaret</strong><meter min="0" max={data.neighborhoods[0][1]} value={count} aria-label={`${name}: ${count} ziyaret`}/></div>)}</>:<p>Bu dönemde tarihli tamamlanmış ziyaret bulunmuyor.</p>}</section>
        <section className="settings-card"><h2>Erteleme sebepleri</h2>{data.reasons.length?data.reasons.map(([reason,count])=><p key={reason}>{reason}: {count}</p>):<p>Bu dönemde kayıtlı erteleme yok.</p>}</section>
        <p className="materials-help">Aktif kayıtlar ve arşivdeki işlem geçmişi birlikte kullanılır. Aynı fiş bir kez; aynı müşteri ve adresteki fişler aynı gün tek ziyaret sayılır. Erteleme sayısı kaydedilmiş işlem sayısıdır. Günlük ortalama seçili dönemin takvim günlerine göredir. Geçmişte kaydedilmemiş işlemler tahmin edilmez.{data.undated>0&&` Tamamlanma tarihi olmayan ${data.undated} fiş dönem hesaplarına alınmadı.`}</p>
    </div>;
}
