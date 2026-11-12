import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ExternalLink,
  X,
  Activity
} from 'lucide-react';
import KPICard from '../components/common/KPICard';
import SearchBar from '../components/common/SearchBar';
import FilterBar from '../components/common/FilterBar';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { api } from '../services/api';
import { exportToCSV } from '../utils/exportCSV';

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Create Event modal state
  const [entityOptions, setEntityOptions] = useState([]);
  const [newEvent, setNewEvent] = useState({
    id: '',
    type: 'Quality Check',
    entityType: 'Batch',
    entityId: '',
    location: '',
    performedBy: '',
    description: ''
  });

  const loadEvents = async () => {
    const data = await api.getEvents();
    setEvents(data);
    const batches = await api.getBatches();
    const mats = await api.getMaterials();
    const prods = await api.getProducts();
    const ships = await api.getShipments();
    const custs = await api.getCustomers();
    const all = [
      ...batches.map(b => ({ id: b.id, type: 'Batch', label: `${b.id} - ${b.name}` })),
      ...mats.map(m => ({ id: m.id, type: 'Material', label: `${m.id} - ${m.name}` })),
      ...prods.map(p => ({ id: p.id, type: 'Product', label: `${p.id} - ${p.name}` })),
      ...ships.map(s => ({ id: s.id, type: 'Shipment', label: `${s.id} - ${s.origin} -> ${s.destination}` })),
      ...custs.map(c => ({ id: c.id, type: 'Customer', label: `${c.id} - ${c.name}` }))
    ];
    setEntityOptions(all);
    if (!newEvent.entityId && batches.length > 0) {
      setNewEvent(prev => ({ ...prev, entityId: prev.entityId || batches[0].id }));
    }
    if (data.length > 0 && !selectedEvent) {
      setSelectedEvent(data[0]);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setEntityTypeFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    return events.filter((e) => {
      const matchSearch =
        search === '' ||
        e.id?.toLowerCase().includes(search.toLowerCase()) ||
        e.type?.toLowerCase().includes(search.toLowerCase()) ||
        e.entityId?.toLowerCase().includes(search.toLowerCase()) ||
        e.location?.toLowerCase().includes(search.toLowerCase());

      const matchType = typeFilter === 'all' || e.type === typeFilter;
      const matchEntity = entityTypeFilter === 'all' || e.entityType === entityTypeFilter;
      const matchStatus = statusFilter === 'all' || e.status === statusFilter;

      return matchSearch && matchType && matchEntity && matchStatus;
    });
  }, [events, search, typeFilter, entityTypeFilter, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.entityId || !newEvent.location) {
      alert('Please fill out Entity ID and Location.');
      return;
    }
    const created = await api.addEvent(newEvent);
    setEvents((prev) => [created, ...prev]);
    setSelectedEvent(created);
    setIsModalOpen(false);
    setNewEvent({
      id: '',
      type: 'Quality Check',
      entityType: 'Batch',
      entityId: '',
      location: '',
      performedBy: '',
      description: ''
    });
  };

  const eventTypes = useMemo(() => {
    return ['all', ...Array.from(new Set(events.map((e) => e.type).filter(Boolean)))];
  }, [events]);

  const entityTypes = useMemo(() => {
    return ['all', ...Array.from(new Set(events.map((e) => e.entityType).filter(Boolean)))];
  }, [events]);

  const columns = [
    {
      header: 'Event ID',
      accessor: 'id',
      render: (row) => (
        <span className="font-mono font-bold text-slate-900 hover:underline">
          {row.id}
        </span>
      )
    },
    {
      header: 'Event Type',
      accessor: 'type',
      render: (row) => (
        <span className="font-bold text-slate-800">{row.type}</span>
      )
    },
    {
      header: 'Related Entity',
      accessor: 'entityType',
      render: (row) => (
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
          {row.entityType}
        </span>
      )
    },
    {
      header: 'Entity ID',
      accessor: 'entityId',
      render: (row) => (
        <span className="font-mono font-bold text-blue-600 hover:underline">
          {row.entityId}
        </span>
      )
    },
    {
      header: 'Location',
      accessor: 'location',
      render: (row) => (
        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          {row.location}
        </span>
      )
    },
    { header: 'Date & Time', accessor: 'timestamp' },
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Events</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track all supply chain events across materials, batches, products and shipments
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-98 transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Events"
          value="--"
          icon={CalendarClock}
          color="emerald"
        />
        <KPICard
          title="Today's Events"
          value="--"
          icon={Activity}
          color="blue"
        />
        <KPICard
          title="Exceptions"
          value="--"
          icon={AlertTriangle}
          color="rose"
        />
        <KPICard
          title="Completed"
          value="--"
          icon={CheckCircle2}
          color="purple"
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
            placeholder="Search event type, ID or facility..."
            onClear={() => setSearch('')}
          />
        </div>

        <FilterBar
          filters={[
            {
              key: 'type',
              value: typeFilter,
              options: eventTypes.map((t) => ({
                value: t,
                label: t === 'all' ? 'All Event Types' : t
              }))
            },
            {
              key: 'entityType',
              value: entityTypeFilter,
              options: entityTypes.map((e) => ({
                value: e,
                label: e === 'all' ? 'All Entity Types' : e
              }))
            },
            {
              key: 'status',
              value: statusFilter,
              options: [
                { value: 'all', label: 'All Statuses' },
                { value: 'Completed', label: 'Completed' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Exception', label: 'Exception' }
              ]
            }
          ]}
          onFilterChange={(key, val) => {
            if (key === 'type') setTypeFilter(val);
            if (key === 'entityType') setEntityTypeFilter(val);
            if (key === 'status') setStatusFilter(val);
            setCurrentPage(1);
          }}
          onReset={handleResetFilters}
        />
      </div>

      {/* Main Split */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <DataTable
            title="Supply Chain Event Stream"
            subtitle="Immutable audit trail of materials and distribution lifecycle"
            columns={columns}
            data={paginatedData}
            emptyMessage="No recent events"
            onRowClick={(row) => setSelectedEvent(row)}
            onExport={() => exportToCSV('materialiq_events', filteredData)}
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

        {/* Right Event Details Panel */}
        <div className="lg:w-96 shrink-0 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs h-fit space-y-6">
          {selectedEvent ? (
            <>
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedEvent.id}</h3>
                    <StatusBadge status={selectedEvent.status} size="sm" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 mt-0.5">{selectedEvent.type}</h4>
                  <p className="text-xs text-slate-500">{selectedEvent.location}</p>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Description */}
              {selectedEvent.description && (
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedEvent.description}
                </p>
              )}

              {/* Properties Grid */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Related Entity</span>
                  <span className="font-semibold text-slate-800">
                    {selectedEvent.entityType} ({selectedEvent.entityId})
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Logged Timestamp</span>
                  <span className="font-semibold text-slate-800">{selectedEvent.timestamp || '--'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Performed By</span>
                  <span className="font-semibold text-slate-800">{selectedEvent.performedBy || '--'}</span>
                </div>
              </div>

              {/* Chronological Timeline */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  Lifecycle Progression
                </span>
                {selectedEvent.lifecycle && selectedEvent.lifecycle.length > 0 ? (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {selectedEvent.lifecycle.map((step, idx) => (
                      <div key={idx} className="relative">
                        <div className={`absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 bg-white ${step.status === 'Completed' ? 'border-emerald-600 ring-2 ring-emerald-100' : step.status === 'Exception' ? 'border-rose-600 ring-2 ring-rose-100' : 'border-slate-400'}`} />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{step.step}</p>
                          <p className="text-[11px] text-slate-400">{step.time}</p>
                          {step.note && <p className="text-[11px] text-slate-600 mt-0.5">{step.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No lifecycle progression logged</p>
                )}
              </div>

              {/* Trace Action */}
              <button
                onClick={() => navigate(`/trace?id=${selectedEvent.entityId}`)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all"
              >
                Trace Entity Stream
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <CalendarClock className="h-10 w-10 text-slate-300 mb-3" />
              <h4 className="text-sm font-semibold text-slate-700">No entity selected</h4>
              <p className="text-xs text-slate-400 mt-1">Select an event from the table to view details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Supply Chain Event"
        subtitle="Record quality inspection, dispatch or milestone"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Event Type *</label>
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="Quality Check">Quality Check</option>
                <option value="Shipment Dispatched">Shipment Dispatched</option>
                <option value="Arrived at Hub">Arrived at Hub</option>
                <option value="Delivered">Delivered</option>
                <option value="Batch Created">Batch Created</option>
                <option value="Production Start">Production Start</option>
                <option value="Shipment Delayed">Shipment Delayed</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Entity Type</label>
              <select
                value={newEvent.entityType}
                onChange={(e) => setNewEvent({ ...newEvent, entityType: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="Batch">Batch</option>
                <option value="Material">Material</option>
                <option value="Product">Product</option>
                <option value="Shipment">Shipment</option>
                <option value="Customer">Customer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Entity ID *</label>
              <input
                type="text"
                required
                list="entity-id-list"
                placeholder="Enter or select entity ID (e.g. BAT-001)"
                value={newEvent.entityId}
                onChange={(e) => setNewEvent({ ...newEvent, entityId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
              />
              <datalist id="entity-id-list">
                {entityOptions
                  .filter(opt => !newEvent.entityType || opt.type.toLowerCase() === newEvent.entityType.toLowerCase())
                  .map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
              </datalist>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Location *</label>
              <input
                type="text"
                required
                placeholder="Enter location / facility"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Performed By</label>
            <input
              type="text"
              placeholder="Enter operator / inspector name"
              value={newEvent.performedBy}
              onChange={(e) => setNewEvent({ ...newEvent, performedBy: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Enter event description..."
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
            />
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
              className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700 shadow-sm"
            >
              Record Event
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
