import { AlertTriangle, FileCheck, ChevronRight } from 'lucide-react'
import { useDashboardStore } from '../store/dashboardStore'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function AttentionAlertsSummary() {
  const getMetrics = useDashboardStore((state) => state.getMetrics)
  const metrics = getMetrics()

  return (
    <div className="glass-card rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Attention & Alerts Summary</h2>

      <div className="space-y-4">
        {metrics.pendingReviews > 0 && (
          <Link
            to="/knowledge"
            className="block glass-panel rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {metrics.pendingReviews} Pending review{metrics.pendingReviews !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Documents or items awaiting review
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>
        )}

        {metrics.syncWarnings > 0 && (
          <Link
            to="/knowledge"
            className="block glass-panel rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {metrics.syncWarnings} Sync warning{metrics.syncWarnings !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Index or sync issues to review
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>
        )}

        {metrics.pendingReviews === 0 && metrics.syncWarnings === 0 && (
          <div className={cn(
            'flex items-center gap-3 py-4 px-4 rounded-lg',
            'bg-green-500/5 border border-green-500/20'
          )}>
            <div className="p-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">All clear</p>
              <p className="text-sm text-muted-foreground">
                No pending reviews or sync warnings.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
