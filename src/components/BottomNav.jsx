import { NavLink } from 'react-router-dom';
import { CalendarDays,Package,Archive,BarChart3,Settings } from 'lucide-react';
export function BottomNav(){return <nav className="bottom-nav" aria-label="Ana gezinme">{[['/','Bugün',CalendarDays],['/materials','Malzeme',Package],['/archive','Arşiv',Archive],['/statistics','İstatistikler',BarChart3],['/settings','Ayarlar',Settings]].map(([to,label,Icon])=><NavLink key={to} to={to} end className={({isActive})=>isActive?'active':''}><Icon size={20}/><span>{label}</span></NavLink>)}</nav>;}
