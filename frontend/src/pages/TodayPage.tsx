/**
 * Today / Diary — premium journaling + intelligence.
 * Responsive: desktop 2-column (writing + AI panel), tablet/mobile single column with collapsible panel.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTheme } from '../hooks/useTheme'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { journalService } from '../services/journal'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import {
  TodayHeader,
  DiaryEditorCard,
  JournalHistorySidebar,
  QuickCheckinSection,
  AIInsightsPanel,
} from '../components/today'

export function TodayPage() {
  const theme = useTheme()
  const screens = useBreakpoint()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const todayDate = dayjs().format('YYYY-MM-DD')

  const [draftText, setDraftText] = useState('')
  const [draftMood, setDraftMood] = useState<string | undefined>()
  const [draftEnergy, setDraftEnergy] = useState<string | undefined>()
  const [selectedDate, setSelectedDate] = useState(todayDate)
  const [filterMonth, setFilterMonth] = useState<string | null>(null)

  const isDesktop = screens.xl === true
  const isTablet = screens.md === true && screens.xl !== true
  const isMobile = !screens.md

  const { data: today, isLoading } = useQuery({
    queryKey: ['journal', 'today'],
    queryFn: () => journalService.getToday(),
  })

  const listParams = filterMonth
    ? {
        limit: 31,
        from_date: `${filterMonth}-01`,
        to_date: dayjs(`${filterMonth}-01`).endOf('month').format('YYYY-MM-DD'),
      }
    : { limit: 20 }
  const { data: recentEntries = [] } = useQuery({
    queryKey: ['journal', 'recent-entries', listParams],
    queryFn: () => journalService.listRecentEntries(listParams),
  })

  const { data: selectedEntry } = useQuery({
    queryKey: ['journal', 'entry-by-date', selectedDate],
    queryFn: () => journalService.getEntryByDate(selectedDate),
    enabled: selectedDate !== todayDate,
  })

  useEffect(() => {
    const entry = selectedDate === todayDate ? today?.entry : selectedEntry
    if (entry) {
      setDraftText(entry.raw_text ?? '')
      setDraftMood(entry.mood ?? undefined)
      setDraftEnergy(entry.energy ?? undefined)
    }
  }, [today?.entry, selectedEntry, selectedDate, todayDate])

  const updateMutation = useMutation({
    mutationFn: (data: { raw_text?: string; mood?: string; energy?: string }) =>
      journalService.updateToday(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journal'] }),
  })

  const analyzeMutation = useMutation({
    mutationFn: () => journalService.analyzeToday(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journal'] }),
  })

  const confirmMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'confirmed' | 'rejected' }) =>
      journalService.confirmSuggestion(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journal'] }),
  })

  const handleSave = (payload: { raw_text: string }) => {
    updateMutation.mutate({ raw_text: payload.raw_text })
  }

  const handleAnalyze = () => {
    updateMutation.mutate(
      { raw_text: draftText, mood: draftMood, energy: draftEnergy },
      { onSuccess: () => analyzeMutation.mutate() },
    )
  }

  const handleMoodChange = (v: string | undefined) => {
    setDraftMood(v)
    updateMutation.mutate({ mood: v })
  }

  const handleEnergyChange = (v: string | undefined) => {
    setDraftEnergy(v)
    updateMutation.mutate({ energy: v })
  }

  const wordCount = draftText.trim() ? draftText.trim().split(/\s+/).length : 0
  const isViewingToday = selectedDate === todayDate

  if (isLoading || !today) {
    return (
      <div
        className="today-page-loading"
        style={{
          padding: 48,
          textAlign: 'center',
          color: theme.textMuted,
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              border: `2px solid ${theme.contentCardBorder}`,
              borderTopColor: theme.accent,
              animation: 'today-spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ margin: 0, fontSize: 15 }}>Loading your day...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="today-page"
      style={{
        minHeight: '100%',
        width: '100%',
        boxSizing: 'border-box',
        padding: isMobile ? 16 : isTablet ? 20 : 24,
        paddingBottom: 48,
        background: theme.contentBg,
      }}
    >
      <style>{`
        @keyframes today-spin { to { transform: rotate(360deg); } }
        .today-page {
          animation: today-fade 0.35s ease-out;
        }
        @keyframes today-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (max-width: 1279px) {
          .today-page-grid { grid-template-columns: 1fr !important; }
          .today-page-main { max-width: 100% !important; }
        }
        @media (min-width: 1280px) {
          .today-page-grid { grid-template-columns: 280px minmax(0, 1fr) !important; }
        }
      `}</style>

      <TodayHeader
        userName={user?.name}
        streakDays={today.streak_days ?? 0}
      />

      <div
        className="today-page-grid"
        style={{
          display: 'grid',
          gap: 24,
          alignItems: 'start',
          maxWidth: '100%',
          margin: 0,
          justifyContent: 'start',
        }}
      >
        <aside style={{ minWidth: 0 }}>
          <JournalHistorySidebar
            entries={recentEntries}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            filterMonth={filterMonth}
            onFilterMonthChange={setFilterMonth}
          />
        </aside>

        <div className="today-page-main" style={{ minWidth: 0 }}>
          <DiaryEditorCard
            value={draftText}
            onChange={setDraftText}
            onSave={handleSave}
            isSaving={updateMutation.isPending}
            onAnalyze={isViewingToday ? handleAnalyze : undefined}
            isAnalyzing={isViewingToday ? analyzeMutation.isPending : false}
            readOnly={!isViewingToday}
          />

          {isViewingToday && (
            <div style={{ marginTop: 24 }}>
              <QuickCheckinSection
                mood={draftMood}
                energy={draftEnergy}
                onMoodChange={handleMoodChange}
                onEnergyChange={handleEnergyChange}
              />
            </div>
          )}

          {isViewingToday && (
            <div style={{ marginTop: 32 }}>
              <AIInsightsPanel
                suggestedUpdates={today.suggested_updates ?? []}
                extractedSignals={today.extracted_signals ?? []}
                streakDays={today.streak_days ?? 0}
                hasEntry={!!today.entry?.raw_text}
                wordCount={wordCount}
                onConfirmSuggestion={(id) => confirmMutation.mutate({ id, status: 'confirmed' })}
                onRejectSuggestion={(id) => confirmMutation.mutate({ id, status: 'rejected' })}
                isConfirming={confirmMutation.isPending}
                collapsible
                defaultOpen={false}
                sticky={false}
              />
            </div>
          )}

          {!isViewingToday && (
            <div
              style={{
                marginTop: 24,
                borderRadius: 18,
                border: `1px solid ${theme.contentCardBorder}`,
                background: theme.contentCardBg,
                padding: 20,
              }}
            >
              <p style={{ margin: '0 0 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: theme.textMuted, fontWeight: 600 }}>
                Journal history
              </p>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: theme.textMuted }}>
                You are viewing an older entry. Return to today to write, check in, or use AI reflections.
              </p>
              <button
                type="button"
                onClick={() => setSelectedDate(todayDate)}
                style={{
                  marginTop: 14,
                  padding: '8px 0',
                  border: 'none',
                  background: 'transparent',
                  color: theme.accent,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Back to today
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
