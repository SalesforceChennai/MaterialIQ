# MaterialIQ

## Overview
MaterialIQ is an enterprise material traceability and supply-chain intelligence platform. It tracks raw materials, production batches, finished products, outbound shipments, customer deliveries, and audit events through an interactive connected graph network and lineage tracing engine.

## Features
- **Material Management**: Inventory tracking, stock levels, lead times, reorder thresholds, and warehouse location management.
- **Batch Management**: Production runs, manufacturing processes, quality certifications, and operator tracking.
- **Product Management**: Finished goods cataloging, batch association, stock levels, and outbound shipment linking.
- **Shipment Tracking**: Multi-modal logistics tracking, transit status, carrier details, route progress, and ETA monitoring.
- **Customer Management**: Customer order histories, linked shipments, material genealogy breakdown, and account tiers.
- **Supply-Chain Events**: Comprehensive timeline logs and event stream covering receptions, inspections, QA checks, and dispatches.
- **Material Genealogy Graph**: Interactive node-link topology powered by React Flow with custom node designs, status indicators, and minimap navigation.
- **Quick Trace**: Instant lookup across materials, batches, products, and shipments by ID with unified provenance paths.
- **Upstream/Downstream Tracing**: Bidirectional graph exploration to trace root material sources and downstream customer impacts.
- **Impact Analysis**: Immediate dependency analysis identifying all affected batches, finished products, shipments, and customers.
- **Reports**: Analytical summaries, shipment trends, material consumption metrics, and CSV export capabilities.

## Tech Stack
- **React 19**
- **Vite 8**
- **Tailwind CSS v4**
- **@xyflow/react (React Flow)**
- **Recharts**
- **Lucide React**
- **Browser LocalStorage & Unified State Layer** (with dynamic relationship graph computation and custom event pub/sub)

## Installation

```bash
npm install
```

## Run

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Environment Variables

Copy `.env.example` to `.env.local` to configure optional external services (such as a backend API or graph database):

```bash
cp .env.example .env.local
```

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_URL` | Base URL for backend API services | `http://localhost:8000` |
| `VITE_NEO4J_URI` | Bolt URI for Neo4j graph database | `bolt://localhost:7687` |
| `VITE_NEO4J_USER` | Username for Neo4j authentication | `neo4j` |
| `VITE_NEO4J_PASSWORD` | Password for Neo4j authentication | *(empty)* |
| `VITE_API_KEY` | Optional authorization key for secured endpoints | *(empty)* |
