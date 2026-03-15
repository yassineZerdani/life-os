/**
 * Left sidebar: search, health legend (info hover), collapsible organ list.
 */
import { useState } from 'react'
import { Input, Collapse, Tooltip, Typography } from 'antd'
import { SearchOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useTheme } from '../../../hooks/useTheme'
import type { BodySystem, Organ } from '../../../services/bodyIntelligence'
import { getHealthColor, HEALTH_COLORS } from './constants'

const { Text } = Typography

const HEALTH_LEGEND_ITEMS = [
  { label: 'Healthy', color: HEALTH_COLORS.healthy },
  { label: 'Moderate', color: HEALTH_COLORS.moderate },
  { label: 'Needs attention', color: HEALTH_COLORS.needsAttention },
  { label: 'Stressed', color: HEALTH_COLORS.stressed },
]

interface BodySystemsSidebarProps {
  systems: BodySystem[]
  organsBySystem: Record<string, Organ[]>
  onSelectOrgan: (organ: Organ) => void
  selectedOrganSlug: string | null
}

export function BodySystemsSidebar({
  systems,
  organsBySystem,
  onSelectOrgan,
  selectedOrganSlug,
}: BodySystemsSidebarProps) {
  const theme = useTheme()
  const [search, setSearch] = useState('')

  const filteredSystems = systems.filter((s) => {
    const organs = organsBySystem[s.id] || []
    const matchSystem = s.name.toLowerCase().includes(search.toLowerCase())
    const matchOrgan = organs.some((o) =>
      o.name.toLowerCase().includes(search.toLowerCase())
    )
    return matchSystem || matchOrgan
  })

  const legendContent = (
    <div style={{ padding: 4 }}>
      <Text strong style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 8 }}>
        Health legend
      </Text>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {HEALTH_LEGEND_ITEMS.map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}40` }} />
            <span style={{ fontSize: 12, color: '#fff' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Input
          placeholder="Search organ or system"
          prefix={<SearchOutlined style={{ color: theme.textMuted }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ borderRadius: 10, flex: 1 }}
        />
        <Tooltip title={legendContent} placement="left" color="#1e293b">
          <span style={{ cursor: 'pointer', color: theme.textMuted, display: 'flex', alignItems: 'center' }}>
            <InfoCircleOutlined style={{ fontSize: 18 }} />
          </span>
        </Tooltip>
      </div>

      <div>
        <Text strong style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.textMuted }}>
          Organs by system
        </Text>
        <Collapse
          ghost
          style={{ marginTop: 8, background: 'transparent' }}
          items={filteredSystems.map((sys) => {
            const organs = (organsBySystem[sys.id] || []).filter((o) =>
              !search || o.name.toLowerCase().includes(search.toLowerCase()) || sys.name.toLowerCase().includes(search.toLowerCase())
            )
            return {
              key: sys.id,
              label: sys.name,
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {organs.map((organ) => {
                    const isSelected = organ.slug === selectedOrganSlug
                    const score = (organ as Organ & { health_score?: number })?.health_score
                    const color = getHealthColor(score)
                    return (
                      <button
                        key={organ.id}
                        type="button"
                        onClick={() => onSelectOrgan(organ)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 10px',
                          borderRadius: 8,
                          border: 'none',
                          background: isSelected ? theme.selectedBg : 'transparent',
                          color: theme.textPrimary,
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                          fontSize: 13,
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: color,
                            flexShrink: 0,
                          }}
                        />
                        {organ.name}
                      </button>
                    )
                  })}
                </div>
              ),
            }
          })}
        />
      </div>
    </div>
  )
}
