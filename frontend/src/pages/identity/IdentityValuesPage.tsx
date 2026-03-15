import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Typography, Button, Card, List, Popconfirm } from 'antd'
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { personaLabService } from '../../services/personaLab'
import { useTheme } from '../../hooks/useTheme'
import { ValuesAlignmentCard } from '../../components/identity'

const { Title, Text } = Typography

export function IdentityValuesPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: dashboard } = useQuery({
    queryKey: ['persona-lab', 'dashboard'],
    queryFn: () => personaLabService.getDashboard(),
  })

  const { data: values = [], isLoading: valuesLoading } = useQuery({
    queryKey: ['persona-lab', 'values'],
    queryFn: () => personaLabService.listValues(),
  })

  const { data: principles = [], isLoading: principlesLoading } = useQuery({
    queryKey: ['persona-lab', 'principles'],
    queryFn: () => personaLabService.listPrinciples(),
  })

  const deleteValue = useMutation({
    mutationFn: (id: string) => personaLabService.deleteValue(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['persona-lab'] }),
  })

  const deletePrinciple = useMutation({
    mutationFn: (id: string) => personaLabService.deletePrinciple(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['persona-lab'] }),
  })

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 900, margin: '0 auto' }}>
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/app/identity')} style={{ marginBottom: 16 }}>
        Back to Persona Lab
      </Button>
      <Title level={2} style={{ marginBottom: 24 }}>
        Values & principles
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Define what matters to you and the principles you live by. Alignment insights compare these with your behavior.
      </Text>

      <ValuesAlignmentCard insights={dashboard?.alignment_insights ?? []} />

      <Card
        size="small"
        title={<span style={{ fontWeight: 600 }}>Values</span>}
        extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => navigate('/app/identity?add=value')}>Add</Button>}
        style={{ marginTop: 24, borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}
      >
        <List
          loading={valuesLoading}
          dataSource={values}
          renderItem={(v) => (
            <List.Item
              actions={[
                <Popconfirm key="del" title="Remove this value?" onConfirm={() => deleteValue.mutate(v.id)}>
                  <Button type="text" size="small" danger>Remove</Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta title={v.name} description={v.description ?? (v.priority_score != null ? `Priority ${v.priority_score}` : null)} />
            </List.Item>
          )}
        />
      </Card>

      <Card
        size="small"
        title={<span style={{ fontWeight: 600 }}>Principles</span>}
        extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => navigate('/app/identity?add=principle')}>Add</Button>}
        style={{ marginTop: 24, borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}
      >
        <List
          loading={principlesLoading}
          dataSource={principles}
          renderItem={(p) => (
            <List.Item
              actions={[
                <Popconfirm key="del" title="Remove this principle?" onConfirm={() => deletePrinciple.mutate(p.id)}>
                  <Button type="text" size="small" danger>Remove</Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta title={p.title} description={p.description ?? (p.active ? 'Active' : 'Inactive')} />
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}
