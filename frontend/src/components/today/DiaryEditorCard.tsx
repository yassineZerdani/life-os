/**
 * Main writing card: title, helper text, large textarea, placeholder, autosave, status.
 */
import { Input } from 'antd'
import { useTheme } from '../../hooks/useTheme'
import { useAutosave } from '../../hooks/useAutosave'

const { TextArea } = Input

const PLACEHOLDER = `How was your day?

Start anywhere.`

interface DiaryEditorCardProps {
  value: string
  onChange: (value: string) => void
  onSave: (payload: { raw_text: string }) => void
  isSaving?: boolean
  lastSavedAt?: Date | null
  onAnalyze?: () => void
  isAnalyzing?: boolean
  readOnly?: boolean
}

export function DiaryEditorCard({
  value,
  onChange,
  onSave,
  isSaving,
  lastSavedAt,
  onAnalyze,
  isAnalyzing,
  readOnly = false,
}: DiaryEditorCardProps) {
  const theme = useTheme()

  useAutosave({
    value,
    onSave: (v) => onSave({ raw_text: v }),
    delayMs: 2200,
    enabled: !readOnly,
  })

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0
  const isEmpty = !value.trim()

  return (
    <div
      className="diary-editor-card"
      style={{
        borderRadius: 20,
        border: `1px solid ${theme.contentCardBorder}`,
        background: theme.contentCardBg,
        boxShadow: 'none',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
    >
      <style>{`
        .diary-editor-card:hover { box-shadow: 0 6px 18px rgba(0,0,0,0.04); }
        .diary-editor-card .diary-textarea { font-size: 18px !important; line-height: 1.9 !important; }
        .diary-editor-card .diary-textarea::placeholder { opacity: 0.6; }
        .diary-editor-card .ant-input { border: none !important; box-shadow: none !important; }
        .diary-editor-card .ant-input:focus { box-shadow: none !important; }
      `}</style>

      <div style={{ padding: '28px 32px 24px' }}>
        <TextArea
          className="diary-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={PLACEHOLDER}
          readOnly={readOnly}
          autoSize={{ minRows: 14, maxRows: 80 }}
          style={{
            resize: 'none',
            padding: 0,
            background: 'transparent',
            minHeight: 380,
          }}
          styles={{
            textarea: {
              background: 'transparent',
              minHeight: 380,
              padding: 0,
            },
          }}
        />

        <div
          style={{
            marginTop: 20,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 16,
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {wordCount > 0 && (
              <span style={{ fontSize: 12, color: theme.textMuted }}>
                {wordCount} word{wordCount !== 1 ? 's' : ''}
              </span>
            )}
            {!readOnly && isSaving && (
              <span style={{ fontSize: 12, color: theme.textMuted }}>Autosaving…</span>
            )}
            {!readOnly && lastSavedAt && !isSaving && (
              <span style={{ fontSize: 12, color: theme.textMuted }}>
                Saved quietly
              </span>
            )}
            {!readOnly && !isSaving && !lastSavedAt && (
              <span style={{ fontSize: 12, color: theme.textMuted }}>Private and autosaved</span>
            )}
            {readOnly && (
              <span style={{ fontSize: 12, color: theme.textMuted }}>Read-only</span>
            )}
          </div>
          {onAnalyze && !readOnly && (
            <button
              type="button"
              onClick={onAnalyze}
              disabled={isAnalyzing || isEmpty}
              style={{
                padding: '8px 0',
                borderRadius: 12,
                border: 'none',
                background: 'transparent',
                color: isEmpty ? theme.textMuted : theme.accent,
                fontSize: 14,
                fontWeight: 600,
                cursor: isEmpty ? 'not-allowed' : 'pointer',
                opacity: isAnalyzing ? 0.8 : 1,
              }}
            >
              {isAnalyzing ? 'Reflecting…' : 'Reflect with AI'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
