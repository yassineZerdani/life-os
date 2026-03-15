/**
 * Artifact vault: list all artifacts across skills with type, title, link.
 */
import { useQuery } from '@tanstack/react-query'
import { Card, Typography, Button, Tag, Empty } from 'antd'
import { FolderOutlined, LinkOutlined, FileOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { skillsService } from '../../services/skills'
import { useTheme } from '../../hooks/useTheme'
import type { Artifact } from '../../services/skills'

const { Title, Text } = Typography

const ARTIFACT_TYPE_LABELS: Record<string, string> = {
  code: 'Code',
  design: 'Design',
  essay: 'Essay',
  recording: 'Recording',
  presentation: 'Presentation',
  certificate: 'Certificate',
  note: 'Note',
}

export function SkillsArtifactsPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { data: artifacts, isLoading } = useQuery({
    queryKey: ['skills', 'artifacts', 'vault'],
    queryFn: () => skillsService.listAllArtifacts(),
  })

  if (isLoading || !artifacts) {
    return <div style={{ padding: 24, color: theme.textMuted }}>Loading artifact vault...</div>
  }

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            <FolderOutlined style={{ marginRight: 8 }} />
            Artifact Vault
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>Proof of practice and quality</Text>
        </div>
        <Button onClick={() => navigate('/app/skills')} style={{ borderRadius: 10 }}>Back to Skills</Button>
      </div>

      <Card
        style={{
          borderRadius: 16,
          border: `1px solid ${theme.contentCardBorder}`,
        }}
      >
        {artifacts.length === 0 ? (
          <Empty
            description="No artifacts yet. Add proof (links or files) from a skill detail page."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => navigate('/app/skills')}>Go to Skills</Button>
          </Empty>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {artifacts.map((a) => (
              <ArtifactRow key={a.id} artifact={a} onOpenSkill={() => navigate(`/app/skills/${a.skill_id}`)} />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function ArtifactRow({ artifact, onOpenSkill }: { artifact: Artifact; onOpenSkill: () => void }) {
  const theme = useTheme()
  const typeLabel = ARTIFACT_TYPE_LABELS[artifact.type] || artifact.type

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 12,
        border: `1px solid ${theme.contentCardBorder}`,
        background: theme.hoverBg,
      }}
    >
      <FileOutlined style={{ fontSize: 18, color: theme.textMuted }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text strong style={{ display: 'block' }}>{artifact.title}</Text>
        {artifact.description && (
          <Text type="secondary" style={{ fontSize: 12 }} ellipsis>{artifact.description}</Text>
        )}
        <div style={{ marginTop: 6 }}>
          <Tag>{typeLabel}</Tag>
          <Button type="link" size="small" style={{ padding: 0 }} onClick={onOpenSkill}>
            View skill
          </Button>
        </div>
      </div>
      {(artifact.link_url || artifact.file_url) && (
        <Button
          type="link"
          icon={<LinkOutlined />}
          href={artifact.link_url || artifact.file_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open
        </Button>
      )}
    </div>
  )
}
