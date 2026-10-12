import { useNavigate, useLocation } from 'react-router-dom'
import { Lock, Unlock, LayoutDashboard, Archive, CheckCircle } from 'lucide-react'
import { useServiceStore } from '../store/useServiceStore'
export const Header = () => {
    const navigate = useNavigate(), location = useLocation();
    const { planLocked, setPlanLocked } = useServiceStore();
    return <header className="field-header"><div className="header-inner"><button className="brand" onClick={() => navigate('/')}><span className="brand-mark"><img src={`${import.meta.env.BASE_URL}fieldops-icon.svg`} alt="FieldOps logosu" width="44" height="44" /></span><span>FieldOps<span className="brand-pro"> PRO</span><small>SAHA SENİN KONTROLÜNDE</small></span></button><nav><button className={location.pathname === '/' ? 'nav-active' : ''} onClick={() => navigate('/')}><LayoutDashboard size={17}/><span>Günlük işler</span></button><button className={location.pathname === '/archive' ? 'nav-active' : ''} onClick={() => navigate('/archive')}><Archive size={17}/><span>Arşiv</span></button><button className={location.pathname === "/completed" ? "nav-active" : ""} onClick={() => navigate("/completed")}><CheckCircle size={17}/><span>Tamamlananlar</span></button><button aria-label={planLocked ? 'Plan kilidini aç' : 'Planı kilitle'} title="Kilit sonrası eklenen fişler ekstra olarak işaretlenir" onClick={() => setPlanLocked(!planLocked)}>{planLocked ? <Lock size={17}/> : <Unlock size={17}/>}</button></nav></div></header>;
};
