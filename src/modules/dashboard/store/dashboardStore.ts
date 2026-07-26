import { create } from 'zustand'

export type KnowledgeHealthStatus = 'healthy' | 'attention' | 'critical'

export interface DashboardMetrics {
  // Knowledge Management Summary
  knowledgeBases: number
  totalDocuments: number
  indexedDocuments: number
  searchQueries24h: number
  overallHealthStatus: KnowledgeHealthStatus

  // Knowledge Overview (stages)
  lifecycleCounts: {
    ingest: number
    organize: number
    search: number
    share: number
  }

  // Live Signals
  liveSignals: {
    searchQueries24h: number
    avgResponseMs: number
    indexCoveragePercent: number
  }

  // Alerts (placeholder)
  pendingReviews: number
  syncWarnings: number
}

interface DashboardState {
  getMetrics: () => DashboardMetrics
  refreshMetrics: () => void
}

export const useDashboardStore = create<DashboardState>(() => ({
  getMetrics: (): DashboardMetrics => {
    // Placeholder EKM metrics — nol sampai ada API riil yang pakai app_id Salvia
    return {
      knowledgeBases: 0,
      totalDocuments: 0,
      indexedDocuments: 0,
      searchQueries24h: 0,
      overallHealthStatus: 'healthy',
      lifecycleCounts: {
        ingest: 0,
        organize: 0,
        search: 0,
        share: 0,
      },
      liveSignals: {
        searchQueries24h: 0,
        avgResponseMs: 0,
        indexCoveragePercent: 0,
      },
      pendingReviews: 0,
      syncWarnings: 0,
    }
  },
  refreshMetrics: () => {},
}))
