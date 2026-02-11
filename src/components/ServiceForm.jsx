import { useState } from 'react'
import { useServiceStore } from '../store/useServiceStore'
import { User, Phone, MapPin, Clock, FileText, PlusCircle, History, Info } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

export const ServiceForm = () => {
    const { addService, planLocked } = useServiceStore();
    const [formData, setFormData] = useState({ name: '', phone: '', mahalle: '', timeSlot: '10/12', address: '', notes: '' });
    const [historyNode, setHistoryNode] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.mahalle) return;

        const lastVisit = addService(formData);

        if (lastVisit) {
            setHistoryNode(lastVisit);
            setTimeout(() => setHistoryNode(null), 8000);
        }

        setFormData({ name: '', phone: '', mahalle: '', timeSlot: '10/12', address: '', notes: '' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="relative">
            <div className={`glass-card p-6 rounded-[2.5rem] mb-10 transition-all border-2 ${planLocked ? 'border-amber-500/20' : 'border-blue-500/10'}`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30">
                            <PlusCircle size={20} className="text-white" />
                        </div>
                        <h2 className="font-black text-sm uppercase tracking-tight italic">Yeni Kayıt Girişi</h2>
                    </div>
                    {planLocked && (
                        <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-[8px] text-amber-500 font-black uppercase tracking-widest">EKSTRA MODU AKTİF</span>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <InputGroup icon={<User size={18} />} type="text" name="name" placeholder="Müşteri İsmi" value={formData.name} onChange={handleChange} required />
                        <InputGroup icon={<Phone size={18} />} type="tel" name="phone" placeholder="Telefon (05xx)" value={formData.phone} onChange={handleChange} required />
                        <InputGroup icon={<MapPin size={18} />} type="text" name="mahalle" placeholder="Mahalle" value={formData.mahalle} onChange={handleChange} required />
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                <Clock size={18} />
                            </div>
                            <select name="timeSlot" value={formData.timeSlot} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-blue-500 appearance-none text-slate-200 font-bold text-sm">
                                <option value="10/12">10:00 - 12:00</option>
                                <option value="12/14">12:00 - 14:00</option>
                                <option value="14/16">14:00 - 16:00</option>
                                <option value="16/18">16:00 - 18:00</option>
                            </select>
                        </div>
                    </div>

                    <InputGroup icon={<FileText size={18} />} type="text" name="address" placeholder="Tam Adres Bilgisi" value={formData.address} onChange={handleChange} required />
                    <textarea name="notes" placeholder="Cihaz modeli, şikayet veya stratejik notlar..." value={formData.notes} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 h-24 focus:outline-none focus:border-blue-500 text-slate-200 text-xs font-bold resize-none" />

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/30 active:scale-95 transition-all uppercase tracking-widest text-xs">Sisteme Kaydet</button>
                </form>

                {/* History Intelligence Popup */}
                {historyNode && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-[95%] glass-card p-4 rounded-3xl border-amber-500/50 shadow-2xl z-50 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                                <History size={16} />
                            </div>
                            <h3 className="font-black text-xs uppercase tracking-widest text-amber-500">Mükerrer Müşteri Yakalandı</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-[10px] font-black uppercase">
                            <div className="text-slate-500">Son Ziyaret: <span className="text-slate-200">{format(new Date(historyNode.createdAt), 'dd.MM.yyyy', { locale: tr })}</span></div>
                            <div className="text-slate-500 text-right">Sonuç: <span className={historyNode.status === 'done' ? 'text-emerald-500' : 'text-rose-500'}>{historyNode.status === 'done' ? 'TAMAMLANDI' : 'İPTAL'}</span></div>
                            <div className="col-span-2 p-2 bg-slate-950 rounded-lg text-slate-400 font-bold border border-white/5">
                                SATIŞ: {historyNode.plus ? '+PLUS ' : ''}{historyNode.aksesuar ? 'AKS ' : ''}{historyNode.bakim ? 'BAKIM' : 'YOK'}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const InputGroup = ({ icon, ...props }) => (
    <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
            {icon}
        </div>
        <input {...props} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-blue-500 transition-all text-slate-200 placeholder:text-slate-700 font-bold text-sm" />
    </div>
);
