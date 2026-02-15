import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const normalizePhone = (phone) => {
    let clean = phone.replace(/\D/g, '');
    if (clean.length === 10) return '90' + clean;
    if (clean.length === 11 && clean.startsWith('0')) return '9' + clean;
    if (clean.length === 12 && clean.startsWith('90')) return clean;
    return clean;
};

export const useServiceStore = create(
    persist(
        (set, get) => ({
            services: [],
            archive: [],
            planLocked: false,
            lastLocation: null,

            setPlanLocked: (locked) => set({ planLocked: locked }),
            setLastLocation: (loc) => set({ lastLocation: loc }),

            addService: (data) => {
                const phone = normalizePhone(data.phone);

                // Detailed history check
                const history = [...get().services, ...get().archive]
                    .filter(s => normalizePhone(s.phone) === phone)
                    .sort((a, b) => b.createdAt - a.createdAt);

                const newService = {
                    ...data,
                    id: generateUUID(),
                    phone,
                    status: 'pending',
                    createdAt: Date.now(),
                    plus: false,
                    aksesuar: false,
                    bakim: false,
                    nps: null,
                    cancelReason: '',
                    postponeReason: [],
                    receiptNo: '',
                    isExtra: get().planLocked // If locked, it's an extra job
                };

                set((state) => ({
                    services: [newService, ...state.services]
                }));

                return history[0] || null;
            },

            updateService: (id, updates) => {
                set((state) => ({
                    services: state.services.map((s) => (s.id === id ? { ...s, ...updates } : s))
                }));
            },

            toggleStatus: (id, status) => {
                set((state) => ({
                    services: state.services.map((s) => (s.id === id ? {
                        ...s,
                        status: s.status === status ? 'pending' : status
                    } : s))
                }));
            },

            archiveOldServices: () => {
                const mid = new Date().setHours(0, 0, 0, 0);
                set((state) => {
                    const toArc = state.services.filter(s => s.createdAt < mid);
                    const rem = state.services.filter(s => s.createdAt >= mid);
                    if (toArc.length === 0) return state;
                    return {
                        services: rem,
                        archive: [...toArc, ...state.archive],
                        planLocked: false
                    };
                });
            },

            calculateStrategicStats: () => {
                const current = get().services;
                const stats = current.reduce((acc, s) => {
                    if (s.status === 'cancelled') {
                        acc.cancels++;
                        return acc;
                    }
                    if (s.status === 'postponed') {
                        acc.postponed++;
                        acc.pending++; // Postponed counts as pending for tracking
                        return acc;
                    }
                    if (s.status === 'done') {
                        acc.done++;
                        let p = 25;
                        if (s.plus) p += 130;
                        if (s.aksesuar) p += 100;
                        if (s.bakim) { p += 250; acc.bakims++; }
                        acc.prime += p;
                        if (s.plus || s.aksesuar || s.bakim) acc.sales++;
                    } else if (s.status === 'pending') {
                        acc.pending++;
                    }
                    return acc;
                }, { done: 0, cancels: 0, postponed: 0, prime: 0, sales: 0, bakims: 0, pending: 0 });

                const total = stats.done + stats.cancels + stats.postponed + (current.filter(s => s.status === 'pending').length);

                return {
                    ...stats,
                    saleRate: stats.done > 0 ? Math.round((stats.sales / stats.done) * 100) : 0,
                    avgPrime: stats.done > 0 ? Math.round(stats.prime / stats.done) : 0,
                    cancelRate: total > 0 ? Math.round((stats.cancels / total) * 100) : 0,
                    bakimRate: stats.done > 0 ? Math.round((stats.bakims / stats.done) * 100) : 0,
                };
            },

            resetSystem: () => {
                if (confirm('Bütün veriler silinecek ve yeni bir gün başlatılacak. Emin misiniz?')) {
                    set({
                        services: [],
                        archive: [],
                        planLocked: false,
                        lastLocation: null
                    });
                }
            },

            exportData: () => {
                const blob = new Blob([JSON.stringify({ s: get().services, a: get().archive })], { type: 'json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `fieldops-pro-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
            }
        }),
        {
            name: 'fieldops-pro-persist-v3',
        }
    )
)
