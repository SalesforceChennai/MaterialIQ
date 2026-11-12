import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  CheckCircle2,
  Clock,
  Building2,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  X,
  Truck,
  Boxes
} from 'lucide-react';
import KPICard from '../components/common/KPICard';
import SearchBar from '../components/common/SearchBar';
import FilterBar from '../components/common/FilterBar';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { api } from '../services/api';
import { exportToCSV } from '../utils/exportCSV';

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, orders, shipments, materials
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Add Customer modal state
  const [newCustomer, setNewCustomer] = useState({
    id: '',
    name: '',
    type: 'Manufacturer',
    industry: '',
    location: '',
    contactPerson: '',
    email: '',
    phone: '',
    status: 'Active'
  });

  const loadCustomers = async () => {
    const data = await api.getCustomers();
    setCustomers(data);
    if (data.length > 0 && !selectedCustomer) {
      setSelectedCustomer(data[0]);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setIndustryFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        search === '' ||
        c.id?.toLowerCase().includes(search.toLowerCase()) ||
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.location?.toLowerCase().includes(search.toLowerCase());

      const matchType = typeFilter === 'all' || c.type === typeFilter;
      const matchIndustry = industryFilter === 'all' || c.industry === industryFilter;
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;

      return matchSearch && matchType && matchIndustry && matchStatus;
    });
  }, [customers, search, typeFilter, industryFilter, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomer.name) {
      alert('Please enter a customer name.');
      return;
    }
    const created = await api.addCustomer(newCustomer);
    setCustomers((prev) => [created, ...prev]);
    setSelectedCustomer(created);
    setIsModalOpen(false);
    setNewCustomer({
      id: '',
      name: '',
      type: 'Manufacturer',
      industry: '',
      location: '',
      contactPerson: '',
      email: '',
      phone: '',
      status: 'Active'
    });
  };

  const customerTypes = useMemo(() => {
    return ['all', ...Array.from(new Set(customers.map((c) => c.type).filter(Boolean)))];
  }, [customers]);

  const industries = useMemo(() => {
    return ['all', ...Array.from(new Set(customers.map((c) => c.industry).filter(Boolean)))];
  }, [customers]);

  const columns = [
    {
      header: 'Customer ID',
      accessor: 'id',
      render: (row) => (
        <span className="font-mono font-bold text-rose-600 hover:underline">
          {row.id}
        </span>
      )
    },
    {
      header: 'Customer Name',
      accessor: 'name',
      render: (row) => <span className="font-bold text-slate-800">{row.name}</span>
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (row) => (
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
          {row.type}
        </span>
      )
    },
    { header: 'Industry', accessor: 'industry' },
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
    {
      header: 'Total Orders',
      accessor: 'totalOrders',
      render: (row) => <span className="font-semibold text-slate-800">{row.totalOrders || 0}</span>
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customers</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage all customers and track their orders, shipments and material usage
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-700 active:scale-98 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Customers"
          value="--"
          icon={Users}
          color="rose"
        />
        <KPICard
          title="Active Customers"
          value="--"
          icon={CheckCircle2}
          color="emerald"
        />
        <KPICard
          title="New Customers"
          value="--"
          icon={Building2}
          color="blue"
        />
        <KPICard
          title="Inactive Customers"
          value="--"
          icon={Clock}
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
            placeholder="Search customer by name, ID or city..."
            onClear={() => setSearch('')}
          />
        </div>

        <FilterBar
          filters={[
            {
              key: 'type',
              value: typeFilter,
              options: customerTypes.map((t) => ({
                value: t,
                label: t === 'all' ? 'All Types' : t
              }))
            },
            {
              key: 'industry',
              value: industryFilter,
              options: industries.map((i) => ({
                value: i,
                label: i === 'all' ? 'All Industries' : i
              }))
            },
            {
              key: 'status',
              value: statusFilter,
              options: [
                { value: 'all', label: 'All Statuses' },
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' }
              ]
            }
          ]}
          onFilterChange={(key, val) => {
            if (key === 'type') setTypeFilter(val);
            if (key === 'industry') setIndustryFilter(val);
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
            title="Customer Portfolio"
            subtitle="Commercial clients and OEM distributors"
            columns={columns}
            data={paginatedData}
            emptyMessage="No customer data available"
            onRowClick={(row) => setSelectedCustomer(row)}
            onExport={() => exportToCSV('materialiq_customers', filteredData)}
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

        {/* Right Customer Details Panel with Tabs */}
        <div className="lg:w-96 shrink-0 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs h-fit space-y-5">
          {selectedCustomer ? (
            <>
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedCustomer.id}</h3>
                    <StatusBadge status={selectedCustomer.status} size="sm" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 mt-0.5">{selectedCustomer.name}</h4>
                  <p className="text-xs text-slate-500">
                    {selectedCustomer.industry} • {selectedCustomer.location}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Panel Tabs */}
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-semibold">
                {['overview', 'orders', 'shipments', 'materials'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-1.5 rounded-lg capitalize transition-all ${
                      activeTab === tab
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-3.5 text-xs">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 space-y-2">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>{selectedCustomer.email || '--'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{selectedCustomer.phone || '--'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{selectedCustomer.address || selectedCustomer.location || '--'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Orders</span>
                      <p className="text-base font-bold text-slate-800 mt-0.5">{selectedCustomer.totalOrders || 0}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Shipments</span>
                      <p className="text-base font-bold text-slate-800 mt-0.5">{selectedCustomer.totalShipments || 0}</p>
                    </div>
                  </div>

                  <div className="flex justify-between py-1.5 border-t border-slate-100">
                    <span className="text-slate-400 font-medium">Customer Since</span>
                    <span className="font-semibold text-slate-800">{selectedCustomer.customerSince || '--'}</span>
                  </div>
                </div>
              )}

              {/* Tab 2: Orders */}
              {activeTab === 'orders' && (
                <div className="space-y-2 text-xs">
                  {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                    selectedCustomer.orders.map((o, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800">{o.orderId}</span>
                          <span className="font-mono text-emerald-700 font-bold">{o.value}</span>
                        </div>
                        <p className="text-slate-600 mt-1">{o.product}</p>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                          <span>{o.date}</span>
                          <StatusBadge status={o.status} size="sm" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-1">No orders recorded</p>
                  )}
                </div>
              )}

              {/* Tab 3: Shipments */}
              {activeTab === 'shipments' && (
                <div className="space-y-2 text-xs">
                  {selectedCustomer.shipmentIds && selectedCustomer.shipmentIds.length > 0 ? (
                    selectedCustomer.shipmentIds.map((sId) => (
                      <div
                        key={sId}
                        onClick={() => navigate(`/shipments?id=${sId}`)}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 hover:bg-purple-50/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-purple-600" />
                          <span className="font-mono font-bold text-purple-700">{sId}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">View Route →</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-1">No shipments recorded</p>
                  )}
                </div>
              )}

              {/* Tab 4: Materials */}
              {activeTab === 'materials' && (
                <div className="space-y-2 text-xs">
                  <p className="text-[11px] text-slate-400">Primary raw materials embedded in delivered products:</p>
                  {selectedCustomer.materialsUsed && selectedCustomer.materialsUsed.length > 0 ? (
                    selectedCustomer.materialsUsed.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5">
                        <Boxes className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="font-medium text-slate-700">{m}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-1">No materials recorded</p>
                  )}
                </div>
              )}

              {/* Trace Action */}
              <button
                onClick={() => navigate(`/trace?id=${selectedCustomer.id}`)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-all"
              >
                Trace Client Upstream
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Users className="h-10 w-10 text-slate-300 mb-3" />
              <h4 className="text-sm font-semibold text-slate-700">No entity selected</h4>
              <p className="text-xs text-slate-400 mt-1">Select a customer from the table to view details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Customer"
        subtitle="Register client account for orders and traceability access"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Customer ID (Optional)</label>
              <input
                type="text"
                placeholder="Enter customer ID"
                value={newCustomer.id}
                onChange={(e) => setNewCustomer({ ...newCustomer, id: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-rose-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Customer Name *</label>
              <input
                type="text"
                required
                placeholder="Enter customer name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Customer Type</label>
              <select
                value={newCustomer.type}
                onChange={(e) => setNewCustomer({ ...newCustomer, type: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-rose-500 focus:outline-hidden"
              >
                <option value="Manufacturer">Manufacturer</option>
                <option value="Distributor">Distributor</option>
                <option value="Logistics Partner">Logistics Partner</option>
                <option value="OEM">OEM</option>
                <option value="Fleet Operator">Fleet Operator</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Industry</label>
              <input
                type="text"
                placeholder="Enter industry"
                value={newCustomer.industry}
                onChange={(e) => setNewCustomer({ ...newCustomer, industry: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">City / Region</label>
              <input
                type="text"
                placeholder="Enter city / location"
                value={newCustomer.location}
                onChange={(e) => setNewCustomer({ ...newCustomer, location: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-rose-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Contact Email</label>
              <input
                type="email"
                placeholder="Enter contact email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-rose-500 focus:outline-hidden"
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
              className="rounded-xl bg-rose-600 px-5 py-2 font-bold text-white hover:bg-rose-700 shadow-sm"
            >
              Save Customer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
