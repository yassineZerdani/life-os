/**
 * Family Command Center — dashboard: members, care summary, memories, support.
 */
import { useQuery } from '@tanstack/react-query'
import { Card, Typography, Button, Progress } from 'antd'
import { ArrowLeftOutlined, ApartmentOutlined, FolderOutlined, HeartOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { familyService } from '../../services/family'
import { useTheme } from '../../hooks/useTheme'
import { FamilyMemberCard } from './FamilyMemberCard'
import { DOMAIN_COLORS } from '../../components/control-room/constants'

const { Title, Text } = Typography

export function FamilyPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['family', 'dashboard'],
    queryFn: () => familyService.getDashboard(),
  })

  if (isLoading || !dashboard) {
    return <div style={{ padding: 24, color: theme.textMuted }}>Loading Family Command Center...</div>
  }

  const { members, responsibilities_pending, memories_count, high_support_members } = dashboard

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 1200, margin: '0 auto' }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/app/relationships')}
        style={{ marginBottom: 16, color: theme.textMuted }}
      >
        Back to Relationships
      </Button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            Family Command Center
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Care, memories, and relationship awareness
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            icon={<ApartmentOutlined />}
            onClick={() => navigate('/app/relationships/family/graph')}
            style={{ borderRadius: 10 }}
          >
            Family graph
          </Button>
          <Button
            icon={<FolderOutlined />}
            onClick={() => navigate('/app/relationships/family/memories')}
            style={{ borderRadius: 10 }}
          >
            Memories
          </Button>
          <Button
            icon={<HeartOutlined />}
            onClick={() => navigate('/app/relationships/family/support')}
            style={{ borderRadius: 10 }}
          >
            Support & care
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div>
          <Card
            title={<span>Family map</span>}
            style={{ marginBottom: 24, borderRadius: 16, border: `1px solid ${theme.contentCardBorder}` }}
            extra={<Button type="primary" size="small" onClick={() => navigate('/app/relationships/family/graph')}>View graph</Button>}
          >
            {members.length === 0 ? (
              <>
                <Text type="secondary">Add family members to build your map.</Text>
                <div style={{ marginTop: 12 }}>
                  <Button type="primary" onClick={() => navigate('/app/relationships/family/graph')}>Add member</Button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {members.slice(0, 6).map((m) => (
                  <FamilyMemberCard
                    key={m.id}
                    member={m}
                    accentColor={DOMAIN_COLORS.family}
                    onOpen={() => navigate(`/app/relationships/family/graph?member=${m.id}`)}
                  />
                ))}
                {members.length > 6 && (
                  <Button type="link" onClick={() => navigate('/app/relationships/family/graph')}>
                    View all {members.length} members
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card
            title="Care at a glance"
            style={{ marginBottom: 24, borderRadius: 16, border: `1px solid ${theme.contentCardBorder}`, position: 'sticky', top: 24 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Pending responsibilities</Text>
                <div style={{ fontSize: 24, fontWeight: 700, color: DOMAIN_COLORS.family }}>{responsibilities_pending}</div>
                <Button type="link" size="small" style={{ padding: 0 }} onClick={() => navigate('/app/relationships/family/support')}>
                  Manage support
                </Button>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Memories saved</Text>
                <div style={{ fontSize: 24, fontWeight: 700, color: DOMAIN_COLORS.family }}>{memories_count}</div>
                <Button type="link" size="small" style={{ padding: 0 }} onClick={() => navigate('/app/relationships/family/memories')}>
                  Memory archive
                </Button>
              </div>
            </div>
          </Card>

          {high_support_members.length > 0 && (
            <Card
              title={<span style={{ color: '#e11d48' }}>High support</span>}
              size="small"
              style={{ borderRadius: 16, border: `1px solid ${theme.contentCardBorder}` }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {high_support_members.map((m) => (
                  <div
                    key={m.id}
                    style={{ fontSize: 13, cursor: 'pointer' }}
                    onClick={() => navigate('/app/relationships/family/support')}
                  >
                    {m.name} <Text type="secondary">({m.support_level})</Text>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
