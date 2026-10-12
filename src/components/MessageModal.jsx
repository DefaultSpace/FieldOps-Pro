import { X, Send, Clock, AlertTriangle, ShieldCheck, DoorOpen, CalendarDays } from 'lucide-react'
import { useServiceStore, normalizePhone } from '../store/useServiceStore'

export const MessageModal = ({ service, onClose }) => {
    const technicianName = useServiceStore(state => state.technicianName);
    const phone = normalizePhone(service.phone);

    const templates = [
        {
            id: 'door',
            name: '🚪 Kapıdayım',
            icon: <DoorOpen size={18} className="text-emerald-400" />,
            text: `Merhaba,\nBen Bosch Siemens yetkili servisinden ${technicianName}. Şu an kapınızdayım.\n\nMüsaitliğiniz varsa zili çalıyorum.`
        },
        {
            id: 'arrival',
            name: 'Varış / Teyit',
            icon: <Clock size={18} className="text-blue-400" />,
            text: `Merhaba,\nBen Bosch Siemens Profilo yetkili servisinden teknisyen ${technicianName}.\n\nBugün ${service.timeSlot} saat aralığında ${service.mahalle} ${service.address} adresiniz için servis kaydınız bulunmaktadır.\n\nŞu an bölgenizdeyiz. Uygunsanız adresinize doğru geçmek isteriz. Müsaitliğinizi teyit edebilir misiniz?`
        },
        {
            id: 'delay',
            name: 'Gecikme Bilgisi',
            icon: <AlertTriangle size={18} className="text-amber-400" />,
            text: `Merhaba,\nBosch Siemens yetkili servisinden ${technicianName} ben.\n\nYoğunluk nedeniyle kısa bir gecikme yaşanmaktadır. En geç 30 dakika içerisinde ${service.mahalle} adresinizde olacağız.\n\nBilginize sunar, anlayışınız için teşekkür ederim.`
        },
        {
            id: 'postpone',
            name: '📅 Yarın Erteleme',
            icon: <CalendarDays size={18} className="text-rose-400" />,
            text: `Merhaba,\nBosch Siemens yetkili servisinden teknisyen ${technicianName}, size ulaşıyorum.\n\nBugün bölgedeki yoğunluk nedeniyle size geçiş yapılamayacaktır. Yarın gün içerisinde gelmeden 10-15dk öncesinde sizi arayacağız.\n\nAnlayışınız ve sabrınız için teşekkür ederiz.`
        }
    ];

    const sendMessage = (text) => {
        const encoded = encodeURIComponent(text);
        window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black italic uppercase italic tracking-tighter">İletişim <span className="text-blue-500">Zekası</span></h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Stratejik Mesaj Şablonları</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-900 rounded-xl text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
                    {templates.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => sendMessage(t.text)}
                            className="w-full bg-slate-900/50 hover:bg-slate-900 border border-white/5 hover:border-blue-500/30 p-4 rounded-3xl text-left transition-all active:scale-[0.98] group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-slate-800 rounded-xl group-hover:bg-blue-600/10 transition-colors">
                                    {t.icon}
                                </div>
                                <span className="font-black text-xs uppercase tracking-widest text-slate-200">{t.name}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed italic">"{t.text}"</p>
                        </button>
                    ))}
                </div>

                <div className="p-6 bg-slate-950/50 flex items-center gap-3 border-t border-white/5">
                    <div className="w-8 h-8 rounded-full bg-emerald-600/10 flex items-center justify-center text-emerald-500">
                        <Send size={14} />
                    </div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">WhatsApp’ta hazır açılır. Göndermek için gönder tuşuna basın.</p>
                </div>
            </div>
        </div>
    );
};
