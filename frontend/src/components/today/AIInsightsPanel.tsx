/**
 * Right-side AI intelligence panel: what I understood, extracted signals, suggested updates.
 * Collapsible on tablet/mobile.
 */
import { useState } from 'react'
import { Typography } from 'antd'
import { ThunderboltOutlined, DownOutlined, UpOutlined } from '@ant-design/icons'
import { useTheme } from '../../hooks/useTheme'
import type { SuggestedDomainUpdate, ExtractedSignal } from '../../services/journal'
import { ExtractedSignalsList } from './ExtractedSignalsList'
import { SuggestedUpdatesCard } from './SuggestedUpdatesCard'
import { DailySummaryCard } from './DailySummaryCard'

const { Text } = Typography

interface AIInsightsPanelProps {
  suggestedUpdates: SuggestedDomainUpdate[]
  extractedSignals: ExtractedSignal[]
  streakDays: number
  hasEntry: boolean
  wordCount?: number
  onConfirmSuggestion: (id: string) => void
  onRejectSuggestion: (id: string) => void
  isConfirming?: boolean
  collapsible?: boolean
  defaultOpen?: boolean
  sticky?: boolean
}

export function AIInsightsPanel({
  suggestedUpdates,
  extractedSignals,
  streakDays,
  hasEntry,
  wordCount,
  onConfirmSuggestion,
  onRejectSuggestion,
  isConfirming,
  collapsible,
  defaultOpen = true,
  sticky = false,
}: AIInsightsPanelProps) {
  const theme = useTheme()
  const [open, setOpen] = useState(defaultOpen)
  const hasSuggestions = suggestedUpdates.length > 0
  const hasSignals = extractedSignals.length > 0

  const content = (
    <>
      {!hasSuggestions && !hasSignals ? (
        <Text
          style={{
            display: 'block',
            fontSize: 14,
            color: theme.textMuted,
            lineHeight: 1.6,
          }}
        >
          When you are ready, AI can gently organize what you wrote into patterns, signals, and possible updates.
        </Text>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <DailySummaryCard streakDays={streakDays} hasEntry={hasEntry} wordCount={wordCount} />
          {hasSignals && <ExtractedSignalsList signals={extractedSignals} />}
          {hasSuggestions && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: theme.textMuted,
                  fontWeight: 600,
                }}
              >
                Possible updates
              </p>
              {suggestedUpdates.map((s) => (
                <SuggestedUpdatesCard
                  key={s.id}
                  suggestion={s}
                  onConfirm={onConfirmSuggestion}
                  onReject={onRejectSuggestion}
                  isConfirming={isConfirming}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )

  const header = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <ThunderboltOutlined style={{ fontSize: 18, color: theme.accent }} />
      <span style={{ fontWeight: 600, fontSize: 15, color: theme.textPrimary }}>Reflections from your entry</span>
    </div>
  )

  if (collapsible) {
    return (
      <div
        style={{
          borderRadius: 20,
          border: `1px solid ${theme.contentCardBorder}`,
          background: theme.contentCardBg,
          boxShadow: theme.shadowMd,
          overflow: 'hidden',
          position: sticky ? 'sticky' : 'static',
          top: sticky ? 24 : undefined,
        }}
      >
        <button
          type="button"
          onClick={() => setOpen(!open)}
          style={{
            width: '100%',
            padding: '18px 22px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: theme.textPrimary,
          }}
        >
          {header}
          {open ? <UpOutlined style={{ color: theme.textMuted }} /> : <DownOutlined style={{ color: theme.textMuted }} />}
        </button>
        {open && (
          <div style={{ padding: '0 22px 22px' }}>
            {content}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      style={{
        borderRadius: 20,
        border: `1px solid ${theme.contentCardBorder}`,
        background: theme.contentCardBg,
        boxShadow: theme.shadowMd,
        overflow: 'hidden',
        position: 'sticky',
        top: 24,
      }}
    >
      <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${theme.contentCardBorder}` }}>
        {header}
      </div>
      <div style={{ padding: 24 }}>{content}</div>
    </div>
  )
}
