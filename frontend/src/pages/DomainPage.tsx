import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Tabs, Card, List, Typography, Empty, Spin } from 'antd'
import { domainsService } from '../services/domains'
import { notesService } from '../services/notes'
import { goalsService } from '../services/goals'
import { metricsService } from '../services/metrics'
import { experiencesService } from '../services/experiences'
import { achievementsService } from '../services/achievements'
import { relationshipsService } from '../services/relationships'
import { DomainStrategySection } from '../components/strategies/DomainStrategySection'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export function DomainPage() {
  const { domainSlug } = useParams<{ domainSlug: string }>()

  const { data: domain, isLoading: domainLoading } = useQuery({
    queryKey: ['domain', domainSlug],
    queryFn: () => domainsService.getBySlug(domainSlug!),
    enabled: !!domainSlug,
  })

  const domainId = domain?.id

  const { data: notes, isLoading: notesLoading } = useQuery({
    queryKey: ['notes', domainId],
    queryFn: () => notesService.list(domainId),
    enabled: !!domainId,
  })

  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ['goals', domainId],
    queryFn: () => goalsService.list(domainId, 'active'),
    enabled: !!domainId,
  })

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['metrics', domainSlug],
    queryFn: () => metricsService.list(domainSlug),
    enabled: !!domainSlug,
  })

  const { data: experiences } = useQuery({
    queryKey: ['experiences'],
    queryFn: () => experiencesService.list(20),
    enabled: domainSlug === 'experiences',
  })

  const { data: achievements } = useQuery({
    queryKey: ['achievements', domainSlug],
    queryFn: () => achievementsService.list(domainSlug, 20),
    enabled: !!domainSlug && domainSlug !== 'experiences' && domainSlug !== 'relationships',
  })

  const { data: relationships } = useQuery({
    queryKey: ['relationships'],
    queryFn: relationshipsService.list,
    enabled: domainSlug === 'relationships',
  })

  if (domainLoading || !domain) {
    return <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />
  }

  const tabItems = [
    {
      key: 'strategy',
      label: 'Strategy',
      children: <DomainStrategySection domainSlug={domainSlug!} />,
    },
    {
      key: 'notes',
      label: 'Notes',
      children: (
        <List
          loading={notesLoading}
          dataSource={notes || []}
          renderItem={(n) => (
            <List.Item>
              <Card size="small" style={{ width: '100%' }}>
                <Title level={5}>{n.title}</Title>
                <Text type="secondary">{n.content}</Text>
              </Card>
            </List.Item>
          )}
          locale={{ emptyText: <Empty description="No notes" /> }}
        />
      ),
    },
    {
      key: 'metrics',
      label: 'Metrics',
      children: (
        <List
          loading={metricsLoading}
          dataSource={metrics || []}
          renderItem={(m) => (
            <List.Item>
              <Card size="small">
                <Text strong>{m.name}</Text>
                <Text type="secondary"> ({m.unit})</Text>
              </Card>
            </List.Item>
          )}
          locale={{ emptyText: <Empty description="No metrics" /> }}
        />
      ),
    },
    {
      key: 'goals',
      label: 'Goals',
      children: (
        <List
          loading={goalsLoading}
          dataSource={goals || []}
          renderItem={(g) => (
            <List.Item>
              <Card size="small">
                <Text strong>{g.title}</Text>
                <br />
                <Text type="secondary">Progress: {g.progress}%</Text>
              </Card>
            </List.Item>
          )}
          locale={{ emptyText: <Empty description="No goals" /> }}
        />
      ),
    },
    ...(domainSlug === 'experiences'
      ? [
          {
            key: 'experiences',
            label: 'Experiences',
            children: (
              <List
                dataSource={experiences || []}
                renderItem={(e) => (
                  <List.Item>
                    <Card size="small">
                      <Text strong>{e.title}</Text>
                      <br />
                      <Text type="secondary">
                        {dayjs(e.date).format('MMM D, YYYY')}
                        {e.location && ` • ${e.location}`}
                      </Text>
                    </Card>
                  </List.Item>
                )}
                locale={{ emptyText: <Empty description="No experiences" /> }}
              />
            ),
          },
        ]
      : []),
    ...(domainSlug === 'relationships'
      ? [
          {
            key: 'relationships',
            label: 'Contacts',
            children: (
              <List
                dataSource={relationships || []}
                renderItem={(r) => (
                  <List.Item>
                    <Card size="small">
                      <Text strong>{r.name}</Text>
                      <Text type="secondary"> — {r.relationship_type}</Text>
                      {r.last_contact_date && (
                        <br />
                      )}
                      {r.last_contact_date && (
                        <Text type="secondary">
                          Last contact: {dayjs(r.last_contact_date).format('MMM D')}
                        </Text>
                      )}
                    </Card>
                  </List.Item>
                )}
                locale={{ emptyText: <Empty description="No relationships" /> }}
              />
            ),
          },
        ]
      : []),
    ...(achievements && achievements.length > 0
      ? [
          {
            key: 'achievements',
            label: 'Achievements',
            children: (
              <List
                dataSource={achievements}
                renderItem={(a) => (
                  <List.Item>
                    <Card size="small">
                      <Text strong>{a.title}</Text>
                      {a.date && (
                        <br />
                      )}
                      {a.date && (
                        <Text type="secondary">
                          {dayjs(a.date).format('MMM D, YYYY')}
                        </Text>
                      )}
                    </Card>
                  </List.Item>
                )}
              />
            ),
          },
        ]
      : []),
  ]

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        {domain.name}
      </Title>
      {domain.description && (
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          {domain.description}
        </Text>
      )}
      <Tabs defaultActiveKey="strategy" items={tabItems} />
    </div>
  )
}
