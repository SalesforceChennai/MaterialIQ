import React, { useState, useEffect } from 'react';
import {
  Download,
  Plus,
  Boxes,
  Truck,
  Layers,
  Users
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import KPICard from '../components/common/KPICard';
import ShipmentTrend from '../components/charts/ShipmentTrend';
import MaterialUsage from '../components/charts/MaterialUsage';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import {
  shipmentTrendData,
  materialUsageData,
  shipmentStatusData,
  eventsByTypeData,
  topCustomersData
} from '../data/reports';
import { api } from '../services/api';
import { exportToCSV } from '../utils/exportCSV';

export default function Reports() {
  const [recentReports, setRecentReports] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Custom Report Form state
  const [reportType, setReportType] = useState('Shipment Performance');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [locationFilter, setLocationFilter] = useState('All Hubs');

  useEffect(() => {
    async function loadReports() {
      const data = await api.getReports();
      setRecentReports(data);
    }
    loadReports();
  }, []);

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    const created = await api.addReport({
      name: `${reportType} — ${locationFilter}`,
      type: reportType,
      dateRange: dateRange,
      status: 'Ready'
    });
    setRecentReports((prev) => [created, ...prev]);
    setIsModalOpen(false);
  };

  const handleQuickReport = async (type) => {
    const created = await api.addReport({
      name: `Instant ${type} Digest`,
      type: type,
      dateRange: 'Current Month',
      status: 'Ready'
    });
    setRecentReports((prev) => [created, ...prev]);
  };

  return (
    <div className="space-y-7">
      {/* Page Title & Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports</h1>
          <p className="text-xs text-slate-500 mt-1">
            Insights and analytics for your supply chain operations
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-98 transition-all"
        >
          <Plus className="h-4 w-4" />
          Generate Report
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
          title="Total Batches"
          value="--"
          icon={Layers}
          color="blue"
        />
        <KPICard
          title="Total Shipments"
          value="--"
          icon={Truck}
          color="purple"
        />
        <KPICard
          title="Total Customers"
          value="--"
          icon={Users}
          color="rose"
        />
      </div>

      {/* Quick Report Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Shipment Report', icon: Truck, color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
          { label: 'Material Report', icon: Boxes, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
          { label: 'Customer Report', icon: Users, color: 'text-rose-600 bg-rose-50 hover:bg-rose-100' },
          { label: 'Inventory Report', icon: Layers, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' }
        ].map((qr) => {
          const Icon = qr.icon;
          return (
            <button
              key={qr.label}
              onClick={() => handleQuickReport(qr.label)}
              className={`flex items-center gap-2.5 rounded-2xl p-3 text-xs font-bold transition-all shadow-2xs ${qr.color}`}
            >
              <Icon className="h-4 w-4" />
              <span>{qr.label}</span>
            </button>
          );
        })}
      </div>

      {/* Charts Grid Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Shipments Trend */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Shipments Trend</h3>
              <p className="text-xs text-slate-500">Delivered vs In Transit vs Delayed (Last 6 Months)</p>
            </div>
          </div>
          <ShipmentTrend data={shipmentTrendData} />
        </div>

        {/* 2. Material Usage */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Material Consumption</h3>
              <p className="text-xs text-slate-500">Top Raw Materials Utilized Across Production</p>
            </div>
          </div>
          <MaterialUsage data={materialUsageData} />
        </div>
      </div>

      {/* Charts Grid Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. Shipment Status Distribution */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Shipment Status Breakdown</h3>
            <p className="text-xs text-slate-500 mt-0.5">Active delivery proportions</p>

            <div className="h-48 w-full mt-2">
              {shipmentStatusData && shipmentStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={shipmentStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {shipmentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm font-medium text-slate-400">
                  No data available
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3">
            {shipmentStatusData && shipmentStatusData.length > 0 ? (
              shipmentStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}:</span>
                  <span className="font-bold text-slate-900">{item.value}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-xs text-slate-400 py-1 col-span-2">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* 4. Events by Type */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-900">Events by Category</h3>
            <p className="text-xs text-slate-500 mt-0.5">Log distribution across supply nodes</p>
          </div>

          {eventsByTypeData && eventsByTypeData.length > 0 ? (
            <div className="space-y-3">
              {eventsByTypeData.map((evt) => {
                const maxCount = 480;
                const pct = Math.round((evt.count / maxCount) * 100);
                return (
                  <div key={evt.type} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-700">{evt.type}</span>
                      <span className="text-slate-900">{evt.count}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm font-medium text-slate-400">
              No data available
            </div>
          )}
        </div>

        {/* 5. Top Customers by Orders */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-900">Top Customers by Orders</h3>
            <p className="text-xs text-slate-500 mt-0.5">Leading demand volume accounts</p>
          </div>

          {topCustomersData && topCustomersData.length > 0 ? (
            <div className="space-y-3">
              {topCustomersData.map((cust, idx) => (
                <div
                  key={cust.name}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white font-bold text-slate-700 shadow-2xs">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-800">{cust.name}</span>
                      <span className="text-[10px] text-slate-400 block">{cust.orders} Orders placed</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-700">{cust.spend}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm font-medium text-slate-400">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Generated Reports</h3>
            <p className="text-xs text-slate-500 mt-0.5">Download or inspect system audit exports</p>
          </div>
          {recentReports.length > 0 && (
            <button
              onClick={() => exportToCSV('materialiq_recent_reports', recentReports)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              Export Audit CSV
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Report ID</th>
                <th className="px-4 py-3">Report Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Date Range</th>
                <th className="px-4 py-3">Generated</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No data available
                  </td>
                </tr>
              ) : (
                recentReports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">{rep.id}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{rep.name}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {rep.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{rep.dateRange}</td>
                    <td className="px-4 py-3 text-slate-500">{rep.generatedOn}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={rep.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => exportToCSV(rep.name.replace(/\s+/g, '_'), [rep])}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                      >
                        <Download className="h-3 w-3 text-emerald-600" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Report Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate Custom Supply Chain Report"
        subtitle="Compile traceability analytics across designated date window"
      >
        <form onSubmit={handleGenerateReport} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Report Category *</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
            >
              <option value="Material Traceability Audit">Material Traceability Audit</option>
              <option value="Shipment Performance & Delay Analysis">Shipment Performance & Delay Analysis</option>
              <option value="Raw Material Consumption & Lead Times">Raw Material Consumption & Lead Times</option>
              <option value="Finished Product Lineage & Genealogy">Finished Product Lineage & Genealogy</option>
              <option value="Customer Order Fulfillment Matrix">Customer Order Fulfillment Matrix</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Quarter to Date">Quarter to Date</option>
                <option value="Year to Date">Year to Date</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Location Filter</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="All Locations">All Locations</option>
                <option value="Facility 1">Facility 1</option>
                <option value="Facility 2">Facility 2</option>
                <option value="Hub 1">Hub 1</option>
                <option value="Hub 2">Hub 2</option>
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
              className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700 shadow-sm"
            >
              Generate Report
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
