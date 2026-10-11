import { commissionStats } from '../utils/commission'
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

            calculateStrategicStats: () => commissionStats(get().services),
            calculateStats: (data) => commissionStats(data),

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
