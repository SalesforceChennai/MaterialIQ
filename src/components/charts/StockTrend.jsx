import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export default function StockTrend({ data = [], color = '#10b981', unit = 'kg' }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-44 w-full flex items-center justify-center text-xs font-medium text-slate-400">
        No data available
      </div>
    );
  }

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '8px',
              border: 'none',
              color: '#fff',
              fontSize: '12px'
            }}
            formatter={(value) => [`${value.toLocaleString()} ${unit}`, 'Stock']}
          />
          <Area
            type="monotone"
            dataKey="stock"
            stroke={color}
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#stockGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
