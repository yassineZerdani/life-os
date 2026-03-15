/**
 * Decay warning row: skill name + message + CTA.
 */
import { Button } from 'antd'
import type { IntelligenceInsight } from '../../services/skills'

interface SkillDecayWarningProps {
  insight: IntelligenceInsight
  onNavigate: () => void
}

export function SkillDecayWarning({ insight, onNavigate }: SkillDecayWarningProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
      <span style={{ fontSize: 13 }}>{insight.message}</span>
      <Button type="primary" size="small" onClick={onNavigate}>
        Practice
      </Button>
    </div>
  )
}
