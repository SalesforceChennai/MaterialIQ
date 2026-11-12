import React from 'react';

const statusStyles = {
  'In Stock': 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-1 ring-emerald-500/10',
  'Active': 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-1 ring-emerald-500/10',
  'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-1 ring-emerald-500/10',
  'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-1 ring-emerald-500/10',
  'Ready': 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-1 ring-emerald-500/10',

  'In Transit': 'bg-blue-50 text-blue-700 border-blue-200/60 ring-1 ring-blue-500/10',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200/60 ring-1 ring-blue-500/10',

  'Low Stock': 'bg-amber-50 text-amber-700 border-amber-200/60 ring-1 ring-amber-500/10',
  'Under Inspection': 'bg-amber-50 text-amber-700 border-amber-200/60 ring-1 ring-amber-500/10',
  'Delayed': 'bg-amber-50 text-amber-700 border-amber-200/60 ring-1 ring-amber-500/10',
  'Pending': 'bg-purple-50 text-purple-700 border-purple-200/60 ring-1 ring-purple-500/10',

  'Out of Stock': 'bg-rose-50 text-rose-700 border-rose-200/60 ring-1 ring-rose-500/10',
  'Exception': 'bg-rose-50 text-rose-700 border-rose-200/60 ring-1 ring-rose-500/10',
  'Cancelled': 'bg-rose-50 text-rose-700 border-rose-200/60 ring-1 ring-rose-500/10',
  'Inactive': 'bg-slate-100 text-slate-600 border-slate-200'
};

const dotColors = {
  'In Stock': 'bg-emerald-500',
  'Active': 'bg-emerald-500',
  'Delivered': 'bg-emerald-500',
  'Completed': 'bg-emerald-500',
  'Ready': 'bg-emerald-500',

  'In Transit': 'bg-blue-500',
  'In Progress': 'bg-blue-500',

  'Low Stock': 'bg-amber-500',
  'Under Inspection': 'bg-amber-500',
  'Delayed': 'bg-amber-500',
  'Pending': 'bg-purple-500',

  'Out of Stock': 'bg-rose-500',
  'Exception': 'bg-rose-500',
  'Cancelled': 'bg-rose-500',
  'Inactive': 'bg-slate-400'
};

export default function StatusBadge({ status, showDot = true, size = 'md' }) {
  const normalized = status || 'Active';
  const style = statusStyles[normalized] || 'bg-slate-100 text-slate-700 border-slate-200';
  const dot = dotColors[normalized] || 'bg-slate-500';

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border transition-all shadow-xs font-medium ${sizeClasses} ${style}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
      {normalized}
    </span>
  );
}
