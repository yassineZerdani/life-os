/**
 * Family graph page: visual map of members by relationship type, add/edit members.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Typography, Button, Modal, Form, Input, Select, DatePicker } from 'antd'
import { ApartmentOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import dayjs from 'dayjs'
import { familyService } from '../../services/family'
import { useTheme } from '../../hooks/useTheme'
import { FamilyMemberCard } from './FamilyMemberCard'
import { DOMAIN_COLORS } from '../../components/control-room/constants'

const { Title, Text } = Typography

const RELATIONSHIP_OPTIONS = [
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'partner', label: 'Partner' },
  { value: 'child', label: 'Child' },
  { value: 'extended', label: 'Extended' },
  { value: 'other', label: 'Other' },
]

const SUPPORT_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

export function FamilyGraphPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const { data: members, isLoading } = useQuery({
    queryKey: ['family', 'members'],
    queryFn: () => familyService.listMembers(),
  })

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      familyService.createMember({
        name: values.name as string,
        relationship_type: values.relationship_type as string,
        birth_date: values.birth_date ? dayjs(values.birth_date as string).format('YYYY-MM-DD') : undefined,
        contact_info: values.contact_info as string,
        notes: values.notes as string,
        closeness_score: values.closeness_score != null ? Number(values.closeness_score) / 10 : undefined,
        tension_score: values.tension_score != null ? Number(values.tension_score) / 10 : undefined,
        support_level: values.support_level as string,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family'] })
      setModalOpen(false)
      form.resetFields()
    },
  })

  if (isLoading || !members) {
    return <div style={{ padding: 24, color: theme.textMuted }}>Loading family graph...</div>
  }

  const byType = members.reduce((acc, m) => {
    if (!acc[m.relationship_type]) acc[m.relationship_type] = []
    acc[m.relationship_type].push(m)
    return acc
  }, {} as Record<string, typeof members>)

  const order = ['parent', 'partner', 'sibling', 'child', 'extended', 'other']

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            <ApartmentOutlined style={{ marginRight: 8 }} />
            Family graph
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>Closeness, tension, and support at a glance</Text>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={() => navigate('/app/relationships/family')}>Back</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} style={{ borderRadius: 10 }}>
            Add member
          </Button>
        </div>
      </div>

      {members.length === 0 ? (
        <Card style={{ borderRadius: 16, border: `1px solid ${theme.contentCardBorder}` }}>
          <div style={{ textAlign: 'center', padding: 32 }}>
            <Text type="secondary">No family members yet. Add parents, siblings, partner, children, or extended family.</Text>
            <div style={{ marginTop: 16 }}>
              <Button type="primary" onClick={() => setModalOpen(true)}>Add first member</Button>
            </div>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {order.map((type) => {
            const list = byType[type] || []
            if (list.length === 0) return null
            const label = RELATIONSHIP_OPTIONS.find((o) => o.value === type)?.label || type
            return (
              <Card
                key={type}
                size="small"
                title={label}
                style={{ borderRadius: 16, border: `1px solid ${theme.contentCardBorder}` }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {list.map((m) => (
                    <FamilyMemberCard
                      key={m.id}
                      member={m}
                      accentColor={DOMAIN_COLORS.family}
                      onOpen={() => setModalOpen(true)}
                    />
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal title="Add family member" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} destroyOnClose width={480}>
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) =>
            createMutation.mutate({
              ...v,
              closeness_score: v.closeness_score != null ? Number(v.closeness_score) : undefined,
              tension_score: v.tension_score != null ? Number(v.tension_score) : undefined,
            })
          }
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Full name" />
          </Form.Item>
          <Form.Item name="relationship_type" label="Relationship" rules={[{ required: true }]}>
            <Select options={RELATIONSHIP_OPTIONS} placeholder="Select" />
          </Form.Item>
          <Form.Item name="birth_date" label="Birth date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="contact_info" label="Contact">
            <Input placeholder="Phone or email" />
          </Form.Item>
          <Form.Item name="closeness_score" label="Closeness (0–10)">
            <Input type="number" min={0} max={10} placeholder="Optional" />
          </Form.Item>
          <Form.Item name="tension_score" label="Tension (0–10)">
            <Input type="number" min={0} max={10} placeholder="Optional" />
          </Form.Item>
          <Form.Item name="support_level" label="Support level">
            <Select options={SUPPORT_OPTIONS} placeholder="Optional" allowClear />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} placeholder="Optional" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
              Add member
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
