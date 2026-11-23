/**
 * MaterialIQ Storage Service
 * Unified localStorage persistence for all entities and relationships.
 */

const STORAGE_KEY = 'materialiq_store';

// Default seeded data matching all modules with rich interconnected relationships
export const defaultStore = {
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
      description: 'Aircraft-grade structural aluminum billet for precision aerospace milling',
      batches: ['BAT-001'],
      stockHistory: [
        { month: 'Aug', stock: 1100 },
        { month: 'Sep', stock: 950 },
        { month: 'Oct', stock: 1400 },
        { month: 'Nov', stock: 1300 },
        { month: 'Dec', stock: 1150 },
        { month: 'Jan', stock: 1250 }
      ]
    },
    {
      id: 'MAT-002',
      name: 'Lithium Carbonate Battery Grade',
      category: 'Chemical',
      supplier: 'Nordic Lithium Ltd',
      currentStock: 850,
      unit: 'kg',
      status: 'In Stock',
      reorderLevel: 200,
      leadTime: '8 days',
      location: 'Chemical Storage Vault B-3',
      description: 'Ultra-pure (99.95%) lithium precursor for high-density EV cathode production',
      batches: ['BAT-002'],
      stockHistory: [
        { month: 'Aug', stock: 600 },
        { month: 'Sep', stock: 750 },
        { month: 'Oct', stock: 900 },
        { month: 'Nov', stock: 800 },
        { month: 'Dec', stock: 920 },
        { month: 'Jan', stock: 850 }
      ]
    },
    {
      id: 'MAT-003',
      name: 'Carbon Fiber Prepreg Toray T800',
      category: 'Composite',
      supplier: 'Hexcel Composites',
      currentStock: 620,
      unit: 'm²',
      status: 'In Stock',
      reorderLevel: 150,
      leadTime: '12 days',
      location: 'Cold Storage Room C-1',
      description: 'High tensile strength carbon epoxy prepreg for monocoque chassis fabrication',
      batches: ['BAT-003'],
      stockHistory: [
        { month: 'Aug', stock: 450 },
        { month: 'Sep', stock: 520 },
        { month: 'Oct', stock: 680 },
        { month: 'Nov', stock: 600 },
        { month: 'Dec', stock: 580 },
        { month: 'Jan', stock: 620 }
      ]
    },
    {
      id: 'MAT-004',
      name: 'Titanium Medical Ti-6Al-4V ELI',
      category: 'Metal',
      supplier: 'Carpenter Technology',
      currentStock: 480,
      unit: 'kg',
      status: 'In Stock',
      reorderLevel: 100,
      leadTime: '10 days',
      location: 'Cleanroom Depot M-1',
      description: 'Biocompatible extra-low interstitial grade 23 titanium for orthopedic surgical implants',
      batches: ['BAT-004'],
      stockHistory: [
        { month: 'Aug', stock: 320 },
        { month: 'Sep', stock: 410 },
        { month: 'Oct', stock: 390 },
        { month: 'Nov', stock: 450 },
        { month: 'Dec', stock: 510 },
        { month: 'Jan', stock: 480 }
      ]
    },
    {
      id: 'MAT-005',
      name: 'Medical Polymer PEEK Optima',
      category: 'Polymer',
      supplier: 'Invibio Biomaterial',
      currentStock: 310,
      unit: 'kg',
      status: 'In Stock',
      reorderLevel: 80,
      leadTime: '14 days',
      location: 'Sterile Bin P-09',
      description: 'Radiolucent implantable thermoplastic with mechanical properties matching cortical bone',
      batches: ['BAT-005'],
      stockHistory: [
        { month: 'Aug', stock: 210 },
        { month: 'Sep', stock: 260 },
        { month: 'Oct', stock: 290 },
        { month: 'Nov', stock: 340 },
        { month: 'Dec', stock: 300 },
        { month: 'Jan', stock: 310 }
      ]
    },
    {
      id: 'MAT-006',
      name: 'Silicon Monocrystalline Ingot 300mm',
      category: 'Semiconductor',
      supplier: 'Shin-Etsu Handotai',
      currentStock: 175,
      unit: 'ingots',
      status: 'In Stock',
      reorderLevel: 50,
      leadTime: '21 days',
      location: 'Fab Clean Bay Alpha',
      description: 'Zero-defect electronic-grade crystalline silicon for microinverter semiconductors',
      batches: ['BAT-006'],
      stockHistory: [
        { month: 'Aug', stock: 120 },
        { month: 'Sep', stock: 145 },
        { month: 'Oct', stock: 160 },
        { month: 'Nov', stock: 190 },
        { month: 'Dec', stock: 180 },
        { month: 'Jan', stock: 175 }
      ]
    },
    {
      id: 'MAT-007',
      name: 'High-TG Copper Clad Laminate FR-4',
      category: 'Electronics',
      supplier: 'Isola Group',
      currentStock: 540,
      unit: 'panels',
      status: 'In Stock',
      reorderLevel: 120,
      leadTime: '7 days',
      location: 'Warehouse B-04',
      description: 'Multilayer high thermal reliability PCB laminate for heavy-duty power electronics',
      batches: ['BAT-007'],
      stockHistory: [
        { month: 'Aug', stock: 400 },
        { month: 'Sep', stock: 460 },
        { month: 'Oct', stock: 520 },
        { month: 'Nov', stock: 610 },
        { month: 'Dec', stock: 570 },
        { month: 'Jan', stock: 540 }
      ]
    },
    {
      id: 'MAT-008',
      name: 'NdFeB Neodymium Magnet Alloy',
      category: 'Metal',
      supplier: 'Hitachi Metals',
      currentStock: 390,
      unit: 'kg',
      status: 'In Stock',
      reorderLevel: 90,
      leadTime: '15 days',
      location: 'Magnetic Shield Bay 2',
      description: 'Sintered rare-earth permanent magnetic material for high-torque brushless stators',
      batches: ['BAT-008'],
      stockHistory: [
        { month: 'Aug', stock: 280 },
        { month: 'Sep', stock: 330 },
        { month: 'Oct', stock: 360 },
        { month: 'Nov', stock: 410 },
        { month: 'Dec', stock: 375 },
        { month: 'Jan', stock: 390 }
      ]
    },
    {
      id: 'MAT-009',
      name: 'Neoprene Industrial Elastomer',
      category: 'Polymer',
      supplier: 'DuPont Dow Elastomers',
      currentStock: 180,
      unit: 'kg',
      status: 'Low Stock',
      reorderLevel: 250,
      leadTime: '6 days',
      location: 'Chemical Rack C-11',
      description: 'Oil, ozone, and flame resistant chloroprene rubber compound for critical hermetic seals',
      batches: ['BAT-009'],
      stockHistory: [
        { month: 'Aug', stock: 380 },
        { month: 'Sep', stock: 320 },
        { month: 'Oct', stock: 280 },
        { month: 'Nov', stock: 240 },
        { month: 'Dec', stock: 210 },
        { month: 'Jan', stock: 180 }
      ]
    },
    {
      id: 'MAT-010',
      name: 'Tungsten Carbide Micro-Grain Powder',
      category: 'Ceramic',
      supplier: 'Kennametal Inc',
      currentStock: 0,
      unit: 'kg',
      status: 'Out of Stock',
      reorderLevel: 100,
      leadTime: '18 days',
      location: 'Hard Metal Bin K-02',
      description: 'Ultra-hard refractory tungsten carbide cobalt binder matrix for extreme wear tooling',
      batches: ['BAT-010'],
      stockHistory: [
        { month: 'Aug', stock: 210 },
        { month: 'Sep', stock: 160 },
        { month: 'Oct', stock: 110 },
        { month: 'Nov', stock: 65 },
        { month: 'Dec', stock: 20 },
        { month: 'Jan', stock: 0 }
      ]
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
    },
    {
      id: 'BAT-002',
      name: 'Cathode Slurry & Calendering',
      process: 'Electrode Roll Coating',
      materials: ['MAT-002'],
      materialId: 'MAT-002',
      supplier: 'Nordic Lithium Ltd',
      productionDate: '2025-01-18',
      expiryDate: '2026-06-30',
      quantity: 500,
      unit: 'kg',
      status: 'Active',
      qualityStatus: 'Passed',
      location: 'Dry Room Cell 2',
      operator: 'Dr. Chloe Aris',
      outputProducts: ['PROD-002']
    },
    {
      id: 'BAT-003',
      name: 'Autoclave Monocoque Curing',
      process: 'Vacuum Bagged Autoclave 180°C',
      materials: ['MAT-003'],
      materialId: 'MAT-003',
      supplier: 'Hexcel Composites',
      productionDate: '2025-01-12',
      expiryDate: '2027-01-12',
      quantity: 320,
      unit: 'm²',
      status: 'Active',
      qualityStatus: 'Passed',
      location: 'Autoclave Chamber 1',
      operator: 'David Thorne',
      outputProducts: ['PROD-003']
    },
    {
      id: 'BAT-004',
      name: 'Electron Beam Additive Run M-4',
      process: 'E-Beam Selective Melting 3D',
      materials: ['MAT-004'],
      materialId: 'MAT-004',
      supplier: 'Carpenter Technology',
      productionDate: '2025-01-08',
      expiryDate: '2030-01-08',
      quantity: 180,
      unit: 'kg',
      status: 'Completed',
      qualityStatus: 'Passed',
      location: 'Additive Manufacturing Bay 3',
      operator: 'Leila Chen',
      outputProducts: ['PROD-004']
    },
    {
      id: 'BAT-005',
      name: 'Precision CNC Micro-Machining',
      process: '5-Axis Ultrasonic Milling',
      materials: ['MAT-005'],
      materialId: 'MAT-005',
      supplier: 'Invibio Biomaterial',
      productionDate: '2025-01-19',
      expiryDate: '2029-01-19',
      quantity: 140,
      unit: 'kg',
      status: 'Active',
      qualityStatus: 'Passed',
      location: 'Clean CNC Suite 6',
      operator: 'Stefan Meyer',
      outputProducts: ['PROD-005']
    },
    {
      id: 'BAT-006',
      name: 'Wafer Slicing & CMP Polishing',
      process: 'Diamond Wire Saw & Chemical Polish',
      materials: ['MAT-006'],
      materialId: 'MAT-006',
      supplier: 'Shin-Etsu Handotai',
      productionDate: '2025-01-05',
      expiryDate: '2028-01-05',
      quantity: 90,
      unit: 'ingots',
      status: 'Completed',
      qualityStatus: 'Passed',
      location: 'Semiconductor Fab Line 1',
      operator: 'Kenji Takahashi',
      outputProducts: ['PROD-006']
    },
    {
      id: 'BAT-007',
      name: 'Multi-Layer PCB Etch & Solder Mask',
      process: 'Laser Direct Imaging & Plating',
      materials: ['MAT-007'],
      materialId: 'MAT-007',
      supplier: 'Isola Group',
      productionDate: '2025-01-16',
      expiryDate: '2027-01-16',
      quantity: 260,
      unit: 'panels',
      status: 'Active',
      qualityStatus: 'Passed',
      location: 'PCB Wet Processing Bay',
      operator: 'Alicia Martinez',
      outputProducts: ['PROD-006']
    },
    {
      id: 'BAT-008',
      name: 'Sintered Rare-Earth Ring Forming',
      process: 'Magnetic Field Orientation Pressing',
      materials: ['MAT-008'],
      materialId: 'MAT-008',
      supplier: 'Hitachi Metals',
      productionDate: '2025-01-14',
      expiryDate: '2028-01-14',
      quantity: 210,
      unit: 'kg',
      status: 'Active',
      qualityStatus: 'Passed',
      location: 'Sintering Vacuum Furnace 2',
      operator: 'Greg Novak',
      outputProducts: ['PROD-007']
    },
    {
      id: 'BAT-009',
      name: 'Elastomer Gasket Compression Molding',
      process: 'High-Pressure Vulcanization',
      materials: ['MAT-009'],
      materialId: 'MAT-009',
      supplier: 'DuPont Dow Elastomers',
      productionDate: '2025-01-20',
      expiryDate: '2026-07-20',
      quantity: 120,
      unit: 'kg',
      status: 'In Transit',
      qualityStatus: 'Passed',
      location: 'Hydraulic Press Hall A',
      operator: 'Tariq Al-Mansoor',
      outputProducts: ['PROD-008']
    },
    {
      id: 'BAT-010',
      name: 'Armor Grade Carbide Sintering',
      process: 'Hot Isostatic Pressing (HIP)',
      materials: ['MAT-010'],
      materialId: 'MAT-010',
      supplier: 'Kennametal Inc',
      productionDate: '2025-01-10',
      expiryDate: '2027-01-10',
      quantity: 75,
      unit: 'kg',
      status: 'Completed',
      qualityStatus: 'Under Review',
      location: 'HIP Facility Alpha',
      operator: 'Viktor Orban',
      outputProducts: ['PROD-009']
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
      description: 'High-tolerance drive rotor component balanced for 18,000 RPM operation',
      shipments: ['SHIP-001'],
      stockTrend: [
        { month: 'Aug', stock: 240 },
        { month: 'Sep', stock: 280 },
        { month: 'Oct', stock: 350 },
        { month: 'Nov', stock: 310 },
        { month: 'Dec', stock: 290 },
        { month: 'Jan', stock: 320 }
      ]
    },
    {
      id: 'PROD-002',
      name: 'High-Density Battery Cell Module',
      category: 'Energy Storage',
      batchId: 'BAT-002',
      batches: ['BAT-002'],
      currentStock: 450,
      unit: 'units',
      unitPrice: '$420.00',
      status: 'In Stock',
      description: 'Prismatic 800V automotive cell pack module with liquid-cooling integration',
      shipments: ['SHIP-002'],
      stockTrend: [
        { month: 'Aug', stock: 310 },
        { month: 'Sep', stock: 380 },
        { month: 'Oct', stock: 420 },
        { month: 'Nov', stock: 490 },
        { month: 'Dec', stock: 440 },
        { month: 'Jan', stock: 450 }
      ]
    },
    {
      id: 'PROD-003',
      name: 'Lightweight Aero Monocoque Strut',
      category: 'Aerospace',
      batchId: 'BAT-003',
      batches: ['BAT-003'],
      currentStock: 180,
      unit: 'pcs',
      unitPrice: '$890.00',
      status: 'In Stock',
      description: 'Carbon composite suspension strut engineered for hypercar structural rigidity',
      shipments: ['SHIP-003'],
      stockTrend: [
        { month: 'Aug', stock: 120 },
        { month: 'Sep', stock: 150 },
        { month: 'Oct', stock: 190 },
        { month: 'Nov', stock: 210 },
        { month: 'Dec', stock: 175 },
        { month: 'Jan', stock: 180 }
      ]
    },
    {
      id: 'PROD-004',
      name: 'Orthopedic Hip Stem Implant',
      category: 'Medical Device',
      batchId: 'BAT-004',
      batches: ['BAT-004'],
      currentStock: 240,
      unit: 'units',
      unitPrice: '$1,250.00',
      status: 'In Stock',
      description: 'Porous titanium trabecular bone stem promoting rapid osseointegration',
      shipments: ['SHIP-004'],
      stockTrend: [
        { month: 'Aug', stock: 160 },
        { month: 'Sep', stock: 190 },
        { month: 'Oct', stock: 220 },
        { month: 'Nov', stock: 250 },
        { month: 'Dec', stock: 230 },
        { month: 'Jan', stock: 240 }
      ]
    },
    {
      id: 'PROD-005',
      name: 'Spinal Fusion Interbody Cage',
      category: 'Medical Device',
      batchId: 'BAT-005',
      batches: ['BAT-005'],
      currentStock: 380,
      unit: 'units',
      unitPrice: '$780.00',
      status: 'In Stock',
      description: 'Lordotic PEEK interbody spacer with tantalum x-ray markers',
      shipments: ['SHIP-005'],
      stockTrend: [
        { month: 'Aug', stock: 260 },
        { month: 'Sep', stock: 310 },
        { month: 'Oct', stock: 340 },
        { month: 'Nov', stock: 400 },
        { month: 'Dec', stock: 365 },
        { month: 'Jan', stock: 380 }
      ]
    },
    {
      id: 'PROD-006',
      name: 'High-Voltage Micro-Inverter PCB',
      category: 'Electronics',
      batchId: 'BAT-007',
      batches: ['BAT-006', 'BAT-007'],
      currentStock: 520,
      unit: 'units',
      unitPrice: '$310.00',
      status: 'In Stock',
      description: 'Silicon carbide MOSFET embedded inverter board for utility solar conversion',
      shipments: ['SHIP-006', 'SHIP-007'],
      stockTrend: [
        { month: 'Aug', stock: 380 },
        { month: 'Sep', stock: 430 },
        { month: 'Oct', stock: 490 },
        { month: 'Nov', stock: 550 },
        { month: 'Dec', stock: 510 },
        { month: 'Jan', stock: 520 }
      ]
    },
    {
      id: 'PROD-007',
      name: 'Brushless Stator Magnet Core',
      category: 'Industrial',
      batchId: 'BAT-008',
      batches: ['BAT-008'],
      currentStock: 290,
      unit: 'units',
      unitPrice: '$145.00',
      status: 'In Stock',
      description: 'Precision balanced multi-pole magnetic assembly for servo actuator motors',
      shipments: [],
      stockTrend: [
        { month: 'Aug', stock: 190 },
        { month: 'Sep', stock: 230 },
        { month: 'Oct', stock: 260 },
        { month: 'Nov', stock: 310 },
        { month: 'Dec', stock: 280 },
        { month: 'Jan', stock: 290 }
      ]
    },
    {
      id: 'PROD-008',
      name: 'Hermetic Flange Sealing Kit',
      category: 'Industrial',
      batchId: 'BAT-009',
      batches: ['BAT-009'],
      currentStock: 45,
      unit: 'sets',
      unitPrice: '$65.00',
      status: 'Low Stock',
      description: 'Extreme pressure neoprene dual-lip sealing assembly for maritime marine gearboxes',
      shipments: ['SHIP-008'],
      stockTrend: [
        { month: 'Aug', stock: 160 },
        { month: 'Sep', stock: 130 },
        { month: 'Oct', stock: 95 },
        { month: 'Nov', stock: 75 },
        { month: 'Dec', stock: 55 },
        { month: 'Jan', stock: 45 }
      ]
    },
    {
      id: 'PROD-009',
      name: 'Heavy-Duty Boring Tool Insert',
      category: 'Tooling',
      batchId: 'BAT-010',
      batches: ['BAT-010'],
      currentStock: 0,
      unit: 'pcs',
      unitPrice: '$95.00',
      status: 'Out of Stock',
      description: 'Titanium carbonitride coated indexable tungsten carbide insert for subterranean drills',
      shipments: [],
      stockTrend: [
        { month: 'Aug', stock: 85 },
        { month: 'Sep', stock: 65 },
        { month: 'Oct', stock: 45 },
        { month: 'Nov', stock: 20 },
        { month: 'Dec', stock: 5 },
        { month: 'Jan', stock: 0 }
      ]
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
    },
    {
      id: 'SHIP-002',
      product: 'High-Density Battery Cell Module',
      productId: 'PROD-002',
      customerId: 'CUS-002',
      customer: 'VoltDrive Motors',
      quantity: 200,
      unit: 'units',
      origin: 'Reno Gigafactory',
      destination: 'Fremont Assembly Hub',
      departure: '2025-01-21',
      eta: '2025-01-23',
      transporter: 'Echo Global Logistics',
      vehicleNumber: 'EV-SEMI-09',
      driver: 'Elena Gomez',
      contact: '+1 775-555-8291',
      status: 'In Transit',
      distanceTotal: '240 miles',
      distanceCovered: '204 miles',
      progressPercent: 85
    },
    {
      id: 'SHIP-003',
      product: 'Lightweight Aero Monocoque Strut',
      productId: 'PROD-003',
      customerId: 'CUS-003',
      customer: 'Apex Hypercars',
      quantity: 60,
      unit: 'pcs',
      origin: 'Salt Lake Facility',
      destination: 'Austin Advanced Tech Hub',
      departure: '2025-01-22',
      eta: '2025-01-25',
      transporter: 'Apex Freight Services',
      vehicleNumber: 'TRK-4410',
      driver: 'Carl Jenkins',
      contact: '+1 801-555-3342',
      status: 'In Transit',
      distanceTotal: '1,320 miles',
      distanceCovered: '594 miles',
      progressPercent: 45
    },
    {
      id: 'SHIP-004',
      product: 'Orthopedic Hip Stem Implant',
      productId: 'PROD-004',
      customerId: 'CUS-004',
      customer: 'OmniHealth Surgical',
      quantity: 80,
      unit: 'units',
      origin: 'Warsaw Ortho Center',
      destination: 'Memphis Medical Distribution',
      departure: '2025-01-18',
      eta: '2025-01-20',
      transporter: 'MediExpress Logistics',
      vehicleNumber: 'MED-1104',
      driver: 'Rachel Adams',
      contact: '+1 901-555-4720',
      status: 'Delivered',
      distanceTotal: '510 miles',
      distanceCovered: '510 miles',
      progressPercent: 100
    },
    {
      id: 'SHIP-005',
      product: 'Spinal Fusion Interbody Cage',
      productId: 'PROD-005',
      customerId: 'CUS-005',
      customer: 'BioLife Therapeutics',
      quantity: 110,
      unit: 'units',
      origin: 'Minneapolis BioHub',
      destination: 'Boston Medical Distribution',
      departure: '2025-01-21',
      eta: '2025-01-24',
      transporter: 'Polar Cold Chain',
      vehicleNumber: 'COLD-772',
      driver: 'Jason Bourne',
      contact: '+1 612-555-8910',
      status: 'In Transit',
      distanceTotal: '1,120 miles',
      distanceCovered: '672 miles',
      progressPercent: 60
    },
    {
      id: 'SHIP-006',
      product: 'High-Voltage Micro-Inverter PCB',
      productId: 'PROD-006',
      customerId: 'CUS-006',
      customer: 'OmniGrid Solar Systems',
      quantity: 250,
      unit: 'units',
      origin: 'Phoenix Fab 12',
      destination: 'Hillsboro Integration Center',
      departure: '2025-01-16',
      eta: '2025-01-19',
      transporter: 'FedEx Custom Critical',
      vehicleNumber: 'FDX-8801',
      driver: 'Markus Weber',
      contact: '+1 602-555-1234',
      status: 'Delivered',
      distanceTotal: '1,280 miles',
      distanceCovered: '1,280 miles',
      progressPercent: 100
    },
    {
      id: 'SHIP-007',
      product: 'High-Voltage Micro-Inverter PCB',
      productId: 'PROD-006',
      customerId: 'CUS-007',
      customer: 'Solaria Energy AG',
      quantity: 180,
      unit: 'units',
      origin: 'Dallas Micro-Center',
      destination: 'Munich Airport Logistics Hub',
      departure: '2025-01-22',
      eta: '2025-01-26',
      transporter: 'DHL Global Forwarding',
      vehicleNumber: 'FLT-LH439',
      driver: 'Air Cargo Dispatch',
      contact: '+49 89 555-0981',
      status: 'In Transit',
      distanceTotal: '5,240 miles',
      distanceCovered: '1,572 miles',
      progressPercent: 30
    },
    {
      id: 'SHIP-008',
      product: 'Hermetic Flange Sealing Kit',
      productId: 'PROD-008',
      customerId: 'CUS-008',
      customer: 'Delta Marine Technologies',
      quantity: 35,
      unit: 'sets',
      origin: 'Chicago Depot',
      destination: 'Savannah Marine Terminal',
      departure: '2025-01-19',
      eta: '2025-01-23',
      transporter: 'Swift Intermodal',
      vehicleNumber: 'SWF-9921',
      driver: 'Trevor Bailey',
      contact: '+1 912-555-6677',
      status: 'Delayed',
      distanceTotal: '950 miles',
      distanceCovered: '380 miles',
      progressPercent: 40
    },
    {
      id: 'SHIP-009',
      product: 'Precision Rotor Shaft',
      productId: 'PROD-001',
      customerId: 'CUS-001',
      customer: 'AeroTech Dynamics',
      quantity: 90,
      unit: 'units',
      origin: 'Seattle Facility',
      destination: 'Vancouver Flight Center',
      departure: '2025-01-17',
      eta: '2025-01-18',
      transporter: 'Pacific Northwest Transport',
      vehicleNumber: 'PNT-3301',
      driver: 'Liam O’Connor',
      contact: '+1 206-555-4490',
      status: 'Delivered',
      distanceTotal: '145 miles',
      distanceCovered: '145 miles',
      progressPercent: 100
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
      shipmentIds: ['SHIP-001', 'SHIP-009'],
      orders: [
        {
          orderId: 'ORD-9021',
          product: 'Precision Rotor Shaft',
          value: '$22,200',
          date: 'Jan 18, 2025',
          status: 'In Transit'
        },
        {
          orderId: 'ORD-8940',
          product: 'Precision Rotor Shaft',
          value: '$16,650',
          date: 'Jan 12, 2025',
          status: 'Delivered'
        }
      ],
      materialsUsed: ['Aluminum Alloy 6061']
    },
    {
      id: 'CUS-002',
      name: 'VoltDrive Motors',
      type: 'Automotive OEM',
      industry: 'Electric Vehicles',
      location: 'Fremont, CA',
      contactPerson: 'Nathaniel Reed',
      email: 'nreed@voltdrive.com',
      phone: '+1 (510) 555-9201',
      status: 'Active',
      totalOrders: 28,
      totalShipments: 16,
      customerSince: 'Jun 10, 2022',
      shipmentIds: ['SHIP-002'],
      orders: [
        {
          orderId: 'ORD-9114',
          product: 'High-Density Battery Cell Module',
          value: '$84,000',
          date: 'Jan 20, 2025',
          status: 'In Transit'
        }
      ],
      materialsUsed: ['Lithium Carbonate Battery Grade']
    },
    {
      id: 'CUS-003',
      name: 'Apex Hypercars',
      type: 'Boutique OEM',
      industry: 'Automotive & Motorsport',
      location: 'Austin, TX',
      contactPerson: 'Valeria Rossi',
      email: 'v.rossi@apexhypercars.com',
      phone: '+1 (512) 555-7389',
      status: 'Active',
      totalOrders: 19,
      totalShipments: 9,
      customerSince: 'Nov 04, 2023',
      shipmentIds: ['SHIP-003'],
      orders: [
        {
          orderId: 'ORD-9150',
          product: 'Lightweight Aero Monocoque Strut',
          value: '$53,400',
          date: 'Jan 21, 2025',
          status: 'In Transit'
        }
      ],
      materialsUsed: ['Carbon Fiber Prepreg Toray T800']
    },
    {
      id: 'CUS-004',
      name: 'OmniHealth Surgical',
      type: 'Medical Provider',
      industry: 'Healthcare & Orthopedics',
      location: 'Memphis, TN',
      contactPerson: 'Dr. Gregory House',
      email: 'ghouse@omnihealthsurgical.com',
      phone: '+1 (901) 555-3211',
      status: 'Active',
      totalOrders: 32,
      totalShipments: 22,
      customerSince: 'Jan 20, 2021',
      shipmentIds: ['SHIP-004'],
      orders: [
        {
          orderId: 'ORD-9005',
          product: 'Orthopedic Hip Stem Implant',
          value: '$100,000',
          date: 'Jan 15, 2025',
          status: 'Delivered'
        }
      ],
      materialsUsed: ['Titanium Medical Ti-6Al-4V ELI']
    },
    {
      id: 'CUS-005',
      name: 'BioLife Therapeutics',
      type: 'Biotech Device Co',
      industry: 'Medical Devices',
      location: 'Boston, MA',
      contactPerson: 'Evelyn Hayes',
      email: 'ehayes@biolifetherapeutics.com',
      phone: '+1 (617) 555-4920',
      status: 'Active',
      totalOrders: 21,
      totalShipments: 12,
      customerSince: 'Aug 14, 2022',
      shipmentIds: ['SHIP-005'],
      orders: [
        {
          orderId: 'ORD-9132',
          product: 'Spinal Fusion Interbody Cage',
          value: '$85,800',
          date: 'Jan 19, 2025',
          status: 'In Transit'
        }
      ],
      materialsUsed: ['Medical Polymer PEEK Optima']
    },
    {
      id: 'CUS-006',
      name: 'OmniGrid Solar Systems',
      type: 'Grid Integrator',
      industry: 'Renewable Energy',
      location: 'Hillsboro, OR',
      contactPerson: 'Brian Murphy',
      email: 'bmurphy@omnigrid.com',
      phone: '+1 (503) 555-8843',
      status: 'Active',
      totalOrders: 17,
      totalShipments: 11,
      customerSince: 'Feb 19, 2023',
      shipmentIds: ['SHIP-006'],
      orders: [
        {
          orderId: 'ORD-8990',
          product: 'High-Voltage Micro-Inverter PCB',
          value: '$77,500',
          date: 'Jan 14, 2025',
          status: 'Delivered'
        }
      ],
      materialsUsed: ['Silicon Monocrystalline Ingot 300mm', 'High-TG Copper Clad Laminate FR-4']
    },
    {
      id: 'CUS-007',
      name: 'Solaria Energy AG',
      type: 'Industrial Manufacturer',
      industry: 'Renewables & Power',
      location: 'Munich, Germany',
      contactPerson: 'Klaus Reinhardt',
      email: 'reinhardt@solaria-energy.de',
      phone: '+49 89 555-3390',
      status: 'Active',
      totalOrders: 24,
      totalShipments: 14,
      customerSince: 'Apr 02, 2022',
      shipmentIds: ['SHIP-007'],
      orders: [
        {
          orderId: 'ORD-9148',
          product: 'High-Voltage Micro-Inverter PCB',
          value: '$55,800',
          date: 'Jan 21, 2025',
          status: 'In Transit'
        }
      ],
      materialsUsed: ['Silicon Monocrystalline Ingot 300mm', 'High-TG Copper Clad Laminate FR-4']
    },
    {
      id: 'CUS-008',
      name: 'Delta Marine Technologies',
      type: 'Shipbuilder',
      industry: 'Maritime & Defense',
      location: 'Savannah, GA',
      contactPerson: 'Captain Ronald Briggs',
      email: 'rbriggs@deltamarine.com',
      phone: '+1 (912) 555-8711',
      status: 'Active',
      totalOrders: 11,
      totalShipments: 5,
      customerSince: 'Sep 12, 2023',
      shipmentIds: ['SHIP-008'],
      orders: [
        {
          orderId: 'ORD-9120',
          product: 'Hermetic Flange Sealing Kit',
          value: '$2,275',
          date: 'Jan 17, 2025',
          status: 'Delayed'
        }
      ],
      materialsUsed: ['Neoprene Industrial Elastomer']
    },
    {
      id: 'CUS-009',
      name: 'Quantum Robotics LLC',
      type: 'Research & Robotics',
      industry: 'Automation & AI',
      location: 'Pittsburgh, PA',
      contactPerson: 'Dr. Anita Roy',
      email: 'aroy@quantumrobotics.io',
      phone: '+1 (412) 555-9012',
      status: 'New',
      totalOrders: 2,
      totalShipments: 0,
      customerSince: 'Jan 08, 2025',
      shipmentIds: [],
      orders: [],
      materialsUsed: ['NdFeB Neodymium Magnet Alloy']
    },
    {
      id: 'CUS-010',
      name: 'Sterling Rail Logistics',
      type: 'Rail Infrastructure',
      industry: 'Heavy Transportation',
      location: 'Chicago, IL',
      contactPerson: 'Frank Castle',
      email: 'fcastle@sterlingrail.com',
      phone: '+1 (312) 555-6701',
      status: 'Inactive',
      totalOrders: 8,
      totalShipments: 7,
      customerSince: 'May 11, 2021',
      shipmentIds: [],
      orders: [],
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
    },
    {
      id: 'EVT-002',
      type: 'Material Received',
      entityType: 'Material',
      entityId: 'MAT-002',
      status: 'Completed',
      location: 'Receiving Dock B',
      performedBy: 'Receiving Officer M. Alvarez',
      description: 'Incoming purity spectrometry confirmed 99.95% lithium assay purity',
      timestamp: 'Jan 17, 2025, 09:15'
    },
    {
      id: 'EVT-003',
      type: 'Quality Check',
      entityType: 'Batch',
      entityId: 'BAT-002',
      status: 'Completed',
      location: 'Battery Test Chamber 4',
      performedBy: 'Dr. Chloe Aris',
      description: 'Electrochemical impedance & thermal runaway containment verified',
      timestamp: 'Jan 19, 2025, 16:45'
    },
    {
      id: 'EVT-004',
      type: 'Inspection',
      entityType: 'Batch',
      entityId: 'BAT-003',
      status: 'Completed',
      location: 'NDT Ultrasonic Lab',
      performedBy: 'Senior Inspector D. Thorne',
      description: 'Non-destructive ultrasonic scan showed zero interlaminar voids',
      timestamp: 'Jan 14, 2025, 11:20'
    },
    {
      id: 'EVT-005',
      type: 'Shipment Dispatched',
      entityType: 'Shipment',
      entityId: 'SHIP-002',
      status: 'In Transit',
      location: 'Reno Gigafactory Gate 4',
      performedBy: 'Echo Global Logistics',
      description: 'Autonomous freight trailer departed on I-80 westbound toward Fremont',
      timestamp: 'Jan 21, 2025, 06:00'
    },
    {
      id: 'EVT-006',
      type: 'Quality Check',
      entityType: 'Batch',
      entityId: 'BAT-004',
      status: 'Completed',
      location: 'Bio-Radiation Sterility Facility',
      performedBy: 'Leila Chen',
      description: 'Gamma beam sterilization validation achieved SAL 10^-6 standard',
      timestamp: 'Jan 10, 2025, 13:00'
    },
    {
      id: 'EVT-007',
      type: 'Inspection',
      entityType: 'Batch',
      entityId: 'BAT-005',
      status: 'Completed',
      location: 'Cleanroom Suite 6',
      performedBy: 'Stefan Meyer',
      description: 'ISO 13485 Class 7 cleanroom environmental particle count verified clean',
      timestamp: 'Jan 20, 2025, 15:10'
    },
    {
      id: 'EVT-008',
      type: 'Shipment Delivered',
      entityType: 'Shipment',
      entityId: 'SHIP-004',
      status: 'Completed',
      location: 'Memphis Medical Receiving',
      performedBy: 'MediExpress Driver Rachel Adams',
      description: 'Delivered sterile implants to OmniHealth surgical inventory safely',
      timestamp: 'Jan 20, 2025, 17:35'
    },
    {
      id: 'EVT-009',
      type: 'Inspection',
      entityType: 'Batch',
      entityId: 'BAT-006',
      status: 'Completed',
      location: 'Wafer Fab Bay 1',
      performedBy: 'Kenji Takahashi',
      description: 'Atomic force microscopy verified surface roughness Ra < 0.2 nm',
      timestamp: 'Jan 07, 2025, 10:40'
    },
    {
      id: 'EVT-010',
      type: 'Quality Check',
      entityType: 'Product',
      entityId: 'PROD-006',
      status: 'Completed',
      location: 'AOI Vision Bay',
      performedBy: 'Automated Vision Station 2',
      description: 'Automated Optical Inspection confirmed 100% solder joint integrity',
      timestamp: 'Jan 17, 2025, 18:25'
    },
    {
      id: 'EVT-011',
      type: 'Customs & Transfer',
      entityType: 'Shipment',
      entityId: 'SHIP-007',
      status: 'In Transit',
      location: 'Dallas Fort Worth Cargo Hub',
      performedBy: 'DHL Global Forwarding',
      description: 'Airway bill generated and transatlantic export clearance granted',
      timestamp: 'Jan 22, 2025, 21:00'
    },
    {
      id: 'EVT-012',
      type: 'Quality Check',
      entityType: 'Batch',
      entityId: 'BAT-008',
      status: 'Completed',
      location: 'Gaussmeter Testing Station',
      performedBy: 'Greg Novak',
      description: 'Remanence Br and coercivity Hc met Grade N52 specifications',
      timestamp: 'Jan 15, 2025, 14:15'
    },
    {
      id: 'EVT-013',
      type: 'Delay Alert',
      entityType: 'Shipment',
      entityId: 'SHIP-008',
      status: 'Delayed',
      location: 'Nashville Transit Corridor',
      performedBy: 'Swift Fleet Dispatch',
      description: 'Severe winter weather delay encountered along I-24 eastbound route',
      timestamp: 'Jan 21, 2025, 08:30'
    },
    {
      id: 'EVT-014',
      type: 'Threshold Alert',
      entityType: 'Material',
      entityId: 'MAT-009',
      status: 'Completed',
      location: 'Automated ERP System',
      performedBy: 'Inventory Sentinel Bot',
      description: 'Stock dropped below reorder threshold (180 / 250 kg); purchase order triggered',
      timestamp: 'Jan 22, 2025, 04:12'
    },
    {
      id: 'EVT-015',
      type: 'Stock Discrepancy',
      entityType: 'Material',
      entityId: 'MAT-010',
      status: 'Failed',
      location: 'Receiving Dock A',
      performedBy: 'Auditor Victor Orban',
      description: 'Supplier shipment delayed by 18 days; stock level reached 0 kg',
      timestamp: 'Jan 22, 2025, 11:50'
    }
  ],

  reports: [
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
  ],

  relationships: [
    // MAT -> BAT
    { id: 'rel-mat-bat-001', source: 'MAT-001', target: 'BAT-001', type: 'HAS_BATCH', label: 'HAS_BATCH' },
    { id: 'rel-mat-bat-002', source: 'MAT-002', target: 'BAT-002', type: 'HAS_BATCH', label: 'HAS_BATCH' },
    { id: 'rel-mat-bat-003', source: 'MAT-003', target: 'BAT-003', type: 'HAS_BATCH', label: 'HAS_BATCH' },
    { id: 'rel-mat-bat-004', source: 'MAT-004', target: 'BAT-004', type: 'HAS_BATCH', label: 'HAS_BATCH' },
    { id: 'rel-mat-bat-005', source: 'MAT-005', target: 'BAT-005', type: 'HAS_BATCH', label: 'HAS_BATCH' },
    { id: 'rel-mat-bat-006', source: 'MAT-006', target: 'BAT-006', type: 'HAS_BATCH', label: 'HAS_BATCH' },
    { id: 'rel-mat-bat-007', source: 'MAT-007', target: 'BAT-007', type: 'HAS_BATCH', label: 'HAS_BATCH' },
    { id: 'rel-mat-bat-008', source: 'MAT-008', target: 'BAT-008', type: 'HAS_BATCH', label: 'HAS_BATCH' },
    { id: 'rel-mat-bat-009', source: 'MAT-009', target: 'BAT-009', type: 'HAS_BATCH', label: 'HAS_BATCH' },
    { id: 'rel-mat-bat-010', source: 'MAT-010', target: 'BAT-010', type: 'HAS_BATCH', label: 'HAS_BATCH' },

    // BAT -> PROD
    { id: 'rel-bat-prod-001', source: 'BAT-001', target: 'PROD-001', type: 'CREATES', label: 'CREATES' },
    { id: 'rel-bat-prod-002', source: 'BAT-002', target: 'PROD-002', type: 'CREATES', label: 'CREATES' },
    { id: 'rel-bat-prod-003', source: 'BAT-003', target: 'PROD-003', type: 'CREATES', label: 'CREATES' },
    { id: 'rel-bat-prod-004', source: 'BAT-004', target: 'PROD-004', type: 'CREATES', label: 'CREATES' },
    { id: 'rel-bat-prod-005', source: 'BAT-005', target: 'PROD-005', type: 'CREATES', label: 'CREATES' },
    { id: 'rel-bat-prod-006', source: 'BAT-006', target: 'PROD-006', type: 'CREATES', label: 'CREATES' },
    { id: 'rel-bat-prod-007', source: 'BAT-007', target: 'PROD-006', type: 'CREATES', label: 'CREATES' },
    { id: 'rel-bat-prod-008', source: 'BAT-008', target: 'PROD-007', type: 'CREATES', label: 'CREATES' },
    { id: 'rel-bat-prod-009', source: 'BAT-009', target: 'PROD-008', type: 'CREATES', label: 'CREATES' },
    { id: 'rel-bat-prod-010', source: 'BAT-010', target: 'PROD-009', type: 'CREATES', label: 'CREATES' },

    // PROD -> SHIP
    { id: 'rel-prod-ship-001', source: 'PROD-001', target: 'SHIP-001', type: 'SHIPS', label: 'SHIPS' },
    { id: 'rel-prod-ship-002', source: 'PROD-002', target: 'SHIP-002', type: 'SHIPS', label: 'SHIPS' },
    { id: 'rel-prod-ship-003', source: 'PROD-003', target: 'SHIP-003', type: 'SHIPS', label: 'SHIPS' },
    { id: 'rel-prod-ship-004', source: 'PROD-004', target: 'SHIP-004', type: 'SHIPS', label: 'SHIPS' },
    { id: 'rel-prod-ship-005', source: 'PROD-005', target: 'SHIP-005', type: 'SHIPS', label: 'SHIPS' },
    { id: 'rel-prod-ship-006', source: 'PROD-006', target: 'SHIP-006', type: 'SHIPS', label: 'SHIPS' },
    { id: 'rel-prod-ship-007', source: 'PROD-006', target: 'SHIP-007', type: 'SHIPS', label: 'SHIPS' },
    { id: 'rel-prod-ship-008', source: 'PROD-008', target: 'SHIP-008', type: 'SHIPS', label: 'SHIPS' },
    { id: 'rel-prod-ship-009', source: 'PROD-001', target: 'SHIP-009', type: 'SHIPS', label: 'SHIPS' },

    // SHIP -> CUS
    { id: 'rel-ship-cus-001', source: 'SHIP-001', target: 'CUS-001', type: 'DELIVERED_TO', label: 'DELIVERED_TO' },
    { id: 'rel-ship-cus-002', source: 'SHIP-002', target: 'CUS-002', type: 'DELIVERED_TO', label: 'DELIVERED_TO' },
    { id: 'rel-ship-cus-003', source: 'SHIP-003', target: 'CUS-003', type: 'DELIVERED_TO', label: 'DELIVERED_TO' },
    { id: 'rel-ship-cus-004', source: 'SHIP-004', target: 'CUS-004', type: 'DELIVERED_TO', label: 'DELIVERED_TO' },
    { id: 'rel-ship-cus-005', source: 'SHIP-005', target: 'CUS-005', type: 'DELIVERED_TO', label: 'DELIVERED_TO' },
    { id: 'rel-ship-cus-006', source: 'SHIP-006', target: 'CUS-006', type: 'DELIVERED_TO', label: 'DELIVERED_TO' },
    { id: 'rel-ship-cus-007', source: 'SHIP-007', target: 'CUS-007', type: 'DELIVERED_TO', label: 'DELIVERED_TO' },
    { id: 'rel-ship-cus-008', source: 'SHIP-008', target: 'CUS-008', type: 'DELIVERED_TO', label: 'DELIVERED_TO' },
    { id: 'rel-ship-cus-009', source: 'SHIP-009', target: 'CUS-001', type: 'DELIVERED_TO', label: 'DELIVERED_TO' },

    // Entity -> Event
    { id: 'rel-bat-evt-001', source: 'BAT-001', target: 'EVT-001', type: 'HAS_EVENT', label: 'HAS_EVENT' },
    { id: 'rel-mat-evt-002', source: 'MAT-002', target: 'EVT-002', type: 'HAS_EVENT', label: 'HAS_EVENT' },
    { id: 'rel-bat-evt-003', source: 'BAT-002', target: 'EVT-003', type: 'HAS_EVENT', label: 'HAS_EVENT' },
    { id: 'rel-bat-evt-004', source: 'BAT-003', target: 'EVT-004', type: 'HAS_EVENT', label: 'HAS_EVENT' },
    { id: 'rel-ship-evt-005', source: 'SHIP-002', target: 'EVT-005', type: 'HAS_EVENT', label: 'HAS_EVENT' },
    { id: 'rel-bat-evt-006', source: 'BAT-004', target: 'EVT-006', type: 'HAS_EVENT', label: 'HAS_EVENT' },
    { id: 'rel-bat-evt-007', source: 'BAT-005', target: 'EVT-007', type: 'HAS_EVENT', label: 'HAS_EVENT' },
    { id: 'rel-ship-evt-008', source: 'SHIP-004', target: 'EVT-008', type: 'HAS_EVENT', label: 'HAS_EVENT' },
    { id: 'rel-bat-evt-009', source: 'BAT-006', target: 'EVT-009', type: 'HAS_EVENT', label: 'HAS_EVENT' },
    { id: 'rel-prod-evt-010', source: 'PROD-006', target: 'EVT-010', type: 'HAS_EVENT', label: 'HAS_EVENT' },
    { id: 'rel-ship-evt-011', source: 'SHIP-007', target: 'EVT-011', type: 'HAS_EVENT', label: 'HAS_EVENT' },
    { id: 'rel-bat-evt-012', source: 'BAT-008', target: 'EVT-012', type: 'HAS_EVENT', label: 'HAS_EVENT' },
    { id: 'rel-ship-evt-013', source: 'SHIP-008', target: 'EVT-013', type: 'HAS_EVENT', label: 'HAS_EVENT' },
    { id: 'rel-mat-evt-014', source: 'MAT-009', target: 'EVT-014', type: 'HAS_EVENT', label: 'HAS_EVENT' },
    { id: 'rel-mat-evt-015', source: 'MAT-010', target: 'EVT-015', type: 'HAS_EVENT', label: 'HAS_EVENT' }
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

    // If only legacy 1 sample exists or empty, reseed with the full default sample data
    if (store.materials.length <= 1) {
      saveStore(defaultStore);
      return JSON.parse(JSON.stringify(defaultStore));
    }

    // Merge in any missing default samples so user customizations are kept while rich samples are guaranteed
    const addMissing = (targetArr, defaultArr) => {
      defaultArr.forEach((item) => {
        if (!targetArr.some((existing) => existing.id === item.id)) {
          targetArr.push(item);
        }
      });
    };

    addMissing(store.materials, defaultStore.materials);
    addMissing(store.batches, defaultStore.batches);
    addMissing(store.products, defaultStore.products);
    addMissing(store.shipments, defaultStore.shipments);
    addMissing(store.customers, defaultStore.customers);
    addMissing(store.events, defaultStore.events);
    addMissing(store.reports, defaultStore.reports);

    // Ensure relationships exist
    defaultStore.relationships.forEach((defRel) => {
      const exists = store.relationships.some(
        (r) => r.source === defRel.source && r.target === defRel.target && r.label === defRel.label
      );
      if (!exists) {
        store.relationships.push(defRel);
      }
    });

    saveStore(store);
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
