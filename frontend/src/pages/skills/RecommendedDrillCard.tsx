/**
 * Recommended drill row: skill name, reason, start button.
 */
import { Button } from 'antd'
import type { RecommendedDrill } from '../../services/skills'

interface RecommendedDrillCardProps {
  drill: RecommendedDrill
  onStart: () => void
}

export function RecommendedDrillCard({ drill, onStart }: RecommendedDrillCardProps) {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 10,
        background: 'var(--skill-drill-bg, rgba(99, 102, 241, 0.08))',
        border: '1px solid var(--skill-drill-border, rgba(99, 102, 241, 0.2))',
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{drill.skill_name}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{drill.reason}</div>
      <Button type="primary" size="small" onClick={onStart}>
        Start drill
      </Button>
    </div>
  )
}
