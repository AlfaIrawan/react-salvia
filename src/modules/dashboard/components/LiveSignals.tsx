import { useDashboardStore } from '@/modules/dashboard'
import { Search, Clock, Percent } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LiveSignals() {
  const getMetrics = useDashboardStore((state) => state.getMetrics)
  const signals = getMetrics().liveSignals

  const items = [
    {
      label: 'Search queries (24h)',
      value: signals.searchQueries24h.toLocaleString(),
      icon: Search,
    },
    {
      label: 'Avg response time',
      value: `${signals.avgResponseMs} ms`,
      icon: Clock,
    },
    {
      label: 'Index coverage',
      value: `${signals.indexCoveragePercent}%`,
      icon: Percent,
    },
  ]

  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Live Signals</h2>
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.label}
              className={cn(
                'flex items-center justify-between py-2 px-3 rounded-lg',
                'bg-gray-50/80 dark:bg-slate-800/40 border border-gray-200/60'
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{item.value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
