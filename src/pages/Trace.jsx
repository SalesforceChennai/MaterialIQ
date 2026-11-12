import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  RotateCcw,
  Maximize2,
  Minimize2,
  ArrowLeft,
  ArrowRight,
  Package
} from 'lucide-react';
import GraphCanvas from '../components/graph/GraphCanvas';
import TracePath from '../components/trace/TracePath';
import TraceTimeline from '../components/trace/TraceTimeline';
import StatusBadge from '../components/common/StatusBadge';
import { api } from '../services/api';

export default function Trace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const initialDir = searchParams.get('dir') || 'both';

  const [searchId, setSearchId] = useState(initialId);
  const [activeTab, setActiveTab] = useState('trace'); // 'trace' | 'graph' | 'timeline' | 'events'
  const [traceData, setTraceData] = useState(null);
  const [direction, setDirection] = useState(initialDir);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchTrace = async (id) => {
    if (!id || !id.trim()) {
      setTraceData(null);
      return;
    }
    const result = await api.getTrace(id);
    setTraceData(result);
  };

  useEffect(() => {
    const id = searchParams.get('id') || '';
    setSearchId(id);
    if (id) {
      fetchTrace(id);
    } else {
      setTraceData(null);
    }
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      setSearchParams({ id: searchId.trim().toUpperCase() });
      fetchTrace(searchId.trim().toUpperCase());
    }
  };

  const handleSelectEntity = (id) => {
    setSearchId(id);
    setSearchParams({ id });
    fetchTrace(id);
  };

  const matched = traceData?.matchedEntity;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Trace Material</h1>
        <p className="text-xs text-slate-500 mt-1">
          Enter any Material, Batch, Product or Shipment ID to explore its complete journey
        </p>
      </div>

      {/* Hero Search Box */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Material, Batch, Product or Shipment ID..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-12 pr-4 text-sm font-semibold text-slate-800 placeholder-slate-400 shadow-2xs transition-all focus:bg-white focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 active:scale-98 transition-all shrink-0 w-full sm:w-auto"
          >
            <Search className="h-4 w-4" />
            Trace
          </button>
        </form>
      </div>

      {/* Tabs Bar & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
          <button
            onClick={() => setActiveTab('trace')}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'trace'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Trace View
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'graph'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Graph View
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'timeline'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'events'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Event History
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDirection(direction === 'upstream' ? 'both' : 'upstream')}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold shadow-2xs transition-all ${
              direction === 'upstream'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Upstream
          </button>
          <button
            onClick={() => setDirection(direction === 'downstream' ? 'both' : 'downstream')}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold shadow-2xs transition-all ${
              direction === 'downstream'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Downstream
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              setDirection('both');
            }}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-2xs hover:bg-slate-50"
            title="Reset direction"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-2xs hover:bg-slate-50"
            title="Toggle fullscreen graph"
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Content Area Based on Active Tab */}
      {(activeTab === 'trace' || activeTab === 'graph') && (
        <div className={`transition-all ${isFullscreen ? 'fixed inset-4 z-50 bg-white p-4 rounded-3xl shadow-2xl flex flex-col' : ''}`}>
          {isFullscreen && (
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Fullscreen Material Genealogy Flow</h3>
              <button
                onClick={() => setIsFullscreen(false)}
                className="rounded-lg p-1.5 bg-slate-100 hover:bg-slate-200"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
          )}

          <GraphCanvas
            selectedEntityId={searchId}
            directionFilter={direction}
            height={isFullscreen ? 'flex-1' : 'h-[500px]'}
          />
        </div>
      )}

      {/* Below Graph 3-column / 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Complete Trace Path */}
        <div className="lg:col-span-1">
          <TracePath
            path={traceData?.tracePath || []}
            onSelectEntity={(id) => handleSelectEntity(id)}
          />
        </div>

        {/* Middle: Key Information Card */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="border-b border-slate-100 pb-4 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Key Information
              </span>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 shadow-xs">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{matched?.id || searchId || '--'}</h3>
                    {matched?.status && <StatusBadge status={matched.status} size="sm" />}
                  </div>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">{matched?.name || 'No entity selected'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Entity Classification</span>
                <span className="font-semibold text-slate-800">{matched?.type || '--'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Batch Association</span>
                <span className="font-mono font-bold text-blue-600">{matched?.batchId || '--'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Available Quantity</span>
                <span className="font-semibold text-slate-800">{matched?.currentStock ? `${matched.currentStock} ${matched.unit || ''}` : '--'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Production Timestamp</span>
                <span className="font-semibold text-slate-800">{matched?.productionDate || matched?.createdDate || '--'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Facility / Hub</span>
                <span className="font-semibold text-slate-800">{matched?.location || '--'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500 font-medium">Destination Client</span>
                <span className="font-semibold text-emerald-700">{matched?.customerName || matched?.supplier || '--'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Recent Events */}
        <div className="lg:col-span-1">
          <TraceTimeline events={traceData?.recentEvents || []} />
        </div>
      </div>
    </div>
  );
}
