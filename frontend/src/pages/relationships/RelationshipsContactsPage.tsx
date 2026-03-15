/**
 * Relationships contacts — list of important people from relationships domain.
 */
import { useQuery } from '@tanstack/react-query'
import { Card, List, Typography, Empty, Spin, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { relationshipsService } from '../../services/relationships'
import { useTheme } from '../../hooks/useTheme'

const { Title, Text } = Typography

export function RelationshipsContactsPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { data: relationships, isLoading } = useQuery({
    queryKey: ['relationships'],
    queryFn: () => relationshipsService.list(),
  })

  return (
    <div>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/app/relationships')}
        style={{ marginBottom: 16, color: theme.textSecondary }}
      >
        Back to Relationships
      </Button>
      <Title level={3} style={{ marginBottom: 8, color: theme.textPrimary }}>
        Contacts
      </Title>
      <Text style={{ color: theme.textSecondary, display: 'block', marginBottom: 24 }}>
        Important people in your network.
      </Text>
      {isLoading ? (
        <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />
      ) : (
        <Card
          style={{
            background: theme.contentCardBg ?? theme.cardBg,
            border: `1px solid ${theme.contentCardBorder ?? theme.border}`,
          }}
        >
          <List
            dataSource={relationships || []}
            renderItem={(r) => (
              <List.Item>
                <Card size="small" style={{ width: '100%' }}>
                  <Text strong>{r.name}</Text>
                  <Text type="secondary"> — {r.relationship_type}</Text>
                  {r.last_contact_date && (
                    <>
                      <br />
                      <Text type="secondary">Last contact: {dayjs(r.last_contact_date).format('MMM D')}</Text>
                    </>
                  )}
                </Card>
              </List.Item>
            )}
            locale={{ emptyText: <Empty description="No contacts yet" /> }}
          />
        </Card>
      )}
    </div>
  )
}
