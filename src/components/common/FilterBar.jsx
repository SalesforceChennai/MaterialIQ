import React from 'react';
import { RotateCcw } from 'lucide-react';

export default function FilterBar({
  filters = [],
  onFilterChange,
  onReset,
  children
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {filters.map((filter) => (
        <div key={filter.key} className="flex items-center gap-2">
          {filter.label && (
            <span className="text-xs font-medium text-slate-500">{filter.label}</span>
          )}
          <select
            value={filter.value}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs transition-all focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          >
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      {children}

      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-2xs transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
          title="Reset all filters"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      )}
    </div>
  );
}
