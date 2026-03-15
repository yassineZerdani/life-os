import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Typography, Button, Input, Card } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { personaLabService } from '../../services/personaLab'
import { useTheme } from '../../hooks/useTheme'
import { SelfAspectMap, PersonaDashboard } from '../../components/identity'

const { Title, Text } = Typography
const { TextArea } = Input

export function IdentityPersonaPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['persona-lab', 'profile'],
    queryFn: () => personaLabService.getProfile(),
  })

  const { data: aspects = [], isLoading: aspectsLoading } = useQuery({
    queryKey: ['persona-lab', 'aspects'],
    queryFn: () => personaLabService.listAspects(true),
  })

  const updateProfile = useMutation({
    mutationFn: (body: Parameters<typeof personaLabService.updateProfile>[0]) =>
      personaLabService.updateProfile(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['persona-lab'] }),
  })

  const fields = [
    { key: 'current_self_summary', label: 'Current self' },
    { key: 'ideal_self_summary', label: 'Ideal self' },
    { key: 'public_self_summary', label: 'Public self' },
    { key: 'private_self_summary', label: 'Private self' },
    { key: 'values_summary', label: 'Values summary' },
  ] as const

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 900, margin: '0 auto' }}>
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/app/identity')} style={{ marginBottom: 16 }}>
        Back to Persona Lab
      </Button>
      <Title level={2} style={{ marginBottom: 24 }}>
        Persona
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Self-aspects and identity summaries. Who you are, how you present, who you want to become.
      </Text>

      <SelfAspectMap aspects={aspects} loading={aspectsLoading} />

      <div style={{ marginTop: 28 }}>
        <Card
          size="small"
          title={<span style={{ fontWeight: 600 }}>Identity summaries</span>}
          style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}
        >
          {fields.map(({ key, label }) => (
            <div key={key} style={{ marginBottom: 20 }}>
              <Text strong style={{ fontSize: 13 }}>{label}</Text>
              <TextArea
                defaultValue={profile?.[key] ?? ''}
                placeholder={`Describe ${label.toLowerCase()}…`}
                rows={3}
                style={{ marginTop: 6 }}
                onBlur={(e) => {
                  const v = e.target.value
                  if (v !== (profile?.[key] ?? '')) {
                    updateProfile.mutate({ [key]: v || null })
                  }
                }}
              />
            </div>
          ))}
        </Card>
      </div>

      <div style={{ marginTop: 28 }}>
        <PersonaDashboard profile={profile ?? null} aspects={aspects} loading={profileLoading} />
      </div>
    </div>
  )
}
