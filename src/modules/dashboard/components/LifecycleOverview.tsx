import { Inbox, FolderTree, Search, Share2, ChevronRight } from 'lucide-react'
import { useDashboardStore } from '@/modules/dashboard'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const knowledgeStages = [
  {
    id: 'ingest',
    label: 'Ingest',
    icon: Inbox,
    path: '/knowledge',
    description: 'Documents & sources',
  },
  {
    id: 'organize',
    label: 'Organize',
    icon: FolderTree,
    path: '/knowledge',
    description: 'Knowledge repositories',
  },
  {
    id: 'search',
    label: 'Search',
    icon: Search,
    path: '/knowledge',
    description: 'Find & discover',
  },
  {
    id: 'share',
    label: 'Share',
    icon: Share2,
    path: '/knowledge',
    description: 'Collaboration',
  },
]

export function LifecycleOverview() {
  const getMetrics = useDashboardStore((state) => state.getMetrics)
  const metrics = getMetrics()

  const counts = [
    metrics.lifecycleCounts.ingest,
    metrics.lifecycleCounts.organize,
    metrics.lifecycleCounts.search,
    metrics.lifecycleCounts.share,
  ]

  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Knowledge Management Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {knowledgeStages.map((stage, index) => {
          const Icon = stage.icon
          return (
            <Link
              key={stage.id}
              to={stage.path}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border border-gray-200/60',
                'hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors'
              )}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">{stage.label}</p>
                <p className="text-xs text-muted-foreground">{stage.description}</p>
                <p className="text-lg font-semibold text-foreground mt-1">{counts[index]?.toLocaleString() ?? 0}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
