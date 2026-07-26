# Modules Structure

This directory contains feature modules for the AI Training Monitoring Console.

## Module 1: Core Shell & Navigation ✅

**Status**: Implemented

**Location**: `core-shell/`

**Components**:
- `Sidebar` - Collapsible navigation sidebar
- `Topbar` - Global search, environment indicator, user menu, theme toggle
- `AppLayout` - Main layout wrapper
- `PlaceholderPage` - Placeholder component for Module 1 routes

**Routes**:
- `/` - Dashboard (placeholder)
- `/runs` - Runs (placeholder navigation entry - NOT a module)
- `/settings` - Platform Settings & Administration

**Important Notes**:
- "Runs" is a placeholder navigation entry only in Module 1
- They have **no domain logic, no submenus, and no implied capabilities**
- "Runs" represents a future **Training module** entry point
- Platform Settings & Administration is implemented as the current system and cross-cutting administration workspace
- They exist solely as navigation placeholders for future modules

## Module 2: Projects & Workspace ✅

**Status**: Implemented

**Location**: `projects/`

**Purpose**: Container konseptual untuk training AI, di mana Project = workspace dan Run akan selalu berada di dalam Project.

**Components**:
- `ProjectListPage` - List semua project dengan search dan filter
- `ProjectCreatePage` - Form untuk membuat project baru
- `ProjectDetailPage` - Detail project dengan placeholder untuk Runs dan Connectors
- `ProjectCard` - Card component untuk menampilkan project
- `EmptyState` - Empty state component

**Store**:
- `projectStore` - Zustand store untuk state management (local/mock data)

**Routes**:
- `/projects` - Project list page
- `/projects/create` - Create project page
- `/projects/:id` - Project detail page

**Key Features**:
- ✅ Project CRUD operations (local state)
- ✅ Search and filter projects
- ✅ Archive/unarchive projects
- ✅ Tags support
- ✅ Placeholder sections for Runs and Connectors

**Hard Boundaries** (WAJIB DIPATUHI):
- ❌ No training logic
- ❌ No run execution
- ❌ No engine API/CLI calls
- ❌ No metrics display
- ❌ No ML framework assumptions

**Conceptual Relationship**:
- Project = workspace container
- Run akan selalu berada di dalam Project
- Training runs akan diimplementasikan di modul Training (Module 4–5)

## Future Modules (Not Implemented)

### Training Module (will implement /runs functionality)
**Location**: `training/` (to be created)
- Route: `/runs` (will replace placeholder)
- Features: Training run management, monitoring, control

### System/Cross-cutting Module
**Location**: `core-shell/pages/PlatformSettingsPage.tsx`
- Route: `/settings`
- Features: Tenant administration, user and role governance, AI model configuration, indexing and storage settings, and system health monitoring

### Module 3: Analytics
**Location**: `analytics/` (to be created)
- Route: `/analytics`
- Features: Training metrics visualization, performance charts

### Module 4: Reports
**Location**: `reports/` (to be created)
- Route: `/reports`
- Features: Report generation, export functionality

### Module 5: Engines Management
**Location**: `engines/` (to be created)
- Route: `/engines`
- Features: Engine registration, configuration, status monitoring

### Module 6: Data Sources
**Location**: `data-sources/` (to be created)
- Route: `/data`
- Features: Data source connections, validation

### Module 7: Models
**Location**: `models/` (to be created)
- Route: `/models`
- Features: Model registry, version management

### Module 8: History
**Location**: `history/` (to be created)
- Route: `/history`
- Features: Run history, audit logs

## Module Development Guidelines

1. Each module should be self-contained in its own directory
2. Modules should export their routes for integration in `App.tsx`
3. Use the `PlaceholderPage` pattern for initial implementation
4. Follow the glassmorphism design system established in Module 1
5. Maintain compact, high-density information display
