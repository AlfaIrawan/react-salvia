import { BookOpen, FileText, Search, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { useDashboardStore, type KnowledgeHealthStatus } from '@/modules/dashboard'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

function HealthStatusBadge({ status }: { status: KnowledgeHealthStatus }) {
  const config = {
    healthy: {
      label: 'Healthy',
      icon: CheckCircle2,
      className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    },
    attention: {
      label: 'Attention',
      icon: AlertTriangle,
      className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    },
    critical: {
      label: 'Critical',
      icon: XCircle,
      className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    },
  }

  const { label, icon: Icon, className } = config[status]

  return (
    <div
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium',
        className
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
  )
}

export function ExecutiveHealthSnapshot() {
  const getMetrics = useDashboardStore((state) => state.getMetrics)
  const metrics = getMetrics()

  const cards = [
    {
      title: 'Knowledge Repositories',
      value: metrics.knowledgeBases,
      subtitle: 'Collections and repositories',
      icon: BookOpen,
      link: '/knowledge',
      color: 'text-blue-500',
      iconBg: 'bg-blue-50 border-blue-200',
    },
    {
      title: 'Total Documents',
      value: metrics.totalDocuments.toLocaleString(),
      subtitle: `${metrics.indexedDocuments.toLocaleString()} indexed`,
      icon: FileText,
      link: '/knowledge',
      color: 'text-emerald-500',
      iconBg: 'bg-emerald-50 border-emerald-200',
    },
    {
      title: 'Search (24h)',
      value: metrics.searchQueries24h.toLocaleString(),
      subtitle: 'Queries in last 24 hours',
      icon: Search,
      link: '/knowledge',
      color: 'text-violet-500',
      iconBg: 'bg-violet-50 border-violet-200',
    },
    {
      title: 'Status',
      value: null,
      subtitle: null,
      icon: null,
      link: null,
      statusBadge: <HealthStatusBadge status={metrics.overallHealthStatus} />,
      iconBg: 'bg-slate-50 border-slate-200',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Link
          key={card.title}
          to={card.link ?? '#'}
          className={cn(
            'glass-card rounded-xl p-4 transition-all duration-200',
            'hover:shadow-md border border-gray-200/60',
            !card.link && 'pointer-events-none'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {card.title}
              </p>
              {card.value != null ? (
                <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
              ) : (
                <div className="mt-2">{card.statusBadge}</div>
              )}
              {card.subtitle && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{card.subtitle}</p>
              )}
            </div>
            {card.icon && (
              <div
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border',
                  card.iconBg,
                  card.color
                )}
              >
                <card.icon className="h-5 w-5" />
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
