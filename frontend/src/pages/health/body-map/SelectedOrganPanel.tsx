/**
 * Right panel: selected organ details — score, function, support needs, signals, metrics, actions.
 */
import { Card, Typography, Tag, List, Progress } from 'antd'
import type { OrganDashboard } from '../../../services/bodyIntelligence'
import { getHealthColor, getHealthLabel } from './constants'

const { Text } = Typography

interface SelectedOrganPanelProps {
  dashboard: OrganDashboard | null
}

export function SelectedOrganPanel({ dashboard }: SelectedOrganPanelProps) {
  if (!dashboard) return null

  const { organ, health_score, tracked_metrics, risk_signals } = dashboard
  const score = health_score?.score
  const color = getHealthColor(score)
  const label = getHealthLabel(score)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
          <Text strong style={{ fontSize: 18 }}>{organ.name}</Text>
          {organ.system && (
            <Tag style={{ margin: 0 }}>{organ.system.name}</Tag>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <Progress
            type="circle"
            percent={score ?? 0}
            size={48}
            strokeColor={color}
            format={() => (
              <span style={{ fontSize: 14, fontWeight: 700, color }}>{Math.round(score ?? 0)}</span>
            )}
          />
          <div>
            <Text strong style={{ fontSize: 13, color }}>{label}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>Health support score</Text>
          </div>
        </div>
      </div>

      {/* Function — always show something when no description */}
      {organ.description ? (
        <Card size="small" title="What it does" style={{ borderRadius: 12 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>{organ.description}</Text>
        </Card>
      ) : organ.system?.description ? (
        <Card size="small" title="What it does" style={{ borderRadius: 12 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Part of {organ.system.name}. {organ.system.description}
          </Text>
        </Card>
      ) : null}

      {/* Daily support */}
      {(organ.nutrition_requirements?.length > 0 || organ.movement_requirements?.length > 0 || organ.sleep_requirements?.length > 0) ? (
        <Card size="small" title="Daily support needs" style={{ borderRadius: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {organ.nutrition_requirements?.length > 0 && (
              <div>
                <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase' }}>Nutrients</Text>
                <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {organ.nutrition_requirements.slice(0, 8).map((n) => (
                    <Tag key={n}>{String(n).replace(/_/g, ' ')}</Tag>
                  ))}
                </div>
              </div>
            )}
            {organ.movement_requirements?.length > 0 && (
              <div>
                <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase' }}>Movement</Text>
                <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {organ.movement_requirements.slice(0, 6).map((m) => (
                    <Tag key={m}>{String(m).replace(/_/g, ' ')}</Tag>
                  ))}
                </div>
              </div>
            )}
            {organ.sleep_requirements?.length > 0 && (
              <div>
                <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase' }}>Sleep</Text>
                <Text style={{ fontSize: 13 }}>{organ.sleep_requirements.join(', ')}</Text>
              </div>
            )}
          </div>
        </Card>
      ) : organ.system && (
        <Card size="small" title="Support" style={{ borderRadius: 12 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Support data is inherited from {organ.system.name}. Add custom data for this organ for richer recommendations.
          </Text>
        </Card>
      )}

      {/* Warning signals */}
      {(risk_signals?.length > 0 || (organ.symptoms?.length ?? 0) > 0 || (organ.signals?.length ?? 0) > 0) ? (
        <Card size="small" title="Signals & symptoms" style={{ borderRadius: 12 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {risk_signals?.map((r) => (
              <Tag key={r} color="orange">{r}</Tag>
            ))}
            {(organ.symptoms || []).map((s) => (
              <Tag key={s}>{String(s).replace(/_/g, ' ')}</Tag>
            ))}
            {(organ.signals || []).filter(s => !(organ.symptoms || []).includes(s)).map((s) => (
              <Tag key={s}>{String(s).replace(/_/g, ' ')}</Tag>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Metrics */}
      {tracked_metrics?.length > 0 ? (
        <Card size="small" title="Metrics affecting this organ" style={{ borderRadius: 12 }}>
          <List
            size="small"
            dataSource={tracked_metrics}
            renderItem={(m) => (
              <List.Item>
                <Text strong style={{ fontSize: 13 }}>{m.name}</Text>
                {m.unit && <Text type="secondary"> ({m.unit})</Text>}
                {m.latest_value != null && (
                  <Text style={{ marginLeft: 8 }}>Latest: {m.latest_value}</Text>
                )}
              </List.Item>
            )}
          />
        </Card>
      ) : (organ.metric_keys?.length ?? 0) > 0 ? (
        <Card size="small" title="Metrics" style={{ borderRadius: 12 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Track: {organ.metric_keys.slice(0, 5).join(', ')}{organ.metric_keys.length > 5 ? '…' : ''}
          </Text>
        </Card>
      ) : null}

      {/* Recommended actions placeholder */}
      <Card size="small" title="Recommended actions" style={{ borderRadius: 12 }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Prioritise sleep, hydration, and the nutrients listed above. Track relevant metrics to improve your score.
        </Text>
      </Card>
    </div>
  )
}
