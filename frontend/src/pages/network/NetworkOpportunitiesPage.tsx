/**
 * Opportunities — list and add connection opportunities linked to contacts.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Typography, Button, Modal, Form, Input, Select, InputNumber, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { networkService } from '../../services/network'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../../components/control-room/constants'
import { OpportunityNetworkPanel } from '../../components/network'
import type { Contact, ConnectionOpportunity } from '../../services/network'

const { Title, Text } = Typography

export function NetworkOpportunitiesPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['network', 'opportunities'],
    queryFn: () => networkService.listOpportunities(),
  })

  const { data: contacts } = useQuery({
    queryKey: ['network', 'contacts'],
    queryFn: () => networkService.listContacts(),
    enabled: modalOpen,
  })

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      networkService.createOpportunity({
        contact_id: values.contact_id as string,
        opportunity_type: values.opportunity_type as string,
        title: values.title as string,
        description: values.description as string,
        status: (values.status as string) ?? 'open',
        potential_value: values.potential_value != null ? Number(values.potential_value) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network'] })
      setModalOpen(false)
      form.resetFields()
    },
  })

  const contactMap = (contacts ?? []).reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {} as Record<string, string>)
  const openOpps = (opportunities ?? []).filter((o) => o.status === 'open')

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            Opportunities
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Link opportunities to contacts — referrals, collaborations, roles
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
          style={{ borderRadius: 10 }}
        >
          Add opportunity
        </Button>
      </div>

      <OpportunityNetworkPanel
        opportunities={openOpps}
        getContactName={(id) => contactMap[id] ?? 'Unknown'}
        onAdd={() => setModalOpen(true)}
        loading={isLoading}
      />

      {(opportunities ?? []).filter((o) => o.status !== 'open').length > 0 && (
        <Card
          size="small"
          style={{ marginTop: 24, borderRadius: 16, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}
        >
          <Text strong style={{ fontSize: 13 }}>Closed / other</Text>
          <div style={{ marginTop: 8 }}>
            {(opportunities ?? [])
              .filter((o) => o.status !== 'open')
              .map((o) => (
                <div key={o.id} style={{ padding: '6px 0', fontSize: 13 }}>
                  <Text>{o.title}</Text>
                  <Tag style={{ marginLeft: 8 }}>{o.status}</Tag>
                </div>
              ))}
          </div>
        </Card>
      )}

      <Modal
        title="Add opportunity"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={440}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'open' }}
          onFinish={(values) => createMutation.mutate(values)}
        >
          <Form.Item name="contact_id" label="Contact" rules={[{ required: true }]}>
            <Select
              placeholder="Select contact"
              options={(contacts ?? []).map((c: Contact) => ({ value: c.id, label: c.name }))}
            />
          </Form.Item>
          <Form.Item name="opportunity_type" label="Type" rules={[{ required: true }]}>
            <Input placeholder="e.g. Referral, Collaboration, Role" />
          </Form.Item>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Short title" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="potential_value" label="Potential value">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="Optional" />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select options={[{ value: 'open', label: 'Open' }, { value: 'pursuing', label: 'Pursuing' }, { value: 'closed', label: 'Closed' }]} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending} style={{ borderRadius: 10 }}>
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
