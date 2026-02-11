import { useServiceStore } from '../store/useServiceStore'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { BarChart3, TrendingUp, Ban, Star, Wallet } from 'lucide-react'

export const Archive = () => {
    const { archive, calculateStats } = useServiceStore();

    // Group archive by date
    const archiveByDate = archive.reduce((acc, s) => {
        const dateStr = format(s.createdAt, 'yyyy-MM-dd');
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(s);
        return acc;
    }, {});

    const dates = Object.keys(archiveByDate).sort((a, b) => b.localeCompare(a));

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 pb-20">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                    <BarChart3 size={28} className="text-blue-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tight">Operasyon Arşivi</h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Geçmiş Performans Analizi</p>
                </div>
            </div>

            {dates.length === 0 ? (
                <div className="text-center py-24 opacity-30">
                    <p className="text-lg font-bold uppercase tracking-widest">Veri Bulunamadı</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {dates.map((date) => {
                        const dayServices = archiveByDate[date];
                        const stats = calculateStats(dayServices);

                        return (
                            <div key={date} className="glass-card rounded-[2.5rem] overflow-hidden border-2 border-slate-700/20">
                                <div className="bg-slate-900/80 p-6 border-b border-slate-700/30 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-black text-lg text-slate-200 uppercase italic">
                                            {format(new Date(date), 'd MMMM yyyy', { locale: tr })}
                                        </h3>
                                        <div className="flex gap-4 mt-2">
                                            <p className="text-[10px] text-slate-500 font-black uppercase">{dayServices.length} SERVİD</p>
                                            <p className="text-[10px] text-emerald-500 font-black uppercase">{stats.done} BİTEN</p>
                                            <p className="text-[10px] text-rose-500 font-black uppercase">{stats.cancelled} İPTAL</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-blue-500 font-black text-2xl tracking-tighter">{stats.totalPrime} ₺</p>
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">TOPLAM PRİM</p>
                                    </div>
                                </div>

                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Performance Indicators */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <Wallet size={12} className="text-emerald-500" /> Günlük Ciro
                                            </span>
                                            <span className="text-sm font-black text-slate-200">{stats.totalCiro} ₺</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <TrendingUp size={12} className="text-blue-500" /> Satış Başarısı
                                            </span>
                                            <span className="text-sm font-black text-slate-200">% {stats.saleRate}</span>
                                        </div>
                                    </div>

                                    {/* Summary List */}
                                    <div className="space-y-3">
                                        {dayServices.slice(0, 3).map(s => (
                                            <div key={s.id} className="flex justify-between items-center bg-slate-900/30 p-2.5 rounded-xl border border-slate-800/50">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${s.status === 'done' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                    <span className="text-[11px] font-bold text-slate-400 truncate max-w-[120px]">{s.name}</span>
                                                </div>
                                                <span className="text-[9px] font-black text-slate-600 uppercase">{s.mahalle}</span>
                                            </div>
                                        ))}
                                        {dayServices.length > 3 && (
                                            <p className="text-[9px] text-slate-500 font-black text-center uppercase tracking-widest pt-1">
                                                + {dayServices.length - 3} DİĞER KAYIT
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
