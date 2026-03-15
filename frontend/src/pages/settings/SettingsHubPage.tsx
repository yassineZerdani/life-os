import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Typography, Progress, Button, Spin } from 'antd'
import {
  EditOutlined,
  HeartOutlined,
  BulbOutlined,
  DollarOutlined,
  SolutionOutlined,
  TeamOutlined,
  HomeOutlined,
  IdcardOutlined,
  ThunderboltOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { profileService } from '../../services/profile'
import type { ProfileHubSection } from '../../services/profile'
import { useTheme } from '../../hooks/useTheme'

const { Title, Text } = Typography

/** Domain keys shown on hub — excludes profile and app (they have dedicated pages) */
const DOMAIN_KEYS = ['health', 'psychology', 'finance', 'career', 'relationships', 'lifestyle', 'identity', 'strategies'] as const

const SECTION_ROUTE: Record<string, string> = {
  health: '/app/settings/health',
  psychology: '/app/settings/psychology',
  finance: '/app/settings/finance',
  career: '/app/settings/career',
  relationships: '/app/settings/relationships',
  lifestyle: '/app/settings/lifestyle',
  identity: '/app/settings/identity',
  strategies: '/app/settings/strategies',
}

/** Approximate total sections per domain for "X sections remaining" */
const TOTAL_SECTIONS: Record<string, number> = {
  health: 8,
  psychology: 4,
  finance: 10,
  career: 5,
  relationships: 4,
  lifestyle: 4,
  identity: 5,
  strategies: 3,
}

const icons: Record<string, React.ReactNode> = {
  health: <HeartOutlined />,
  psychology: <BulbOutlined />,
  finance: <DollarOutlined />,
  career: <SolutionOutlined />,
  relationships: <TeamOutlined />,
  lifestyle: <HomeOutlined />,
  identity: <IdcardOutlined />,
  strategies: <ThunderboltOutlined />,
}

function DomainCard({ section }: { section: ProfileHubSection }) {
  const navigate = useNavigate()
  const theme = useTheme()
  const path = SECTION_ROUTE[section.key]
  const Icon = icons[section.key]
  const isComplete = section.completion_pct >= 100
  const total = TOTAL_SECTIONS[section.key] ?? 5
  const filled = Math.round((section.completion_pct / 100) * total)
  const missing = Math.max(0, total - filled)

  return (
    <Card
      hoverable
      onClick={() => path && navigate(path)}
      style={{
        height: '100%',
        background: theme.contentCardBg ?? theme.cardBg ?? '#fff',
        border: `1px solid ${theme.contentCardBorder ?? theme.borderColor ?? '#e2e8f0'}`,
        borderRadius: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 24, color: theme.accent }}>{Icon}</span>
        <Button
          type="primary"
          size="small"
          ghost
          icon={isComplete ? <EditOutlined /> : <RightOutlined />}
          onClick={(e) => {
            e.stopPropagation()
            path && navigate(path)
          }}
        >
          {isComplete ? 'Edit' : 'Continue setup'}
        </Button>
      </div>
      <Title level={5} style={{ margin: '0 0 8px', color: theme.textPrimary }}>
        {section.name}
      </Title>
      <Progress
        percent={Math.round(section.completion_pct)}
        size="small"
        showInfo={false}
        strokeColor={theme.accent}
        trailColor={theme.contentCardBorder ?? theme.borderColor ?? '#e2e8f0'}
      />
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
        {isComplete ? 'Complete' : missing > 0 ? `${missing} section${missing !== 1 ? 's' : ''} to complete` : `${Math.round(section.completion_pct)}% complete`}
      </Text>
      {section.last_updated && (
        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
          Updated {new Date(section.last_updated).toLocaleDateString()}
        </Text>
      )}
      {section.summary && (
        <Text style={{ fontSize: 12, color: theme.textSecondary, display: 'block', marginTop: 4 }}>
          {section.summary}
        </Text>
      )}
    </Card>
  )
}

export function SettingsHubPage() {
  const theme = useTheme()
  const { data: hub, isLoading } = useQuery({
    queryKey: ['profile', 'hub'],
    queryFn: () => profileService.getHub(),
  })

  const domainSections = hub?.sections?.filter((s) => DOMAIN_KEYS.includes(s.key as (typeof DOMAIN_KEYS)[number])) ?? []

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <Title level={3} style={{ marginBottom: 8, color: theme.textPrimary }}>
        Personal Profile & Life Configuration
      </Title>
      <Text style={{ color: theme.textSecondary, display: 'block', marginBottom: 24 }}>
        Configure your profile and domain intakes so Life OS can personalize strategies, simulations, and recommendations.
      </Text>
      <Row gutter={[16, 16]}>
        {domainSections.map((section) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={section.key}>
            <DomainCard section={section} />
          </Col>
        ))}
      </Row>
    </div>
  )
}
