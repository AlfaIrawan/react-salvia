import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Network,
  FileSearch,
  Bot,
  Workflow,
  ShieldCheck,
  Lock,
  GitBranch,
  BarChart3,
  Zap,
  Radar,
  Settings,
  Grid3x3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface AppLauncherItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  path: string
}

// Salvia: Enterprise Knowledge Management — focused workspace for repository, semantic modeling, and intelligent retrieval
const existingNavItems: AppLauncherItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    description: 'Executive overview and insights',
    path: '/'
  },
  {
    icon: BookOpen,
    label: 'Knowledge Repository & Content Management',
    description: 'Govern enterprise knowledge assets with lifecycle control',
    path: '/knowledge'
  },
  {
    icon: Network,
    label: 'Knowledge Structuring & Ontology Management',
    description: 'Model taxonomy, ontology, and semantic relationships for AI-ready knowledge',
    path: '/knowledge-structuring-ontology'
  },
  {
    icon: FileSearch,
    label: 'Search, Discovery & Retrieval',
    description: 'Discover and retrieve trusted enterprise knowledge with semantic and contextual relevance',
    path: '/search-discovery-retrieval'
  },
  {
    icon: Bot,
    label: 'AI Knowledge Assistant',
    description: 'Interact with enterprise knowledge through grounded answers, traceable citations, and multi-document synthesis',
    path: '/ai-knowledge-assistant'
  },
  {
    icon: Workflow,
    label: 'Knowledge Integration & Ingestion',
    description: 'Control source connectivity, ingestion reliability, parsing readiness, OCR review, and enterprise synchronization posture',
    path: '/knowledge-integration-ingestion'
  },
  {
    icon: ShieldCheck,
    label: 'Knowledge Quality & Validation',
    description: 'Measure quality, govern validation workflows, control duplicates, monitor content freshness, and expose trusted knowledge readiness',
    path: '/knowledge-quality-validation'
  },
  {
    icon: Lock,
    label: 'Governance, Security & Access Control',
    description: 'Govern who can access enterprise knowledge, how sensitive content is protected, and how audit and compliance evidence are maintained',
    path: '/governance-security-access-control'
  },
  {
    icon: GitBranch,
    label: 'Knowledge Lifecycle & Workflow Management',
    description: 'Control workflow discipline, stewardship accountability, update SLA posture, expiration readiness, and lifecycle follow-through for enterprise knowledge assets',
    path: '/knowledge-lifecycle-workflow-management'
  },
  {
    icon: BarChart3,
    label: 'Knowledge Analytics & Insights',
    description: 'Measure content usage, search effectiveness, knowledge gaps, topic momentum, and explainable AI interaction performance across enterprise knowledge',
    path: '/knowledge-analytics-insights'
  },
  {
    icon: Zap,
    label: 'Knowledge Activation',
    description: 'Operationalize governed enterprise knowledge through APIs, context injection, AI integrations, decision linkage, and event-driven runtime activation',
    path: '/knowledge-activation'
  },
  {
    icon: Radar,
    label: 'Knowledge Command Center',
    description: 'Lead enterprise knowledge as an executive control tower across visibility, trust, AI performance, governance posture, and cross-platform orchestration',
    path: '/knowledge-command-center'
  },
  {
    icon: Settings,
    label: 'Platform Settings & Administration',
    description: 'Administer tenant control, access governance, AI models, storage, indexing, and runtime health',
    path: '/settings'
  },
]

export function AppLauncher() {
  const navigate = useNavigate()
  const location = useLocation()
  const itemsPerColumn = Math.ceil(existingNavItems.length / 3)
  const columns = [
    existingNavItems.slice(0, itemsPerColumn),
    existingNavItems.slice(itemsPerColumn, itemsPerColumn * 2),
    existingNavItems.slice(itemsPerColumn * 2),
  ]

  const handleItemClick = (path: string) => {
    navigate(path)
  }

  const isItemActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="topbar-action-btn hover:bg-gray-100/80 rounded-lg transition-all duration-200"
          aria-label="Open app launcher"
        >
          <Grid3x3 className="h-4 w-4 text-gray-700 topbar-action-icon" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          'w-[980px] max-w-[95vw] p-0 !glass-card app-launcher-content',
          '!border border-gray-200/80 !shadow-2xl rounded-xl',
          'mt-2 right-0 overflow-hidden',
          '!backdrop-blur-xl !bg-white'
        )}
        style={{
          backgroundColor: 'rgba(255,255,255,0.98)',
          color: '#0f172a',
          backdropFilter: 'none',
        }}
      >
        <div className="grid grid-cols-3 gap-0">
          {columns.map((columnItems, columnIndex) => (
            <div
              key={columnIndex}
              className={cn(
                'flex flex-col',
                columnIndex < columns.length - 1 && 'border-r border-gray-200/60'
              )}
            >
              {columnItems.map((item, index) => {
                const Icon = item.icon
                const isActive = isItemActive(item.path)

                return (
                  <button
                    key={`${item.path}-${index}`}
                    onClick={() => handleItemClick(item.path)}
                    className={cn(
                      'flex items-start gap-4 p-5 transition-all duration-200',
                      'text-left group relative',
                      'border-b border-gray-100 last:border-b-0',
                      'hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent',
                      isActive && 'bg-gradient-to-r from-blue-50 to-transparent'
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />
                    )}

                    <div className={cn(
                      'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
                      'transition-all duration-200',
                      'bg-gradient-to-br from-gray-100 to-gray-50',
                      'border border-gray-200/60',
                      'group-hover:from-blue-50 group-hover:to-blue-100/50',
                      'group-hover:border-blue-200/60',
                      'group-hover:scale-105',
                      isActive && 'from-blue-100 to-blue-50 border-blue-200'
                    )}>
                      <Icon className={cn(
                        'h-5 w-5 transition-colors duration-200 text-slate-700',
                        'group-hover:text-blue-600',
                        isActive && 'text-blue-600'
                      )} />
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className={cn(
                        'font-semibold text-sm mb-1 text-slate-900',
                        'group-hover:text-blue-700 transition-colors duration-200',
                        isActive && 'text-blue-700'
                      )}>
                        {item.label}
                      </div>
                      <div className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {item.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
