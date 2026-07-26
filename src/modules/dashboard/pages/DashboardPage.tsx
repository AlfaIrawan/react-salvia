import { ExecutiveHealthSnapshot } from '../components/ExecutiveHealthSnapshot'
import { LifecycleOverview } from '../components/LifecycleOverview'
import { LiveSignals } from '../components/LiveSignals'
import { AttentionAlertsSummary } from '../components/AttentionAlertsSummary'
import { QuickNavigationShortcuts } from '../components/QuickNavigationShortcuts'
import { ExecutiveInterpretation } from '../components/ExecutiveInterpretation'
import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb } from '@/components/ui/breadcrumb'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Dashboard' }]} />

      {/* Header */}
      <PageHeader
        title="Salvia Dashboard"
        description="Executive overview of Enterprise Knowledge Management: knowledge indexing, discovery, and search health across enterprise content."
      />

      {/* Executive AI Health Snapshot */}
      <ExecutiveHealthSnapshot />

      {/* AI Lifecycle Overview */}
      <LifecycleOverview />

      {/* Live Signals & Quick Navigation - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveSignals />
        <QuickNavigationShortcuts />
      </div>

      {/* Executive Interpretation */}
      <ExecutiveInterpretation />

      {/* Attention & Alerts Summary */}
      <AttentionAlertsSummary />
    </div>
  )
}
