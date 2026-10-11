import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mergeImported } from '../utils/ecom'
import { archiveFinishedDays, restoreKnownLocations } from '../utils/fieldTools'

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

            importServices: (records) => set(state => {
                const current = archiveFinishedDays(state.services, state.archive);
                return { archive:current.archive, services:mergeImported(current.services, current.archive, restoreKnownLocations(records,[...current.services,...current.archive]), generateUUID, Date.now(), state.planLocked) };
            }),
            undoVisit: (ids) => set(state => ({ services:state.services.map(s => ids.includes(s.id) && s.status === 'done' ? {...s,status:s.statusBeforeDone || 'pending',completedAt:null} : s) })),
            removeVisit: (ids) => set(state => ({ services:state.services.filter(s => !ids.includes(s.id)), archive:[...state.services.filter(s => ids.includes(s.id)).map(s => ({...s,removedFromList:true})),...state.archive] })),
            restoreVisit: (ids) => set(state => ({ services:[...state.services,...state.archive.filter(s => ids.includes(s.id)).map(s => ({...s,removedFromList:false}))], archive:state.archive.filter(s => !ids.includes(s.id)) })),
            startNewDay: () => set(state => ({ services: [], archive: [...state.services, ...state.archive], planLocked: false })),
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
                    receiptNo: data.receiptNo || '',
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
                        status: s.status === status ? 'pending' : status,
                        statusBeforeDone: status === 'done' && s.status !== 'done' ? s.status : s.statusBeforeDone,
                        completedAt: status === 'done' && s.status !== 'done' ? Date.now() : null
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
                        acc.cancelled++;
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
                }, { done: 0, cancelled: 0, postponed: 0, prime: 0, sales: 0, bakims: 0, pending: 0 });

                const total = stats.done + stats.cancelled + stats.postponed + stats.pending;

                return {
                    ...stats,
                    saleRate: stats.done > 0 ? Math.round((stats.sales / stats.done) * 100) : 0,
                    avgPrime: stats.done > 0 ? Math.round(stats.prime / stats.done) : 0,
                    cancelRate: total > 0 ? Math.round((stats.cancelled / total) * 100) : 0,
                    bakimRate: stats.done > 0 ? Math.round((stats.bakims / stats.done) * 100) : 0,
                };
            },

            calculateStats: (data) => {
                const stats = data.reduce((acc, s) => {
                    if (s.status === 'done') {
                        acc.done++;
                        let p = 25;
                        let c = 0;
                        if (s.plus) { p += 130; c += 1500; }
                        if (s.aksesuar) { p += 100; c += 800; }
                        if (s.bakim) { p += 250; c += 1200; }
                        acc.totalPrime += p;
                        acc.totalCiro += c;
                        if (s.plus || s.aksesuar || s.bakim) acc.sales++;
                    } else if (s.status === 'cancelled') {
                        acc.cancelled++;
                    }
                    return acc;
                }, { done: 0, cancelled: 0, totalPrime: 0, totalCiro: 0, sales: 0 });

                return {
                    ...stats,
                    saleRate: stats.done > 0 ? Math.round((stats.sales / stats.done) * 100) : 0
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
            name: 'routex-persist-v1',
        }
    )
)
