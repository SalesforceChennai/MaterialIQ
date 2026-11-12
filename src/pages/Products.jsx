import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Layers,
  ExternalLink,
  X,
  TrendingUp,
  Tag
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

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Add Product modal state
  const [batchesList, setBatchesList] = useState([]);
  const [newProduct, setNewProduct] = useState({
    id: '',
    name: '',
    category: 'Automotive',
    currentStock: '',
    unit: 'pcs',
    status: 'In Stock',
    batchId: '',
    description: '',
    unitPrice: ''
  });

  const loadProducts = async () => {
    const data = await api.getProducts();
    setProducts(data);
    const bData = await api.getBatches();
    setBatchesList(bData);
    if (bData.length > 0 && !newProduct.batchId) {
      setNewProduct(prev => ({ ...prev, batchId: prev.batchId || bData[0].id }));
    }
    if (data.length > 0 && !selectedProduct) {
      setSelectedProduct(data[0]);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleResetFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        search === '' ||
        p.id?.toLowerCase().includes(search.toLowerCase()) ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase());

      const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name) {
      alert('Please enter a product name.');
      return;
    }
    const created = await api.addProduct({
      ...newProduct,
      currentStock: Number(newProduct.currentStock) || 0
    });
    setProducts((prev) => [created, ...prev]);
    setSelectedProduct(created);
    setIsModalOpen(false);
    setNewProduct({
      id: '',
      name: '',
      category: 'Automotive',
      currentStock: '',
      unit: 'pcs',
      status: 'In Stock',
      batchId: '',
      description: '',
      unitPrice: ''
    });
  };

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];
  }, [products]);

  const columns = [
    {
      header: 'Product ID',
      accessor: 'id',
      render: (row) => (
        <span className="font-mono font-bold text-orange-600 hover:underline">
          {row.id}
        </span>
      )
    },
    {
      header: 'Product Name',
      accessor: 'name',
      render: (row) => <span className="font-bold text-slate-800">{row.name}</span>
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
      header: 'Unit Price',
      accessor: 'unitPrice',
      render: (row) => <span className="font-mono text-slate-700">{row.unitPrice || '--'}</span>
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Products</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage finished products and track their complete lifecycle
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-98 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Products"
          value="--"
          icon={Package}
          color="orange"
        />
        <KPICard
          title="Active Products"
          value="--"
          icon={Tag}
          color="emerald"
        />
        <KPICard
          title="Low Stock"
          value="--"
          icon={TrendingUp}
          color="blue"
        />
        <KPICard
          title="Product Categories"
          value="--"
          icon={Layers}
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
            placeholder="Search product ID, name, category..."
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
            if (key === 'status') setStatusFilter(val);
            setCurrentPage(1);
          }}
          onReset={handleResetFilters}
        />
      </div>

      {/* Split Table and Details */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <DataTable
            title="Products Catalog"
            subtitle="Finished products inventory and batch lineage"
            columns={columns}
            data={paginatedData}
            emptyMessage="No product data available"
            onRowClick={(row) => setSelectedProduct(row)}
            onExport={() => exportToCSV('materialiq_products', filteredData)}
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

        {/* Right Product Details Panel */}
        <div className="lg:w-96 shrink-0 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs h-fit space-y-6">
          {selectedProduct ? (
            <>
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedProduct.id}</h3>
                    <StatusBadge status={selectedProduct.status} size="sm" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 mt-0.5">{selectedProduct.name}</h4>
                  <p className="text-xs text-slate-500">{selectedProduct.category}</p>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {selectedProduct.description && (
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedProduct.description}
                </p>
              )}

              {/* Properties Grid */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Current Stock</span>
                  <span className="font-bold text-slate-800">
                    {selectedProduct.currentStock?.toLocaleString() || 0} {selectedProduct.unit}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Manufacturing Batch</span>
                  <span className="font-mono font-bold text-blue-600">{selectedProduct.batchId || '--'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Unit Price</span>
                  <span className="font-bold text-slate-800">{selectedProduct.unitPrice || '--'}</span>
                </div>
              </div>

              {/* Stock Trend Chart */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">Stock Trend</span>
                  <span className="text-[10px] text-slate-400">Last 6 Months</span>
                </div>
                <StockTrend
                  data={selectedProduct.stockTrend || []}
                  color="#f97316"
                  unit={selectedProduct.unit}
                />
              </div>

              {/* Connected Materials & Shipments */}
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Raw Materials
                  </span>
                  {selectedProduct.materials && selectedProduct.materials.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProduct.materials.map((m, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800 border border-emerald-100"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No materials recorded</p>
                  )}
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Shipments Dispatched
                  </span>
                  {selectedProduct.shipments && selectedProduct.shipments.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProduct.shipments.map((s, idx) => (
                        <span
                          key={idx}
                          onClick={() => navigate(`/shipments?id=${s}`)}
                          className="rounded-lg bg-purple-50 px-2 py-1 text-[11px] font-mono font-bold text-purple-800 border border-purple-100 cursor-pointer hover:bg-purple-100"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No shipments recorded</p>
                  )}
                </div>
              </div>

              {/* Trace Action */}
              <button
                onClick={() => navigate(`/trace?id=${selectedProduct.id}`)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-orange-700 transition-all"
              >
                Trace Product Genealogy
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Package className="h-10 w-10 text-slate-300 mb-3" />
              <h4 className="text-sm font-semibold text-slate-700">No entity selected</h4>
              <p className="text-xs text-slate-400 mt-1">Select a product from the table to view details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Finished Product"
        subtitle="Catalog a new finished product line"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Product ID (Optional)</label>
              <input
                type="text"
                placeholder="Enter product ID"
                value={newProduct.id}
                onChange={(e) => setNewProduct({ ...newProduct, id: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Product Name *</label>
              <input
                type="text"
                required
                placeholder="Enter product name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Category</label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="Automotive">Automotive</option>
                <option value="Electronics">Electronics</option>
                <option value="Electrical">Electrical</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Unit Price</label>
              <input
                type="text"
                placeholder="Enter unit price"
                value={newProduct.unitPrice}
                onChange={(e) => setNewProduct({ ...newProduct, unitPrice: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Initial Stock</label>
              <input
                type="number"
                placeholder="Enter initial stock"
                value={newProduct.currentStock}
                onChange={(e) => setNewProduct({ ...newProduct, currentStock: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Associated Batch</label>
              <select
                value={newProduct.batchId}
                onChange={(e) => setNewProduct({ ...newProduct, batchId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-orange-500 focus:outline-hidden"
              >
                <option value="">-- Select Batch --</option>
                {batchesList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} - {b.name}
                  </option>
                ))}
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
              className="rounded-xl bg-orange-600 px-5 py-2 font-bold text-white hover:bg-orange-700 shadow-sm"
            >
              Save Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
