/**
 * Skill detail page: progress, subskills, practice sessions, log practice, weaknesses, artifacts.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Typography, Button, Progress, Tag, Empty, Modal, Form, Input } from 'antd'
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { skillsService } from '../../services/skills'
import { useTheme } from '../../hooks/useTheme'
import { PracticeSessionForm } from './PracticeSessionForm'
import { WeaknessPanel } from './WeaknessPanel'
import { ArtifactVault } from './ArtifactVault'
import { DOMAIN_COLORS } from '../../components/control-room/constants'

const { Title, Text } = Typography

export function SkillDetailPage() {
  const { id } = useParams<{ id: string }>()
  const theme = useTheme()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [subskillModalOpen, setSubskillModalOpen] = useState(false)
  const [subskillForm] = Form.useForm()

  const { data: skill, isLoading } = useQuery({
    queryKey: ['skills', id],
    queryFn: () => skillsService.getById(id!),
    enabled: !!id,
  })

  const createSubskillMutation = useMutation({
    mutationFn: (values: { name: string; category?: string; description?: string }) =>
      skillsService.create({
        name: values.name,
        category: values.category,
        description: values.description,
        parent_skill_id: id!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      setSubskillModalOpen(false)
      subskillForm.resetFields()
    },
  })

  if (!id || isLoading || !skill) {
    return (
      <div style={{ padding: 24, color: theme.textMuted }}>
        {!id ? 'Missing skill ID' : 'Loading skill...'}
      </div>
    )
  }

  const progress = skill.progress
  const level = progress?.level ?? 1
  const xp = progress?.xp ?? 0
  const nextLevelXp = level * 100
  const progressPct = nextLevelXp > 0 ? Math.min(100, (xp / nextLevelXp) * 100) : 0
  const subskills = skill.subskills ?? []

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/app/skills')}
          style={{ marginBottom: 12 }}
        >
          Back to Skills
        </Button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
              {skill.name}
            </Title>
            {skill.category && (
              <Tag color={DOMAIN_COLORS.skills} style={{ marginTop: 8 }}>{skill.category}</Tag>
            )}
            {skill.description && (
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>{skill.description}</Text>
            )}
          </div>
          <PracticeSessionForm skillId={skill.id} skillName={skill.name} />
        </div>
      </div>

      {/* Progress */}
      <Card
        size="small"
        style={{ marginBottom: 24, borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Level</Text>
            <div style={{ fontSize: 24, fontWeight: 700, color: DOMAIN_COLORS.skills }}>{level}</div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>XP to next level</Text>
            <Progress percent={progressPct} strokeColor={DOMAIN_COLORS.skills} />
            <Text type="secondary" style={{ fontSize: 12 }}>{xp} / {nextLevelXp} XP</Text>
          </div>
          {progress?.last_practiced_at && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Last practiced</Text>
              <div style={{ fontSize: 13 }}>{new Date(progress.last_practiced_at).toLocaleDateString()}</div>
            </div>
          )}
          {progress?.decay_risk != null && progress.decay_risk > 0.3 && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Decay risk</Text>
              <div style={{ color: '#f59e0b', fontSize: 13 }}>{Math.round(progress.decay_risk * 100)}%</div>
            </div>
          )}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <WeaknessPanel skillId={skill.id} />
          <div style={{ marginTop: 24 }}>
            <ArtifactVault skillId={skill.id} />
          </div>
        </div>
        <div>
          {/* Recent sessions placeholder - could use listSessions */}
          <Card
            size="small"
            title="Recent practice"
            style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}
          >
            <Text type="secondary" style={{ fontSize: 13 }}>
              Sessions are shown on the dashboard. Log practice above to update progress and reduce decay risk.
            </Text>
          </Card>
          {subskills.length > 0 && (
            <Card
              size="small"
              title="Subskills"
              extra={
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setSubskillModalOpen(true)}>
                  Add subskill
                </Button>
              }
              style={{ marginTop: 24, borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {subskills.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      background: theme.hoverBg,
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/app/skills/${s.id}`)}
                  >
                    <Text strong>{s.name}</Text>
                    {s.progress && (
                      <span style={{ marginLeft: 8, fontSize: 12, color: theme.textMuted }}>
                        Lv.{s.progress.level} · {s.progress.xp} XP
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
          {subskills.length === 0 && (
            <Card size="small" style={{ marginTop: 24, borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}>
              <Empty description="No subskills yet">
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setSubskillModalOpen(true)}>
                  Add subskill
                </Button>
              </Empty>
            </Card>
          )}
        </div>
      </div>

      <Modal title="Add subskill" open={subskillModalOpen} onCancel={() => setSubskillModalOpen(false)} footer={null} destroyOnClose>
        <Form form={subskillForm} layout="vertical" onFinish={(v) => createSubskillMutation.mutate(v)}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. speaking, APIs" />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Input placeholder="Optional" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Optional" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createSubskillMutation.isPending}>
              Create subskill
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
