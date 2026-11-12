/**
 * MaterialIQ Storage Service
 * Unified localStorage persistence for all entities and relationships.
 */

const STORAGE_KEY = 'materialiq_store';

// Default seeded data matching the existing application state
const defaultStore = {
  materials: [
    {
      id: 'MAT-001',
      name: 'Aluminum Alloy 6061',
      category: 'Metal',
      supplier: 'Apex Metallurgy Corp',
      currentStock: 1250,
      unit: 'kg',
      status: 'In Stock',
      reorderLevel: 300,
      leadTime: '5 days',
      location: 'Warehouse A-12',
      description: 'Aircraft-grade structural aluminum billet',
      batches: ['BAT-001']
    }
  ],
  batches: [
    {
      id: 'BAT-001',
      name: 'Milling Run Alpha',
      process: 'Precision CNC Extrusion',
      materials: ['MAT-001'],
      materialId: 'MAT-001',
      supplier: 'Apex Metallurgy Corp',
      productionDate: '2025-01-15',
      expiryDate: '2026-01-15',
      quantity: 450,
      unit: 'kg',
      status: 'Active',
      qualityStatus: 'Passed',
      location: 'Facility Bay 4',
      operator: 'Marcus Vance',
      outputProducts: ['PROD-001']
    }
  ],
  products: [
    {
      id: 'PROD-001',
      name: 'Precision Rotor Shaft',
      category: 'Automotive',
      batchId: 'BAT-001',
      batches: ['BAT-001'],
      currentStock: 320,
      unit: 'pcs',
      unitPrice: '$185.00',
      status: 'In Stock',
      description: 'High-tolerance drive rotor component',
      shipments: ['SHIP-001']
    }
  ],
  shipments: [
    {
      id: 'SHIP-001',
      product: 'Precision Rotor Shaft',
      productId: 'PROD-001',
      customerId: 'CUS-001',
      customer: 'AeroTech Dynamics',
      quantity: 120,
      unit: 'units',
      origin: 'Cleveland Plant',
      destination: 'Detroit Logistics Center',
      departure: '2025-01-20',
      eta: '2025-01-22',
      transporter: 'Titan Freightways',
      vehicleNumber: 'TRK-8821',
      driver: 'Robert Diaz',
      contact: '+1 555-0192',
      status: 'In Transit',
      distanceTotal: '280 miles',
      distanceCovered: '195 miles',
      progressPercent: 70
    }
  ],
  customers: [
    {
      id: 'CUS-001',
      name: 'AeroTech Dynamics',
      type: 'Manufacturer',
      industry: 'Aerospace & Defense',
      location: 'Detroit, MI',
      contactPerson: 'Sarah Jenkins',
      email: 'sjenkins@aerotechdynamics.com',
      phone: '+1 (313) 555-0144',
      status: 'Active',
      totalOrders: 14,
      totalShipments: 8,
      customerSince: 'Mar 15, 2023',
      shipmentIds: ['SHIP-001'],
      orders: [
        {
          orderId: 'ORD-9021',
          product: 'Precision Rotor Shaft',
          value: '$22,200',
          date: 'Jan 18, 2025',
          status: 'In Transit'
        }
      ],
      materialsUsed: ['Aluminum Alloy 6061']
    }
  ],
  events: [
    {
      id: 'EVT-001',
      type: 'Quality Check',
      entityType: 'Batch',
      entityId: 'BAT-001',
      status: 'Completed',
      location: 'QA Testing Lab 2',
      performedBy: 'Dr. Elena Rostova',
      description: 'Metallurgical stress & tolerance validation passed 99.8%',
      timestamp: 'Jan 16, 2025, 14:30'
    }
  ],
  reports: [],
  relationships: [
    {
      id: 'rel-mat-bat-001',
      source: 'MAT-001',
      target: 'BAT-001',
      type: 'HAS_BATCH',
      label: 'HAS_BATCH'
    },
    {
      id: 'rel-bat-prod-001',
      source: 'BAT-001',
      target: 'PROD-001',
      type: 'CREATES',
      label: 'CREATES'
    },
    {
      id: 'rel-prod-ship-001',
      source: 'PROD-001',
      target: 'SHIP-001',
      type: 'SHIPS',
      label: 'SHIPS'
    },
    {
      id: 'rel-ship-cus-001',
      source: 'SHIP-001',
      target: 'CUS-001',
      type: 'DELIVERED_TO',
      label: 'DELIVERED_TO'
    },
    {
      id: 'rel-bat-evt-001',
      source: 'BAT-001',
      target: 'EVT-001',
      type: 'HAS_EVENT',
      label: 'HAS_EVENT'
    }
  ]
};

