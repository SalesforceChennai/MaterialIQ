import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Boxes, Layers, Package, Truck, Users, CalendarClock, Activity, Building2 } from 'lucide-react';

const categoryConfig = {
  raw_material: {
    icon: Boxes,
    border: 'border-emerald-500',
    bg: 'bg-emerald-50/90',
    iconBg: 'bg-emerald-500 text-white',
    badge: 'bg-emerald-100 text-emerald-800'
  },
  material: {
    icon: Boxes,
    border: 'border-emerald-500',
    bg: 'bg-emerald-50/90',
    iconBg: 'bg-emerald-500 text-white',
    badge: 'bg-emerald-100 text-emerald-800'
  },
  supplier: {
    icon: Building2,
    border: 'border-teal-500',
    bg: 'bg-teal-50/90',
    iconBg: 'bg-teal-500 text-white',
    badge: 'bg-teal-100 text-teal-800'
  },
  batch: {
    icon: Layers,
    border: 'border-blue-500',
    bg: 'bg-blue-50/90',
    iconBg: 'bg-blue-500 text-white',
    badge: 'bg-blue-100 text-blue-800'
  },
  product: {
    icon: Package,
    border: 'border-orange-500',
    bg: 'bg-orange-50/90',
    iconBg: 'bg-orange-500 text-white',
    badge: 'bg-orange-100 text-orange-800'
  },
  shipment: {
    icon: Truck,
    border: 'border-purple-500',
    bg: 'bg-purple-50/90',
    iconBg: 'bg-purple-500 text-white',
    badge: 'bg-purple-100 text-purple-800'
  },
  customer: {
    icon: Users,
    border: 'border-rose-500',
    bg: 'bg-rose-50/90',
    iconBg: 'bg-rose-500 text-white',
    badge: 'bg-rose-100 text-rose-800'
  },
  event: {
    icon: CalendarClock,
    border: 'border-amber-500',
    bg: 'bg-amber-50/90',
    iconBg: 'bg-amber-500 text-white',
    badge: 'bg-amber-100 text-amber-800'
  }
};

function CustomGraphNode({ data, selected }) {
  const catKey = (data.category || data.type || 'product').toLowerCase();
  const config = categoryConfig[catKey] || categoryConfig[data.category] || categoryConfig.product;
  const Icon = config.icon || Activity;

  const isDimmed = data.isDimmed;
  const isHighlighted = data.isHighlighted || selected;
  const isPulse = data.isPulse;

  return (
    <div
      className={`group relative flex w-56 flex-col rounded-2xl border-2 bg-white/95 p-3.5 shadow-md backdrop-blur-xs transition-all duration-300 cursor-pointer ${
        isDimmed
          ? 'opacity-25 scale-95 border-slate-200'
          : isHighlighted
          ? 'ring-3 ring-emerald-500 border-emerald-600 scale-105 shadow-xl z-30'
          : config.border
      } ${isPulse ? 'animate-pulse ring-4 ring-amber-400' : ''}`}
    >
      {/* Target Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-3 !h-3 !bg-slate-400 group-hover:!bg-emerald-500"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!w-3 !h-3 !bg-slate-400 group-hover:!bg-emerald-500"
      />

      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs transition-colors ${config.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-bold text-slate-900 truncate">{data.id}</span>
            <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${config.badge}`}>
              {data.type || data.category}
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-800 truncate mt-0.5">{data.name}</h4>
        </div>
      </div>

      {data.subtitle && (
        <div className="mt-2.5 border-t border-slate-100 pt-2 text-[10px] text-slate-500 font-medium truncate">
          {data.subtitle}
        </div>
      )}

      {/* Source Handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-3 !h-3 !bg-slate-400 group-hover:!bg-emerald-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-3 !h-3 !bg-slate-400 group-hover:!bg-emerald-500"
      />
    </div>
  );
}

export default memo(CustomGraphNode);
