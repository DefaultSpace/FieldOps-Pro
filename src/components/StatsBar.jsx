import { useServiceStore } from '../store/useServiceStore'
import { TrendingUp, Ban, Award, Zap, CheckCircle2 } from 'lucide-react'

export const StatsBar = () => {
    const { calculateStrategicStats } = useServiceStore();
    const stats = calculateStrategicStats();

    const total = stats.done + stats.pending + stats.cancelled;
    const progress = total > 0 ? Math.round((stats.done / (stats.done + stats.pending)) * 100) : 0;

    const getTactic = () => {
        if (stats.done >= 5 && stats.saleRate < 20) return "⚠ 5 işte satış yok. En az 1 bakım hedefle!";
        if (stats.bakimRate > 50) return "🏆 Efsane bakım oranı! Bölge liderliği yakında.";
        if (stats.cancelRate > 30) return "📉 İptal oranı yüksek. Teyit aramalarına odaklan.";
        if (stats.saleRate > 60) return "🔥 Mükemmel satış zekası! NPS'i korumaya devam.";
        return "💡 Bugün bölge potansiyeli yüksek. Bakım satışına odaklan.";
    };

    return (
        <div className="space-y-4 mb-8">
            {/* Route Progress Bar */}
            <div className="glass-card p-5 rounded-[2.5rem] border-blue-500/20 shadow-xl shadow-blue-900/10">
                <div className="flex justify-between items-end mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <CheckCircle2 size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Rota İlerlemesi</p>
                            <h3 className="text-sm font-black text-slate-100 uppercase italic">Günün %{progress} Tamamlandı</h3>
                        </div>
                    </div>
                    <span className="text-[11px] font-black text-blue-500 uppercase tracking-tighter">İş: {stats.done}/{stats.done + stats.pending}</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5 p-0.5">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Analytics Panel */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <MiniStat icon={<TrendingUp className="text-blue-400" />} label="Satışlı İş" val={`%${stats.saleRate}`} />
                <MiniStat icon={<Zap className="text-emerald-400" />} label="Ort. Prim" val={`${stats.avgPrime}₺`} />
                <MiniStat icon={<Ban className="text-rose-400" />} label="İptal Oranı" val={`%${stats.cancelRate}`} />
                <MiniStat icon={<Award className="text-amber-400" />} label="Bakım" val={`%${stats.bakimRate}`} />
            </div>

            {/* Strategic Tactic */}
            <div className="glass-card p-4 rounded-2xl border-blue-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                    <p className="text-[11px] font-black text-slate-100 uppercase italic tracking-tighter">
                        PRO STRATEJİ: <span className="text-blue-400 ml-1">{getTactic()}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

const MiniStat = ({ icon, label, val }) => (
    <div className="glass-card p-3 rounded-2xl border-slate-700/30 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-900/50 flex items-center justify-center shrink-0">
            {icon}
        </div>
        <div>
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{label}</p>
            <p className="text-lg font-black text-slate-100 leading-none">{val}</p>
        </div>
    </div>
);