/**
 * Load store from localStorage or return initialized default
 */
export function getStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveStore(defaultStore);
      return JSON.parse(JSON.stringify(defaultStore));
    }
    const parsed = JSON.parse(raw);
    
    // Ensure all arrays exist
    const store = {
      materials: Array.isArray(parsed.materials) ? parsed.materials : [],
      batches: Array.isArray(parsed.batches) ? parsed.batches : [],
      products: Array.isArray(parsed.products) ? parsed.products : [],
      shipments: Array.isArray(parsed.shipments) ? parsed.shipments : [],
      customers: Array.isArray(parsed.customers) ? parsed.customers : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
      reports: Array.isArray(parsed.reports) ? parsed.reports : [],
      relationships: Array.isArray(parsed.relationships) ? parsed.relationships : []
    };

    // If completely empty or missing MAT-001 / BAT-001 / PROD-001 / SHIP-001 / CUS-001 / EVT-001, seed defaults
    if (store.materials.length === 0 && store.batches.length === 0 && store.products.length === 0) {
      saveStore(defaultStore);
      return JSON.parse(JSON.stringify(defaultStore));
    }

    // Ensure the required base relationships exist if the base entities are present
    const edgeExists = (source, target, label) => 
      store.relationships.some(r => r.source === source && r.target === target && r.label === label);

    defaultStore.relationships.forEach(defRel => {
      if (!edgeExists(defRel.source, defRel.target, defRel.label)) {
        // Check if both entities exist in store
        const hasSource = store.materials.some(m => m.id === defRel.source) ||
                          store.batches.some(b => b.id === defRel.source) ||
                          store.products.some(p => p.id === defRel.source) ||
                          store.shipments.some(s => s.id === defRel.source) ||
                          store.customers.some(c => c.id === defRel.source);
        const hasTarget = store.materials.some(m => m.id === defRel.target) ||
                          store.batches.some(b => b.id === defRel.target) ||
                          store.products.some(p => p.id === defRel.target) ||
                          store.shipments.some(s => s.id === defRel.target) ||
                          store.customers.some(c => c.id === defRel.target) ||
                          store.events.some(e => e.id === defRel.target);
        if (hasSource && hasTarget) {
          store.relationships.push(defRel);
        }
      }
    });

    return store;
  } catch (err) {
    console.error('Error reading MaterialIQ store:', err);
    return JSON.parse(JSON.stringify(defaultStore));
  }
}

/**
 * Save store to localStorage and broadcast change event
 */
export function saveStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('materialiq_storage_updated'));
    }
  } catch (err) {
    console.error('Error saving MaterialIQ store:', err);
  }
}

/**
 * Add or update a relationship
 */
export function upsertRelationship(source, target, type, label) {
  if (!source || !target) return;
  const store = getStore();
  const relLabel = label || type;
  const existing = store.relationships.find(
    (r) => r.source === source && r.target === target && (r.label === relLabel || r.type === type)
  );
  if (!existing) {
    store.relationships.push({
      id: `rel-${source}-${target}-${Date.now()}`,
      source,
      target,
      type: type || relLabel,
      label: relLabel
    });
    saveStore(store);
  }
}
