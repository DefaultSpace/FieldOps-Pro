import { useServiceStore } from '../store/useServiceStore';
import { groupVisits } from '../utils/ecom';
import { MaterialsList } from '../components/MaterialsList';
export function Materials(){const services=useServiceStore(s=>s.services);return <div className="field-shell"><p className="eyebrow">GÜNLÜK HAZIRLIK</p><h1>Malzeme</h1><MaterialsList visits={groupVisits(services)}/></div>;}
