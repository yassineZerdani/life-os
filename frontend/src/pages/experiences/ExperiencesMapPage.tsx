/**
 * Life map — experiences by location with filters.
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { lifeMemoryService } from '../../services/lifeMemory'
import { useTheme } from '../../hooks/useTheme'
import { LifeMap } from '../../components/experiences'

const { Title, Text } = Typography

export function ExperiencesMapPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const [emotionalTone, setEmotionalTone] = useState<string | undefined>()
  const [category, setCategory] = useState<string | undefined>()

  const { data: points, isLoading } = useQuery({
    queryKey: ['life-memory', 'map', emotionalTone, category],
    queryFn: () =>
      lifeMemoryService.getMap({
        emotional_tone: emotionalTone,
        category,
      }),
  })

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
          Life map
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Experiences by location — filter by tone, category, or time
        </Text>
      </div>

      <LifeMap
        points={points ?? []}
        emotionalTone={emotionalTone}
        category={category}
        onFilterChange={({ emotional_tone, category: cat }) => {
          setEmotionalTone(emotional_tone)
          setCategory(cat)
        }}
        loading={isLoading}
      />
    </div>
  )
}
