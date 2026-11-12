import React, { useState, useEffect, useMemo } from 'react';
import {
  Boxes,
  Plus,
  X,
  TrendingUp,
  Clock,
  Warehouse,
  ExternalLink,
  Layers
} from 'lucide-react';
import KPICard from '../components/common/KPICard';
import SearchBar from '../components/common/SearchBar';
import FilterBar from '../components/common/FilterBar';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import StockTrend from '../components/charts/StockTrend';
import { api } from '../services/api';
import { exportToCSV } from '../utils/exportCSV';

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // New material modal state
  const [newMaterial, setNewMaterial] = useState({
    id: '',
    name: '',
    category: 'Metal',
    supplier: '',
    currentStock: '',
    unit: 'kg',
    status: 'In Stock',
    reorderLevel: '',
    leadTime: '',
    location: '',
    description: ''
  });

  const loadMaterials = async () => {
    const data = await api.getMaterials();
    setMaterials(data);
    if (data.length > 0 && !selectedMaterial) {
      setSelectedMaterial(data[0]);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const handleResetFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setSupplierFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  // Filtered and paginated list
  const filteredData = useMemo(() => {
    return materials.filter((item) => {
      const matchSearch =
        search === '' ||
        item.id?.toLowerCase().includes(search.toLowerCase()) ||
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.supplier?.toLowerCase().includes(search.toLowerCase());

      const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchSupplier = supplierFilter === 'all' || item.supplier === supplierFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchSearch && matchCategory && matchSupplier && matchStatus;
    });
  }, [materials, search, categoryFilter, supplierFilter, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Handle Add Material submission
  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    if (!newMaterial.name || !newMaterial.supplier) {
      alert('Please fill out Material Name and Supplier.');
      return;
    }
    const created = await api.addMaterial({
      ...newMaterial,
      currentStock: Number(newMaterial.currentStock) || 0,
      reorderLevel: Number(newMaterial.reorderLevel) || 0
    });
    setMaterials((prev) => [created, ...prev]);
    setSelectedMaterial(created);
    setIsModalOpen(false);
    setNewMaterial({
      id: '',
      name: '',
      category: 'Metal',
      supplier: '',
      currentStock: '',
      unit: 'kg',
      status: 'In Stock',
      reorderLevel: '',
      leadTime: '',
      location: '',
      description: ''
    });
  };

  // Unique suppliers & categories for dropdowns
  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(materials.map((m) => m.category).filter(Boolean)))];
  }, [materials]);

  const suppliers = useMemo(() => {
    return ['all', ...Array.from(new Set(materials.map((m) => m.supplier).filter(Boolean)))];
  }, [materials]);

  const columns = [
    {
      header: 'Material ID',
      accessor: 'id',
      render: (row) => (
        <span className="font-mono font-bold text-blue-600 hover:underline">
          {row.id}
        </span>
      )
    },
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <span className="font-bold text-slate-800">{row.name}</span>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => (
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
          {row.category}
        </span>
      )
    },
    { header: 'Supplier', accessor: 'supplier' },
    {
      header: 'Current Stock',
      accessor: 'currentStock',
      render: (row) => (
        <span className="font-semibold text-slate-800">
          {row.currentStock?.toLocaleString() || 0} {row.unit}
        </span>
      )
    },
    { header: 'Unit', accessor: 'unit' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} size="sm" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title & Add Material Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Materials</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage and track all raw materials across your supply chain
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-98 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Material
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Materials"
          value="--"
          icon={Boxes}
          color="emerald"
        />
        <KPICard
          title="Active Materials"
          value="--"
          icon={Warehouse}
          color="blue"
        />
        <KPICard
          title="Low Stock"
          value="--"
          icon={TrendingUp}
          color="orange"
        />
        <KPICard
          title="Out of Stock"
          value="--"
          icon={Clock}
          color="rose"
        />
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex-1 min-w-[240px] max-w-sm">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setCurrentPage(1);
            }}
            placeholder="Search material by name, code or supplier..."
            onClear={() => setSearch('')}
          />
        </div>

        <FilterBar
          filters={[
            {
              key: 'category',
              value: categoryFilter,
              options: categories.map((c) => ({
                value: c,
                label: c === 'all' ? 'All Categories' : c
              }))
            },
            {
              key: 'supplier',
              value: supplierFilter,
              options: suppliers.map((s) => ({
                value: s,
                label: s === 'all' ? 'All Suppliers' : s
              }))
            },
            {
              key: 'status',
              value: statusFilter,
              options: [
                { value: 'all', label: 'All Status' },
                { value: 'In Stock', label: 'In Stock' },
                { value: 'Low Stock', label: 'Low Stock' },
                { value: 'Out of Stock', label: 'Out of Stock' }
              ]
            }
          ]}
          onFilterChange={(key, val) => {
            if (key === 'category') setCategoryFilter(val);
            if (key === 'supplier') setSupplierFilter(val);
            if (key === 'status') setStatusFilter(val);
            setCurrentPage(1);
          }}
          onReset={handleResetFilters}
        />
      </div>

      {/* Table & Right Details Drawer Split */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Materials Table */}
        <div className="flex-1 min-w-0">
          <DataTable
            title="Materials List"
            subtitle="View and manage all raw materials in your supply chain"
            columns={columns}
            data={paginatedData}
            emptyMessage="No material data available"
            onRowClick={(row) => setSelectedMaterial(row)}
            onExport={() => exportToCSV('materialiq_materials', filteredData)}
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

        {/* Right Material Details Panel */}
        <div className="lg:w-96 shrink-0 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs h-fit space-y-6">
          {selectedMaterial ? (
            <>
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedMaterial.id}</h3>
                    <StatusBadge status={selectedMaterial.status} size="sm" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 mt-0.5">{selectedMaterial.name}</h4>
                  <p className="text-xs text-slate-500">{selectedMaterial.supplier}</p>
                </div>
                <button
                  onClick={() => setSelectedMaterial(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Properties Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Current Stock</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    {selectedMaterial.currentStock?.toLocaleString() || 0} {selectedMaterial.unit}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Reorder Level</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    {selectedMaterial.reorderLevel?.toLocaleString() || '--'} {selectedMaterial.unit}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Lead Time</span>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">
                    {selectedMaterial.leadTime || '--'}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Storage Location</span>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">
                    {selectedMaterial.location || '--'}
                  </p>
                </div>
              </div>

              {/* Stock Trend Chart */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">Stock Trend</span>
                  <span className="text-[10px] text-slate-400">Last 6 Months</span>
                </div>
                <StockTrend
                  data={selectedMaterial.stockHistory || []}
                  color="#10b981"
                  unit={selectedMaterial.unit}
                />
              </div>

              {/* Recent Batches Association */}
              <div>
                <span className="text-xs font-bold text-slate-800 block mb-2">
                  Associated Batches
                </span>
                {selectedMaterial.batches && selectedMaterial.batches.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedMaterial.batches.map((bId) => (
                      <div
                        key={bId}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5 text-blue-600" />
                          <span className="font-mono font-bold text-blue-700">{bId}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-1">No batches associated</p>
                )}
              </div>

              {/* Trace Action */}
              <button
                onClick={() => (window.location.href = `/trace?id=${selectedMaterial.id}`)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all"
              >
                Trace Material Flow
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Boxes className="h-10 w-10 text-slate-300 mb-3" />
              <h4 className="text-sm font-semibold text-slate-700">No entity selected</h4>
              <p className="text-xs text-slate-400 mt-1">Select a material from the table to view details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Material Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Raw Material"
        subtitle="Register a new material SKU and associate it with a supplier"
      >
        <form onSubmit={handleCreateMaterial} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Material ID (Optional)</label>
              <input
                type="text"
                placeholder="Enter material ID"
                value={newMaterial.id}
                onChange={(e) => setNewMaterial({ ...newMaterial, id: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Material Name *</label>
              <input
                type="text"
                required
                placeholder="Enter material name"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Category</label>
              <select
                value={newMaterial.category}
                onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="Metal">Metal</option>
                <option value="Polymer">Polymer</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Electrical">Electrical</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Supplier *</label>
              <input
                type="text"
                required
                placeholder="Enter supplier name"
                value={newMaterial.supplier}
                onChange={(e) => setNewMaterial({ ...newMaterial, supplier: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Initial Stock</label>
              <input
                type="number"
                placeholder="Enter initial stock"
                value={newMaterial.currentStock}
                onChange={(e) => setNewMaterial({ ...newMaterial, currentStock: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Unit</label>
              <select
                value={newMaterial.unit}
                onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="kg">kg</option>
                <option value="pcs">pcs</option>
                <option value="meters">meters</option>
                <option value="liters">liters</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Reorder Level</label>
              <input
                type="number"
                placeholder="Enter reorder level"
                value={newMaterial.reorderLevel}
                onChange={(e) => setNewMaterial({ ...newMaterial, reorderLevel: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Enter material description..."
              value={newMaterial.description}
              onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
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
              Save Material
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
