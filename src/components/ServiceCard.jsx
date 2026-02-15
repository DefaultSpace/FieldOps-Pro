import { useState } from 'react'
import { MapPin, MessageSquare, Phone, Clock, AlertTriangle, DoorOpen, Star } from 'lucide-react'
import { useServiceStore, normalizePhone } from '../store/useServiceStore'
import { getMapsSearchUrl } from '../utils/maps'
import { getActiveTimeSlot, calculatePriorityScore } from '../utils/sorting'
import { MessageModal } from './MessageModal'
import { PostponeModal } from './PostponeModal'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export const ServiceCard = ({ service }) => {
    const { updateService, toggleStatus } = useServiceStore();
    const [msgOpen, setMsgOpen] = useState(false);
    const [postponeOpen, setPostponeOpen] = useState(false);

    const copyAddress = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(service.address);
        alert('Adres kopyalandı!');
    };

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: service.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const activeSlot = getActiveTimeSlot();
    const isDelayed = service.status === 'pending' &&
        ["10/12", "12/14", "14/16", "16/18"].indexOf(service.timeSlot) < ["10/12", "12/14", "14/16", "16/18"].indexOf(activeSlot);
    const isActive = service.timeSlot === activeSlot;

    const openMaps = () => window.open(getMapsSearchUrl(service.address), '_blank');
    const makeCall = () => window.location.href = `tel:${service.phone}`;

    const sendImHere = () => {
        const text = `Merhaba, Ben Bosch Siemens yetkili servisinden Emrehan. Şu an kapınızdayım. Müsaitliğiniz varsa zili çalıyorum.`;
        window.open(`https://wa.me/${normalizePhone(service.phone)}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const getStatusColor = () => {
        if (service.status === 'done') return 'border-emerald-500/30 bg-emerald-500/5';
        if (service.status === 'cancelled') return 'border-rose-500/30 bg-rose-500/5';
        if (service.status === 'postponed') return 'border-amber-500/40 bg-amber-500/5 shadow-amber-900/10';
        if (isDelayed) return 'border-rose-500/40 bg-rose-500/5 shadow-rose-900/20';
        if (isActive) return 'border-amber-500/40 bg-amber-500/5 shadow-amber-900/20';
        return 'border-slate-800 bg-slate-900/40';
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative p-5 rounded-[2.5rem] border-2 transition-all group shadow-xl ${getStatusColor()}`}
        >
            {/* Priority Badge */}
            <div className="absolute -right-2 -top-2 z-10">
                {isDelayed && (
                    <div className="bg-rose-600 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1 border border-rose-400/30 animate-pulse">
                        <AlertTriangle size={10} /> GECİKMİŞ
                    </div>
                )}
                {!isDelayed && isActive && (
                    <div className="bg-amber-600 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1 border border-amber-400/30">
                        <Clock size={10} /> AKTİF SAAT
                    </div>
                )}
            </div>

            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-black text-lg leading-tight tracking-tight uppercase italic">{service.name}</h3>
                        {service.isExtra ? (
                            <span className="text-[8px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full font-black border border-blue-500/20">EKSTRA</span>
                        ) : (
                            <span className="text-[8px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-black">PLANLANAN</span>
                        )}
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{service.timeSlot} • {service.phone}</p>
                </div>
                <div className="flex gap-2">
                    {/* USER REQUEST: Kapıdayım Button */}
                    <ActionIcon icon={<DoorOpen size={18} />} onClick={sendImHere} color="bg-rose-600 shadow-rose-600/30" title="Kapıdayım" />
                    <ActionIcon icon={<Phone size={18} />} onClick={makeCall} color="bg-indigo-600 shadow-indigo-600/30" />
                    <ActionIcon icon={<MapPin size={18} />} onClick={openMaps} color="bg-blue-600 shadow-blue-600/30" />
                    <ActionIcon icon={<MessageSquare size={18} />} onClick={() => setMsgOpen(true)} color="bg-emerald-600 shadow-emerald-600/30" />
                </div>
            </div>

            {/* Address Section */}
            <div
                onClick={copyAddress}
                className="mb-4 cursor-pointer group/addr hover:bg-slate-800/30 p-2 -m-2 rounded-xl transition-all"
                title="Tıklayınca Kopyala"
            >
                <div className="flex items-start gap-2">
                    <MapPin size={12} className="text-slate-500 mt-0.5 shrink-0 group-hover/addr:text-blue-400 transition-colors" />
                    <p className="text-[11px] font-bold text-slate-300 line-clamp-2 leading-snug group-hover/addr:text-white transition-colors">
                        {service.address}
                    </p>
                </div>
            </div>

            {service.notes && (
                <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-3 mb-4 flex gap-2">
                    <p className="text-[11px] text-slate-400 italic font-medium">"{service.notes}"</p>
                </div>
            )}

            {/* Sale Toggles */}
            <div className="flex flex-wrap gap-1.5 mb-5">
                <SaleToggle active={service.plus} onClick={() => updateService(service.id, { plus: !service.plus })} label="+PLUS" color="blue" />
                <SaleToggle active={service.aksesuar} onClick={() => updateService(service.id, { aksesuar: !service.aksesuar })} label="AKSESUAR" color="amber" />
                <SaleToggle active={service.bakim} onClick={() => updateService(service.id, { bakim: !service.bakim })} label="BAKIM" color="purple" />
            </div>

            {service.status === 'done' && (
                <div className="mb-5 bg-slate-950/50 p-3 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1">
                            <Star size={10} className="fill-blue-500 text-blue-500" /> NPS Score
                        </span>
                        <span className="text-blue-400 text-xs font-black">{service.nps ?? '-'}</span>
                    </div>
                    <input
                        type="range" min="0" max="10" step="1"
                        value={service.nps || 0}
                        onChange={(e) => updateService(service.id, { nps: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>
            )}

            <div className="flex gap-2">
                <button
                    onClick={() => toggleStatus(service.id, 'done')}
                    className={`flex-1 py-3.5 rounded-2xl font-black text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all ${service.status === 'done' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-950 text-slate-600 border border-white/5'}`}
                >
                    TAMAMLA
                </button>
                <button
                    onClick={() => setPostponeOpen(true)}
                    className={`flex-1 py-3.5 rounded-2xl font-black text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all ${service.status === 'postponed' ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'bg-slate-950 text-slate-600 border border-white/5'}`}
                >
                    ERTELENDİ
                </button>
                <button
                    onClick={() => toggleStatus(service.id, 'cancelled')}
                    className={`flex-1 py-3.5 rounded-2xl font-black text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all ${service.status === 'cancelled' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'bg-slate-950 text-slate-600 border border-white/5'}`}
                >
                    İPTAL
                </button>
            </div>

            {msgOpen && <MessageModal service={service} onClose={() => setMsgOpen(false)} />}
            {postponeOpen && (
                <PostponeModal
                    service={service}
                    onClose={() => setPostponeOpen(false)}
                    onSave={(updates) => updateService(service.id, updates)}
                />
            )}
        </div>
    );
};

const ActionIcon = ({ icon, onClick, color, title }) => (
    <button
        onClick={onClick}
        title={title}
        className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all active:scale-95 ${color}`}
    >
        {icon}
    </button>
);

const SaleToggle = ({ active, onClick, label, color }) => {
    const configs = {
        blue: active ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-950 text-slate-600 border-white/5',
        amber: active ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-950 text-slate-600 border-white/5',
        purple: active ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-950 text-slate-600 border-white/5',
    };
    return (
        <button onClick={onClick} className={`px-3 py-2 rounded-full border text-[9px] font-black transition-all outline-none ${configs[color]}`}>
            {label}
        </button>
    );
};
