import { nextVisit,visitSlot } from '../utils/scheduling';
import { getMapsSearchUrl } from '../utils/maps';
import { ContactActions } from './ContactActions';
export function NextVisit({visits,region,clock}) {
    const visit=nextVisit(visits,region,'',clock.getTime());
    return <section className="next-visit"><p className="eyebrow">SIRADAKİ İŞ</p>{visit?<><div className="next-visit-heading"><h2>{visit.name}</h2><strong>{visitSlot(visit).replace('/','–')}</strong></div><p>{visit.mahalle} · {visit.address}</p><div className="next-visit-actions"><a className="quiet-btn" href={getMapsSearchUrl(visit.address,visit.mahalle,null,visit.district)} target="_blank" rel="noopener noreferrer">Harita</a><ContactActions service={{...visit.items[0],name:visit.name,phones:visit.items.flatMap(s=>[s.phone,...(s.phones||[])])}} compact/></div></>:<p>Şu an sırada uygun iş yok. Sonra gel kayıtlarının saati geldiğinde burada görünür.</p>}</section>;
}
