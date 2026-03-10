import { Progress } from 'antd'

interface XPProgressBarProps {
  current: number
  required: number
  level?: number
  showLevel?: boolean
}

export function XPProgressBar({ current, required, level = 1, showLevel = true }: XPProgressBarProps) {
  const percent = required > 0 ? Math.min(100, (current / required) * 100) : 0

  return (
    <div>
      {showLevel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
          <span style={{ fontWeight: 600 }}>Level {level}</span>
          <span style={{ color: '#64748b' }}>
            {Math.round(current)} / {Math.round(required)} XP
          </span>
        </div>
      )}
      <Progress
        percent={Math.round(percent)}
        size="small"
        strokeColor={{
          '0%': '#6366f1',
          '100%': '#8b5cf6',
        }}
        showInfo={false}
      />
    </div>
  )
}
