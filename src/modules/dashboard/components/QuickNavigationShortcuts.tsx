import { BookOpen, Settings, Search, ArrowRight, Network, FileSearch, Bot, Workflow, ShieldCheck, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const shortcuts = [
  {
    label: 'Knowledge Repository',
    path: '/knowledge',
    icon: BookOpen,
    description: 'Govern and browse enterprise knowledge assets',
  },
  {
    label: 'Content Search',
    path: '/knowledge',
    icon: Search,
    description: 'Search by owner, taxonomy, language, and version',
  },
  {
    label: 'Knowledge Structuring',
    path: '/knowledge-structuring-ontology',
    icon: Network,
    description: 'Manage taxonomy, ontology, graph, and semantic tagging',
  },
  {
    label: 'Search, Discovery & Retrieval',
    path: '/search-discovery-retrieval',
    icon: FileSearch,
    description: 'Run intelligent full-text, semantic, and contextual enterprise retrieval',
  },
  {
    label: 'AI Knowledge Assistant',
    path: '/ai-knowledge-assistant',
    icon: Bot,
    description: 'Use grounded conversational search, answer traceability, and multi-document synthesis',
  },
  {
    label: 'Knowledge Integration & Ingestion',
    path: '/knowledge-integration-ingestion',
    icon: Workflow,
    description: 'Control source connectivity, ingestion, OCR review, parsing readiness, and synchronization health',
  },
  {
    label: 'Knowledge Quality & Validation',
    path: '/knowledge-quality-validation',
    icon: ShieldCheck,
    description: 'Measure knowledge quality, duplicate risk, freshness, validation workflow, and trust readiness',
  },
  {
    label: 'Governance, Security & Access Control',
    path: '/governance-security-access-control',
    icon: Lock,
    description: 'Control roles, classification, masking, policy enforcement, audit traceability, and compliance readiness',
  },
  {
    label: 'Platform Settings & Administration',
    path: '/settings',
    icon: Settings,
    description: 'Control tenants, access, AI models, indexing, storage, and platform health',
  },
]

export function QuickNavigationShortcuts() {
  const iconConfigs = [
    { color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200' },
    { color: 'text-violet-500', bg: 'bg-violet-50 border-violet-200' },
    { color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200' },
  ]

  return (
    <div className="glass-card-purple rounded-xl p-3">
      <h2 className="text-xs font-semibold text-gray-900 mb-3">
        Quick Navigation
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8 gap-3">
        {shortcuts.map((shortcut, index) => {
          const Icon = shortcut.icon
          const config = iconConfigs[index % iconConfigs.length]

          return (
            <Link
              key={`${shortcut.label}-${index}`}
              to={shortcut.path}
              className={cn(
                'group glass-panel rounded-lg p-4 hover:shadow-lg transition-all duration-200'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={cn(
                  'p-1.5 rounded-md border',
                  config.bg
                )}>
                  <Icon className={cn('h-4 w-4', config.color)} />
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="font-medium text-gray-900 text-xs mb-1">
                {shortcut.label}
              </p>
              <p className="text-[10px] text-gray-500">
                {shortcut.description}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
