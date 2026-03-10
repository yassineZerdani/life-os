import { useMemo } from 'react'
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { DomainCard } from '../../types/controlRoom'
import { useTheme } from '../../hooks/useTheme'

const DOMAIN_ORDER = [
  'health',
  'wealth',
  'skills',
  'network',
  'career',
  'relationships',
  'experiences',
  'identity',
] as const

interface DomainRadarChartProps {
  domains: DomainCard[]
  loading?: boolean
  size?: number
}

export function DomainRadarChart({ domains, loading, size = 280 }: DomainRadarChartProps) {
  const theme = useTheme()

  const data = useMemo(() => {
    const byDomain = new Map(domains.map((d) => [d.domain, d.score]))
    return DOMAIN_ORDER.map((key) => ({
      domain: key.charAt(0).toUpperCase() + key.slice(1),
      score: byDomain.get(key) ?? 0,
      fullMark: 100,
    }))
  }, [domains])

  const strokeColor = theme.accent
  const gridStroke = theme.textMuted
  const textColor = theme.textSecondary

  if (loading) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.hoverBg,
          borderRadius: theme.crRadius,
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            border: `2px solid ${theme.border}`,
            borderTopColor: theme.accent,
            borderRadius: '50%',
            animation: 'control-room-spin 0.8s linear infinite',
          }}
        />
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: size, overflow: 'visible' }}>
      <ResponsiveContainer width="100%" height={size}>
      <RechartsRadarChart
        cx="50%"
        cy="50%"
        outerRadius="68%"
        data={data}
        margin={{ top: 24, right: 24, bottom: 24, left: 24 }}
      >
        <PolarGrid stroke={gridStroke} strokeOpacity={0.4} />
        <PolarAngleAxis
          dataKey="domain"
          tickLine={false}
          tickMargin={20}
          tick={(props) => {
            const p = props as { x?: number; y?: number; payload?: { value?: string }; textAnchor?: string }
            let { x = 0, y = 0, payload, textAnchor } = p
            const centerX = size / 2
            const centerY = size / 2
            const dx = x - centerX
            const dy = y - centerY
            const push = 1.22
            x = centerX + dx * push
            y = centerY + dy * push
            return (
              <g transform={`translate(${x}, ${y})`}>
                <text
                  textAnchor={textAnchor || 'middle'}
                  fill={textColor}
                  fontSize={10}
                  style={{ overflow: 'visible' }}
                >
                  {payload?.value ?? ''}
                </text>
              </g>
            )
          }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: textColor, fontSize: 10 }}
          tickCount={5}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke={strokeColor}
          fill={strokeColor}
          fillOpacity={0.25}
          strokeWidth={2}
          animationBegin={0}
          animationDuration={800}
          animationEasing="ease-out"
        />
        <Tooltip
          contentStyle={{
            background: theme.contentCardBg,
            border: `1px solid ${theme.border}`,
            borderRadius: theme.radius,
            fontSize: 13,
          }}
          labelStyle={{ color: theme.textPrimary }}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
    </div>
  )
}
