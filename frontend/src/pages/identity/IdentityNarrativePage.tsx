import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Typography, Button, Card, Select, Input } from 'antd'
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { personaLabService } from '../../services/personaLab'
import { useTheme } from '../../hooks/useTheme'
import { NarrativeTimeline } from '../../components/identity'

const { Title, Text } = Typography
const { TextArea } = Input

const NARRATIVE_TYPES = [
  { value: 'who_i_was', label: 'Who I was' },
  { value: 'who_i_am', label: 'Who I am' },
  { value: 'who_i_am_becoming', label: 'Who I am becoming' },
  { value: 'defining_moment', label: 'Defining moment' },
  { value: 'identity_shift', label: 'Identity shift' },
]

export function IdentityNarrativePage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timePeriod, setTimePeriod] = useState('')
  const [type, setType] = useState<string>('who_i_am')

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['persona-lab', 'narrative'],
    queryFn: () => personaLabService.listNarrative({ limit: 100 }),
  })

  const createNarrative = useMutation({
    mutationFn: (body: { title: string; description?: string; time_period?: string; type: string }) =>
      personaLabService.createNarrative(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['persona-lab'] })
      setTitle('')
      setDescription('')
      setTimePeriod('')
    },
  })

  const deleteNarrative = useMutation({
    mutationFn: (id: string) => personaLabService.deleteNarrative(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['persona-lab'] }),
  })

  const handleAdd = () => {
    if (!title.trim()) return
    createNarrative.mutate({ title: title.trim(), description: description.trim() || undefined, time_period: timePeriod.trim() || undefined, type })
  }

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 900, margin: '0 auto' }}>
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/app/identity')} style={{ marginBottom: 16 }}>
        Back to Persona Lab
      </Button>
      <Title level={2} style={{ marginBottom: 24 }}>
        Narrative
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Who you were, who you are, who you are becoming. Defining moments and identity shifts.
      </Text>

      <Card
        size="small"
        title={<span style={{ fontWeight: 600 }}>Add entry</span>}
        style={{ marginBottom: 24, borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}
      >
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginBottom: 8 }} />
        <Select
          options={NARRATIVE_TYPES}
          value={type}
          onChange={setType}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <Input placeholder="Time period (e.g. 2020–2022)" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} style={{ marginBottom: 8 }} />
        <TextArea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ marginBottom: 8 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} disabled={!title.trim() || createNarrative.isPending}>
          Add
        </Button>
      </Card>

      <NarrativeTimeline entries={entries} loading={isLoading} onDelete={(id) => deleteNarrative.mutate(id)} />
    </div>
  )
}
