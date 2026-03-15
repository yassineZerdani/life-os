/**
 * Health Body Map — human body by gender, organs with green liquid fill.
 * Heart beats, brain glows; click organs for dashboard.
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, Spin, Typography, List, Segmented, Tag } from 'antd'
import { bodyIntelligenceService, type Organ } from '../../services/bodyIntelligence'
import { useTheme } from '../../hooks/useTheme'

const { Title, Text } = Typography

// Green liquid gradient IDs (defined in SVG defs)
const LIQUID_GREEN = 'url(#liquidGreen)'
const LIQUID_GREEN_DARK = 'url(#liquidGreenDark)'

function getScoreColor(score: number | undefined): string {
  if (score == null) return '#22c55e'
  if (score >= 75) return '#22c55e'
  if (score >= 50) return '#84cc16'
  return '#15803d'
}

// Male: broader shoulders, straighter waist, square torso
const MALE_BODY_PATH =
  'M 100 30 C 66 30 44 50 44 76 C 44 92 52 102 64 108 L 64 118 L 42 118 L 38 172 L 38 222 L 54 222 L 54 400 L 78 400 L 78 280 L 78 222 L 100 222 L 122 222 L 122 280 L 122 400 L 146 400 L 146 222 L 162 222 L 162 172 L 158 118 L 136 118 L 136 108 C 148 102 156 92 156 76 C 156 50 134 30 100 30 Z'

// Female: narrower shoulders, defined waist, wider hips
const FEMALE_BODY_PATH =
  'M 100 30 C 70 30 50 50 50 76 C 50 92 58 102 70 108 L 70 118 L 54 118 L 50 165 L 48 200 L 48 230 L 58 260 L 58 400 L 82 400 L 82 268 L 82 230 L 100 230 L 118 230 L 118 268 L 118 400 L 142 400 L 142 230 L 142 260 L 152 230 L 152 200 L 150 165 L 146 118 L 130 118 L 130 108 C 142 102 150 92 150 76 C 150 50 130 30 100 30 Z'

const ORGAN_SPOTS: { id: string; x: number; y: number; label: string; r?: number }[] = [
  { id: 'brain', x: 100, y: 58, label: 'Brain', r: 14 },
  { id: 'heart', x: 100, y: 168, label: 'Heart', r: 10 },
  { id: 'lungs', x: 100, y: 142, label: 'Lungs', r: 12 },
  { id: 'liver', x: 100, y: 198, label: 'Liver', r: 11 },
  { id: 'stomach', x: 100, y: 218, label: 'Stomach', r: 10 },
  { id: 'intestines', x: 100, y: 268, label: 'Gut', r: 12 },
  { id: 'muscles', x: 100, y: 320, label: 'Muscles', r: 11 },
]

export function BodyMapPage() {
  const [bodyType, setBodyType] = useState<'male' | 'female'>('male')
  const navigate = useNavigate()
  const theme = useTheme()
  const { data: organs, isLoading, isError, error } = useQuery({
    queryKey: ['body-intelligence', 'organs-map'],
    queryFn: () => bodyIntelligenceService.listOrgansForMap(),
  })

  const organByRegion = (organs || []).reduce<Record<string, Organ>>((acc, o) => {
    if (o.map_region_id) acc[o.map_region_id] = o
    return acc
  }, {})

  const handleRegionClick = (regionId: string) => {
    const organ = organByRegion[regionId]
    if (organ) navigate(`/app/health/organ/${organ.slug}`)
  }

  if (isLoading) {
    return <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />
  }

  if (isError) {
    return (
      <Card style={{ maxWidth: 500, margin: '48px auto' }}>
        <Text type="danger">Could not load body map. {(error as Error)?.message || 'Please try again.'}</Text>
      </Card>
    )
  }

  const bodyPath = bodyType === 'male' ? MALE_BODY_PATH : FEMALE_BODY_PATH

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <style>{`
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.18); }
          30% { transform: scale(1); }
          45% { transform: scale(1.12); }
          60% { transform: scale(1); }
        }
        @keyframes brainGlow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(34, 197, 94, 0.8)); opacity: 1; }
          50% { filter: drop-shadow(0 0 12px rgba(34, 197, 94, 1)); opacity: 0.95; }
        }
        @keyframes liquidShine {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 0.95; }
        }
        .organ-heart { animation: heartBeat 1.1s ease-in-out infinite; transform-origin: center; }
        .organ-brain { animation: brainGlow 2s ease-in-out infinite; }
        .organ-liquid { animation: liquidShine 3s ease-in-out infinite; }
      `}</style>

      <Title level={2} style={{ marginBottom: 8 }}>
        Health Body Map
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Click an organ to open its dashboard. Organs show support level with green liquid fill.
      </Text>

      <Card
        style={{
          marginBottom: 24,
          background: theme.contentCardBg,
          border: `1px solid ${theme.contentCardBorder}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, gap: 16, alignItems: 'center' }}>
          <Text type="secondary">Body:</Text>
          <Segmented
            options={[
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
            ]}
            value={bodyType}
            onChange={(v) => setBodyType(v as 'male' | 'female')}
          />
        </div>

        <svg
          viewBox="0 0 200 420"
          width="100%"
          maxWidth={300}
          style={{ display: 'block', margin: '0 auto', cursor: 'pointer' }}
        >
          <defs>
            {/* Green liquid gradient — fill organs */}
            <linearGradient id="liquidGreen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#22c55e" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="liquidGreenDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#15803d" stopOpacity="0.9" />
            </linearGradient>
            {/* Glow for brain — animated blur */}
            <filter id="brainGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur">
                <animate attributeName="stdDeviation" values="1;4;1" dur="2s" repeatCount="indefinite" />
              </feGaussianBlur>
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Body silhouette — gender-specific */}
          <path
            fill={theme.contentCardBorder}
            fillOpacity={0.1}
            stroke={theme.textMuted}
            strokeWidth={1.5}
            strokeLinejoin="round"
            d={bodyPath}
          />

          {/* Organ regions — green liquid fill, heart beats, brain glows */}
          {ORGAN_SPOTS.map(({ id, x, y, label, r = 12 }) => {
            const organ = organByRegion[id]
            const score = (organ as Organ & { health_score?: number })?.health_score
            const fillColor = getScoreColor(score)
            const isHeart = id === 'heart'
            const isBrain = id === 'brain'
            const className = isHeart ? 'organ-heart' : isBrain ? 'organ-brain' : 'organ-liquid'

            return (
              <g
                key={id}
                onClick={() => handleRegionClick(id)}
                style={{ cursor: 'pointer' }}
                className={className}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={LIQUID_GREEN}
                  fillOpacity={0.88}
                  stroke={fillColor}
                  strokeWidth={2}
                  style={isBrain ? { filter: 'url(#brainGlow)' } : undefined}
                />
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fill={theme.textPrimary}
                  fontSize={8}
                  fontWeight={600}
                >
                  {organ?.name || label}
                </text>
              </g>
            )
          })}
        </svg>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Text type="secondary">Click any organ or choose from the list below. Heart beats, brain glows.</Text>
        </div>
      </Card>

      <Title level={4} style={{ marginBottom: 12 }}>
        All organs
      </Title>
      <List
        grid={{ gutter: 12, xs: 1, sm: 2, md: 2 }}
        dataSource={organs || []}
        renderItem={(organ) => (
          <List.Item>
            <Card
              size="small"
              hoverable
              onClick={() => navigate(`/app/health/organ/${organ.slug}`)}
              style={{
                cursor: 'pointer',
                borderLeft: `4px solid ${theme.accent}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <Text strong>{organ.name}</Text>
                  {organ.system && (
                    <Tag style={{ marginLeft: 8 }}>{organ.system.name}</Tag>
                  )}
                </div>
              </div>
              {organ.description && (
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                  {organ.description}
                </Text>
              )}
            </Card>
          </List.Item>
        )}
      />
    </div>
  )
}
