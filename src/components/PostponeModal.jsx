import { useState } from 'react'
import { X, CheckCircle2, Copy, Send, MessageSquare } from 'lucide-react'
import { normalizePhone } from '../store/useServiceStore'

export const PostponeModal = ({ service, onClose, onSave }) => {
    const [receiptNo, setReceiptNo] = useState(service.receiptNo || '');
    const [selectedReasons, setSelectedReasons] = useState(service.postponeReason || []);
    const [otherReason, setOtherReason] = useState('');
    const [showOther, setShowOther] = useState(false);
    const [generatedText, setGeneratedText] = useState('');

    const reasons = [
        "Malzeme sipariş edildi",
        "Müşteri evde yok",
        "Sorun yok iptal",
        "Yerleri hazır değil",
        "İstemiyor iptal"
    ];

    const toggleReason = (reason) => {
        setSelectedReasons(prev =>
            prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
        );
    };

    const generateMessage = () => {
        let text = `Fiş No: ${receiptNo}\n\n`;
        selectedReasons.forEach(r => {
            text += `[✓] ${r}\n`;
        });
        if (showOther && otherReason) {
            text += `[✓] ${otherReason}\n`;
        }

        const isCancel = selectedReasons.some(r => r.toLowerCase().includes('iptal')) || (showOther && otherReason.toLowerCase().includes('iptal'));

        if (isCancel) {
            text += `\nMüşteri işlemi iptal etmiştir.`;
        } else {
            text += `\nYarın tekrar gidilecektir.`;
        }

        setGeneratedText(text);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedText);
        alert('Mesaj kopyalandı!');
    };

    const handleSave = () => {
        const finalReasons = [...selectedReasons];
        if (showOther && otherReason) finalReasons.push(otherReason);
        onSave({ receiptNo, postponeReason: finalReasons, status: 'postponed' });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border-2 border-amber-500/30 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-amber-500/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500 rounded-xl shadow-lg shadow-amber-500/30">
                            <Clock size={20} className="text-white" />
                        </div>
                        <h2 className="font-black text-sm uppercase tracking-tight italic">Erteleme Nedeni</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Fiş No</label>
                        <input
                            type="text"
                            placeholder="Örn: 152168142"
                            value={receiptNo}
                            onChange={(e) => setReceiptNo(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 px-4 focus:outline-none focus:border-amber-500 text-slate-200 font-bold text-sm"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Nedenler</label>
                        <div className="grid grid-cols-1 gap-2">
                            {reasons.map(reason => (
                                <button
                                    key={reason}
                                    onClick={() => toggleReason(reason)}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${selectedReasons.includes(reason) ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/10'}`}
                                >
                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${selectedReasons.includes(reason) ? 'bg-amber-500 border-amber-500' : 'bg-transparent border-slate-700'}`}>
                                        {selectedReasons.includes(reason) && <CheckCircle2 size={14} className="text-slate-900" />}
                                    </div>
                                    <span className="text-xs font-bold">{reason}</span>
                                </button>
                            ))}
                            <button
                                onClick={() => setShowOther(!showOther)}
                                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${showOther ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/10'}`}
                            >
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${showOther ? 'bg-amber-500 border-amber-500' : 'bg-transparent border-slate-700'}`}>
                                    {showOther && <CheckCircle2 size={14} className="text-slate-900" />}
                                </div>
                                <span className="text-xs font-bold">Diğer</span>
                            </button>
                        </div>
                    </div>

                    {showOther && (
                        <textarea
                            placeholder="Diğer erteleme nedenini buraya yazın..."
                            value={otherReason}
                            onChange={(e) => setOtherReason(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 h-24 focus:outline-none focus:border-amber-500 text-slate-200 text-xs font-bold resize-none"
                        />
                    )}

                    {generatedText && (
                        <div className="bg-slate-950 border border-white/5 rounded-2xl p-4 space-y-3">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Önizleme</p>
                            <pre className="text-[11px] text-slate-300 font-medium whitespace-pre-wrap font-sans bg-slate-900/50 p-3 rounded-xl border border-white/5 italic">
                                {generatedText}
                            </pre>
                            <button
                                onClick={copyToClipboard}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-xs"
                            >
                                <Copy size={14} /> METNİ KOPYALA
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-slate-950/50 flex gap-3">
                    <button
                        onClick={generateMessage}
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-4 rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                    >
                        <MessageSquare size={16} /> METİN OLUŞTUR
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-slate-100 hover:bg-white text-slate-900 font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-[10px]"
                    >
                        KAYDET
                    </button>
                </div>
            </div>
        </div>
    );
};

const Clock = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);
