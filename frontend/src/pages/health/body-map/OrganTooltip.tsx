/**
 * Tooltip shown on hover over an organ. Labels only on hover or selection.
 */
interface OrganTooltipProps {
  x: number
  y: number
  label: string
  visible: boolean
  theme: { contentCardBg: string; contentCardBorder: string; shadowMd: string; textPrimary: string }
}

export function OrganTooltip({ x, y, label, visible, theme }: OrganTooltipProps) {
  if (!visible || !label) return null
  return (
    <div
      style={{
        position: 'absolute',
        left: x + 14,
        top: y + 10,
        padding: '6px 12px',
        borderRadius: 8,
        background: theme.contentCardBg,
        border: `1px solid ${theme.contentCardBorder}`,
        boxShadow: theme.shadowMd,
        pointerEvents: 'none',
        fontSize: 13,
        fontWeight: 500,
        color: theme.textPrimary,
        zIndex: 20,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
  )
}
