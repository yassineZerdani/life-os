import { useQuery } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, Button } from 'antd'
import { profileService } from '../../services/profile'
import { useTheme } from '../../hooks/useTheme'
import { SettingsPageLayout, SettingsHeader, EmptyStateCard } from '../../components/settings'

const SECTION_NAMES: Record<string, string> = {
  psychology: 'Psychology Profile',
  finance: 'Finance Profile',
  career: 'Career & Skills',
  relationships: 'Relationships',
  lifestyle: 'Lifestyle',
  identity: 'Identity & Values',
  strategies: 'Strategy Preferences',
}

const GETTERS: Record<string, () => Promise<Record<string, unknown>>> = {
  psychology: profileService.getPsychology,
  finance: profileService.getFinance,
  career: profileService.getCareer,
  relationships: profileService.getRelationships,
  lifestyle: profileService.getLifestyle,
  identity: profileService.getIdentity,
  strategies: profileService.getStrategies,
}

export function DomainIntakePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme()
  const key = location.pathname.split('/').pop() ?? 'psychology'
  const getter = GETTERS[key] ?? profileService.getPsychology

  const { isLoading } = useQuery({
    queryKey: ['profile', key],
    queryFn: getter,
  })

  const name = SECTION_NAMES[key] ?? key

  if (isLoading) return null

  return (
    <SettingsPageLayout
      header={
        <SettingsHeader
          title={name}
          description={`Configure your ${key} intake. This data helps personalize strategies and recommendations.`}
        />
      }
    >
      <Card
        style={{
          maxWidth: 560,
          background: theme.contentCardBg ?? theme.cardBg,
          border: `1px solid ${theme.contentCardBorder ?? theme.border}`,
        }}
      >
        <EmptyStateCard
          title="Coming soon"
          description={`Structured forms for ${name} are in development. Your data will be saved here and used across Life OS for personalized strategies, simulations, and recommendations. Check back soon.`}
        />
        <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
          <Button type="primary" onClick={() => navigate('/app/settings/profile')}>
            Back to Profile Hub
          </Button>
          <Button onClick={() => navigate('/app/settings/profile')}>View other domains</Button>
        </div>
      </Card>
    </SettingsPageLayout>
  )
}
