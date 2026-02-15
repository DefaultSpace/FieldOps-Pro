import { useMemo, useState } from 'react'
import { useServiceStore } from '../store/useServiceStore'
import { StatsBar } from '../components/StatsBar'
import { ServiceForm } from '../components/ServiceForm'
import { ServiceCard } from '../components/ServiceCard'
import { Navigation, Target, Zap, Clock, Search, X } from 'lucide-react'
import { groupAndSortServices, getActiveTimeSlot, calculatePriorityScore } from '../utils/sorting'
import { getMapsSearchUrl } from '../utils/maps'

export const Home = () => {
    const { services, lastLocation } = useServiceStore();
    const [searchTerm, setSearchTerm] = useState('');

    const sortedServices = useMemo(() => groupAndSortServices(services), [services]);

    const filteredServices = useMemo(() => {
        if (!searchTerm) return sortedServices;
        const term = searchTerm.toLowerCase();
        return sortedServices.filter(s =>
            s.name.toLowerCase().includes(term) ||
            s.phone.includes(term) ||
            s.mahalle.toLowerCase().includes(term)
        );
    }, [sortedServices, searchTerm]);

    const planned = useMemo(() => filteredServices.filter(s => !s.isExtra && s.status === 'pending'), [filteredServices]);
    const extra = useMemo(() => filteredServices.filter(s => s.isExtra && s.status === 'pending'), [filteredServices]);
    const postponed = useMemo(() => filteredServices.filter(s => s.status === 'postponed'), [filteredServices]);
    const completed = useMemo(() => filteredServices.filter(s => s.status !== 'pending' && s.status !== 'postponed'), [filteredServices]);

    const bestJob = useMemo(() => {
        return sortedServices.find(s => s.status === 'pending');
    }, [sortedServices]);

    const activeSlot = getActiveTimeSlot();

    const handleBestJob = () => {
        if (bestJob) {
            window.open(getMapsSearchUrl(bestJob.address), '_blank');
        }
    };

    return (
        <div className="max-w-xl mx-auto p-4 pb-20">
            <StatsBar />

            {/* Dynamic Time Info */}
            <div className="bg-slate-900/50 border border-white/5 p-4 rounded-3xl mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Şu Anki Periyot</p>
                        <p className="text-lg font-black text-slate-100 italic uppercase">
                            {activeSlot} <span className="text-slate-500 text-sm not-italic ml-1">Zamanındasın</span>
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xl font-black text-blue-500 leading-none">{planned.length + extra.length}</p>
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-tight">Kalan İş</p>
                </div>
            </div>

            {/* HIZLI ARAMA (Search) */}
            <div className="relative mb-8 group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                    <Search size={20} />
                </div>
                <input
                    type="text"
                    placeholder="İsim, telefon veya mahalle ile hızlı ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border-2 border-slate-900 focus:border-blue-600/50 rounded-[2rem] py-4 pl-14 pr-12 focus:outline-none text-sm font-bold text-slate-200 shadow-2xl transition-all"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            <ServiceForm />

            {/* Strategic Recommender */}
            {bestJob && !searchTerm && (
                <button
                    onClick={handleBestJob}
                    className="w-full bg-slate-900 border-2 border-blue-500/30 p-5 rounded-[2.5rem] mb-10 text-left flex items-center justify-between group hover:border-blue-500 transition-all shadow-2xl shadow-blue-900/10"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-lg animate-pulse">
                            <Navigation size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1 leading-none">STRATEJİK ÖNERİ: EN YAKIN İŞ</p>
                            <h3 className="font-black text-xl italic uppercase text-slate-100">{bestJob.name}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">{bestJob.mahalle} • {bestJob.timeSlot}</p>
                        </div>
                    </div>
                    <Zap size={24} className="text-blue-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                </button>
            )}

            {/* List Sections */}
            <div className="space-y-12">
                {planned.length > 0 && (
                    <section>
                        <SectionHeader label="Planlananlar" count={planned.length} color="blue" />
                        <div className="space-y-4">
                            {planned.map(s => <ServiceCard key={s.id} service={s} />)}
                        </div>
                    </section>
                )}

                {extra.length > 0 && (
                    <section>
                        <SectionHeader label="Ekstra Çağrılar" count={extra.length} color="amber" />
                        <div className="space-y-4">
                            {extra.map(s => <ServiceCard key={s.id} service={s} />)}
                        </div>
                    </section>
                )}

                {postponed.length > 0 && (
                    <section>
                        <SectionHeader label="Ertelenenler" count={postponed.length} color="amber" />
                        <div className="space-y-4">
                            {postponed.map(s => <ServiceCard key={s.id} service={s} />)}
                        </div>
                    </section>
                )}

                {completed.length > 0 && (
                    <section className="opacity-60 grayscale-[0.5]">
                        <SectionHeader label="Tamamlanan / İptal" count={completed.length} color="slate" />
                        <div className="space-y-4">
                            {completed.map(s => <ServiceCard key={s.id} service={s} />)}
                        </div>
                    </section>
                )}
            </div>

            {filteredServices.length === 0 && (
                <div className="text-center py-20 opacity-20">
                    <Target size={48} className="mx-auto mb-4" />
                    <p className="font-black uppercase italic tracking-widest text-sm">Sonuç Bulunamadı.</p>
                </div>
            )}
        </div>
    );
};

const SectionHeader = ({ label, count, color }) => {
    const colors = {
        blue: 'border-blue-600 text-blue-600',
        amber: 'border-amber-600 text-amber-600',
        slate: 'border-slate-800 text-slate-500'
    };
    return (
        <div className="flex items-center justify-between mb-6 px-1">
            <h2 className={`font-black text-lg italic border-l-[6px] pl-4 uppercase tracking-tighter ${colors[color]}`}>
                {label} <span className="text-slate-600 text-sm not-italic font-bold ml-1">({count})</span>
            </h2>
        </div>
    );
};
