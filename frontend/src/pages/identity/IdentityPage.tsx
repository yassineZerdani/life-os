import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Typography, Button, Row, Col } from 'antd'
import { UserOutlined, HeartOutlined, BookOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { personaLabService } from '../../services/personaLab'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../../components/control-room/constants'
import {
  PersonaDashboard,
  ValuesAlignmentCard,
  IdentityDriftPanel,
} from '../../components/identity'

const { Title, Text } = Typography

export function IdentityPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const accent = DOMAIN_COLORS.identity ?? '#64748b'

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['persona-lab', 'dashboard'],
    queryFn: () => personaLabService.getDashboard(),
  })

  const dismissDrift = useMutation({
    mutationFn: (id: string) => personaLabService.deleteDriftSignal(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['persona-lab'] }),
  })

  const profile = dashboard?.profile ?? null
  const aspects: { id: string; name: string; description: string | null; strength_score: number | null; tension_score: number | null; active: boolean }[] = []

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            Persona Lab
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Identity dashboard, values alignment, and self-image
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button icon={<UserOutlined />} onClick={() => navigate('/app/identity/persona')} style={{ borderRadius: 10 }}>
            Persona
          </Button>
          <Button icon={<HeartOutlined />} onClick={() => navigate('/app/identity/values')} style={{ borderRadius: 10 }}>
            Values
          </Button>
          <Button icon={<BookOutlined />} onClick={() => navigate('/app/identity/narrative')} style={{ borderRadius: 10 }}>
            Narrative
          </Button>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <PersonaDashboard profile={profile} aspects={aspects} loading={isLoading} />
          <div style={{ marginTop: 24 }}>
            <ValuesAlignmentCard insights={dashboard?.alignment_insights ?? []} loading={isLoading} />
          </div>
        </Col>
        <Col xs={24} lg={8}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ padding: '12px 16px', borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`, minWidth: 100, textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 11 }}>Values</Text>
              <div style={{ fontSize: 22, fontWeight: 700, color: accent }}>{dashboard?.values_count ?? 0}</div>
            </div>
            <div style={{ padding: '12px 16px', borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`, minWidth: 100, textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 11 }}>Principles</Text>
              <div style={{ fontSize: 22, fontWeight: 700, color: accent }}>{dashboard?.principles_count ?? 0}</div>
            </div>
            <div style={{ padding: '12px 16px', borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`, minWidth: 100, textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 11 }}>Narrative</Text>
              <div style={{ fontSize: 22, fontWeight: 700, color: accent }}>{dashboard?.narrative_count ?? 0}</div>
            </div>
          </div>
          <IdentityDriftPanel
            signals={dashboard?.drift_signals ?? []}
            loading={isLoading}
            onDismiss={(id) => dismissDrift.mutate(id)}
          />
        </Col>
      </Row>
    </div>
  )
}
