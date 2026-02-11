import { ServiceCard } from './ServiceCard'
import { getMapsRouteUrl } from '../utils/maps'
import { Map, Navigation } from 'lucide-react'
import {
    SortableContext,
    verticalListSortingStrategy
} from '@dnd-kit/sortable'

export const MahalleGroup = ({ mahalleName, services }) => {
    const openRoute = () => {
        const addresses = services.map(s => s.address);
        window.open(getMapsRouteUrl(addresses), '_blank');
    };

    const count = services.length;
    const doneCount = services.filter(s => s.status === 'done').length;

    return (
        <div className="mb-10 last:mb-20">
            <div className="flex items-center justify-between px-2 mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-6 bg-blue-500 rounded-full" />
                    <h2 className="font-black text-xl tracking-tight text-slate-100 italic">
                        {mahalleName} <span className="text-slate-500 text-base font-bold ml-1">({doneCount}/{count})</span>
                    </h2>
                </div>

                <button
                    onClick={openRoute}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-slate-700/50"
                >
                    <Navigation size={14} /> ROTA YAP
                </button>
            </div>

            <div className="space-y-4">
                <SortableContext
                    items={services.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {services.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
};
