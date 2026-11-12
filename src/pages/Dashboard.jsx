import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  Layers,
  Package,
  Truck,
  Users,
  Search,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink
} from 'lucide-react';
import KPICard from '../components/common/KPICard';
import GraphCanvas from '../components/graph/GraphCanvas';
import EntityDetails from '../components/graph/EntityDetails';
import StatusBadge from '../components/common/StatusBadge';
import { api } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [activeShipments, setActiveShipments] = useState([]);
  const [traceSearchInput, setTraceSearchInput] = useState('');

  useEffect(() => {
    async function loadData() {
      const events = await api.getEvents();
      const shipments = await api.getShipments();
      setRecentEvents(events.slice(0, 5));
      setActiveShipments(shipments.filter(s => s.status !== 'Delivered').slice(0, 5));
    }
    loadData();
  }, []);

  const handleTraceSubmit = (e) => {
    e.preventDefault();
    if (traceSearchInput.trim()) {
      navigate(`/trace?id=${traceSearchInput.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete visibility across your material supply chain
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-emerald-600" />
            <span>All Time</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Materials"
          value="--"
          icon={Boxes}
          color="emerald"
        />
        <KPICard
          title="Production Batches"
          value="--"
          icon={Layers}
          color="blue"
        />
        <KPICard
          title="Finished Products"
          value="--"
          icon={Package}
          color="orange"
        />
        <KPICard
          title="Active Shipments"
          value="--"
          icon={Truck}
          color="purple"
        />
        <KPICard
          title="Customers"
          value="--"
          icon={Users}
          color="rose"
        />
      </div>

      {/* Main Section: Material Genealogy Graph */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Material Genealogy Graph</h2>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Interactive
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore the complete material flow from source to destination
            </p>
          </div>
          <button
            onClick={() => navigate('/graph')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
          >
            <span>Full Graph View</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>

        {/* Graph + Entity Details Split */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <GraphCanvas
              selectedEntityId={selectedEntity?.id}
              onNodeClick={(entityData) => setSelectedEntity(entityData)}
              height="h-[520px]"
            />
          </div>

          <div className="lg:w-96 shrink-0 rounded-2xl border border-slate-200 overflow-hidden">
            <EntityDetails
              entity={selectedEntity}
              onClose={() => setSelectedEntity(null)}
            />
          </div>
        </div>
      </div>

      {/* Bottom 3-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Recent Events */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-900">Recent Events</h3>
            <button
              onClick={() => navigate('/events')}
              className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {recentEvents.length === 0 ? (
            <div className="py-10 text-center text-xs font-medium text-slate-400">
              No recent events
            </div>
          ) : (
            <div className="space-y-3.5">
              {recentEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => navigate(`/trace?id=${evt.entityId}`)}
                  className="group flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50 cursor-pointer"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 mt-0.5">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {evt.type}
                      </span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {evt.timestamp?.split(' ')[0] || '--'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{evt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Active Shipments */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-900">Active Shipments</h3>
            <button
              onClick={() => navigate('/shipments')}
              className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {activeShipments.length === 0 ? (
            <div className="py-10 text-center text-xs font-medium text-slate-400">
              No shipment data available
            </div>
          ) : (
            <div className="space-y-3">
              {activeShipments.map((shp) => (
                <div
                  key={shp.id}
                  onClick={() => navigate(`/shipments?id=${shp.id}`)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{shp.id}</span>
                        <span className="text-[11px] text-slate-500">{shp.origin} → {shp.destination}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">{shp.product} ({shp.quantity} {shp.unit})</span>
                    </div>
                  </div>
                  <StatusBadge status={shp.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Trace Search */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Trace Search</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter any Material, Batch, Product or Shipment ID to trace.
            </p>

            <form onSubmit={handleTraceSubmit} className="relative mb-3">
              <input
                type="text"
                value={traceSearchInput}
                onChange={(e) => setTraceSearchInput(e.target.value)}
                placeholder="Enter entity ID..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-3.5 pr-20 text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 transition-all"
              >
                <Search className="h-3 w-3" />
                Trace
              </button>
            </form>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => navigate('/trace?dir=upstream')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 p-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-emerald-600" />
              Trace Upstream
            </button>
            <button
              onClick={() => navigate('/trace?dir=downstream')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-orange-50 p-2.5 text-xs font-bold text-orange-800 hover:bg-orange-100 transition-colors"
            >
              Trace Downstream
              <ArrowRight className="h-3.5 w-3.5 text-orange-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
