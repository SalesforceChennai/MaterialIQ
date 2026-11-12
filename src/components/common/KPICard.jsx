import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const colorThemes = {
  emerald: {
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100/80',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
    stroke: '#10b981'
  },
  blue: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100/80',
    text: 'text-blue-600',
    border: 'border-blue-100',
    stroke: '#3b82f6'
  },
  orange: {
    bg: 'bg-orange-50',
    iconBg: 'bg-orange-100/80',
    text: 'text-orange-600',
    border: 'border-orange-100',
    stroke: '#f97316'
  },
  purple: {
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-100/80',
    text: 'text-purple-600',
    border: 'border-purple-100',
    stroke: '#8b5cf6'
  },
  rose: {
    bg: 'bg-rose-50',
    iconBg: 'bg-rose-100/80',
    text: 'text-rose-600',
    border: 'border-rose-100',
    stroke: '#ef4444'
  }
};

export default function KPICard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  color = 'emerald',
  subtitle
}) {
  const theme = colorThemes[color] || colorThemes.emerald;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${theme.bg} ${theme.text}`}>
            {Icon && <Icon className="h-6 w-6" />}
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {title}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
              {change && (
                <span
                  className={`inline-flex items-center text-xs font-semibold ${
                    isPositive ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {isPositive ? (
                    <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="mr-0.5 h-3.5 w-3.5" />
                  )}
                  {change}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mini sparkline visualization */}
        <div className="w-16 h-8 opacity-80">
          <svg viewBox="0 0 60 30" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.stroke} stopOpacity="0.3" />
                <stop offset="100%" stopColor={theme.stroke} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={isPositive ? "M0,25 Q15,22 30,14 T60,5" : "M0,8 Q15,12 30,20 T60,26"}
              fill="none"
              stroke={theme.stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
      {subtitle && (
        <p className="mt-3 text-xs text-slate-400 font-medium border-t border-slate-100 pt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
}
