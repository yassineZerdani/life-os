/**
 * Health Body Map — interactive anatomy explorer.
 * Center canvas replaced with "Coming soon" until we have a proper anatomy asset.
 */
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Spin, Typography } from 'antd'
import { bodyIntelligenceService, type Organ } from '../../../services/bodyIntelligence'
import { useTheme } from '../../../hooks/useTheme'
import { useBreakpoint } from '../../../hooks/useBreakpoint'
import type { BodyViewMode } from './constants'
import { HealthSystemsSidebar } from './HealthSystemsSidebar'
import { OverallBodyHealthCard } from './OverallBodyHealthCard'
import { SelectedOrganPanel } from './SelectedOrganPanel'

const { Title, Text } = Typography

export function HealthBodyMapPage() {
  const theme = useTheme()
  const screens = useBreakpoint()
  const isSmall = !screens.md
  const [selectedOrganSlug, setSelectedOrganSlug] = useState<string | null>(null)

  const { data: organs = [], isLoading: organsLoading } = useQuery({
    queryKey: ['body-intelligence', 'organs-map'],
    queryFn: () => bodyIntelligenceService.listOrgansForMap(),
  })

  const { data: systems = [] } = useQuery({
    queryKey: ['body-intelligence', 'systems'],
    queryFn: () => bodyIntelligenceService.listBodySystems(),
  })

  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['body-intelligence', 'organ-dashboard', selectedOrganSlug],
    queryFn: () => bodyIntelligenceService.getOrganDashboardBySlug(selectedOrganSlug!),
    enabled: !!selectedOrganSlug,
  })

  const organByRegionId = useMemo(() => {
    const map: Record<string, Organ & { health_score?: number }> = {}
    organs.forEach((o) => {
      if (o.map_region_id) {
        const dash = dashboard?.organ?.slug === o.slug ? dashboard : null
        map[o.map_region_id] = {
          ...o,
          health_score: dash?.health_score?.score,
        }
      }
    })
    return map
  }, [organs, dashboard])

  const organsBySystem = useMemo(() => {
    const map: Record<string, Organ[]> = {}
    systems.forEach((s) => {
      map[s.id] = organs.filter((o) => o.system_id === s.id)
    })
    return map
  }, [systems, organs])

  const handleSelectRegion = (regionId: string) => {
    const organ = organs.find((o) => o.map_region_id === regionId)
    if (organ) setSelectedOrganSlug(organ.slug)
  }

  const handleSelectOrganFromSidebar = (organ: Organ) => {
    setSelectedOrganSlug(organ.slug)
  }

  const selectedRegionId = useMemo(() => {
    if (!selectedOrganSlug) return null
    const organ = organs.find((o) => o.slug === selectedOrganSlug)
    return organ?.map_region_id ?? null
  }, [selectedOrganSlug, organs])

  const { overallScore, stressedSystems, strongSystems } = useMemo(() => ({
    overallScore: null as number | null,
    stressedSystems: [] as string[],
    strongSystems: systems.slice(0, 5).map((s) => s.name),
  }), [systems])

  if (organsLoading) {
    return <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />
  }

  return (
    <div
      style={{
        minHeight: '100%',
        background: theme.contentBg,
        padding: isSmall ? 16 : 24,
      }}
    >
      <style>{`
        @media (max-width: 1200px) {
          .health-body-map-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 768px) {
          .health-body-map-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div style={{ marginBottom: isSmall ? 16 : 24 }}>
        <Title level={2} className="app-page-title" style={{ marginBottom: 4, fontWeight: 600 }}>
          Health Body Map
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Interactive anatomy explorer — select an organ to see support needs and metrics.
        </Text>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px minmax(480px, 2fr) 340px',
          gap: 24,
          alignItems: 'start',
        }}
        className="health-body-map-grid"
      >
        {/* Left: systems list, search, health legend (info icon) */}
        <div
          style={{
            position: 'sticky',
            top: 24,
            padding: 20,
            borderRadius: 16,
            background: theme.contentCardBg,
            border: `1px solid ${theme.contentCardBorder}`,
            boxShadow: theme.shadowMd,
          }}
        >
        <HealthSystemsSidebar
          systems={systems}
          organsBySystem={organsBySystem}
          onSelectOrgan={handleSelectOrganFromSidebar}
          selectedOrganSlug={selectedOrganSlug}
        />
        </div>

        {/* Center: coming soon — proper anatomy asset TBD */}
        <div
          style={{
            padding: 48,
            borderRadius: 16,
            background: theme.contentCardBg,
            border: `1px solid ${theme.contentCardBorder}`,
            boxShadow: theme.shadowMd,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 480,
            color: theme.textMuted,
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: 320 }}>
            <Title level={4} style={{ marginBottom: 8, fontWeight: 500, color: theme.textSecondary }}>
              Body map
            </Title>
            <Text style={{ fontSize: 15 }}>
              Coming soon. We’re working on a proper anatomy view — in the meantime use the list to the left and select an organ for details.
            </Text>
          </div>
        </div>

        {/* Right: selected organ panel or overall health card */}
        <div
          style={{
            position: 'sticky',
            top: 24,
            padding: 24,
            borderRadius: 16,
            background: theme.contentCardBg,
            border: `1px solid ${theme.contentCardBorder}`,
            boxShadow: theme.shadowMd,
            minHeight: 400,
          }}
        >
          {selectedOrganSlug ? (
            dashboardLoading ? (
              <Spin tip="Loading organ details..." />
            ) : dashboard ? (
              <SelectedOrganPanel dashboard={dashboard} />
            ) : (
              <Text type="secondary">Select an organ on the body or from the list.</Text>
            )
          ) : (
            <OverallBodyHealthCard
              overallScore={overallScore}
              systems={systems}
              stressedSystems={stressedSystems}
              strongSystems={strongSystems}
            />
          )}
        </div>
      </div>
    </div>
  )
}
