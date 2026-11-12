import React from 'react';
import { CalendarClock } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function TraceTimeline({ events = [] }) {
  if (!events || events.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-slate-400">
        <CalendarClock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm font-semibold text-slate-600">No recent events</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Event History &amp; Audit Trail</h3>
          <p className="text-xs text-slate-500 mt-0.5">Immutable traceability log recorded across the network</p>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          {events.length} Events Total
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {events.map((evt, idx) => (
          <div key={evt.id || idx} className="relative group">
            {/* Dot */}
            <div className="absolute -left-[27px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-4 ring-emerald-100 border-2 border-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:bg-slate-50 hover:shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-xs">{evt.type}</span>
                  <span className="rounded-md bg-white border border-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                    {evt.id}
                  </span>
                </div>
                <StatusBadge status={evt.status} size="sm" />
              </div>

              <p className="text-xs text-slate-600 mt-1.5">{evt.description}</p>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-slate-400 border-t border-slate-200/50 pt-2.5">
                {evt.location && <span>📍 {evt.location}</span>}
                {evt.timestamp && <span>⏱️ {evt.timestamp}</span>}
                {evt.performedBy && <span>👤 {evt.performedBy}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
