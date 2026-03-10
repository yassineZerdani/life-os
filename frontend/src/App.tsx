import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { MainLayout } from './components/MainLayout'
import { AuthPage } from './pages/AuthPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { DashboardPage } from './pages/DashboardPage'
import { DomainPage } from './pages/DomainPage'
import { GoalsPage } from './pages/GoalsPage'
import { MetricsPage } from './pages/MetricsPage'
import { TimelinePage } from './pages/TimelinePage'
import { TimeTrackingPage } from './pages/TimeTrackingPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { InsightsPage } from './pages/InsightsPage'
import { SimulationPage } from './pages/SimulationPage'
import { RecommendationsPage } from './pages/RecommendationsPage'
import { LifeGraphPage } from './pages/LifeGraphPage'
import { ControlRoomPage } from './pages/ControlRoomPage'
import { LifeAchievementsPage } from './pages/LifeAchievementsPage'
import { QuestsPage } from './pages/QuestsPage'
import { SettingsLayout } from './components/settings/SettingsLayout'
import { SettingsHubPage } from './pages/settings/SettingsHubPage'
import { AppSettingsPage } from './pages/settings/AppSettingsPage'
import { PersonProfilePage } from './pages/settings/PersonProfilePage'
import { DomainIntakePage } from './pages/settings/DomainIntakePage'
import { StrategyLibraryPage } from './pages/StrategyLibraryPage'
import { StrategyDomainPage } from './pages/StrategyDomainPage'
import { ActiveProtocolsPage } from './pages/ActiveProtocolsPage'
import { LearnPage } from './pages/learn/LearnPage'
import { LearnCategoryPage } from './pages/learn/LearnCategoryPage'
import { LearnArticlePage } from './pages/learn/LearnArticlePage'
import { LearnSearchPage } from './pages/learn/LearnSearchPage'
import { domainsService } from './services/domains'
import { useAppStore } from './store/useAppStore'

function AppRoutes() {
  const setDomains = useAppStore((s) => s.setDomains)
  const { data: domains, isLoading } = useQuery({
    queryKey: ['domains'],
    queryFn: domainsService.list,
  })

  useEffect(() => {
    if (domains) setDomains(domains)
  }, [domains, setDomains])

  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/signin" element={<AuthPage initialTab="signin" />} />
      <Route path="/signup" element={<AuthPage initialTab="signup" />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/control-room" replace />} />
        <Route path="control-room" element={<ControlRoomPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="metrics" element={<MetricsPage />} />
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="time-tracking" element={<TimeTrackingPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="insights" element={<InsightsPage />} />
        <Route path="simulation" element={<SimulationPage />} />
        <Route path="recommendations" element={<RecommendationsPage />} />
        <Route path="strategies" element={<Outlet />}>
          <Route index element={<StrategyLibraryPage />} />
          <Route path=":domainKey" element={<StrategyDomainPage />} />
        </Route>
        <Route path="protocols/active" element={<ActiveProtocolsPage />} />
        <Route path="learn" element={<Outlet />}>
          <Route index element={<LearnPage />} />
          <Route path="category/:slug" element={<LearnCategoryPage />} />
          <Route path="article/:slug" element={<LearnArticlePage />} />
          <Route path="search" element={<LearnSearchPage />} />
        </Route>
        <Route path="life-graph" element={<LifeGraphPage />} />
        <Route path="achievements" element={<LifeAchievementsPage />} />
        <Route path="quests" element={<QuestsPage />} />
        <Route path="settings" element={<SettingsLayout />}>
          <Route index element={<Navigate to="/app/settings/profile" replace />} />
          <Route path="profile" element={<SettingsHubPage />} />
          <Route path="app" element={<AppSettingsPage />} />
          <Route path="person" element={<PersonProfilePage />} />
          <Route path="health" element={<DomainIntakePage />} />
          <Route path="psychology" element={<DomainIntakePage />} />
          <Route path="finance" element={<DomainIntakePage />} />
          <Route path="career" element={<DomainIntakePage />} />
          <Route path="relationships" element={<DomainIntakePage />} />
          <Route path="lifestyle" element={<DomainIntakePage />} />
          <Route path="identity" element={<DomainIntakePage />} />
          <Route path="strategies" element={<DomainIntakePage />} />
        </Route>
        <Route path=":domainSlug" element={<DomainPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
