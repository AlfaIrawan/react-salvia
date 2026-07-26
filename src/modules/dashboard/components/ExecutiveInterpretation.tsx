import { CheckCircle2, Info } from 'lucide-react'
import { useDashboardStore } from '../store/dashboardStore'
import { cn } from '@/lib/utils'

interface InterpretationItem {
  type: 'success' | 'info'
  message: string
  icon: typeof CheckCircle2
}

export function ExecutiveInterpretation() {
  const getMetrics = useDashboardStore((state) => state.getMetrics)
  const metrics = getMetrics()

  const interpretations: InterpretationItem[] = []

  if (metrics.totalDocuments === 0 && metrics.indexedDocuments === 0) {
    interpretations.push({
      type: 'info',
      message: 'No knowledge data yet. Connect a knowledge source or ingest documents to see metrics here. Data is scoped to Salvia (app_id) only.',
      icon: Info,
    })
  } else if (metrics.overallHealthStatus === 'healthy') {
    interpretations.push({
      type: 'success',
      message: 'Knowledge repository health is good. Index coverage and search performance are within normal range.',
      icon: CheckCircle2,
    })
  }

  if (metrics.totalDocuments > 0 || metrics.indexedDocuments > 0) {
    interpretations.push({
      type: 'info',
      message: `${metrics.indexedDocuments.toLocaleString()} of ${metrics.totalDocuments.toLocaleString()} documents are indexed (${metrics.liveSignals.indexCoveragePercent}% coverage).`,
      icon: Info,
    })
  }

  const config = {
    success: {
      iconClassName: 'text-green-600 dark:text-green-400',
      bgClassName: 'bg-green-500/10 border-green-500/20',
    },
    info: {
      iconClassName: 'text-blue-600 dark:text-blue-400',
      bgClassName: 'bg-blue-500/10 border-blue-500/20',
    },
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Executive Interpretation</h2>
      <div className="space-y-3">
        {interpretations.map((item, index) => {
          const Icon = item.icon
          const c = config[item.type]
          return (
            <div
              key={index}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border',
                c.bgClassName
              )}
            >
              <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', c.iconClassName)} />
              <p className="text-sm text-foreground">{item.message}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
