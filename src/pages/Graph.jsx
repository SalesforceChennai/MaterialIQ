import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  RotateCcw,
  Package,
  Layers,
  Boxes,
  Truck,
  Users,
  CalendarClock,
  ArrowRight,
  ArrowLeft,
  Zap,
  Activity,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import GraphCanvas from '../components/graph/GraphCanvas';
import StatusBadge from '../components/common/StatusBadge';
import { api } from '../services/api';
import { realtime } from '../services/realtime';
import {
  getUpstream,
  getDownstream,
  getImpact,
  getFullConnectedPath
} from '../utils/graphTransform';

export default function Graph() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchId, setSearchId] = useState(searchParams.get('id') || '');
  const [activeEntityId, setActiveEntityId] = useState(searchParams.get('id') || null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'upstream' | 'downstream' | 'impact'
  const [entityTypeFilter, setEntityTypeFilter] = useState('all');
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [events, setEvents] = useState([]);
  const [notFoundError, setNotFoundError] = useState(false);

  // Load latest graph data & events
  const loadData = useCallback(async () => {
    try {
      const graph = await api.getGraph();
      setGraphData(graph);
      const allEvents = await api.getEvents();
      setEvents(allEvents);

      // If active entity exists, sync its details
      if (activeEntityId) {
        const found = graph.nodes.find(n => n.id?.toUpperCase() === activeEntityId.toUpperCase());
        if (found) {
          setSelectedEntity(found.data);
          setNotFoundError(false);
        } else {
          const trace = await api.traceEntity(activeEntityId);
          if (trace?.matchedEntity) {
            setSelectedEntity(trace.matchedEntity);
            setNotFoundError(false);
          } else {
            setNotFoundError(true);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load graph data:', err);
    }
  }, [activeEntityId]);

  useEffect(() => {
    loadData();

    // Subscribe to live events and storage updates
    const unsubscribe = realtime.subscribe(() => {
      loadData();
    });

    const handleStorage = () => loadData();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('materialiq_storage_updated', handleStorage);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('materialiq_storage_updated', handleStorage);
    };
  }, [loadData]);

  // Handle Quick Trace submission
  const handleQuickTrace = (e) => {
    if (e) e.preventDefault();
    if (!searchId.trim()) return;

    const queryId = searchId.trim().toUpperCase();
    const node = graphData.nodes.find(n => n.id?.toUpperCase() === queryId);

    if (node) {
      setActiveEntityId(node.id);
      setSelectedEntity(node.data);
      setViewMode('all');
      setNotFoundError(false);
      setSearchParams({ id: node.id });
    } else {
      api.traceEntity(queryId).then((res) => {
        if (res && res.matchedEntity) {
          setActiveEntityId(res.matchedEntity.id);
          setSelectedEntity(res.matchedEntity);
          setViewMode('all');
          setNotFoundError(false);
          setSearchParams({ id: res.matchedEntity.id });
        } else {
          setNotFoundError(true);
          setSelectedEntity(null);
          setActiveEntityId(null);
        }
      });
    }
  };

  // Node Click in Canvas
  const handleNodeClick = (nodeData) => {
    if (!nodeData) {
      setSelectedEntity(null);
      setActiveEntityId(null);
      return;
    }
    setActiveEntityId(nodeData.id);
    setSelectedEntity(nodeData);
    setSearchId(nodeData.id);
    setNotFoundError(false);
    setSearchParams({ id: nodeData.id });
  };

  // Traversal and View actions
  const handleUpstreamClick = () => {
    if (!activeEntityId && graphData.nodes.length > 0) {
      setActiveEntityId(graphData.nodes[0].id);
      setSelectedEntity(graphData.nodes[0].data);
    }
    setViewMode('upstream');
  };

  const handleDownstreamClick = () => {
    if (!activeEntityId && graphData.nodes.length > 0) {
      setActiveEntityId(graphData.nodes[0].id);
      setSelectedEntity(graphData.nodes[0].data);
    }
    setViewMode('downstream');
  };

  const handleImpactClick = () => {
    if (!activeEntityId && graphData.nodes.length > 0) {
      setActiveEntityId(graphData.nodes[0].id);
      setSelectedEntity(graphData.nodes[0].data);
    }
    setViewMode('impact');
  };

  const handleReset = () => {
    setActiveEntityId(null);
    setSelectedEntity(null);
    setSearchId('');
    setViewMode('all');
    setEntityTypeFilter('all');
    setNotFoundError(false);
    setSearchParams({});
  };

  // Compute Trace Path Details
  const tracePathDetails = useMemo(() => {
    if (!activeEntityId || graphData.nodes.length === 0) return null;

    if (viewMode === 'upstream') {
      const up = getUpstream(activeEntityId, graphData.nodes, graphData.edges);
      return {
        directionLabel: 'Upstream',
        nodes: up.nodes,
        pathString: up.nodes.map(n => n.id).reverse().join(' → ') || activeEntityId,
        length: up.nodes.length
      };
    } else if (viewMode === 'downstream') {
      const down = getDownstream(activeEntityId, graphData.nodes, graphData.edges);
      return {
        directionLabel: 'Downstream',
        nodes: down.nodes,
        pathString: down.nodes.map(n => n.id).join(' → ') || activeEntityId,
        length: down.nodes.length
      };
    } else if (viewMode === 'impact') {
      const imp = getImpact(activeEntityId, graphData.nodes, graphData.edges);
      return {
        directionLabel: 'Impact Analysis',
        nodes: imp.nodes,
        pathString: imp.nodes.map(n => n.id).join(' → ') || activeEntityId,
        length: imp.nodes.length,
        summary: imp.summary
      };
    } else {
      const full = getFullConnectedPath(activeEntityId, graphData.nodes, graphData.edges);
      return {
        directionLabel: 'Both (Full Journey)',
        nodes: full.nodes,
        pathString: full.nodes.map(n => n.id).join(' → ') || activeEntityId,
        length: full.nodes.length
      };
    }
  }, [activeEntityId, viewMode, graphData]);

  // Related events for active entity
  const entityRelatedEvents = useMemo(() => {
    if (!activeEntityId) return [];
    return events.filter(
      e => e.entityId?.toUpperCase() === activeEntityId.toUpperCase()
    );
  }, [activeEntityId, events]);

  // Impact summary for active entity
  const impactSummary = useMemo(() => {
    if (!activeEntityId) return null;
    return getImpact(activeEntityId, graphData.nodes, graphData.edges).summary;
  }, [activeEntityId, graphData]);

  // Calculate dynamic events/minute rate
  const eventsPerMinute = useMemo(() => {
    if (events.length === 0) return 0;
    // Calculate based on recent events (simulated activity rate)
    return Math.max(1, Math.min(12, Math.round(events.length * 0.8)));
  }, [events]);

  const getEntityIcon = (cat) => {
    const c = (cat || '').toLowerCase();
    if (c === 'material' || c === 'raw_material') return Boxes;
    if (c === 'batch') return Layers;
    if (c === 'product') return Package;
    if (c === 'shipment') return Truck;
    if (c === 'customer') return Users;
    return CalendarClock;
  };

  return (
    <div className="space-y-6">
      {/* 1. GRAPH HEADER – LIVE STATUS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Material Genealogy Graph
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200/60 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              LIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time material flow, entity ancestry, and supply chain telemetry
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center divide-x divide-slate-200 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xs">
            <div className="px-4 py-1 text-center">
              <span className="text-lg font-mono font-extrabold text-slate-900 block leading-tight">
                {graphData.nodes.length}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Nodes
              </span>
            </div>
            <div className="px-4 py-1 text-center">
              <span className="text-lg font-mono font-extrabold text-slate-900 block leading-tight">
                {graphData.edges.length}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Edges
              </span>
            </div>
            <div className="px-4 py-1 text-center">
              <span className="text-lg font-mono font-extrabold text-emerald-600 block leading-tight">
                {eventsPerMinute}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Events/Min
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Graph + Right Live Event Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Columns: Graph & Flow */}
        <div className="lg:col-span-3 space-y-4">
          {/* Column Flow Indicators */}
          <div className="grid grid-cols-5 gap-2 px-2 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <div className="rounded-xl bg-emerald-50/80 py-1.5 text-emerald-800 border border-emerald-100">
              Raw Materials
            </div>
            <div className="rounded-xl bg-blue-50/80 py-1.5 text-blue-800 border border-blue-100">
              Manufacturing
            </div>
            <div className="rounded-xl bg-orange-50/80 py-1.5 text-orange-800 border border-orange-100">
              Products
            </div>
            <div className="rounded-xl bg-purple-50/80 py-1.5 text-purple-800 border border-purple-100">
              Shipments
            </div>
            <div className="rounded-xl bg-rose-50/80 py-1.5 text-rose-800 border border-rose-100">
              Customers
            </div>
          </div>

          {/* React Flow Canvas */}
          <GraphCanvas
            selectedEntityId={activeEntityId}
            viewMode={viewMode}
            filterEntityType={entityTypeFilter}
            onNodeClick={handleNodeClick}
            onModeChange={(mode) => setViewMode(mode)}
            height="h-[560px]"
          />
        </div>

        {/* Right Column: Live Event Feed & Quick Filters */}
        <div className="lg:col-span-1 space-y-5">
          {/* 3. LIVE EVENT FEED */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col h-[560px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Live Event Feed
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                {events.length} Events
              </span>
            </div>

            {/* Event List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
              {events.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <Activity className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-500">No recent events</p>
                  <p className="text-[11px] text-slate-400 mt-1">Events will stream here automatically.</p>
                </div>
              ) : (
                events.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => {
                      if (evt.entityId) {
                        const targetNode = graphData.nodes.find(
                          n => n.id?.toUpperCase() === evt.entityId?.toUpperCase()
                        );
                        if (targetNode) {
                          handleNodeClick(targetNode.data);
                        } else {
                          setActiveEntityId(evt.entityId);
                        }
                      }
                    }}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-emerald-50/50 hover:border-emerald-200 cursor-pointer transition-all duration-200 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-900 uppercase tracking-tight text-[11px] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        {evt.type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                        {evt.timestamp?.split(',')[1]?.trim() || evt.timestamp?.split(' ')[1] || 'Just now'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {evt.description || 'Supply chain event recorded'}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100/60 text-[10px]">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                        {evt.entityId || 'SYS'}
                      </span>
                      <span className="text-slate-400 truncate max-w-[110px]">
                        {evt.location || 'Factory'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Quick Trace + Trace Result + Entity Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 5. QUICK TRACE & 10. TRACE RESULT */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-5">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Quick Trace
              </h3>
              <button
                onClick={handleReset}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>

            {/* Search Input */}
            <form onSubmit={handleQuickTrace} className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="e.g. MAT-001 or PROD-001"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {notFoundError && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-100">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Entity not found. Please verify the ID.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 transition-all cursor-pointer"
              >
                Trace
              </button>
            </form>
          </div>

          {/* 10. TRACE RESULT */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Trace Result
            </span>

            {tracePathDetails ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Selected Entity</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">{activeEntityId}</span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Trace Path</span>
                  <p className="font-mono text-xs font-semibold text-emerald-800 break-words mt-0.5">
                    {tracePathDetails.pathString}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Path Length</span>
                    <span className="font-mono font-bold text-slate-800">{tracePathDetails.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Direction</span>
                    <span className="font-bold text-slate-800 text-[11px] truncate block">
                      {tracePathDetails.directionLabel.split(' ')[0]}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Related Events</span>
                    <span className="font-mono font-bold text-slate-800">{entityRelatedEvents.length}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs font-medium text-slate-400">
                Enter an ID above or click any node to view trace path results
              </div>
            )}
          </div>
        </div>

        {/* 9. IMPACT VIEW & TRAVERSAL CONTROLS */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Impact & Lineage Analysis
            </h3>
            {activeEntityId && (
              <span className="text-xs font-mono font-bold text-emerald-600">
                {activeEntityId}
              </span>
            )}
          </div>

          {/* Action Buttons for Upstream, Downstream, Impact View */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleUpstreamClick}
              className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                viewMode === 'upstream'
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ArrowLeft className="h-4 w-4 mx-auto mb-1" />
              Upstream
            </button>
            <button
              onClick={handleDownstreamClick}
              className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                viewMode === 'downstream'
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ArrowRight className="h-4 w-4 mx-auto mb-1" />
              Downstream
            </button>
            <button
              onClick={handleImpactClick}
              className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                viewMode === 'impact'
                  ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Zap className="h-4 w-4 mx-auto mb-1 text-amber-500" />
              Impact View
            </button>
          </div>

          {/* Impact Summary Grid */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Downstream Blast Radius
            </span>

            {impactSummary ? (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-100 bg-blue-50/60 p-3">
                  <span className="text-[10px] font-bold uppercase text-blue-700 block">
                    Affected Batches
                  </span>
                  <span className="text-xl font-mono font-extrabold text-blue-900 mt-1 block">
                    {impactSummary.batchesCount}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-orange-50/60 p-3">
                  <span className="text-[10px] font-bold uppercase text-orange-700 block">
                    Affected Products
                  </span>
                  <span className="text-xl font-mono font-extrabold text-orange-900 mt-1 block">
                    {impactSummary.productsCount}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-purple-50/60 p-3">
                  <span className="text-[10px] font-bold uppercase text-purple-700 block">
                    Affected Shipments
                  </span>
                  <span className="text-xl font-mono font-extrabold text-purple-900 mt-1 block">
                    {impactSummary.shipmentsCount}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-rose-50/60 p-3">
                  <span className="text-[10px] font-bold uppercase text-rose-700 block">
                    Affected Customers
                  </span>
                  <span className="text-xl font-mono font-extrabold text-rose-900 mt-1 block">
                    {impactSummary.customersCount}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs font-medium text-slate-400">
                Select an entity to calculate downstream supply chain impact
              </div>
            )}
          </div>
        </div>

        {/* 12. NODE CLICK & SELECTED ENTITY DETAILS */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Entity Details
            </h3>
            {selectedEntity && (
              <button
                onClick={() => navigate(`/trace?id=${selectedEntity.id}`)}
                className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Deep Trace <ExternalLink className="h-3 w-3" />
              </button>
            )}
          </div>

          {selectedEntity ? (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold shrink-0">
                  {React.createElement(getEntityIcon(selectedEntity.category || selectedEntity.type), { className: 'h-5 w-5' })}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 font-mono truncate">{selectedEntity.id}</h4>
                    <StatusBadge status={selectedEntity.status || 'Active'} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500 truncate">{selectedEntity.name}</p>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Classification</span>
                  <span className="font-semibold text-slate-800">{selectedEntity.type || selectedEntity.category || '--'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Description / Details</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[170px]">
                    {selectedEntity.raw?.description || selectedEntity.subtitle || '--'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Current Volume / Qty</span>
                  <span className="font-semibold text-slate-800">{selectedEntity.stock || '--'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Related Events</span>
                  <span className="font-bold text-emerald-600">{entityRelatedEvents.length} recorded</span>
                </div>
              </div>

              {/* Action Buttons in Entity Details */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => {
                    setViewMode('all');
                    handleQuickTrace();
                  }}
                  className="rounded-lg bg-emerald-50 px-2 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 text-center"
                >
                  Trace
                </button>
                <button
                  onClick={handleUpstreamClick}
                  className="rounded-lg bg-slate-100 px-2 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-200 text-center"
                >
                  Upstream
                </button>
                <button
                  onClick={handleDownstreamClick}
                  className="rounded-lg bg-slate-100 px-2 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-200 text-center"
                >
                  Downstream
                </button>
                <button
                  onClick={handleImpactClick}
                  className="rounded-lg bg-amber-50 px-2 py-1.5 text-[11px] font-bold text-amber-700 hover:bg-amber-100 text-center"
                >
                  Impact
                </button>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-xs font-medium text-slate-400">
              Click any node in the graph above to view its details, ancestry, and connected telemetry
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
