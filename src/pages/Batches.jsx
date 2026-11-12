import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Plus,
  CheckCircle2,
  Truck,
  Boxes,
  ExternalLink,
  X,
  FileCheck
} from 'lucide-react';
import KPICard from '../components/common/KPICard';
import SearchBar from '../components/common/SearchBar';
import FilterBar from '../components/common/FilterBar';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { api } from '../services/api';
import { exportToCSV } from '../utils/exportCSV';

export default function Batches() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // New batch modal state
  const [materialsList, setMaterialsList] = useState([]);
  const [newBatch, setNewBatch] = useState({
    id: '',
    name: '',
    process: '',
    materialId: '',
    materials: [],
    supplier: '',
    productionDate: '',
    expiryDate: '',
    quantity: '',
    unit: 'kg',
    status: 'Active',
    location: '',
    qualityStatus: 'Passed',
    operator: ''
  });

  const loadBatches = async () => {
    const data = await api.getBatches();
    setBatches(data);
    const mats = await api.getMaterials();
    setMaterialsList(mats);
    if (mats.length > 0 && !newBatch.materialId) {
      setNewBatch(prev => ({ ...prev, materialId: prev.materialId || mats[0].id, materials: prev.materials.length > 0 ? prev.materials : [mats[0].id] }));
    }
    if (data.length > 0 && !selectedBatch) {
      setSelectedBatch(data[0]);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    return batches.filter((b) => {
      const matchSearch =
        search === '' ||
        b.id?.toLowerCase().includes(search.toLowerCase()) ||
        b.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.supplier?.toLowerCase().includes(search.toLowerCase()) ||
        (b.materials && b.materials.some(m => m.toLowerCase().includes(search.toLowerCase())));

      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [batches, search, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    if (!newBatch.name || !newBatch.quantity) {
      alert('Please fill in required fields.');
      return;
    }
    const created = await api.addBatch({
      ...newBatch,
      quantity: Number(newBatch.quantity) || 0
    });
    setBatches((prev) => [created, ...prev]);
    setSelectedBatch(created);
    setIsModalOpen(false);
    setNewBatch({
      id: '',
      name: '',
      process: '',
      materials: [],
      supplier: '',
      productionDate: '',
      expiryDate: '',
      quantity: '',
      unit: 'kg',
      status: 'Active',
      location: '',
      qualityStatus: 'Passed',
      operator: ''
    });
  };

  const columns = [
    {
      header: 'Batch ID',
      accessor: 'id',
      render: (row) => (
        <span className="font-mono font-bold text-blue-600 hover:underline">
          {row.id}
        </span>
      )
    },
    {
      header: 'Process / Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.name}</p>
          <span className="text-[11px] text-slate-400">{row.process || '--'}</span>
        </div>
      )
    },
    {
      header: 'Raw Materials Consumed',
      accessor: 'materials',
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.materials && row.materials.length > 0 ? (
            row.materials.map((m, idx) => (
              <span
                key={idx}
                className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-100"
              >
                {m.split(' ')[0]}
              </span>
            ))
          ) : (
            <span className="text-slate-400 text-xs">--</span>
          )}
        </div>
      )
    },
    { header: 'Supplier', accessor: 'supplier' },
    { header: 'Production Date', accessor: 'productionDate' },
    { header: 'Expiry Date', accessor: 'expiryDate' },
    {
      header: 'Quantity',
      accessor: 'quantity',
      render: (row) => (
        <span className="font-semibold text-slate-800">
          {row.quantity?.toLocaleString() || 0} {row.unit}
        </span>
      )
    },
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Batches</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage and track all material batches from production to final delivery
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-98 transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Batch
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Batches"
          value="--"
          icon={Layers}
          color="blue"
        />
        <KPICard
          title="Active Batches"
          value="--"
          icon={CheckCircle2}
          color="emerald"
        />
        <KPICard
          title="In Transit"
          value="--"
          icon={Truck}
          color="purple"
        />
        <KPICard
          title="Completed"
          value="--"
          icon={FileCheck}
          color="orange"
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
            placeholder="Search batch ID, process, material..."
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
                { value: 'Active', label: 'Active' },
                { value: 'In Transit', label: 'In Transit' },
                { value: 'Completed', label: 'Completed' }
              ]
            }
          ]}
          onFilterChange={(key, val) => {
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
            title="Production Batches"
            subtitle="Real-time metallurgical and manufacturing batch log"
            columns={columns}
            data={paginatedData}
            emptyMessage="No batch data available"
            onRowClick={(row) => setSelectedBatch(row)}
            onExport={() => exportToCSV('materialiq_batches', filteredData)}
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

        {/* Right Batch Details Panel */}
        <div className="lg:w-96 shrink-0 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs h-fit space-y-6">
          {selectedBatch ? (
            <>
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedBatch.id}</h3>
                    <StatusBadge status={selectedBatch.status} size="sm" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 mt-0.5">{selectedBatch.name}</h4>
                  <p className="text-xs text-slate-500">{selectedBatch.location || '--'}</p>
                </div>
                <button
                  onClick={() => setSelectedBatch(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Properties Grid */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Quality Compliance</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {selectedBatch.qualityStatus || 'Passed'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Production Date</span>
                  <span className="font-semibold text-slate-800">{selectedBatch.productionDate || '--'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Batch Yield</span>
                  <span className="font-semibold text-slate-800">
                    {selectedBatch.quantity?.toLocaleString() || 0} {selectedBatch.unit}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Certified Operator</span>
                  <span className="font-semibold text-slate-800">{selectedBatch.operator || '--'}</span>
                </div>
              </div>

              {/* Ingested Materials */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Ingested Materials
                </span>
                {selectedBatch.materials && selectedBatch.materials.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedBatch.materials.map((m, idx) => (
                      <div
                        key={idx}
                        onClick={() => navigate(`/materials?id=${m.split(' ')[0]}`)}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs hover:bg-emerald-50/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Boxes className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="font-medium text-slate-800">{m}</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold">Verified</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-1">No materials recorded</p>
                )}
              </div>

              {/* Traceability Flow Action */}
              <button
                onClick={() => navigate(`/trace?id=${selectedBatch.id}`)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-all"
              >
                Explore Batch Genealogy
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Layers className="h-10 w-10 text-slate-300 mb-3" />
              <h4 className="text-sm font-semibold text-slate-700">No entity selected</h4>
              <p className="text-xs text-slate-400 mt-1">Select a batch from the table to view details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Batch Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Production Batch"
        subtitle="Initiate a new production run from raw material inventory"
      >
        <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Batch ID (Optional)</label>
              <input
                type="text"
                placeholder="Enter batch ID"
                value={newBatch.id}
                onChange={(e) => setNewBatch({ ...newBatch, id: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Batch Name *</label>
              <input
                type="text"
                required
                placeholder="Enter batch name"
                value={newBatch.name}
                onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Source Material</label>
              <select
                value={newBatch.materialId}
                onChange={(e) => setNewBatch({ ...newBatch, materialId: e.target.value, materials: [e.target.value] })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-blue-500 focus:outline-hidden"
              >
                <option value="">-- Select Material --</option>
                {materialsList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} - {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Manufacturing Process</label>
              <input
                type="text"
                placeholder="Enter manufacturing process"
                value={newBatch.process}
                onChange={(e) => setNewBatch({ ...newBatch, process: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Batch Output Quantity</label>
              <input
                type="number"
                required
                placeholder="Enter quantity"
                value={newBatch.quantity}
                onChange={(e) => setNewBatch({ ...newBatch, quantity: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Unit</label>
              <select
                value={newBatch.unit}
                onChange={(e) => setNewBatch({ ...newBatch, unit: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="kg">kg</option>
                <option value="pcs">pcs</option>
                <option value="units">units</option>
              </select>
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
              className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 shadow-sm"
            >
              Start Batch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
