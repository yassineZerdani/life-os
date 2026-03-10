import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Typography, Progress, Button, Spin } from 'antd'
import { EditOutlined, UserOutlined, AppstoreOutlined, HeartOutlined, BulbOutlined, DollarOutlined, SolutionOutlined, TeamOutlined, HomeOutlined, IdcardOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { profileService } from '../../services/profile'
import type { ProfileHubSection } from '../../services/profile'
import { useTheme } from '../../hooks/useTheme'

const { Title, Text } = Typography

const SECTION_ROUTE: Record<string, string> = {
  profile: '/app/settings/person',
  app: '/app/settings/app',
  health: '/app/settings/health',
  psychology: '/app/settings/psychology',
  finance: '/app/settings/finance',
  career: '/app/settings/career',
  relationships: '/app/settings/relationships',
  lifestyle: '/app/settings/lifestyle',
  identity: '/app/settings/identity',
  strategies: '/app/settings/strategies',
}

const icons: Record<string, React.ReactNode> = {
  profile: <UserOutlined />,
  app: <AppstoreOutlined />,
  health: <HeartOutlined />,
  psychology: <BulbOutlined />,
  finance: <DollarOutlined />,
  career: <SolutionOutlined />,
  relationships: <TeamOutlined />,
  lifestyle: <HomeOutlined />,
  identity: <IdcardOutlined />,
  strategies: <ThunderboltOutlined />,
}

function SectionCard({ section }: { section: ProfileHubSection }) {
  const navigate = useNavigate()
  const theme = useTheme()
  const path = SECTION_ROUTE[section.key]
  const Icon = icons[section.key]

  return (
    <Card
      hoverable
      onClick={() => path && navigate(path)}
      style={{
        height: '100%',
        background: theme.cardBg ?? '#fff',
        border: `1px solid ${theme.borderColor ?? '#e2e8f0'}`,
        borderRadius: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 24, color: theme.accent }}>{Icon}</span>
        <Button type="text" size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); path && navigate(path); }} />
      </div>
      <Title level={5} style={{ margin: '0 0 8px', color: theme.textPrimary }}>
        {section.name}
      </Title>
      <Progress
        percent={Math.round(section.completion_pct)}
        size="small"
        showInfo={false}
        strokeColor={theme.accent}
        trailColor={theme.borderColor ?? '#e2e8f0'}
      />
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
        {section.completion_pct >= 100 ? 'Complete' : `${Math.round(section.completion_pct)}% complete`}
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
        {hub?.sections?.map((section) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={section.key}>
            <SectionCard section={section} />
          </Col>
        ))}
      </Row>
    </div>
  )
}
