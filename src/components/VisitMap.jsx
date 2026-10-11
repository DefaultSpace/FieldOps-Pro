import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { validCoordinates } from '../utils/maps'
export function VisitMap({ visits, onSelect }) {
    const element = useRef(null);
    useEffect(() => {
        const map = L.map(element.current).setView([40.979, 28.721], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 19 }).addTo(map);
        const points = [];
        visits.forEach((v, i) => {
            const position = v.items.find(s => validCoordinates(s.coordinates))?.coordinates;
            if (!position) return;
            points.push([position.lat, position.lng]);
            L.marker([position.lat, position.lng], { icon: L.divIcon({ className: 'visit-marker', html: `<span>${i + 1}</span>`, iconSize: [32, 32] }) }).addTo(map).on('click', () => onSelect(v.key));
        });
        if (points.length) map.fitBounds(points, { padding: [35, 35], maxZoom: 15 });
        const observer = new ResizeObserver(() => map.invalidateSize()); observer.observe(element.current);
        return () => { observer.disconnect(); map.remove(); };
    }, [visits, onSelect]);
    return <div ref={element} className="visit-map" aria-label="Doğrulanmış kalan ziyaretlerin haritası" />;
}
