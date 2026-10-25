import { materialRows } from '../utils/fieldTools'
import { useServiceStore } from '../store/useServiceStore'
import { dayKey,isOpen } from '../utils/workflow'
export function MaterialsList({ visits }) {
    const updateService = useServiceStore(s => s.updateService);
    const rows = materialRows(visits);
    const total = rows.reduce((sum,row) => sum+row.quantity,0), used = rows.reduce((sum,row) => sum+row.used,0);
    const today=dayKey();
    const prepared=row=>Math.min(row.quantity-row.used,Math.max(0,Number(row.visit.items.find(s=>s.materialPreparedDay===today)?.materialPrepared?.[row.code])||0));
    const preparationRows=rows.filter(row=>row.visit.items.some(isOpen) && row.quantity>row.used);
    const toPrepare=preparationRows.reduce((sum,row)=>sum+row.quantity-row.used-prepared(row),0);
    const prepare=(row,value)=>row.visit.items.forEach(s=>updateService(s.id,{materialPrepared:{...(s.materialPreparedDay===today?s.materialPrepared:{}),[row.code]:value},materialPreparedDay:today}));
    const change = (row, amount) => {
        const old = row.visit.items.find(s => s.materialUsage)?.materialUsage || {};
        const materialUsage = {...old, [row.code]:Math.max(0,Math.min(row.quantity,row.used+amount))};
        row.visit.items.forEach(s => updateService(s.id,{materialUsage}));
    };
    return <details className="materials-panel"><summary>Malzeme hazırlığı · {toPrepare} hazırlanacak · {used} kullanılan</summary><div className="materials-heading"><div><p className="eyebrow">SABAH HAZIRLIĞI</p><h2>Malzeme listesi</h2></div><strong>{total-used} kalan <small>· {used} kullanılan</small></strong></div><p className="materials-help">Notta her malzemeyi ayrı satıra yaz: “576101 pompa motoru — 7000 TL”. Adet yazmazsan 1 sayılır. Örnek: “576101 2 adet pompa motoru”. Hazırlık işaretleri her gün yenilenir.</p>
        {preparationRows.map(row=><label className="check-line material-preparation" key={`${row.visit.key}-${row.code}`}><input type="checkbox" checked={prepared(row)===row.quantity-row.used} onChange={e=>prepare(row,e.target.checked?row.quantity-row.used:0)}/><span>{row.code} · {row.quantity-row.used} adet araçta hazır<br/>{row.visit.name} · Fiş {row.visit.items.map(s=>s.receiptNo||'—').join(', ')}</span></label>)}
        {!rows.length ? <p className="materials-empty">Kartlara malzeme kodlu not eklediğinde liste burada oluşur.</p> : <div className="material-rows">{rows.map(row => <div className={`material-row ${row.used === row.quantity ? 'used' : ''}`} key={`${row.visit.key}-${row.code}`}><div><strong>{row.code}</strong><p>{row.description || 'Malzeme'}</p><small>{row.visit.name} · {row.visit.mahalle}</small></div><span>{row.quantity-row.used} / {row.quantity} kalan</span><div className="material-buttons"><button className="quiet-btn" disabled={row.used >= row.quantity} onClick={() => change(row,1)}>{row.quantity === 1 ? row.used ? 'Kullanıldı ✓' : 'Kullandım ✓' : '1 adet kullandım'}</button>{row.used > 0 && <button className="undo-btn" onClick={() => change(row,-1)}>Geri al</button>}</div></div>)}</div>}
        <small>Bu listeye yazılan malzemelerden kalan miktardır. eCom veya depo stoğunu değiştirmez. İş tamamlamak malzemeyi otomatik düşürmez.</small></details>;
}
