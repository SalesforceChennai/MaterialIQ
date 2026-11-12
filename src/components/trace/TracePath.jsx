import React from 'react';
import { Boxes, Layers, Package, Truck, Users } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const typeIcons = {
  'Raw Material': Boxes,
  'Manufacturing': Layers,
  'Finished Product': Package,
  'Product': Package,
  'Outbound Shipment': Truck,
  'Shipment': Truck,
  'Customer Delivery': Users,
  'Customer': Users
};

const typeColors = {
  'Raw Material': 'bg-emerald-500 text-white ring-4 ring-emerald-50',
  'Manufacturing': 'bg-blue-500 text-white ring-4 ring-blue-50',
  'Finished Product': 'bg-orange-500 text-white ring-4 ring-orange-50',
  'Product': 'bg-orange-500 text-white ring-4 ring-orange-50',
  'Outbound Shipment': 'bg-purple-500 text-white ring-4 ring-purple-50',
  'Shipment': 'bg-purple-500 text-white ring-4 ring-purple-50',
  'Customer Delivery': 'bg-rose-500 text-white ring-4 ring-rose-50',
  'Customer': 'bg-rose-500 text-white ring-4 ring-rose-50'
};

export default function TracePath({ path = [], onSelectEntity }) {
  if (!path || path.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs h-full flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Trace Path Journey</h3>
            <p className="text-xs text-slate-500 mt-0.5">Chronological flow from source supply to end customer</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm font-medium text-slate-500">No traceability data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Trace Path Journey</h3>
          <p className="text-xs text-slate-500 mt-0.5">Chronological flow from source supply to end customer</p>
        </div>
        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          {path.length} Milestones Recorded
        </span>
      </div>

      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-emerald-500 via-blue-500 to-rose-500" />

        <div className="space-y-6">
          {path.map((item, idx) => {
            const Icon = typeIcons[item.type] || Package;
            const colorClass = typeColors[item.type] || 'bg-slate-500 text-white ring-4 ring-slate-50';

            return (
              <div
                key={idx}
                onClick={() => onSelectEntity && onSelectEntity(item.id)}
                className="group relative flex items-start gap-4 rounded-xl p-2.5 transition-all hover:bg-slate-50 cursor-pointer"
              >
                {/* Node Icon */}
                <div
                  className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-xs transition-transform group-hover:scale-105 ${colorClass}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {item.type}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-bold text-slate-800">
                        {item.id}
                      </span>
                    </div>
                    {item.status && <StatusBadge status={item.status} size="sm" />}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mt-1">{item.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>

                  {item.date && (
                    <div className="mt-2 text-[11px] font-medium text-slate-400">
                      Logged: {item.date}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
