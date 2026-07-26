# Enterprise Knowledge Management

> **Codename: Salvia**

Enterprise Knowledge Management platform for organizing, searching, and sharing organizational knowledge. Same UI/UX as the sibling platform (react-sequoia); capabilities are limited to knowledge management only — **no AI Lifecycle Management** (no models, training, deployment, feedback, governance, portfolio).

*Salvia - Cultivating and sharing enterprise knowledge*

## Overview

Salvia provides a consistent, enterprise-grade UI for Knowledge Management:

- **Dashboard**: Executive overview of knowledge bases, documents, search, and health
- **Knowledge Base**: Entry point for document management, collections, search, and collaboration (placeholder; capabilities to be implemented)
- **Knowledge Structuring & Ontology Management**: Semantic workspace for taxonomy governance, ontology modeling, knowledge graph exploration, and AI-assisted semantic tagging
- **Search, Discovery & Retrieval**: Intelligent retrieval workspace for full-text, semantic, and contextual search with faceted filters, query guidance, and search analytics
- **AI Knowledge Assistant**: Explainable conversational knowledge workspace for grounded answers, context-aware enterprise responses, answer traceability, multi-document synthesis, document summarization, and FAQ draft generation
- **Knowledge Integration & Ingestion**: Enterprise intake control workspace for governed source connectivity, batch and event-based ingestion, OCR or ICR review, parsing and chunk preparation, metadata extraction, and synchronization health
- **Knowledge Quality & Validation**: Trust control workspace for scoring knowledge quality, duplicate detection, freshness visibility, validation workflow governance, human review, and trusted knowledge readiness
- **Governance, Security & Access Control**: Enterprise knowledge protection workspace for role-based access control, classification, masking, policy enforcement, audit traceability, and compliance monitoring through a Ficus-integrated governance layer
- **Knowledge Lifecycle & Workflow Management**: Enterprise lifecycle control workspace for stewardship accountability, approval workflow discipline, review SLA management, expiration monitoring, and reminder continuity across knowledge assets
- **Knowledge Analytics & Insights**: Enterprise knowledge intelligence workspace for measuring content usage, search success, knowledge demand, knowledge gaps, trending topics, and explainable AI interaction performance across SALVIA
- **Knowledge Activation**: Enterprise execution workspace for operationalizing governed knowledge through APIs, AI integrations, RAG context injection, knowledge-to-decision linkage, and event-driven runtime triggers across SALVIA
- **Knowledge Command Center**: Executive enterprise control tower for end-to-end knowledge visibility, AI knowledge performance, governance posture, cross-platform integration health, and decision-ready knowledge orchestration across SALVIA
- **Platform Settings & Administration**: Central enterprise operations workspace for tenant governance, user and role control, AI model configuration, indexing and storage settings, and platform health visibility

### Out of scope (not included)

- AI Lifecycle: models, training runs, deployment, inference monitoring
- Projects/workspaces (project-centric AI workflows)
- Feedback, model governance, and AI lifecycle portfolio modules
- AI lifecycle connectors, model datasets, training execution, and AI workflow orchestration

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **TailwindCSS** – utility-first CSS, glassmorphism
- **lucide-react** – icons
- **Zustand** – state management
- **TanStack Query** – data fetching and caching
- **React Router** – client-side routing

## Design

- Same design system as react-sequoia: glassmorphism, compact density, light/dark theme, accent options
- Theme and preferences are stored under `salvia_theme` and `salvia_preferences` in localStorage (separate from other apps)

## Project Structure

```
src/
├── auth/           # Authentication & protected routes
├── components/     # Reusable UI (layout, settings, ui)
├── lib/            # Utils, animation, API (notification, todo)
├── modules/
│   ├── core-shell/ # App shell, topbar, app launcher, settings
│   ├── dashboard/  # EKM dashboard (knowledge summary, signals, alerts)
│   └── knowledge/  # Knowledge workspaces for repository, retrieval, trust, governance, AI assistance, and intake control
├── pages/          # Login, Profile
├── stores/         # Theme, preferences, settings panel
└── App.tsx         # Routing
```

## Getting Started

### Prerequisites

- Node.js 20+ or 22+
- npm or yarn

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

App runs at **http://localhost:5177** (different port from react-sequoia).

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Routes

- `/` – Dashboard  
- `/knowledge` – Knowledge Base (placeholder)  
- `/knowledge-structuring-ontology` – Knowledge Structuring & Ontology Management
- `/search-discovery-retrieval` – Search, Discovery & Retrieval
- `/ai-knowledge-assistant` – AI Knowledge Assistant
- `/knowledge-integration-ingestion` – Knowledge Integration & Ingestion
- `/knowledge-quality-validation` – Knowledge Quality & Validation
- `/governance-security-access-control` – Governance, Security & Access Control
- `/knowledge-lifecycle-workflow-management` – Knowledge Lifecycle & Workflow Management
- `/knowledge-analytics-insights` – Knowledge Analytics & Insights
- `/knowledge-activation` – Knowledge Activation
- `/knowledge-command-center` – Knowledge Command Center
- `/settings` – Platform Settings & Administration  
- `/profile` – User profile  
- `/login` – Login  

## License

MIT
