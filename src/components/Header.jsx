import { useNavigate, useLocation } from 'react-router-dom'
import { Lock, Unlock, BarChart3, LayoutDashboard, Download, Navigation } from 'lucide-react'
import { useServiceStore } from '../store/useServiceStore'

export const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { planLocked, setPlanLocked, exportData, setLastLocation } = useServiceStore();

    const handleLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setLastLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                alert("Konum güncellendi. Artık en yakın işleri önerebilirim!");
            });
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full glass-card px-4 h-20 flex flex-col justify-center border-b border-white/5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-600 overflow-hidden flex items-center justify-center shadow-xl shadow-blue-600/30">
                            <img src="logo.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentNode.innerHTML = '<span class="font-black text-xl italic">F</span>';
                            }} />
                        </div>
                        <div>
                            <h1 className="font-black text-lg tracking-tighter leading-none italic uppercase">FieldOps <span className="text-blue-500">Pro</span></h1>
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Strategic</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Location Trigger */}
                    <button
                        onClick={handleLocation}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-blue-400 transition-all"
                        title="Konum Al"
                    >
                        <Navigation size={20} />
                    </button>

                    {/* Plan Lock Toggle */}
                    <button
                        onClick={() => setPlanLocked(!planLocked)}
                        className={`p-2.5 rounded-xl transition-all border ${planLocked ? 'bg-amber-600/20 border-amber-500/30 text-amber-500' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                        title={planLocked ? "Plan Kilitli" : "Günü Kilitle"}
                    >
                        {planLocked ? <Lock size={20} /> : <Unlock size={20} />}
                    </button>

                    <nav className="flex items-center gap-1 bg-slate-950 rounded-2xl p-1 border border-white/5">
                        <button
                            onClick={() => navigate('/')}
                            className={`p-2 rounded-xl transition-all ${location.pathname === '/' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
                        >
                            <LayoutDashboard size={20} />
                        </button>
                        <button
                            onClick={() => navigate('/archive')}
                            className={`p-2 rounded-xl transition-all ${location.pathname === '/archive' ? 'bg-slate-800 text-slate-300' : 'text-slate-600'}`}
                        >
                            <BarChart3 size={20} />
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    );
};
