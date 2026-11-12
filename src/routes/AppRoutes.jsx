import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';

import Dashboard from '../pages/Dashboard';
import Trace from '../pages/Trace';
import Graph from '../pages/Graph';
import Materials from '../pages/Materials';
import Batches from '../pages/Batches';
import Products from '../pages/Products';
import Shipments from '../pages/Shipments';
import Customers from '../pages/Customers';
import Events from '../pages/Events';
import Reports from '../pages/Reports';

export default function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/trace" element={<Trace />} />
        <Route path="/graph" element={<Graph />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/batches" element={<Batches />} />
        <Route path="/products" element={<Products />} />
        <Route path="/shipments" element={<Shipments />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/events" element={<Events />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
