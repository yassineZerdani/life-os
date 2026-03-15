/**
 * Skills tree page: full tree view with add-skill and navigate to detail.
 */
import { useQuery } from '@tanstack/react-query'
import { Card, Typography, Button, Empty } from 'antd'
import { PlusOutlined, ApartmentOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { skillsService } from '../../services/skills'
import { useTheme } from '../../hooks/useTheme'
import { SkillTreeView } from './SkillTreeView'
import { DOMAIN_COLORS } from '../../components/control-room/constants'

const { Title, Text } = Typography

export function SkillsTreePage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { data: tree, isLoading } = useQuery({
    queryKey: ['skills', 'tree'],
    queryFn: () => skillsService.getTree(),
  })

  if (isLoading || !tree) {
    return <div style={{ padding: 24, color: theme.textMuted }}>Loading skill tree...</div>
  }

  const hasNodes = tree.length > 0

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            <ApartmentOutlined style={{ marginRight: 8 }} />
            Skill Tree
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>Expand and drill into subskills</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/app/skills')} style={{ borderRadius: 10 }}>
          Back to dashboard
        </Button>
      </div>

      <Card
        style={{
          borderRadius: 16,
          border: `1px solid ${theme.contentCardBorder}`,
        }}
      >
        {!hasNodes ? (
          <Empty
            description="No skills yet. Create a skill from the dashboard."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => navigate('/app/skills')}>Go to dashboard</Button>
          </Empty>
        ) : (
          <SkillTreeView
            nodes={tree}
            accentColor={DOMAIN_COLORS.skills}
            onSelectSkill={(id) => navigate(`/app/skills/${id}`)}
          />
        )}
      </Card>
    </div>
  )
}
