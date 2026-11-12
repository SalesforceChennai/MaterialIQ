import { getStore, saveStore } from './storage';
import {
  buildGraphData,
  getUpstream as computeUpstream,
  getDownstream as computeDownstream,
  getImpact as computeImpact
} from '../utils/graphTransform';
import { realtime } from './realtime';

/**
 * MaterialIQ Service Layer
 * Reads and persists to unified localStorage store.
 * Dynamically computes graph topology, entity traces, upstream, downstream, and impact.
 */

export const api = {
  // Store access
  getRawStore() {
    return getStore();
  },

  // Centralized graph data transformation
  buildGraphData() {
    return buildGraphData(getStore());
  },

  // Materials
  async getMaterials() {
    const store = getStore();
    return Promise.resolve([...store.materials]);
  },
  async getMaterialById(id) {
    if (!id) return Promise.resolve(null);
    const store = getStore();
    const item = store.materials.find((m) => m.id?.toUpperCase() === id.toUpperCase());
    return Promise.resolve(item || null);
  },
  async addMaterial(newMaterial) {
    const store = getStore();
    const matId = newMaterial.id?.trim() || `MAT-${String(store.materials.length + 1).padStart(3, '0')}`;
    const item = {
      id: matId,
      status: newMaterial.status || 'In Stock',
      stockHistory: [],
      batches: [],
      ...newMaterial
    };
    store.materials.unshift(item);

    // Auto-log activity event in supply-chain event feed
    const evtId = `EVT-${String(store.events.length + 1).padStart(3, '0')}`;
    const activityEvent = {
      id: evtId,
      type: 'MATERIAL RECEIVED',
      entityType: 'Material',
      entityId: matId,
      status: 'Completed',
      location: item.location || 'Warehouse Main',
      performedBy: 'Receiving Team',
      description: `Material ${matId} (${item.name || ''}) registered in stock`,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    store.events.unshift(activityEvent);

    saveStore(store);
    realtime.emitEvent('MATERIAL_CREATED', { material: item, event: activityEvent });
    return Promise.resolve(item);
  },

  // Batches
  async getBatches() {
    const store = getStore();
    return Promise.resolve([...store.batches]);
  },
  async getBatchById(id) {
    if (!id) return Promise.resolve(null);
    const store = getStore();
    const item = store.batches.find((b) => b.id?.toUpperCase() === id.toUpperCase());
    return Promise.resolve(item || null);
  },
  async addBatch(newBatch) {
    const store = getStore();
    const batchId = newBatch.id?.trim() || `BAT-${String(store.batches.length + 1).padStart(3, '0')}`;
    const materialId = newBatch.materialId || (Array.isArray(newBatch.materials) && newBatch.materials[0]) || (store.materials[0]?.id);

    const item = {
      id: batchId,
      status: newBatch.status || 'Active',
      qualityStatus: newBatch.qualityStatus || 'Passed',
      outputProducts: [],
      relatedShipments: [],
      materialId: materialId || '',
      materials: materialId ? [materialId] : (newBatch.materials || []),
      stockHistory: [],
      ...newBatch
    };
    store.batches.unshift(item);

    // Auto-create relationship: Material -> Batch (HAS_BATCH)
    if (materialId) {
      const relExists = store.relationships.some(
        r => r.source === materialId && r.target === batchId && r.label === 'HAS_BATCH'
      );
      if (!relExists) {
        store.relationships.push({
          id: `rel-${materialId}-${batchId}-${Date.now()}`,
          source: materialId,
          target: batchId,
          type: 'HAS_BATCH',
          label: 'HAS_BATCH'
        });
      }

      const mat = store.materials.find(m => m.id?.toUpperCase() === materialId.toUpperCase());
      if (mat) {
        if (!Array.isArray(mat.batches)) mat.batches = [];
        if (!mat.batches.includes(batchId)) mat.batches.push(batchId);
      }
    }

    // Auto-log activity event
    const evtId = `EVT-${String(store.events.length + 1).padStart(3, '0')}`;
    const activityEvent = {
      id: evtId,
      type: 'BATCH CREATED',
      entityType: 'Batch',
      entityId: batchId,
      status: 'Active',
      location: item.location || 'Facility Bay',
      performedBy: item.operator || 'Production Supervisor',
      description: `Batch ${batchId} for ${item.process || 'manufacturing'} initiated`,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    store.events.unshift(activityEvent);

    saveStore(store);
    realtime.emitEvent('BATCH_CREATED', { batch: item, event: activityEvent });
    return Promise.resolve(item);
  },

  // Products
  async getProducts() {
    const store = getStore();
    return Promise.resolve([...store.products]);
  },
  async getProductById(id) {
    if (!id) return Promise.resolve(null);
    const store = getStore();
    const item = store.products.find((p) => p.id?.toUpperCase() === id.toUpperCase());
    return Promise.resolve(item || null);
  },
  async addProduct(newProduct) {
    const store = getStore();
    const prodId = newProduct.id?.trim() || `PROD-${String(store.products.length + 1).padStart(3, '0')}`;
    const batchId = newProduct.batchId || (Array.isArray(newProduct.batches) && newProduct.batches[0]) || (store.batches[0]?.id);

    const item = {
      id: prodId,
      status: newProduct.status || 'In Stock',
      batchId: batchId || '',
      batches: batchId ? [batchId] : (newProduct.batches || []),
      shipments: [],
      materials: [],
      customers: [],
      stockTrend: [],
      ...newProduct
    };
    store.products.unshift(item);

    // Auto-create relationship: Batch -> Product (CREATES)
    if (batchId) {
      const relExists = store.relationships.some(
        r => r.source === batchId && r.target === prodId && (r.label === 'CREATES' || r.type === 'CREATES')
      );
      if (!relExists) {
        store.relationships.push({
          id: `rel-${batchId}-${prodId}-${Date.now()}`,
          source: batchId,
          target: prodId,
          type: 'CREATES',
          label: 'CREATES'
        });
      }

      const bat = store.batches.find(b => b.id?.toUpperCase() === batchId.toUpperCase());
      if (bat) {
        if (!Array.isArray(bat.outputProducts)) bat.outputProducts = [];
        if (!bat.outputProducts.includes(prodId)) bat.outputProducts.push(prodId);
      }
    }

    // Auto-log activity event
    const evtId = `EVT-${String(store.events.length + 1).padStart(3, '0')}`;
    const activityEvent = {
      id: evtId,
      type: 'PRODUCTION COMPLETE',
      entityType: 'Product',
      entityId: prodId,
      status: 'Completed',
      location: 'Assembly Floor',
      performedBy: 'Assembly Line',
      description: `Product ${prodId} (${item.name || ''}) output completed`,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    store.events.unshift(activityEvent);

    saveStore(store);
    realtime.emitEvent('PRODUCT_CREATED', { product: item, event: activityEvent });
    return Promise.resolve(item);
  },

  // Shipments
  async getShipments() {
    const store = getStore();
    return Promise.resolve([...store.shipments]);
  },
  async getShipmentById(id) {
    if (!id) return Promise.resolve(null);
    const store = getStore();
    const item = store.shipments.find((s) => s.id?.toUpperCase() === id.toUpperCase());
    return Promise.resolve(item || null);
  },
  async addShipment(newShipment) {
    const store = getStore();
    const shipId = newShipment.id?.trim() || `SHIP-${String(store.shipments.length + 1).padStart(3, '0')}`;
    
    // Determine Product ID
    let productId = newShipment.productId;
    if (!productId && newShipment.product) {
      const match = store.products.find(
        p => p.id?.toUpperCase() === newShipment.product.toUpperCase() ||
             p.name?.toLowerCase() === newShipment.product.toLowerCase()
      );
      if (match) productId = match.id;
    }
    if (!productId && store.products.length > 0) {
      productId = store.products[0].id;
    }

    // Determine Customer ID
    let customerId = newShipment.customerId;
    if (!customerId && newShipment.customer) {
      const match = store.customers.find(
        c => c.id?.toUpperCase() === newShipment.customer.toUpperCase() ||
             c.name?.toLowerCase() === newShipment.customer.toLowerCase()
      );
      if (match) customerId = match.id;
    }
    if (!customerId && store.customers.length > 0) {
      customerId = store.customers[0].id;
    }

    const item = {
      id: shipId,
      productId: productId || '',
      customerId: customerId || '',
      status: newShipment.status || 'In Transit',
      distanceTotal: '--',
      distanceCovered: '--',
      progressPercent: 30,
      checkpoints: [],
      ...newShipment
    };
    store.shipments.unshift(item);

    // Auto-create relationship: Product -> Shipment (SHIPS)
    if (productId) {
      const relExists = store.relationships.some(
        r => r.source === productId && r.target === shipId && r.label === 'SHIPS'
      );
      if (!relExists) {
        store.relationships.push({
          id: `rel-${productId}-${shipId}-${Date.now()}`,
          source: productId,
          target: shipId,
          type: 'SHIPS',
          label: 'SHIPS'
        });
      }

      const prod = store.products.find(p => p.id?.toUpperCase() === productId.toUpperCase());
      if (prod) {
        if (!Array.isArray(prod.shipments)) prod.shipments = [];
        if (!prod.shipments.includes(shipId)) prod.shipments.push(shipId);
      }
    }

    // Auto-create relationship: Shipment -> Customer (DELIVERED_TO)
    if (customerId) {
      const relExists = store.relationships.some(
        r => r.source === shipId && r.target === customerId && r.label === 'DELIVERED_TO'
      );
      if (!relExists) {
        store.relationships.push({
          id: `rel-${shipId}-${customerId}-${Date.now()}`,
          source: shipId,
          target: customerId,
          type: 'DELIVERED_TO',
          label: 'DELIVERED_TO'
        });
      }

      const cust = store.customers.find(c => c.id?.toUpperCase() === customerId.toUpperCase());
      if (cust) {
        if (!Array.isArray(cust.shipmentIds)) cust.shipmentIds = [];
        if (!cust.shipmentIds.includes(shipId)) cust.shipmentIds.push(shipId);
      }
    }

    // Auto-log activity event
    const evtId = `EVT-${String(store.events.length + 1).padStart(3, '0')}`;
    const activityEvent = {
      id: evtId,
      type: 'SHIPMENT DISPATCHED',
      entityType: 'Shipment',
      entityId: shipId,
      status: 'In Transit',
      location: item.origin || 'Distribution Center',
      performedBy: item.transporter || 'Freight Carrier',
      description: `Shipment ${shipId} departed for ${item.destination || 'destination'}`,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    store.events.unshift(activityEvent);

    saveStore(store);
    realtime.emitEvent('SHIPMENT_CREATED', { shipment: item, event: activityEvent });
    return Promise.resolve(item);
  },

  // Customers
  async getCustomers() {
    const store = getStore();
    return Promise.resolve([...store.customers]);
  },
  async getCustomerById(id) {
    if (!id) return Promise.resolve(null);
    const store = getStore();
    const item = store.customers.find((c) => c.id?.toUpperCase() === id.toUpperCase());
    return Promise.resolve(item || null);
  },
  async addCustomer(newCustomer) {
    const store = getStore();
    const custId = newCustomer.id?.trim() || `CUS-${String(store.customers.length + 1).padStart(3, '0')}`;
    const item = {
      id: custId,
      totalOrders: 0,
      totalShipments: 0,
      status: newCustomer.status || 'Active',
      customerSince: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      orders: [],
      shipmentIds: [],
      materialsUsed: [],
      ...newCustomer
    };
    store.customers.unshift(item);

    // Auto-log activity event
    const evtId = `EVT-${String(store.events.length + 1).padStart(3, '0')}`;
    const activityEvent = {
      id: evtId,
      type: 'CUSTOMER ONBOARDED',
      entityType: 'Customer',
      entityId: custId,
      status: 'Active',
      location: item.location || 'Headquarters',
      performedBy: 'Sales Operations',
      description: `Client account ${custId} (${item.name || ''}) activated`,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    store.events.unshift(activityEvent);

    saveStore(store);
    realtime.emitEvent('CUSTOMER_CREATED', { customer: item, event: activityEvent });
    return Promise.resolve(item);
  },

  // Events
  async getEvents() {
    const store = getStore();
    return Promise.resolve([...store.events]);
  },
  async addEvent(newEvent) {
    const store = getStore();
    const evtId = newEvent.id?.trim() || `EVT-${String(store.events.length + 1).padStart(3, '0')}`;
    const targetEntityId = newEvent.entityId || (store.batches[0]?.id);

    const item = {
      id: evtId,
      type: newEvent.type || 'Quality Check',
      entityType: newEvent.entityType || 'Batch',
      entityId: targetEntityId || '',
      status: newEvent.status || 'Completed',
      location: newEvent.location || 'QA Testing Lab',
      performedBy: newEvent.performedBy || 'System Auditor',
      description: newEvent.description || 'Logged in system',
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      lifecycle: [
        { step: newEvent.type || 'Event Logged', time: 'Just now', status: 'Completed', note: newEvent.description || 'Logged in system' }
      ],
      ...newEvent
    };
    store.events.unshift(item);

    // Auto-create relationship: Entity -> Event (HAS_EVENT)
    if (targetEntityId) {
      const relExists = store.relationships.some(
        r => r.source === targetEntityId && r.target === evtId && r.label === 'HAS_EVENT'
      );
      if (!relExists) {
        store.relationships.push({
          id: `rel-${targetEntityId}-${evtId}-${Date.now()}`,
          source: targetEntityId,
          target: evtId,
          type: 'HAS_EVENT',
          label: 'HAS_EVENT'
        });
      }
    }

    saveStore(store);
    realtime.emitEvent('EVENT_LOGGED', { event: item, targetEntityId });
    return Promise.resolve(item);
  },

  // Reports
  async getReports() {
    const store = getStore();
    return Promise.resolve([...store.reports]);
  },
  async addReport(newReport) {
    const store = getStore();
    const item = {
      id: `REP-${new Date().getFullYear()}-${String(store.reports.length + 1).padStart(3, '0')}`,
      generatedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Ready',
      fileSize: '1.2 MB',
      format: 'PDF / CSV',
      ...newReport
    };
    store.reports.unshift(item);
    saveStore(store);
    return Promise.resolve(item);
  },

  // Dynamic Graph Generation from stored application entities & relationships
  async getGraph() {
    const store = getStore();
    const graph = buildGraphData(store);
    return Promise.resolve(graph);
  },

  async getGraphData() {
    return this.getGraph();
  },

  // Upstream query
  async getUpstream(nodeId) {
    const graph = await this.getGraph();
    return Promise.resolve(computeUpstream(nodeId, graph.nodes, graph.edges));
  },

  // Downstream query
  async getDownstream(nodeId) {
    const graph = await this.getGraph();
    return Promise.resolve(computeDownstream(nodeId, graph.nodes, graph.edges));
  },

  // Impact query
  async getImpact(nodeId) {
    const graph = await this.getGraph();
    return Promise.resolve(computeImpact(nodeId, graph.nodes, graph.edges));
  },

  // Unified Trace Entity Journey
  async getTrace(entityId) {
    return this.traceEntity(entityId);
  },

  async traceEntity(entityId) {
    const id = entityId?.trim().toUpperCase();
    if (!id) return null;

    const store = getStore();
    const { materials, batches, products, shipments, customers, events } = store;

    // Check material
    const mat = materials.find((m) => m.id?.toUpperCase() === id);
    if (mat) {
      const relatedBatches = batches.filter(b => b.materialId?.toUpperCase() === id || b.materials?.some(mId => mId.toUpperCase() === id));
      const relatedProdIds = relatedBatches.flatMap(b => b.outputProducts || []);
      const relatedProducts = products.filter(p => relatedProdIds.includes(p.id) || relatedBatches.some(b => b.id === p.batchId));
      const relatedShipments = shipments.filter(s => relatedProducts.some(p => p.id === s.productId || p.name === s.product));

      const path = [
        { type: 'Raw Material', id: mat.id, name: mat.name, detail: `Supplier: ${mat.supplier || '--'}`, date: mat.lastRestocked || '--', status: mat.status }
      ];
      if (relatedBatches[0]) {
        path.push({ type: 'Manufacturing', id: relatedBatches[0].id, name: relatedBatches[0].name, detail: `${relatedBatches[0].quantity || '--'} ${relatedBatches[0].unit || ''}`, date: relatedBatches[0].productionDate || '--', status: relatedBatches[0].status });
      }
      if (relatedProducts[0]) {
        path.push({ type: 'Finished Product', id: relatedProducts[0].id, name: relatedProducts[0].name, detail: `Qty: ${relatedProducts[0].currentStock || '--'} ${relatedProducts[0].unit || ''}`, date: relatedProducts[0].createdDate || '--', status: relatedProducts[0].status });
      }
      if (relatedShipments[0]) {
        path.push({ type: 'Outbound Shipment', id: relatedShipments[0].id, name: `${relatedShipments[0].origin || '--'} → ${relatedShipments[0].destination || '--'}`, detail: `${relatedShipments[0].transporter || '--'}`, date: relatedShipments[0].departure || '--', status: relatedShipments[0].status });
      }

      return {
        matchedEntity: { ...mat, type: 'Material', category: 'material' },
        tracePath: path,
        recentEvents: events.filter((e) => e.entityId?.toUpperCase() === mat.id.toUpperCase())
      };
    }

    // Check batch
    const batch = batches.find((b) => b.id?.toUpperCase() === id);
    if (batch) {
      const sourceMat = materials.find(m => m.id === batch.materialId || batch.materials?.includes(m.id)) || materials[0];
      const relatedProducts = products.filter(p => p.batchId === batch.id || batch.outputProducts?.includes(p.id));
      const relatedShipments = shipments.filter(s => relatedProducts.some(p => p.id === s.productId || p.name === s.product));

      const path = [];
      if (sourceMat) {
        path.push({ type: 'Raw Material', id: sourceMat.id, name: sourceMat.name, detail: `Supplier: ${sourceMat.supplier || '--'}`, date: sourceMat.lastRestocked || '--', status: sourceMat.status });
      }
      path.push({ type: 'Manufacturing', id: batch.id, name: batch.name, detail: `${batch.quantity || '--'} ${batch.unit || ''}`, date: batch.productionDate || '--', status: batch.status });
      if (relatedProducts[0]) {
        path.push({ type: 'Finished Product', id: relatedProducts[0].id, name: relatedProducts[0].name, detail: `Qty: ${relatedProducts[0].currentStock || '--'} ${relatedProducts[0].unit || ''}`, date: relatedProducts[0].createdDate || '--', status: relatedProducts[0].status });
      }
      if (relatedShipments[0]) {
        path.push({ type: 'Outbound Shipment', id: relatedShipments[0].id, name: `${relatedShipments[0].origin || '--'} → ${relatedShipments[0].destination || '--'}`, detail: `${relatedShipments[0].transporter || '--'}`, date: relatedShipments[0].departure || '--', status: relatedShipments[0].status });
      }

      return {
        matchedEntity: { ...batch, type: 'Batch', category: 'batch' },
        tracePath: path,
        recentEvents: events.filter((e) => e.entityId?.toUpperCase() === batch.id.toUpperCase())
      };
    }

    // Check product
    const prod = products.find((p) => p.id?.toUpperCase() === id);
    if (prod) {
      const batchItem = batches.find(b => b.id === prod.batchId || prod.batches?.includes(b.id));
      const sourceMat = batchItem ? materials.find(m => m.id === batchItem.materialId || batchItem.materials?.includes(m.id)) : null;
      const relatedShipments = shipments.filter(s => s.productId === prod.id || s.product === prod.name);

      const path = [];
      if (sourceMat) {
        path.push({ type: 'Raw Material', id: sourceMat.id, name: sourceMat.name, detail: `Supplier: ${sourceMat.supplier || '--'}`, date: sourceMat.lastRestocked || '--', status: sourceMat.status });
      }
      if (batchItem) {
        path.push({ type: 'Manufacturing', id: batchItem.id, name: batchItem.name, detail: `${batchItem.quantity || '--'} ${batchItem.unit || ''}`, date: batchItem.productionDate || '--', status: batchItem.status });
      }
      path.push({ type: 'Finished Product', id: prod.id, name: prod.name, detail: `Qty: ${prod.currentStock || '--'} ${prod.unit || ''}`, date: prod.createdDate || '--', status: prod.status });
      if (relatedShipments[0]) {
        path.push({ type: 'Outbound Shipment', id: relatedShipments[0].id, name: `${relatedShipments[0].origin || '--'} → ${relatedShipments[0].destination || '--'}`, detail: `${relatedShipments[0].transporter || '--'}`, date: relatedShipments[0].departure || '--', status: relatedShipments[0].status });
      }

      return {
        matchedEntity: { ...prod, type: 'Product', category: 'product' },
        tracePath: path,
        recentEvents: events.filter((e) => e.entityId?.toUpperCase() === prod.id.toUpperCase())
      };
    }

    // Check shipment
    const shp = shipments.find((s) => s.id?.toUpperCase() === id);
    if (shp) {
      const prodItem = products.find(p => p.id === shp.productId || p.name === shp.product);
      const batchItem = prodItem ? batches.find(b => b.id === prodItem.batchId) : null;
      const sourceMat = batchItem ? materials.find(m => m.id === batchItem.materialId) : null;
      const custItem = customers.find(c => c.id === shp.customerId || shp.destination?.includes(c.location));

      const path = [];
      if (sourceMat) path.push({ type: 'Raw Material', id: sourceMat.id, name: sourceMat.name, detail: `Supplier: ${sourceMat.supplier || '--'}`, date: sourceMat.lastRestocked || '--', status: sourceMat.status });
      if (batchItem) path.push({ type: 'Manufacturing', id: batchItem.id, name: batchItem.name, detail: `${batchItem.quantity || '--'} ${batchItem.unit || ''}`, date: batchItem.productionDate || '--', status: batchItem.status });
      if (prodItem) path.push({ type: 'Finished Product', id: prodItem.id, name: prodItem.name, detail: `Qty: ${prodItem.currentStock || '--'} ${prodItem.unit || ''}`, date: prodItem.createdDate || '--', status: prodItem.status });
      path.push({ type: 'Outbound Shipment', id: shp.id, name: `${shp.origin || '--'} → ${shp.destination || '--'}`, detail: `${shp.transporter || '--'}`, date: shp.departure || '--', status: shp.status });
      if (custItem) path.push({ type: 'Customer', id: custItem.id, name: custItem.name, detail: `${custItem.industry || '--'} • ${custItem.location || '--'}`, date: custItem.customerSince || '--', status: custItem.status });

      return {
        matchedEntity: { ...shp, type: 'Shipment', category: 'shipment' },
        tracePath: path,
        recentEvents: events.filter((e) => e.entityId?.toUpperCase() === shp.id.toUpperCase())
      };
    }

    // Check customer
    const cust = customers.find((c) => c.id?.toUpperCase() === id);
    if (cust) {
      return {
        matchedEntity: { ...cust, type: 'Customer', category: 'customer' },
        tracePath: [
          { type: 'Customer', id: cust.id, name: cust.name, detail: `${cust.industry || '--'} • ${cust.location || '--'}`, date: cust.customerSince || '--', status: cust.status }
        ],
        recentEvents: events.filter((e) => e.entityId?.toUpperCase() === cust.id.toUpperCase())
      };
    }

    // Check event
    const evt = events.find((e) => e.id?.toUpperCase() === id);
    if (evt) {
      return {
        matchedEntity: { ...evt, type: 'Event', category: 'event' },
        tracePath: [
          { type: 'Quality Event', id: evt.id, name: evt.type, detail: evt.description, date: evt.timestamp, status: evt.status }
        ],
        recentEvents: [evt]
      };
    }

    return null;
  },

  // Global search across all entities
  async globalSearch(query) {
    if (!query || query.trim() === '') return [];
    const q = query.toLowerCase().trim();
    const results = [];
    const store = getStore();

    store.materials.forEach((m) => {
      if (m.id?.toLowerCase().includes(q) || m.name?.toLowerCase().includes(q) || m.supplier?.toLowerCase().includes(q)) {
        results.push({ id: m.id, name: m.name, type: 'Material', subtitle: m.supplier, category: 'material', link: '/materials' });
      }
    });

    store.batches.forEach((b) => {
      if (b.id?.toLowerCase().includes(q) || b.name?.toLowerCase().includes(q) || b.process?.toLowerCase().includes(q)) {
        results.push({ id: b.id, name: b.name, type: 'Batch', subtitle: `${b.quantity} ${b.unit}`, category: 'batch', link: '/batches' });
      }
    });

    store.products.forEach((p) => {
      if (p.id?.toLowerCase().includes(q) || p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)) {
        results.push({ id: p.id, name: p.name, type: 'Product', subtitle: `${p.currentStock} ${p.unit}`, category: 'product', link: '/products' });
      }
    });

    store.shipments.forEach((s) => {
      if (s.id?.toLowerCase().includes(q) || s.product?.toLowerCase().includes(q) || s.origin?.toLowerCase().includes(q) || s.destination?.toLowerCase().includes(q)) {
        results.push({ id: s.id, name: `${s.origin} → ${s.destination}`, type: 'Shipment', subtitle: s.product, category: 'shipment', link: '/shipments' });
      }
    });

    store.customers.forEach((c) => {
      if (c.id?.toLowerCase().includes(q) || c.name?.toLowerCase().includes(q) || c.location?.toLowerCase().includes(q)) {
        results.push({ id: c.id, name: c.name, type: 'Customer', subtitle: c.location, category: 'customer', link: '/customers' });
      }
    });

    return Promise.resolve(results);
  }
};
