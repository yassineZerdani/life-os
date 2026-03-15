/**
 * Contacts — list, add, edit contacts. Trust, warmth, opportunity scores.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Typography, Button, Modal, Form, Input, Select, InputNumber } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import { networkService } from '../../services/network'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../../components/control-room/constants'
import { ContactCard } from '../../components/network'
import type { Contact } from '../../services/network'

const { Title, Text } = Typography

const CATEGORY_OPTIONS = [
  { value: 'mentor', label: 'Mentor' },
  { value: 'peer', label: 'Peer' },
  { value: 'collaborator', label: 'Collaborator' },
  { value: 'client', label: 'Client' },
  { value: 'other', label: 'Other' },
]

export function NetworkContactsPage() {
  const theme = useTheme()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const highlightId = searchParams.get('highlight') ?? searchParams.get('contact')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [form] = Form.useForm()

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['network', 'contacts'],
    queryFn: () => networkService.listContacts(),
  })

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      networkService.createContact({
        name: values.name as string,
        category: values.category as string,
        company: values.company as string,
        role: values.role as string,
        notes: values.notes as string,
        trust_score: values.trust_score != null ? Number(values.trust_score) : undefined,
        warmth_score: values.warmth_score != null ? Number(values.warmth_score) : undefined,
        opportunity_score: values.opportunity_score != null ? Number(values.opportunity_score) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network'] })
      setModalOpen(false)
      form.resetFields()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Contact> }) =>
      networkService.updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network'] })
      setEditing(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => networkService.deleteContact(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['network'] }),
  })

  const byCategory = (contacts ?? []).reduce((acc, c) => {
    const cat = c.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(c)
    return acc
  }, {} as Record<string, Contact[]>)
  const categoryOrder = ['mentor', 'peer', 'collaborator', 'client', 'other']

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            Contacts
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Map important contacts — trust, warmth, opportunity
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
          style={{ borderRadius: 10 }}
        >
          Add contact
        </Button>
      </div>

      {isLoading ? (
        <div style={{ padding: 24, color: theme.textMuted }}>Loading contacts…</div>
      ) : (contacts ?? []).length === 0 ? (
        <Card
          style={{
            borderRadius: 16,
            border: `1px dashed ${theme.border ?? '#cbd5e1'}`,
            background: 'transparent',
            textAlign: 'center',
            padding: 32,
          }}
        >
          <Text type="secondary">No contacts yet. Add people who matter to your network.</Text>
          <div style={{ marginTop: 12 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} style={{ borderRadius: 10 }}>
              Add first contact
            </Button>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {categoryOrder.filter((cat) => (byCategory[cat]?.length ?? 0) > 0).map((cat) => (
            <div key={cat}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: theme.textMuted,
                  display: 'block',
                  marginBottom: 12,
                }}
              >
                {CATEGORY_OPTIONS.find((o) => o.value === cat)?.label ?? cat}
              </Text>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {byCategory[cat].map((c) => (
                  <div
                    key={c.id}
                    style={{
                      outline: highlightId === c.id ? `2px solid ${DOMAIN_COLORS.network}` : undefined,
                      borderRadius: 12,
                    }}
                  >
                    <ContactCard
                      contact={c}
                      onClick={() => setEditing(c)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        title="Add contact"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={440}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => createMutation.mutate(values)}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Full name" />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select options={CATEGORY_OPTIONS} placeholder="Select" />
          </Form.Item>
          <Form.Item name="company" label="Company">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role">
            <Input />
          </Form.Item>
          <Form.Item name="trust_score" label="Trust (0–10)">
            <InputNumber min={0} max={10} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="warmth_score" label="Warmth (0–10)">
            <InputNumber min={0} max={10} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="opportunity_score" label="Opportunity (0–10)">
            <InputNumber min={0} max={10} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending} style={{ borderRadius: 10 }}>
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {editing && (
        <Modal
          title="Edit contact"
          open={!!editing}
          onCancel={() => setEditing(null)}
          footer={null}
          width={440}
          destroyOnClose
        >
          <Form
            layout="vertical"
            initialValues={{
              name: editing.name,
              category: editing.category,
              company: editing.company ?? '',
              role: editing.role ?? '',
              trust_score: editing.trust_score ?? undefined,
              warmth_score: editing.warmth_score ?? undefined,
              opportunity_score: editing.opportunity_score ?? undefined,
              notes: editing.notes ?? '',
            }}
            onFinish={(values) =>
              updateMutation.mutate({
                id: editing.id,
                data: {
                  name: values.name,
                  category: values.category,
                  company: values.company || undefined,
                  role: values.role || undefined,
                  trust_score: values.trust_score != null ? Number(values.trust_score) : undefined,
                  warmth_score: values.warmth_score != null ? Number(values.warmth_score) : undefined,
                  opportunity_score: values.opportunity_score != null ? Number(values.opportunity_score) : undefined,
                  notes: values.notes || undefined,
                },
              })
            }
          >
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
              <Select options={CATEGORY_OPTIONS} />
            </Form.Item>
            <Form.Item name="company" label="Company">
              <Input />
            </Form.Item>
            <Form.Item name="role" label="Role">
              <Input />
            </Form.Item>
            <Form.Item name="trust_score" label="Trust (0–10)">
              <InputNumber min={0} max={10} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="warmth_score" label="Warmth (0–10)">
              <InputNumber min={0} max={10} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="opportunity_score" label="Opportunity (0–10)">
              <InputNumber min={0} max={10} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="notes" label="Notes">
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={updateMutation.isPending} style={{ borderRadius: 10 }}>
                Save
              </Button>
              <Button danger style={{ marginLeft: 8 }} onClick={() => { deleteMutation.mutate(editing.id); setEditing(null); }}>
                Delete
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  )
}
