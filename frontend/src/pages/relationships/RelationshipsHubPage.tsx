/**
 * Relationships hub — Family, Partner, Contacts in one place.
 */
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Typography, Button } from 'antd'
import { HomeOutlined, HeartTwoTone, TeamOutlined } from '@ant-design/icons'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../../components/control-room/constants'

const { Title, Text } = Typography

const SECTIONS = [
  {
    key: 'family',
    path: '/app/relationships/family',
    icon: <HomeOutlined />,
    title: 'Family',
    description: 'Family members, memories, and support responsibilities.',
    color: DOMAIN_COLORS.family,
  },
  {
    key: 'partner',
    path: '/app/relationships/partner',
    icon: <HeartTwoTone twoToneColor="#be185d" />,
    title: 'Partner',
    description: 'Relationship depth, pulse, timeline, and shared vision.',
    color: '#be185d',
  },
  {
    key: 'contacts',
    path: '/app/relationships/contacts',
    icon: <TeamOutlined />,
    title: 'Contacts',
    description: 'Important people and relationship network.',
    color: DOMAIN_COLORS.relationships,
  },
]

export function RelationshipsHubPage() {
  const theme = useTheme()
  const navigate = useNavigate()

  return (
    <div>
      <Title level={3} style={{ marginBottom: 8, color: theme.textPrimary }}>
        Relationships
      </Title>
      <Text style={{ color: theme.textSecondary, display: 'block', marginBottom: 24 }}>
        Family, partner, and your wider network — all in one place.
      </Text>
      <Row gutter={[16, 16]}>
        {SECTIONS.map((s) => (
          <Col xs={24} sm={12} lg={8} key={s.key}>
            <Card
              hoverable
              onClick={() => navigate(s.path)}
              style={{
                height: '100%',
                background: theme.contentCardBg ?? theme.cardBg,
                border: `1px solid ${theme.contentCardBorder ?? theme.border}`,
                borderRadius: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 28, color: s.color }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <Title level={5} style={{ margin: '0 0 4px', color: theme.textPrimary }}>
                    {s.title}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 13 }}>{s.description}</Text>
                </div>
              </div>
              <Button type="primary" ghost size="small" onClick={(e) => { e.stopPropagation(); navigate(s.path) }}>
                Open
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
