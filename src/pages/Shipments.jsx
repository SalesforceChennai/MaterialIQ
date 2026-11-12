import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Truck,
  Plus,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ExternalLink,
  X,
  Navigation
} from 'lucide-react';
import KPICard from '../components/common/KPICard';
import SearchBar from '../components/common/SearchBar';
import FilterBar from '../components/common/FilterBar';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { api } from '../services/api';
import { exportToCSV } from '../utils/exportCSV';

export default function Shipments() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [originFilter, setOriginFilter] = useState('all');
  const [destFilter, setDestFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Create Shipment modal state
  const [productsList, setProductsList] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [newShipment, setNewShipment] = useState({
    id: '',
    product: '',
    productId: '',
    customer: '',
    customerId: '',
    quantity: '',
    unit: 'units',
    origin: '',
    destination: '',
    departure: '',
    eta: '',
    transporter: '',
    vehicleNumber: '',
    driver: '',
    contact: '',
    status: 'In Transit'
  });

  const loadShipments = async () => {
    const data = await api.getShipments();
    setShipments(data);
    const pData = await api.getProducts();
    setProductsList(pData);
    const cData = await api.getCustomers();
    setCustomersList(cData);

    if (pData.length > 0 && !newShipment.productId) {
      setNewShipment(prev => ({
        ...prev,
        productId: prev.productId || pData[0].id,
        product: prev.product || pData[0].name
      }));
    }
    if (cData.length > 0 && !newShipment.customerId) {
      setNewShipment(prev => ({
        ...prev,
        customerId: prev.customerId || cData[0].id,
        customer: prev.customer || cData[0].name,
        destination: prev.destination || cData[0].location || ''
      }));
    }

    const paramId = searchParams.get('id');
    if (paramId) {
      const match = data.find((s) => s.id === paramId);
      if (match) setSelectedShipment(match);
      else if (data.length > 0) setSelectedShipment(data[0]);
    } else if (data.length > 0 && !selectedShipment) {
      setSelectedShipment(data[0]);
    }
  };

  useEffect(() => {
    loadShipments();
  }, [searchParams]);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setOriginFilter('all');
    setDestFilter('all');
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    return shipments.filter((s) => {
      const matchSearch =
        search === '' ||
        s.id?.toLowerCase().includes(search.toLowerCase()) ||
        s.product?.toLowerCase().includes(search.toLowerCase()) ||
        s.origin?.toLowerCase().includes(search.toLowerCase()) ||
        s.destination?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchOrigin = originFilter === 'all' || s.origin === originFilter;
      const matchDest = destFilter === 'all' || s.destination === destFilter;

      return matchSearch && matchStatus && matchOrigin && matchDest;
    });
  }, [shipments, search, statusFilter, originFilter, destFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    if (!newShipment.product || !newShipment.origin || !newShipment.destination) {
      alert('Please fill out Product, Origin, and Destination.');
      return;
    }
    const created = await api.addShipment({
      ...newShipment,
      quantity: Number(newShipment.quantity) || 0
    });
    setShipments((prev) => [created, ...prev]);
    setSelectedShipment(created);
    setIsModalOpen(false);
    setNewShipment({
      id: '',
      product: '',
      productId: '',
      quantity: '',
      unit: 'units',
      origin: '',
      destination: '',
      departure: '',
      eta: '',
      transporter: '',
      vehicleNumber: '',
      driver: '',
      contact: '',
      status: 'In Transit'
    });
  };

  const origins = useMemo(() => {
    return ['all', ...Array.from(new Set(shipments.map((s) => s.origin).filter(Boolean)))];
  }, [shipments]);

  const destinations = useMemo(() => {
    return ['all', ...Array.from(new Set(shipments.map((s) => s.destination).filter(Boolean)))];
  }, [shipments]);

  const columns = [
    {
      header: 'Shipment ID',
      accessor: 'id',
      render: (row) => (
        <span className="font-mono font-bold text-purple-600 hover:underline">
          {row.id}
        </span>
      )
    },
    {
      header: 'Product',
      accessor: 'product',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-800">{row.product}</span>
          <span className="text-[11px] text-slate-400 block">{row.quantity?.toLocaleString() || 0} {row.unit}</span>
        </div>
      )
    },
    {
      header: 'Origin',
      accessor: 'origin',
      render: (row) => (
        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          {row.origin}
        </span>
      )
    },
    {
      header: 'Destination',
      accessor: 'destination',
      render: (row) => (
        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
          <MapPin className="h-3.5 w-3.5 text-rose-400" />
          {row.destination}
        </span>
      )
    },
    { header: 'Departure', accessor: 'departure' },
    { header: 'ETA', accessor: 'eta' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} size="sm" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Shipments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track and manage all material shipments across your supply chain
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-purple-700 active:scale-98 transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Shipment
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Shipments"
          value="--"
          icon={Truck}
          color="purple"
        />
        <KPICard
          title="In Transit"
          value="--"
          icon={Navigation}
          color="blue"
        />
        <KPICard
          title="Delivered"
          value="--"
          icon={CheckCircle2}
          color="emerald"
        />
        <KPICard
          title="Delayed"
          value="--"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex-1 min-w-[240px] max-w-sm">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setCurrentPage(1);
            }}
            placeholder="Search Shipment ID, Product, City..."
            onClear={() => setSearch('')}
          />
        </div>

        <FilterBar
          filters={[
            {
              key: 'status',
              value: statusFilter,
              options: [
                { value: 'all', label: 'All Statuses' },
                { value: 'In Transit', label: 'In Transit' },
                { value: 'Delivered', label: 'Delivered' },
                { value: 'Delayed', label: 'Delayed' },
                { value: 'Pending', label: 'Pending' }
              ]
            },
            {
              key: 'origin',
              value: originFilter,
              options: origins.map((o) => ({
                value: o,
                label: o === 'all' ? 'All Origins' : o
              }))
            },
            {
              key: 'destination',
              value: destFilter,
              options: destinations.map((d) => ({
                value: d,
                label: d === 'all' ? 'All Destinations' : d
              }))
            }
          ]}
          onFilterChange={(key, val) => {
            if (key === 'status') setStatusFilter(val);
            if (key === 'origin') setOriginFilter(val);
            if (key === 'destination') setDestFilter(val);
            setCurrentPage(1);
          }}
          onReset={handleResetFilters}
        />
      </div>

      {/* Main Split: Table & Right Live Tracking Drawer */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <DataTable
            title="Active Freight Consignments"
            subtitle="Multi-modal transport telematics and delivery status"
            columns={columns}
            data={paginatedData}
            emptyMessage="No shipment data available"
            onRowClick={(row) => setSelectedShipment(row)}
            onExport={() => exportToCSV('materialiq_shipments', filteredData)}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredData.length}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Right Live Tracking & Details Panel */}
        <div className="lg:w-96 shrink-0 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs h-fit space-y-6">
          {selectedShipment ? (
            <>
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedShipment.id}</h3>
                    <StatusBadge status={selectedShipment.status} size="sm" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 mt-0.5">{selectedShipment.product}</h4>
                  <p className="text-xs text-slate-500">
                    {selectedShipment.quantity} {selectedShipment.unit} {selectedShipment.customerName ? `• ${selectedShipment.customerName}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedShipment(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* LIVE TRACKING VISUAL ROUTE */}
              <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/70 to-indigo-50/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                    <Navigation className="h-4 w-4 text-purple-600 animate-pulse" />
                    Live Route Telematics
                  </span>
                  <span className="rounded-md bg-purple-200/80 px-2 py-0.5 text-[10px] font-bold text-purple-900">
                    {selectedShipment.progressPercent || 0}% Completed
                  </span>
                </div>

                {/* Visual Route Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {selectedShipment.origin || '--'}
                    </span>
                    <span className="flex items-center gap-1 text-rose-600">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      {selectedShipment.destination || '--'}
                    </span>
                  </div>

                  {/* Progress Line */}
                  <div className="relative h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-purple-500 to-indigo-600 transition-all duration-500"
                      style={{ width: `${selectedShipment.progressPercent || 0}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>Dep: {selectedShipment.departure || '--'}</span>
                    <span>ETA: {selectedShipment.eta || '--'}</span>
                  </div>
                </div>

                {/* Current Status Pill */}
                <div className="rounded-xl bg-white/90 p-2.5 text-xs shadow-2xs border border-purple-100/50">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                    Current Position
                  </span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    📍 {selectedShipment.currentLocation || '--'}
                  </p>
                  <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                    <span>Covered: {selectedShipment.distanceCovered || '--'}</span>
                    <span>Total: {selectedShipment.distanceTotal || '--'}</span>
                  </div>
                </div>
              </div>

              {/* Transporter & Driver Info */}
              <div className="space-y-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Logistics Carrier &amp; Driver
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Transporter</span>
                  <span className="font-bold text-slate-800">{selectedShipment.transporter || '--'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Vehicle Plate</span>
                  <span className="font-mono font-bold text-slate-800">{selectedShipment.vehicleNumber || '--'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Driver</span>
                  <span className="font-semibold text-slate-800">{selectedShipment.driver || '--'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Dispatch Contact</span>
                  <span className="font-mono text-emerald-700 font-semibold">{selectedShipment.contact || '--'}</span>
                </div>
              </div>

              {/* Checkpoints Timeline */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Route Checkpoints
                </span>
                {selectedShipment.checkpoints && selectedShipment.checkpoints.length > 0 ? (
                  <div className="space-y-2 text-xs">
                    {selectedShipment.checkpoints.map((cp, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${cp.status === 'Completed' || cp.status === 'Delivered' ? 'bg-emerald-500' : cp.status === 'Delayed' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                        <div className="flex-1 flex justify-between">
                          <span className="font-medium text-slate-700">{cp.location}</span>
                          <span className="text-[11px] text-slate-400">{cp.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No checkpoints recorded</p>
                )}
              </div>

              {/* Trace Action */}
              <button
                onClick={() => navigate(`/trace?id=${selectedShipment.id}`)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-purple-700 transition-all"
              >
                Trace Material Origin
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Truck className="h-10 w-10 text-slate-300 mb-3" />
              <h4 className="text-sm font-semibold text-slate-700">No entity selected</h4>
              <p className="text-xs text-slate-400 mt-1">Select a shipment from the table to view details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Shipment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Outbound Shipment"
        subtitle="Schedule freight dispatch and assign carrier"
      >
        <form onSubmit={handleCreateShipment} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Product *</label>
              <select
                required
                value={newShipment.productId}
                onChange={(e) => {
                  const sel = productsList.find(p => p.id === e.target.value);
                  setNewShipment({
                    ...newShipment,
                    productId: e.target.value,
                    product: sel ? sel.name : e.target.value
                  });
                }}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-purple-500 focus:outline-hidden"
              >
                <option value="">-- Select Product --</option>
                {productsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} - {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Quantity *</label>
              <input
                type="number"
                required
                placeholder="Enter quantity"
                value={newShipment.quantity}
                onChange={(e) => setNewShipment({ ...newShipment, quantity: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-purple-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Destination Customer</label>
              <select
                value={newShipment.customerId}
                onChange={(e) => {
                  const sel = customersList.find(c => c.id === e.target.value);
                  setNewShipment({
                    ...newShipment,
                    customerId: e.target.value,
                    customer: sel ? sel.name : e.target.value,
                    destination: sel?.location || newShipment.destination
                  });
                }}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-purple-500 focus:outline-hidden"
              >
                <option value="">-- Select Customer --</option>
                {customersList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} - {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Origin City *</label>
              <input
                type="text"
                required
                placeholder="Enter origin city"
                value={newShipment.origin}
                onChange={(e) => setNewShipment({ ...newShipment, origin: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-purple-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Destination City *</label>
              <input
                type="text"
                required
                placeholder="Enter destination city"
                value={newShipment.destination}
                onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-purple-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Transporter Carrier</label>
              <input
                type="text"
                placeholder="Enter carrier name"
                value={newShipment.transporter}
                onChange={(e) => setNewShipment({ ...newShipment, transporter: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-purple-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Transporter Carrier</label>
              <input
                type="text"
                placeholder="Enter carrier name"
                value={newShipment.transporter}
                onChange={(e) => setNewShipment({ ...newShipment, transporter: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-purple-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Vehicle Number</label>
              <input
                type="text"
                placeholder="Enter vehicle number"
                value={newShipment.vehicleNumber}
                onChange={(e) => setNewShipment({ ...newShipment, vehicleNumber: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-purple-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-purple-600 px-5 py-2 font-bold text-white hover:bg-purple-700 shadow-sm"
            >
              Dispatch Shipment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
