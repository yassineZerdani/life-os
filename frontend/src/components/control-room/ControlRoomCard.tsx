import { useTheme } from '../../hooks/useTheme'

interface ControlRoomCardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  /** Optional gradient overlay for hero-style cards */
  gradient?: boolean
}

export function ControlRoomCard({ children, className, style, gradient }: ControlRoomCardProps) {
  const theme = useTheme()
  return (
    <div
      className={className}
      style={{
        background: theme.crCardBg,
        border: `1px solid ${theme.contentCardBorder}`,
        borderRadius: theme.crRadius,
        boxShadow: theme.crShadow,
        padding: theme.crCardPadding,
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ...(gradient
          ? {
              background: `linear-gradient(135deg, ${theme.crCardBg} 0%, ${theme.hoverBg} 100%)`,
            }
          : {}),
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = theme.crShadowHover
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = theme.crShadow
      }}
    >
      {children}
    </div>
  )
}
