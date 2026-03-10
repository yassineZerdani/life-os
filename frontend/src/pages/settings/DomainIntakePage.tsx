import { useQuery } from '@tanstack/react-query'
import { Card, Typography, Button } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { profileService } from '../../services/profile'
import { useTheme } from '../../hooks/useTheme'

const { Title, Text } = Typography

const SECTION_NAMES: Record<string, string> = {
  health: 'Health Profile',
  psychology: 'Psychology Profile',
  finance: 'Finance Profile',
  career: 'Career & Skills',
  relationships: 'Relationships',
  lifestyle: 'Lifestyle',
  identity: 'Identity & Values',
  strategies: 'Strategy Preferences',
}

const GETTERS: Record<string, () => Promise<Record<string, unknown>>> = {
  health: profileService.getHealth,
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
  const key = location.pathname.split('/').pop() ?? 'health'
  const getter = GETTERS[key] ?? profileService.getHealth

  const { data, isLoading } = useQuery({
    queryKey: ['profile', key],
    queryFn: getter,
  })

  const name = SECTION_NAMES[key] ?? key

  if (isLoading) return null

  return (
    <div>
      <Title level={3} style={{ marginBottom: 8, color: theme.textPrimary }}>
        {name}
      </Title>
      <Text style={{ color: theme.textSecondary, display: 'block', marginBottom: 24 }}>
        Configure your {key} intake. This data helps personalize strategies and recommendations.
      </Text>
      <Card style={{ maxWidth: 640, background: theme.cardBg, border: `1px solid ${theme.borderColor ?? '#e2e8f0'}` }}>
        <p style={{ color: theme.textSecondary }}>
          Structured forms for {name} are coming soon. Your data will be saved here and used across Life OS.
        </p>
        <pre style={{ fontSize: 12, background: theme.hoverBg ?? '#f8fafc', padding: 12, borderRadius: 6, overflow: 'auto' }}>
          {JSON.stringify(data ?? {}, null, 2)}
        </pre>
        <Button type="primary" onClick={() => navigate('/app/settings/profile')}>
          Back to Profile Hub
        </Button>
      </Card>
    </div>
  )
}
