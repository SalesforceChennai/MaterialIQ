import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function MaterialUsage({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-72 w-full flex items-center justify-center text-sm font-medium text-slate-400">
        No data available
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
        >
          <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '10px',
              border: 'none',
              color: '#fff',
              fontSize: '12px'
            }}
            formatter={(value, name, props) => [`${value.toLocaleString()} ${props.payload.unit}`, 'Usage']}
          />
          <Bar dataKey="usage" radius={[0, 6, 6, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
