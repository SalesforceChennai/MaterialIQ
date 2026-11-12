import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState
} from '@xyflow/react';
import CustomGraphNode from './CustomGraphNode';
import {
  getUpstream,
  getDownstream,
  getImpact,
  getFullConnectedPath,
  filterGraphByEntityTypes,
  applyPathHighlight
} from '../../utils/graphTransform';
import { api } from '../../services/api';
import { realtime } from '../../services/realtime';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Zap,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Target,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const nodeTypes = {
  customNode: CustomGraphNode,
  material: CustomGraphNode,
  raw_material: CustomGraphNode,
  supplier: CustomGraphNode,
  batch: CustomGraphNode,
  product: CustomGraphNode,
  shipment: CustomGraphNode,
  customer: CustomGraphNode,
  event: CustomGraphNode
};

export default function GraphCanvas({
  selectedEntityId = null,
  viewMode = 'all', // 'all' | 'upstream' | 'downstream' | 'impact'
  onNodeClick,
  onModeChange,
  filterEntityType = 'all',
  height = 'h-[560px]'
}) {
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const masterGraphRef = useRef({ nodes: [], edges: [] });
  const [activeMode, setActiveMode] = useState(viewMode);
  const [activeFilter, setActiveFilter] = useState(filterEntityType);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [currentSelectedId, setCurrentSelectedId] = useState(selectedEntityId);
  const [pulseNodeId, setPulseNodeId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Sync external props
  useEffect(() => {
    setCurrentSelectedId(selectedEntityId);
  }, [selectedEntityId]);

  useEffect(() => {
    setActiveMode(viewMode);
  }, [viewMode]);

  useEffect(() => {
    setActiveFilter(filterEntityType);
  }, [filterEntityType]);

  // Load and apply graph
  const renderGraph = useCallback((baseGraph, mode, filter, selectedId, pulseId = null) => {
    let { nodes: rawNodes, edges: rawEdges } = baseGraph;

    // Filter by entity type if specified
    if (filter && filter !== 'all') {
      const filtered = filterGraphByEntityTypes(rawNodes, rawEdges, [filter]);
      rawNodes = filtered.nodes;
      rawEdges = filtered.edges;
    }

    // Determine highlighted nodes & edges based on mode and selected entity
    if (selectedId && mode !== 'all') {
      let pathResult = null;
      if (mode === 'upstream') {
        pathResult = getUpstream(selectedId, rawNodes, rawEdges);
      } else if (mode === 'downstream') {
        pathResult = getDownstream(selectedId, rawNodes, rawEdges);
      } else if (mode === 'impact') {
        pathResult = getImpact(selectedId, rawNodes, rawEdges);
      } else {
        pathResult = getFullConnectedPath(selectedId, rawNodes, rawEdges);
      }

      const highlighted = applyPathHighlight(
        rawNodes,
        rawEdges,
        pathResult.pathNodeIds,
        pathResult.pathEdgeIds,
        pulseId
      );
      setNodes(highlighted.nodes);
      setEdges(highlighted.edges);

      // Fit to traced nodes
      if (reactFlowInstance && pathResult.pathNodeIds.length > 0) {
        setTimeout(() => {
          reactFlowInstance.fitView({
            nodes: highlighted.nodes.filter(n => pathResult.pathNodeIds.includes(n.id)),
            padding: 0.25,
            duration: 400
          });
        }, 60);
      }
    } else if (selectedId) {
      // Complete view but with selected entity connected path highlighted
      const pathResult = getFullConnectedPath(selectedId, rawNodes, rawEdges);
      const highlighted = applyPathHighlight(
        rawNodes,
        rawEdges,
        pathResult.pathNodeIds,
        pathResult.pathEdgeIds,
        pulseId
      );
      setNodes(highlighted.nodes);
      setEdges(highlighted.edges);
    } else {
      // Complete normal view
      const normal = applyPathHighlight(rawNodes, rawEdges, null, null, pulseId);
      setNodes(normal.nodes);
      setEdges(normal.edges);
    }
  }, [reactFlowInstance, setNodes, setEdges]);

  // Load graph from API
  const refreshGraph = useCallback(async (pulseId = null) => {
    try {
      const graph = await api.getGraph();
      masterGraphRef.current = graph;
      renderGraph(graph, activeMode, activeFilter, currentSelectedId, pulseId);
    } catch (err) {
      console.error('Failed to load graph:', err);
    }
  }, [activeMode, activeFilter, currentSelectedId, renderGraph]);

  // Initial load
  useEffect(() => {
    refreshGraph();
  }, [refreshGraph]);

  // Subscribe to real-time events
  useEffect(() => {
    const unsubscribe = realtime.subscribe((event) => {
      const targetId = event.payload?.targetEntityId || event.payload?.event?.entityId || event.payload?.material?.id || event.payload?.batch?.id;
      if (targetId) {
        setPulseNodeId(targetId);
        setTimeout(() => setPulseNodeId(null), 3000);
      }
      refreshGraph(targetId);
    });

    const handleStorage = () => refreshGraph();
    window.addEventListener('storage', handleStorage);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorage);
    };
  }, [refreshGraph]);

  // Re-render when mode, filter, or selected entity changes
  useEffect(() => {
    if (masterGraphRef.current.nodes.length > 0) {
      renderGraph(masterGraphRef.current, activeMode, activeFilter, currentSelectedId, pulseNodeId);
    }
  }, [activeMode, activeFilter, currentSelectedId, pulseNodeId, renderGraph]);

  // Node selection handler
  const handleNodeClick = useCallback(
    (_, node) => {
      setCurrentSelectedId(node.id);
      if (onNodeClick) onNodeClick(node.data);
    },
    [onNodeClick]
  );

  // Control handlers
  const handleModeToggle = (mode) => {
    const nextMode = activeMode === mode ? 'all' : mode;
    setActiveMode(nextMode);
    if (onModeChange) onModeChange(nextMode);
  };

  const handleReset = () => {
    setActiveMode('all');
    setActiveFilter('all');
    setCurrentSelectedId(null);
    if (onModeChange) onModeChange('all');
    if (onNodeClick) onNodeClick(null);

    const normal = applyPathHighlight(masterGraphRef.current.nodes, masterGraphRef.current.edges);
    setNodes(normal.nodes);
    setEdges(normal.edges);

    if (reactFlowInstance) {
      setTimeout(() => reactFlowInstance.fitView({ padding: 0.18, duration: 400 }), 50);
    }
  };

  const handleFitView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.18, duration: 300 });
    }
  };

  const handleZoomIn = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn({ duration: 250 });
    }
  };

  const handleZoomOut = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut({ duration: 250 });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isFullscreen ? 'fixed inset-4 z-50 rounded-3xl shadow-2xl bg-white p-2' : `${height} rounded-2xl`} border border-slate-200/80 bg-slate-50/50 overflow-hidden shadow-xs transition-all`}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Traversal Action Buttons */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-white/95 p-1.5 rounded-xl border border-slate-200/80 shadow-xs backdrop-blur-sm text-xs font-semibold">
          <button
            onClick={() => handleModeToggle('upstream')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all ${
              activeMode === 'upstream'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Highlight upstream origin path"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Upstream
          </button>
          <button
            onClick={() => handleModeToggle('downstream')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all ${
              activeMode === 'downstream'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Highlight downstream destination path"
          >
            Downstream
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleModeToggle('impact')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all ${
              activeMode === 'impact'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Impact analysis of downstream affected entities"
          >
            <Zap className="h-3.5 w-3.5" />
            Impact View
          </button>
          <div className="h-4 w-px bg-slate-200 mx-0.5" />
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 transition-all"
            title="Reset complete graph"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        {/* Viewport Controls (+, -, Fit, Fullscreen) */}
        <div className="flex items-center gap-1 pointer-events-auto bg-white/95 p-1 rounded-xl border border-slate-200/80 shadow-xs backdrop-blur-sm">
          <button
            onClick={handleZoomIn}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleFitView}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Fit View"
          >
            <Target className="h-3.5 w-3.5" />
          </button>
          <div className="h-4 w-px bg-slate-200 mx-0.5" />
          <button
            onClick={toggleFullscreen}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Compact Graph Legend inside graph area */}
      <div className="absolute bottom-3 right-3 z-10 pointer-events-auto bg-white/90 p-2.5 rounded-xl border border-slate-200/80 shadow-xs backdrop-blur-sm">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
          Graph Legend
        </span>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs" />
            <span>Material</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-2xs" />
            <span>Supplier</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-2xs" />
            <span>Batch</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-2xs" />
            <span>Product</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-2xs" />
            <span>Shipment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-2xs" />
            <span>Customer</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-2xs" />
            <span>Event</span>
          </div>
        </div>
      </div>

      {/* Empty State Overlay */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto z-10 bg-slate-50/80 p-6 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-600">No traceability data available</p>
          <button
            onClick={() => navigate('/materials')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Material
          </button>
        </div>
      )}

      {/* Main React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        onInit={(instance) => {
          setReactFlowInstance(instance);
          setTimeout(() => instance.fitView({ padding: 0.18 }), 60);
        }}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.15}
        maxZoom={2.0}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#cbd5e1" gap={20} size={1} />
        <Controls position="bottom-left" showInteractive={false} className="!bg-white !border-slate-200 !rounded-xl !shadow-xs" />
      </ReactFlow>
    </div>
  );
}
