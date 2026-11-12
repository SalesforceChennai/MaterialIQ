import { MarkerType } from '@xyflow/react';

export const EDGE_COLORS = {
  HAS_BATCH: '#059669', // Emerald
  CREATES: '#2563eb', // Blue
  PRODUCED_FROM: '#2563eb', // Blue
  SHIPS: '#ea580c', // Orange
  DELIVERED_TO: '#9333ea', // Purple
  HAS_EVENT: '#d97706' // Amber
};

/**
 * Traverse graph upstream (sources leading to nodeId)
 */
export function getUpstream(nodeId, allNodes, allEdges) {
  if (!nodeId) return { nodes: allNodes, edges: allEdges, pathNodeIds: [] };
  const targetId = nodeId.trim().toUpperCase();
  const visitedNodes = new Set();
  
  const startNode = allNodes.find(n => n.id?.toUpperCase() === targetId);
  if (!startNode) return { nodes: allNodes, edges: allEdges, pathNodeIds: [] };
  
  visitedNodes.add(startNode.id);
  const visitedEdges = new Set();
  const queue = [startNode.id];

  while (queue.length > 0) {
    const current = queue.shift();
    allEdges.forEach(edge => {
      if (edge.target?.toUpperCase() === current.toUpperCase()) {
        visitedEdges.add(edge.id);
        const sourceNode = allNodes.find(n => n.id?.toUpperCase() === edge.source?.toUpperCase());
        if (sourceNode && !visitedNodes.has(sourceNode.id)) {
          visitedNodes.add(sourceNode.id);
          queue.push(sourceNode.id);
        }
      }
    });
  }

  const nodes = allNodes.filter(n => visitedNodes.has(n.id));
  const edges = allEdges.filter(e => visitedEdges.has(e.id));
  return {
    nodes,
    edges,
    pathNodeIds: Array.from(visitedNodes),
    pathEdgeIds: Array.from(visitedEdges)
  };
}
export const getUpstreamSubgraph = getUpstream;

/**
 * Traverse graph downstream (targets departing from nodeId)
 */
export function getDownstream(nodeId, allNodes, allEdges) {
  if (!nodeId) return { nodes: allNodes, edges: allEdges, pathNodeIds: [] };
  const sourceId = nodeId.trim().toUpperCase();
  const visitedNodes = new Set();
  
  const startNode = allNodes.find(n => n.id?.toUpperCase() === sourceId);
  if (!startNode) return { nodes: allNodes, edges: allEdges, pathNodeIds: [] };
  
  visitedNodes.add(startNode.id);
  const visitedEdges = new Set();
  const queue = [startNode.id];

  while (queue.length > 0) {
    const current = queue.shift();
    allEdges.forEach(edge => {
      if (edge.source?.toUpperCase() === current.toUpperCase()) {
        visitedEdges.add(edge.id);
        const targetNode = allNodes.find(n => n.id?.toUpperCase() === edge.target?.toUpperCase());
        if (targetNode && !visitedNodes.has(targetNode.id)) {
          visitedNodes.add(targetNode.id);
          queue.push(targetNode.id);
        }
      }
    });
  }

  const nodes = allNodes.filter(n => visitedNodes.has(n.id));
  const edges = allEdges.filter(e => visitedEdges.has(e.id));
  return {
    nodes,
    edges,
    pathNodeIds: Array.from(visitedNodes),
    pathEdgeIds: Array.from(visitedEdges)
  };
}
export const getDownstreamSubgraph = getDownstream;

/**
 * Impact Analysis: Downstream blast radius of an entity
 */
export function getImpact(nodeId, allNodes, allEdges) {
  const downstream = getDownstream(nodeId, allNodes, allEdges);
  const affectedNodes = downstream.nodes.filter(n => n.id?.toUpperCase() !== nodeId?.trim().toUpperCase());

  const summary = {
    batchesCount: affectedNodes.filter(n => n.type === 'batch' || n.data?.category === 'batch').length,
    productsCount: affectedNodes.filter(n => n.type === 'product' || n.data?.category === 'product').length,
    shipmentsCount: affectedNodes.filter(n => n.type === 'shipment' || n.data?.category === 'shipment').length,
    customersCount: affectedNodes.filter(n => n.type === 'customer' || n.data?.category === 'customer').length,
    totalAffected: affectedNodes.length
  };

  return {
    ...downstream,
    affectedNodes,
    summary
  };
}

