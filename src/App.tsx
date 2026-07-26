import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './modules/core-shell/components/AppLayout'
import { ToastProvider } from './components/ui/toast'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { LoginPage } from './pages/Login'
import { ProfilePage } from './pages/Profile'
import { DashboardPage } from './modules/dashboard'
import {
  KnowledgeActivationPage,
  KnowledgeCommandCenterPage,
  AIKnowledgeAssistantPage,
  GovernanceSecurityAccessControlPage,
  KnowledgeAnalyticsInsightsPage,
  KnowledgeLifecycleWorkflowManagementPage,
  KnowledgeIntegrationIngestionPage,
  KnowledgeQualityValidationPage,
  KnowledgeRepositoryContentManagementPage,
  KnowledgeStructuringOntologyManagementPage,
  SearchDiscoveryRetrievalPage,
} from './modules/knowledge'
import { PlatformSettingsPage } from './modules/core-shell/pages/PlatformSettingsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/knowledge" element={<KnowledgeRepositoryContentManagementPage />} />
              <Route
                path="/knowledge-structuring-ontology"
                element={<KnowledgeStructuringOntologyManagementPage />}
              />
              <Route
                path="/search-discovery-retrieval"
                element={<SearchDiscoveryRetrievalPage />}
              />
              <Route
                path="/ai-knowledge-assistant"
                element={<AIKnowledgeAssistantPage />}
              />
              <Route
                path="/knowledge-integration-ingestion"
                element={<KnowledgeIntegrationIngestionPage />}
              />
              <Route
                path="/knowledge-quality-validation"
                element={<KnowledgeQualityValidationPage />}
              />
              <Route
                path="/governance-security-access-control"
                element={<GovernanceSecurityAccessControlPage />}
              />
              <Route
                path="/knowledge-lifecycle-workflow-management"
                element={<KnowledgeLifecycleWorkflowManagementPage />}
              />
              <Route
                path="/knowledge-analytics-insights"
                element={<KnowledgeAnalyticsInsightsPage />}
              />
              <Route
                path="/knowledge-activation"
                element={<KnowledgeActivationPage />}
              />
              <Route
                path="/knowledge-command-center"
                element={<KnowledgeCommandCenterPage />}
              />
              <Route path="/settings" element={<PlatformSettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App
