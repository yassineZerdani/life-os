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
import { HealthSettingsPage } from './pages/settings/HealthSettingsPage'
import { StrategyLibraryPage } from './pages/StrategyLibraryPage'
import { StrategyDomainPage } from './pages/StrategyDomainPage'
import { ActiveProtocolsPage } from './pages/ActiveProtocolsPage'
import { LearnPage } from './pages/learn/LearnPage'
import { LearnCategoryPage } from './pages/learn/LearnCategoryPage'
import { LearnArticlePage } from './pages/learn/LearnArticlePage'
import { LearnSearchPage } from './pages/learn/LearnSearchPage'
import { HealthBodyMapPage } from './pages/health/body-map'
import { OrganDashboardPage } from './pages/health/OrganDashboardPage'
import { WealthPage } from './pages/WealthPage'
import { WealthVaultsPage } from './pages/wealth/WealthVaultsPage'
import { WealthVaultDetailPage } from './pages/wealth/WealthVaultDetailPage'
import { WealthAccountsPage } from './pages/wealth/WealthAccountsPage'
import { FundingSourcesPage } from './pages/wealth/FundingSourcesPage'
import { StripeConnectionPage } from './pages/settings/wealth/StripeConnectionPage'
import { TodayPage } from './pages/TodayPage'
import { SkillsPage } from './pages/skills/SkillsPage'
import { SkillsTreePage } from './pages/skills/SkillsTreePage'
import { SkillsArtifactsPage } from './pages/skills/SkillsArtifactsPage'
import { SkillDetailPage } from './pages/skills/SkillDetailPage'
import { CareerPage } from './pages/career/CareerPage'
import { CareerMissionsPage } from './pages/career/CareerMissionsPage'
import { CareerOpportunitiesPage } from './pages/career/CareerOpportunitiesPage'
import { CareerAchievementsPage } from './pages/career/CareerAchievementsPage'
import { RelationshipsHubPage } from './pages/relationships/RelationshipsHubPage'
import { RelationshipsContactsPage } from './pages/relationships/RelationshipsContactsPage'
import { FamilyPage } from './pages/family/FamilyPage'
import { FamilyGraphPage } from './pages/family/FamilyGraphPage'
import { FamilyMemoriesPage } from './pages/family/FamilyMemoriesPage'
import { FamilySupportPage } from './pages/family/FamilySupportPage'
import { LovePage } from './pages/love/LovePage'
import { LovePulsePage } from './pages/love/LovePulsePage'
import { LoveTimelinePage } from './pages/love/LoveTimelinePage'
import { LoveSharedVisionPage } from './pages/love/LoveSharedVisionPage'
import { NetworkPage } from './pages/network/NetworkPage'
import { NetworkGraphPage } from './pages/network/NetworkGraphPage'
import { NetworkOpportunitiesPage } from './pages/network/NetworkOpportunitiesPage'
import { NetworkContactsPage } from './pages/network/NetworkContactsPage'
import { ExperiencesPage } from './pages/experiences/ExperiencesPage'
import { ExperiencesTimelinePage } from './pages/experiences/ExperiencesTimelinePage'
import { ExperiencesMapPage } from './pages/experiences/ExperiencesMapPage'
import { ExperiencesSeasonsPage } from './pages/experiences/ExperiencesSeasonsPage'
import { IdentityPage } from './pages/identity/IdentityPage'
import { IdentityPersonaPage } from './pages/identity/IdentityPersonaPage'
import { IdentityValuesPage } from './pages/identity/IdentityValuesPage'
import { IdentityNarrativePage } from './pages/identity/IdentityNarrativePage'
import { MindPage } from './pages/mind/MindPage'
import { MindEmotionsPage } from './pages/mind/MindEmotionsPage'
import { MindLoopsPage } from './pages/mind/MindLoopsPage'
import { MindRegulationPage } from './pages/mind/MindRegulationPage'
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
        <Route index element={<Navigate to="/app/today" replace />} />
        <Route path="control-room" element={<ControlRoomPage />} />
        <Route path="today" element={<TodayPage />} />
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
        <Route path="health" element={<Outlet />}>
          <Route index element={<Navigate to="/app/health/body-map" replace />} />
          <Route path="body-map" element={<HealthBodyMapPage />} />
          <Route path="organ/:slug" element={<OrganDashboardPage />} />
        </Route>
        <Route path="life-graph" element={<LifeGraphPage />} />
        <Route path="wealth" element={<Outlet />}>
          <Route index element={<WealthPage />} />
          <Route path="vaults" element={<WealthVaultsPage />} />
          <Route path="vaults/:id" element={<WealthVaultDetailPage />} />
          <Route path="accounts" element={<WealthAccountsPage />} />
          <Route path="funding-sources" element={<FundingSourcesPage />} />
        </Route>
        <Route path="achievements" element={<LifeAchievementsPage />} />
        <Route path="quests" element={<QuestsPage />} />
        <Route path="skills" element={<Outlet />}>
          <Route index element={<SkillsPage />} />
          <Route path="tree" element={<SkillsTreePage />} />
          <Route path="artifacts" element={<SkillsArtifactsPage />} />
          <Route path=":id" element={<SkillDetailPage />} />
        </Route>
        <Route path="career" element={<Outlet />}>
          <Route index element={<CareerPage />} />
          <Route path="missions" element={<CareerMissionsPage />} />
          <Route path="opportunities" element={<CareerOpportunitiesPage />} />
          <Route path="achievements" element={<CareerAchievementsPage />} />
        </Route>
        <Route path="relationships" element={<Outlet />}>
          <Route index element={<RelationshipsHubPage />} />
          <Route path="contacts" element={<RelationshipsContactsPage />} />
          <Route path="family" element={<Outlet />}>
            <Route index element={<FamilyPage />} />
            <Route path="graph" element={<FamilyGraphPage />} />
            <Route path="memories" element={<FamilyMemoriesPage />} />
            <Route path="support" element={<FamilySupportPage />} />
          </Route>
          <Route path="partner" element={<Outlet />}>
            <Route index element={<LovePage />} />
            <Route path="pulse" element={<LovePulsePage />} />
            <Route path="timeline" element={<LoveTimelinePage />} />
            <Route path="shared-vision" element={<LoveSharedVisionPage />} />
          </Route>
        </Route>
        <Route path="network" element={<Outlet />}>
          <Route index element={<NetworkPage />} />
          <Route path="graph" element={<NetworkGraphPage />} />
          <Route path="opportunities" element={<NetworkOpportunitiesPage />} />
          <Route path="contacts" element={<NetworkContactsPage />} />
        </Route>
        <Route path="experiences" element={<Outlet />}>
          <Route index element={<ExperiencesPage />} />
          <Route path="timeline" element={<ExperiencesTimelinePage />} />
          <Route path="map" element={<ExperiencesMapPage />} />
          <Route path="seasons" element={<ExperiencesSeasonsPage />} />
        </Route>
        <Route path="identity" element={<Outlet />}>
          <Route index element={<IdentityPage />} />
          <Route path="persona" element={<IdentityPersonaPage />} />
          <Route path="values" element={<IdentityValuesPage />} />
          <Route path="narrative" element={<IdentityNarrativePage />} />
        </Route>
        <Route path="mind" element={<Outlet />}>
          <Route index element={<MindPage />} />
          <Route path="emotions" element={<MindEmotionsPage />} />
          <Route path="loops" element={<MindLoopsPage />} />
          <Route path="regulation" element={<MindRegulationPage />} />
        </Route>
        <Route path="settings" element={<SettingsLayout />}>
          <Route index element={<Navigate to="/app/settings/profile" replace />} />
          <Route path="profile" element={<SettingsHubPage />} />
          <Route path="app" element={<AppSettingsPage />} />
          <Route path="person" element={<PersonProfilePage />} />
          <Route path="health" element={<HealthSettingsPage />} />
          <Route path="psychology" element={<DomainIntakePage />} />
          <Route path="finance" element={<DomainIntakePage />} />
          <Route path="wealth" element={<StripeConnectionPage />} />
          <Route path="career" element={<DomainIntakePage />} />
          <Route path="relationships" element={<DomainIntakePage />} />
          <Route path="lifestyle" element={<DomainIntakePage />} />
          <Route path="identity" element={<DomainIntakePage />} />
          <Route path="strategies" element={<DomainIntakePage />} />
        </Route>
        {/* Redirect legacy paths to merged Relationships */}
        <Route path="family" element={<Navigate to="/app/relationships/family" replace />} />
        <Route path="love" element={<Navigate to="/app/relationships/partner" replace />} />
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