/**
 * Complete Connected Path (Both Upstream & Downstream)
 */
export function getFullConnectedPath(nodeId, allNodes, allEdges) {
  const upstream = getUpstream(nodeId, allNodes, allEdges);
  const downstream = getDownstream(nodeId, allNodes, allEdges);

  const combinedNodes = new Set([...upstream.pathNodeIds, ...downstream.pathNodeIds]);
  const combinedEdges = new Set([...upstream.pathEdgeIds, ...downstream.pathEdgeIds]);

  return {
    nodes: allNodes.filter(n => combinedNodes.has(n.id)),
    edges: allEdges.filter(e => combinedEdges.has(e.id)),
    pathNodeIds: Array.from(combinedNodes),
    pathEdgeIds: Array.from(combinedEdges)
  };
}

/**
 * Filter graph by entity types
 */
export function filterGraphByEntityTypes(allNodes, allEdges, selectedCategories) {
  if (!selectedCategories || selectedCategories.length === 0 || selectedCategories.includes('all')) {
    return { nodes: allNodes, edges: allEdges };
  }

  const activeNodeIds = new Set(
    allNodes
      .filter(n => {
        const cat = (n.data?.category || n.type || '').toLowerCase();
        return selectedCategories.includes(cat) || 
               (selectedCategories.includes('raw_material') && cat === 'material') ||
               (selectedCategories.includes('material') && cat === 'raw_material');
      })
      .map(n => n.id)
  );

  return {
    nodes: allNodes.filter(n => activeNodeIds.has(n.id)),
    edges: allEdges.filter(e => activeNodeIds.has(e.source) && activeNodeIds.has(e.target))
  };
}

/**
 * Apply dimming/highlighting for trace paths
 */
export function applyPathHighlight(allNodes, allEdges, activeNodeIds = null, activeEdgeIds = null, pulseNodeId = null) {
  if (!activeNodeIds) {
    // Normal graph view (all active)
    return {
      nodes: allNodes.map(n => ({
        ...n,
        data: {
          ...n.data,
          isDimmed: false,
          isHighlighted: false,
          isPulse: n.id?.toUpperCase() === pulseNodeId?.toUpperCase()
        }
      })),
      edges: allEdges.map(e => ({
        ...e,
        style: {
          ...e.style,
          opacity: 1
        }
      }))
    };
  }

  const activeNodeSet = new Set(activeNodeIds.map(id => id.toUpperCase()));
  const activeEdgeSet = new Set((activeEdgeIds || []).map(id => id.toUpperCase()));

  const nodes = allNodes.map(n => {
    const isTarget = activeNodeSet.has(n.id?.toUpperCase());
    return {
      ...n,
      data: {
        ...n.data,
        isHighlighted: isTarget,
        isDimmed: !isTarget,
        isPulse: n.id?.toUpperCase() === pulseNodeId?.toUpperCase()
      }
    };
  });

  const edges = allEdges.map(e => {
    const isTargetEdge = activeEdgeSet.size > 0 
      ? activeEdgeSet.has(e.id?.toUpperCase())
      : (activeNodeSet.has(e.source?.toUpperCase()) && activeNodeSet.has(e.target?.toUpperCase()));

    const strokeColor = EDGE_COLORS[e.label] || '#059669';

    return {
      ...e,
      animated: isTargetEdge,
      style: {
        ...e.style,
        stroke: isTargetEdge ? strokeColor : '#94a3b8',
        strokeWidth: isTargetEdge ? 3 : 1,
        opacity: isTargetEdge ? 1 : 0.15
      }
    };
  });

  return { nodes, edges };
}

/**
 * Build dynamic graph data (React Flow nodes and edges) directly from stored application entities & relationships
 */
