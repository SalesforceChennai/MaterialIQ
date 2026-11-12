import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Network,
  Boxes,
  Layers,
  Package,
  Truck,
  Users,
  CalendarClock,
  BarChart3,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/trace', label: 'Trace', icon: Search },
  { path: '/graph', label: 'Graph', icon: Network },
  { path: '/materials', label: 'Materials', icon: Boxes },
  { path: '/batches', label: 'Batches', icon: Layers },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/shipments', label: 'Shipments', icon: Truck },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/events', label: 'Events', icon: CalendarClock },
  { path: '/reports', label: 'Reports', icon: BarChart3 }
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col justify-between border-r border-emerald-950/40 bg-[#071d18] text-slate-300 shadow-xl transition-all">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-emerald-900/30">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-700 p-0.5 shadow-md">
            <img
              src="/materialiq-logo.png"
              alt="MaterialIQ Logo"
              className="h-full w-full object-cover rounded-[10px]"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-white font-sans">
                Material<span className="text-emerald-400">IQ</span>
              </span>
              <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-emerald-300/70 font-medium leading-tight line-clamp-1">
              Traceability & Intelligence
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="mt-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50 font-bold'
                      : 'text-emerald-100/70 hover:bg-emerald-900/40 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Logistics Card */}
      <div className="p-4 border-t border-emerald-900/30">
        <Link
          to="/trace"
          className="group relative block overflow-hidden rounded-2xl border border-emerald-800/40 bg-gradient-to-b from-emerald-900/30 to-[#051814] p-3 text-left transition-all hover:border-emerald-500/50 shadow-md"
        >
          <div className="relative h-24 w-full overflow-hidden rounded-xl mb-3">
            <img
              src="/sidebar-card.jpg"
              alt="Material Visibility"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071d18] via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[11px] font-bold text-white">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Full Provenance</span>
            </div>
          </div>

          <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
            Complete Material Visibility
          </h4>
          <p className="text-[11px] text-emerald-200/60 mt-0.5 leading-snug">
            From Source to Destination
          </p>

          <div className="mt-2.5 flex items-center justify-between text-[11px] font-semibold text-emerald-400">
            <span>Trace Journey</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
