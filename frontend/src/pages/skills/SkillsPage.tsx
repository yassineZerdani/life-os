/**
 * Skills Dashboard — Skill OS home: decay warnings, recommended drills, skill list, insights.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Typography, Button, Empty, Modal, Form, Input } from 'antd'
import { ThunderboltOutlined, ApartmentOutlined, FolderOutlined, WarningOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { skillsService } from '../../services/skills'
import { useTheme } from '../../hooks/useTheme'
import { SkillDecayWarning } from './SkillDecayWarning'
import { RecommendedDrillCard } from './RecommendedDrillCard'
import { SkillCard } from './SkillCard'
import { DOMAIN_COLORS } from '../../components/control-room/constants'

const { Title, Text } = Typography

export function SkillsPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [form] = Form.useForm()

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['skills', 'dashboard'],
    queryFn: () => skillsService.getDashboard(),
  })

  const createSkillMutation = useMutation({
    mutationFn: (values: { name: string; category?: string; description?: string }) =>
      skillsService.create({ name: values.name, category: values.category, description: values.description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      setAddModalOpen(false)
      form.resetFields()
    },
  })

  if (isLoading || !dashboard) {
    return (
      <div style={{ padding: 24, color: theme.textMuted }}>
        Loading Skill OS...
      </div>
    )
  }

  const { root_skills, insights, recommended_drills, decay_warnings } = dashboard
  const hasSkills = root_skills.length > 0

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            Skill Operating System
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Deliberate practice, skill trees, and proof of progress
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)} style={{ borderRadius: 10 }}>
            Add skill
          </Button>
          <Button
            icon={<ApartmentOutlined />}
            onClick={() => navigate('/app/skills/tree')}
            style={{ borderRadius: 10 }}
          >
            Tree View
          </Button>
          <Button
            icon={<FolderOutlined />}
            onClick={() => navigate('/app/skills/artifacts')}
            style={{ borderRadius: 10 }}
          >
            Artifact Vault
          </Button>
        </div>
      </div>

      {/* Decay warnings */}
      {decay_warnings.length > 0 && (
        <Card
          size="small"
          style={{
            marginBottom: 24,
            borderRadius: 12,
            border: `1px solid ${theme.contentCardBorder}`,
            background: theme.hoverBg,
          }}
          title={
            <span style={{ color: '#f59e0b' }}>
              <WarningOutlined style={{ marginRight: 8 }} />
              Decay risk
            </span>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {decay_warnings.map((w) => (
              <SkillDecayWarning key={w.skill_id} insight={w} onNavigate={() => navigate(`/app/skills/${w.skill_id}`)} />
            ))}
          </div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Main: skills + insights */}
        <div>
          {!hasSkills ? (
            <Card
              style={{
                borderRadius: 16,
                border: `1px solid ${theme.contentCardBorder}`,
                marginBottom: 24,
              }}
            >
              <Empty
                description={
                  <span style={{ color: theme.textSecondary }}>
                    No skills yet. Add a root skill to start building your tree.
                  </span>
                }
              >
                <Button type="primary" onClick={() => setAddModalOpen(true)} style={{ borderRadius: 10 }}>
                  Create first skill
                </Button>
              </Empty>
            </Card>
          ) : (
            <>
              <Title level={4} style={{ marginBottom: 16, fontWeight: 600 }}>
                Your skills
              </Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {root_skills.map((node) => (
                  <SkillCard
                    key={node.skill.id}
                    node={node}
                    accentColor={DOMAIN_COLORS.skills}
                    onOpen={() => navigate(`/app/skills/${node.skill.id}`)}
                  />
                ))}
              </div>
              {insights.length > 0 && (
                <Card
                  size="small"
                  style={{
                    borderRadius: 12,
                    border: `1px solid ${theme.contentCardBorder}`,
                  }}
                  title="Intelligence"
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {insights.map((i) => (
                      <div
                        key={`${i.skill_id}-${i.type}`}
                        style={{
                          padding: 10,
                          borderRadius: 8,
                          background: theme.hoverBg,
                          fontSize: 13,
                          color: theme.textSecondary,
                        }}
                      >
                        {i.message}
                        <Button
                          type="link"
                          size="small"
                          style={{ padding: 0, marginLeft: 8 }}
                          onClick={() => navigate(`/app/skills/${i.skill_id}`)}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Side: recommended drills */}
        <div>
          <Card
            style={{
              borderRadius: 16,
              border: `1px solid ${theme.contentCardBorder}`,
              position: 'sticky',
              top: 24,
            }}
            title={
              <span>
                <ThunderboltOutlined style={{ marginRight: 8 }} />
                Recommended drills
              </span>
            }
          >
            {recommended_drills.length === 0 ? (
              <Text type="secondary" style={{ fontSize: 13 }}>
                Add skills and log practice. Recommendations will appear here.
              </Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recommended_drills.map((d) => (
                  <RecommendedDrillCard
                    key={d.skill_id}
                    drill={d}
                    onStart={() => navigate(`/app/skills/${d.skill_id}`)}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal title="Add skill" open={addModalOpen} onCancel={() => setAddModalOpen(false)} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={(v) => createSkillMutation.mutate(v)}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Spanish, Backend Engineering" />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Input placeholder="Optional" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Optional" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createSkillMutation.isPending}>
              Create skill
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