export function buildGraphData(store) {
  if (!store) return { nodes: [], edges: [] };

  const {
    materials = [],
    batches = [],
    products = [],
    shipments = [],
    customers = [],
    events = [],
    relationships = []
  } = store;

  const nodes = [];
  const existingNodeIds = new Set();

  // Spacing constants for the supply chain columns
  const colX = {
    material: 40,
    batch: 340,
    product: 650,
    shipment: 960,
    customer: 1270,
    event: 340
  };

  const colY = {
    material: 60,
    batch: 60,
    product: 60,
    shipment: 60,
    customer: 60,
    event: 60
  };

  // 1. Materials
  materials.forEach((mat) => {
    const id = mat.id || `MAT-${nodes.length + 1}`;
    nodes.push({
      id,
      type: 'material',
      position: { x: colX.material, y: colY.material },
      data: {
        id,
        name: mat.name || 'Unnamed Material',
        type: 'Material',
        category: 'material',
        subtitle: mat.supplier ? `Supplier: ${mat.supplier}` : (mat.category || 'Raw Material'),
        status: mat.status || 'In Stock',
        stock: `${mat.currentStock ?? 0} ${mat.unit || 'kg'}`,
        raw: mat
      }
    });
    existingNodeIds.add(id);
    colY.material += 140;
  });

  // Track batch Y positions to position child events near parent batch
  const batchYPositions = new Map();

  // 2. Batches
  batches.forEach((bat) => {
    const id = bat.id || `BAT-${nodes.length + 1}`;
    const posY = colY.batch;
    batchYPositions.set(id, posY);
    nodes.push({
      id,
      type: 'batch',
      position: { x: colX.batch, y: posY },
      data: {
        id,
        name: bat.name || 'Batch Production',
        type: 'Batch',
        category: 'batch',
        subtitle: `${bat.quantity ?? '--'} ${bat.unit || 'kg'} • ${bat.process || 'Manufacturing'}`,
        status: bat.status || 'Active',
        stock: `${bat.quantity ?? 0} ${bat.unit || 'kg'}`,
        raw: bat
      }
    });
    existingNodeIds.add(id);
    colY.batch += 140;
  });

  // 3. Products
  products.forEach((prod) => {
    const id = prod.id || `PROD-${nodes.length + 1}`;
    nodes.push({
      id,
      type: 'product',
      position: { x: colX.product, y: colY.product },
      data: {
        id,
        name: prod.name || 'Finished Product',
        type: 'Product',
        category: 'product',
        subtitle: `${prod.currentStock ?? '--'} ${prod.unit || 'pcs'} • ${prod.category || 'Product'}`,
        status: prod.status || 'In Stock',
        stock: `${prod.currentStock ?? 0} ${prod.unit || 'pcs'}`,
        raw: prod
      }
    });
    existingNodeIds.add(id);
    colY.product += 140;
  });

  // 4. Shipments
  shipments.forEach((shp) => {
    const id = shp.id || `SHIP-${nodes.length + 1}`;
    nodes.push({
      id,
      type: 'shipment',
      position: { x: colX.shipment, y: colY.shipment },
      data: {
        id,
        name: shp.origin && shp.destination ? `${shp.origin} → ${shp.destination}` : (shp.product || 'Shipment'),
        type: 'Shipment',
        category: 'shipment',
        subtitle: shp.transporter ? `Carrier: ${shp.transporter}` : (shp.status || 'In Transit'),
        status: shp.status || 'In Transit',
        stock: `${shp.quantity ?? '--'} ${shp.unit || 'units'}`,
        raw: shp
      }
    });
    existingNodeIds.add(id);
    colY.shipment += 140;
  });

  // 5. Customers
  customers.forEach((cust) => {
    const id = cust.id || `CUS-${nodes.length + 1}`;
    nodes.push({
      id,
      type: 'customer',
      position: { x: colX.customer, y: colY.customer },
      data: {
        id,
        name: cust.name || 'Customer Account',
        type: 'Customer',
        category: 'customer',
        subtitle: `${cust.industry || 'Client'} • ${cust.location || '--'}`,
        status: cust.status || 'Active',
        raw: cust
      }
    });
    existingNodeIds.add(id);
    colY.customer += 140;
  });

  // 6. Events (linked to target entities)
  let eventOffset = 0;
  events.forEach((evt) => {
    const id = evt.id || `EVT-${nodes.length + 1}`;
    let posX = colX.event;
    let posY = 0;

    if (evt.entityId && batchYPositions.has(evt.entityId)) {
      posY = batchYPositions.get(evt.entityId) + 120 + (eventOffset * 80);
      eventOffset++;
    } else {
      posY = Math.max(colY.batch, 200) + (eventOffset * 100);
      eventOffset++;
    }

    nodes.push({
      id,
      type: 'event',
      position: { x: posX, y: posY },
      data: {
        id,
        name: evt.type || 'Quality Event',
        type: 'Event',
        category: 'event',
        subtitle: evt.description || evt.location || 'Event Logged',
        status: evt.status || 'Completed',
        raw: evt
      }
    });
    existingNodeIds.add(id);
  });

  // Collect & build all edges
  const edgeMap = new Map();

  const addEdgeRecord = (source, target, label, type) => {
    if (!source || !target) return;
    const actualSource = Array.from(existingNodeIds).find(id => id.toUpperCase() === source.toUpperCase());
    const actualTarget = Array.from(existingNodeIds).find(id => id.toUpperCase() === target.toUpperCase());

    if (!actualSource || !actualTarget || actualSource === actualTarget) return;

    const edgeKey = `${actualSource}->${actualTarget}`;
    if (edgeMap.has(edgeKey)) return;

    const strokeColor = EDGE_COLORS[label] || EDGE_COLORS[type] || '#059669';

    edgeMap.set(edgeKey, {
      id: `e-${actualSource}-${actualTarget}`,
      source: actualSource,
      target: actualTarget,
      label: label || type,
      type: 'smoothstep',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: strokeColor,
        width: 18,
        height: 18
      },
      style: {
        stroke: strokeColor,
        strokeWidth: 2
      },
      labelStyle: {
        fill: '#0f172a',
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: '0.04em'
      },
      labelBgStyle: {
        fill: '#ffffff',
        fillOpacity: 0.95,
        stroke: '#cbd5e1',
        strokeWidth: 1,
        rx: 6,
        ry: 6
      },
      labelBgPadding: [6, 4]
    });
  };

  // 1. Process explicit relationships from store
  relationships.forEach((rel) => {
    addEdgeRecord(rel.source, rel.target, rel.label, rel.type);
  });

  // 2. Automatically derive required relationships from entity attributes
  batches.forEach((bat) => {
    if (bat.materialId) {
      addEdgeRecord(bat.materialId, bat.id, 'HAS_BATCH', 'HAS_BATCH');
    } else if (Array.isArray(bat.materials) && bat.materials.length > 0) {
      bat.materials.forEach((mId) => {
        addEdgeRecord(mId, bat.id, 'HAS_BATCH', 'HAS_BATCH');
      });
    } else if (materials.length > 0) {
      addEdgeRecord(materials[0].id, bat.id, 'HAS_BATCH', 'HAS_BATCH');
    }
  });

  products.forEach((prod) => {
    if (prod.batchId) {
      addEdgeRecord(prod.batchId, prod.id, 'CREATES', 'CREATES');
    } else if (Array.isArray(prod.batches) && prod.batches.length > 0) {
      prod.batches.forEach((bId) => {
        addEdgeRecord(bId, prod.id, 'CREATES', 'CREATES');
      });
    } else if (batches.length > 0) {
      addEdgeRecord(batches[0].id, prod.id, 'CREATES', 'CREATES');
    }
  });

  shipments.forEach((shp) => {
    if (shp.productId) {
      addEdgeRecord(shp.productId, shp.id, 'SHIPS', 'SHIPS');
    } else {
      const matchProd = products.find(p => p.id === shp.product || p.name === shp.product) || products[0];
      if (matchProd) {
        addEdgeRecord(matchProd.id, shp.id, 'SHIPS', 'SHIPS');
      }
    }

    if (shp.customerId) {
      addEdgeRecord(shp.id, shp.customerId, 'DELIVERED_TO', 'DELIVERED_TO');
    } else {
      const matchCust = customers.find(c => c.id === shp.customer || c.name === shp.customer) || customers[0];
      if (matchCust) {
        addEdgeRecord(shp.id, matchCust.id, 'DELIVERED_TO', 'DELIVERED_TO');
      }
    }
  });

  customers.forEach((cust) => {
    if (Array.isArray(cust.shipmentIds)) {
      cust.shipmentIds.forEach((sId) => {
        addEdgeRecord(sId, cust.id, 'DELIVERED_TO', 'DELIVERED_TO');
      });
    }
  });

  events.forEach((evt) => {
    if (evt.entityId) {
      addEdgeRecord(evt.entityId, evt.id, 'HAS_EVENT', 'HAS_EVENT');
    } else if (batches.length > 0) {
      addEdgeRecord(batches[0].id, evt.id, 'HAS_EVENT', 'HAS_EVENT');
    }
  });

  return {
    nodes,
    edges: Array.from(edgeMap.values())
  };
}

export const generateGraphData = buildGraphData;
