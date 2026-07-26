import {
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocation, useNavigate } from 'react-router-dom'

interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  path: string
}

// Salvia: Enterprise Knowledge Management — Dashboard, repository, semantic workspaces, and Platform Settings & Administration
const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: BookOpen, label: 'Knowledge Repository', path: '/knowledge' },
  {
    icon: Network,
    label: 'Knowledge Structuring & Ontology Management',
    path: '/knowledge-structuring-ontology',
  },
  {
    icon: FileSearch,
    label: 'Search, Discovery & Retrieval',
    path: '/search-discovery-retrieval',
  },
  {
    icon: Bot,
    label: 'AI Knowledge Assistant',
    path: '/ai-knowledge-assistant',
  },
  {
    icon: Workflow,
    label: 'Knowledge Integration & Ingestion',
    path: '/knowledge-integration-ingestion',
  },
  {
    icon: ShieldCheck,
    label: 'Knowledge Quality & Validation',
    path: '/knowledge-quality-validation',
  },
  {
    icon: Lock,
    label: 'Governance, Security & Access Control',
    path: '/governance-security-access-control',
  },
  {
    icon: GitBranch,
    label: 'Knowledge Lifecycle & Workflow Management',
    path: '/knowledge-lifecycle-workflow-management',
  },
  {
    icon: BarChart3,
    label: 'Knowledge Analytics & Insights',
    path: '/knowledge-analytics-insights',
  },
  {
    icon: Zap,
    label: 'Knowledge Activation',
    path: '/knowledge-activation',
  },
  {
    icon: Radar,
    label: 'Knowledge Command Center',
    path: '/knowledge-command-center',
  },
  { icon: Settings, label: 'Platform Settings & Administration', path: '/settings' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen glass-sidebar transition-all duration-300 z-40',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-12 px-2 border-b border-gray-200">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-emerald-500" />
              </div>
              <h1 className="text-sm font-semibold text-gray-900">Salvia</h1>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>

        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isKnowledgeRepositoryRoute =
              location.pathname === '/knowledge' || location.pathname.startsWith('/knowledge/')
            const isKnowledgeStructuringRoute =
              location.pathname === '/knowledge-structuring-ontology' ||
              location.pathname.startsWith('/knowledge-structuring-ontology/')
            const isSearchDiscoveryRoute =
              location.pathname === '/search-discovery-retrieval' ||
              location.pathname.startsWith('/search-discovery-retrieval/')
            const isAIKnowledgeAssistantRoute =
              location.pathname === '/ai-knowledge-assistant' ||
              location.pathname.startsWith('/ai-knowledge-assistant/')
            const isKnowledgeIntegrationRoute =
              location.pathname === '/knowledge-integration-ingestion' ||
              location.pathname.startsWith('/knowledge-integration-ingestion/')
            const isKnowledgeQualityRoute =
              location.pathname === '/knowledge-quality-validation' ||
              location.pathname.startsWith('/knowledge-quality-validation/')
            const isGovernanceSecurityRoute =
              location.pathname === '/governance-security-access-control' ||
              location.pathname.startsWith('/governance-security-access-control/')
            const isKnowledgeLifecycleWorkflowRoute =
              location.pathname === '/knowledge-lifecycle-workflow-management' ||
              location.pathname.startsWith('/knowledge-lifecycle-workflow-management/')
            const isKnowledgeAnalyticsInsightsRoute =
              location.pathname === '/knowledge-analytics-insights' ||
              location.pathname.startsWith('/knowledge-analytics-insights/')
            const isKnowledgeActivationRoute =
              location.pathname === '/knowledge-activation' ||
              location.pathname.startsWith('/knowledge-activation/')
            const isKnowledgeCommandCenterRoute =
              location.pathname === '/knowledge-command-center' ||
              location.pathname.startsWith('/knowledge-command-center/')
            const isActive =
              location.pathname === item.path ||
              (item.path === '/knowledge' && isKnowledgeRepositoryRoute) ||
              (item.path === '/knowledge-structuring-ontology' && isKnowledgeStructuringRoute) ||
              (item.path === '/search-discovery-retrieval' && isSearchDiscoveryRoute) ||
              (item.path === '/ai-knowledge-assistant' && isAIKnowledgeAssistantRoute) ||
              (item.path === '/knowledge-integration-ingestion' && isKnowledgeIntegrationRoute) ||
              (item.path === '/knowledge-quality-validation' && isKnowledgeQualityRoute) ||
              (item.path === '/governance-security-access-control' && isGovernanceSecurityRoute) ||
              (item.path === '/knowledge-lifecycle-workflow-management' && isKnowledgeLifecycleWorkflowRoute) ||
              (item.path === '/knowledge-analytics-insights' && isKnowledgeAnalyticsInsightsRoute) ||
              (item.path === '/knowledge-activation' && isKnowledgeActivationRoute) ||
              (item.path === '/knowledge-command-center' && isKnowledgeCommandCenterRoute) ||
              (item.path === '/settings' && location.pathname === '/settings')

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full transition-all',
                  collapsed
                    ? 'flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-md'
                    : 'flex items-center gap-2 p-1.5 rounded-md',
                  'text-xs font-medium hover:bg-gray-50',
                  isActive
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900',
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {collapsed ? (
                  <span className="text-[10px] leading-none text-gray-600">
                    {item.label}
                  </span>
                ) : (
                  <span className="flex-1 text-left">{item.label}</span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="px-2 py-2 border-t border-border/20">
          {!collapsed && (
            <div className="text-[10px] text-muted-foreground">
              <div className="font-medium text-foreground text-xs">v1.0.0</div>
              <div className="text-[10px] mt-0.5 opacity-70">Enterprise Knowledge Management</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
