import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Archive, CheckCircle } from 'lucide-react'
export const Header = () => {
    const navigate = useNavigate(), location = useLocation();
    return <header className="field-header"><div className="header-inner"><button className="brand" onClick={() => navigate('/')}><span className="brand-mark"><img src={`${import.meta.env.BASE_URL}fieldops-icon.svg`} alt="FieldOps logosu" width="44" height="44" /></span><span>FieldOps<span className="brand-pro"> PRO</span><small>SAHA SENİN KONTROLÜNDE</small></span></button><nav><button className={location.pathname === '/' ? 'nav-active' : ''} onClick={() => navigate('/')}><LayoutDashboard size={17}/><span>Günlük işler</span></button><button className={location.pathname === '/archive' ? 'nav-active' : ''} onClick={() => navigate('/archive')}><Archive size={17}/><span>Arşiv</span></button><button className={location.pathname === "/completed" ? "nav-active" : ""} onClick={() => navigate("/completed")}><CheckCircle size={17}/><span>Tamamlananlar</span></button></nav></div></header>;
};

