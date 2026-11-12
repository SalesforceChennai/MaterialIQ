import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Search,
  ExternalLink,
  Layers,
  Truck,
  Users,
  Calendar,
  Boxes,
  Package
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const entityIcons = {
  raw_material: Boxes,
  material: Boxes,
  batch: Layers,
  product: Package,
  shipment: Truck,
  customer: Users,
  event: Calendar
};

const categoryThemeColors = {
  raw_material: 'bg-emerald-500 text-white',
  material: 'bg-emerald-500 text-white',
  batch: 'bg-blue-500 text-white',
  product: 'bg-orange-500 text-white',
  shipment: 'bg-purple-500 text-white',
  customer: 'bg-rose-500 text-white',
  event: 'bg-amber-500 text-white'
};

export default function EntityDetails({ entity, onClose }) {
  const navigate = useNavigate();

  if (!entity) {
    return (
      <div className="flex h-full flex-col bg-white border-l border-slate-200/80 shadow-xl w-80 md:w-96 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Entity Details
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
            <Package className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No entity selected</p>
          <p className="text-xs text-slate-400 mt-1">Select an entity from the graph or table to view its details.</p>
        </div>
      </div>
    );
  }

  const cat = (entity.category || entity.type || '').toLowerCase();
  const Icon = entityIcons[cat] || Package;
  const themeClass = categoryThemeColors[cat] || 'bg-slate-700 text-white';

  const getEntityRoute = () => {
    switch (cat) {
      case 'raw_material':
      case 'material':
        return '/materials';
      case 'batch':
        return '/batches';
      case 'product':
        return '/products';
      case 'shipment':
        return '/shipments';
      case 'customer':
        return '/customers';
      case 'event':
        return '/events';
      default:
        return '/';
    }
  };

  return (
    <div className="flex h-full flex-col bg-white border-l border-slate-200/80 shadow-xl w-80 md:w-96 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Entity Details
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Main Entity Card */}
        <div className="flex items-start gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-xs ${themeClass}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <h3 className="text-sm font-bold text-slate-900 truncate">{entity.id}</h3>
              <StatusBadge status={entity.status || 'Active'} size="sm" />
            </div>
            <p className="text-xs font-bold text-slate-700 mt-0.5 truncate">{entity.name}</p>
            {entity.type && (
              <span className="inline-block mt-1 rounded-md bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                {entity.type}
              </span>
            )}
          </div>
        </div>

        {/* Key Attributes */}
        <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Key Properties
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-medium text-slate-400">Status</span>
              <p className="font-semibold text-slate-700">{entity.status || '--'}</p>
            </div>
            <div>
              <span className="text-[10px] font-medium text-slate-400">Created / Updated</span>
              <p className="font-semibold text-slate-700">{entity.createdDate || '--'}</p>
            </div>
            {entity.stock && (
              <div>
                <span className="text-[10px] font-medium text-slate-400">Capacity / Stock</span>
                <p className="font-semibold text-slate-700">{entity.stock}</p>
              </div>
            )}
            {entity.subtitle && (
              <div className="col-span-2">
                <span className="text-[10px] font-medium text-slate-400">Detail</span>
                <p className="font-medium text-slate-700">{entity.subtitle}</p>
              </div>
            )}
          </div>

          {entity.description && (
            <div className="border-t border-slate-100 pt-3">
              <span className="text-[10px] font-medium text-slate-400">Description</span>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{entity.description}</p>
            </div>
          )}
        </div>

        {/* Connected Graph Relationships */}
        <div className="space-y-2.5">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Connected Graph Nodes
          </h4>

          {entity.batches && entity.batches.length > 0 && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                <Layers className="h-3.5 w-3.5" />
                <span>Related Batches ({entity.batches.length})</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {entity.batches.map((b) => (
                  <span
                    key={b}
                    onClick={() => navigate(`/trace?id=${b}`)}
                    className="cursor-pointer rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-800 hover:bg-blue-100 transition-colors"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {entity.shipments && entity.shipments.length > 0 && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700">
                <Truck className="h-3.5 w-3.5" />
                <span>Related Shipments ({entity.shipments.length})</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {entity.shipments.map((s) => (
                  <span
                    key={s}
                    onClick={() => navigate(`/trace?id=${s}`)}
                    className="cursor-pointer rounded-lg border border-purple-200 bg-purple-50 px-2 py-1 text-[11px] font-semibold text-purple-800 hover:bg-purple-100 transition-colors"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {entity.customers && entity.customers.length > 0 && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                <Users className="h-3.5 w-3.5" />
                <span>Related Customers ({entity.customers.length})</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {entity.customers.map((c) => (
                  <span
                    key={c}
                    onClick={() => navigate(`/trace?id=${c}`)}
                    className="cursor-pointer rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-800 hover:bg-rose-100 transition-colors"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(!entity.batches || entity.batches.length === 0) &&
            (!entity.shipments || entity.shipments.length === 0) &&
            (!entity.customers || entity.customers.length === 0) && (
              <p className="text-xs text-slate-400 py-2">No connected nodes</p>
            )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-slate-100 bg-slate-50/70 p-4 space-y-2">
        <button
          onClick={() => navigate(`/trace?id=${entity.id}`)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-98 transition-all"
        >
          <Search className="h-4 w-4" />
          Trace This Entity
        </button>
        <button
          onClick={() => navigate(getEntityRoute())}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
        >
          <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
          View Full Details
        </button>
      </div>
    </div>
  );
}
