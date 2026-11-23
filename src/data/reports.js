export const shipmentTrendData = [
  { month: 'Aug', Delivered: 52, InTransit: 18, Delayed: 3 },
  { month: 'Sep', Delivered: 64, InTransit: 22, Delayed: 5 },
  { month: 'Oct', Delivered: 71, InTransit: 26, Delayed: 2 },
  { month: 'Nov', Delivered: 85, InTransit: 31, Delayed: 6 },
  { month: 'Dec', Delivered: 94, InTransit: 35, Delayed: 4 },
  { month: 'Jan', Delivered: 108, InTransit: 42, Delayed: 7 }
];

export const materialUsageData = [
  { name: 'Aluminum 6061', usage: 1250, unit: 'kg' },
  { name: 'Lithium Carb.', usage: 850, unit: 'kg' },
  { name: 'Carbon Fiber T800', usage: 620, unit: 'm²' },
  { name: 'Titanium Ti-6Al-4V', usage: 480, unit: 'kg' },
  { name: 'Silicon 300mm', usage: 350, unit: 'ingots' },
  { name: 'Copper Clad FR-4', usage: 540, unit: 'panels' }
];

export const shipmentStatusData = [
  { name: 'Delivered', value: 142, color: '#10b981' },
  { name: 'In Transit', value: 38, color: '#3b82f6' },
  { name: 'Delayed', value: 8, color: '#f59e0b' },
  { name: 'Pending', value: 16, color: '#94a3b8' }
];

export const eventsByTypeData = [
  { type: 'Quality Check', count: 320 },
  { type: 'Material Received', count: 245 },
  { type: 'Production Batch', count: 198 },
  { type: 'Shipment Dispatched', count: 164 },
  { type: 'Inspection', count: 112 },
  { type: 'Customs & Transfer', count: 86 }
];

export const topCustomersData = [
  { name: 'AeroTech Dynamics', orders: 48, spend: '$542,000' },
  { name: 'VoltDrive Motors', orders: 42, spend: '$476,500' },
  { name: 'OmniHealth Surgical', orders: 36, spend: '$389,000' },
  { name: 'Apex Hypercars', orders: 29, spend: '$312,400' },
  { name: 'Solaria Energy AG', orders: 24, spend: '$268,000' }
];

export const initialRecentReports = [
  {
    id: 'REP-2025-001',
    name: 'Global Supply Chain Traceability Audit',
    type: 'Material Report',
    dateRange: 'Last 30 Days',
    generatedOn: 'Jan 22, 2025',
    status: 'Ready',
    fileSize: '3.4 MB'
  },
  {
    id: 'REP-2025-002',
    name: 'In-Transit Logistics & Carrier Performance',
    type: 'Shipment Performance',
    dateRange: 'Q4 2024',
    generatedOn: 'Jan 18, 2025',
    status: 'Ready',
    fileSize: '2.1 MB'
  },
  {
    id: 'REP-2025-003',
    name: 'ISO 13485 & FAA Regulatory Compliance',
    type: 'Quality Audit',
    dateRange: 'Year-to-Date',
    generatedOn: 'Jan 15, 2025',
    status: 'Ready',
    fileSize: '4.8 MB'
  },
  {
    id: 'REP-2025-004',
    name: 'Raw Material Stock & Safety Buffer Assessment',
    type: 'Inventory Report',
    dateRange: 'Last 90 Days',
    generatedOn: 'Jan 10, 2025',
    status: 'Ready',
    fileSize: '1.9 MB'
  },
  {
    id: 'REP-2025-005',
    name: 'Key Customer Order Delivery & Fulfillment',
    type: 'Customer Report',
    dateRange: 'Full Year 2024',
    generatedOn: 'Jan 05, 2025',
    status: 'Ready',
    fileSize: '5.2 MB'
  },
  {
    id: 'REP-2025-006',
    name: 'Supplier On-Time Delivery & Purity Matrix',
    type: 'Supplier Audit',
    dateRange: 'Q4 2024',
    generatedOn: 'Dec 28, 2024',
    status: 'Ready',
    fileSize: '2.7 MB'
  }
];
