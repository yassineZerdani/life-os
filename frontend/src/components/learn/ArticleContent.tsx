import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import { useTheme } from '../../hooks/useTheme'
import type { Components } from 'react-markdown'

const CALLOUT_PREFIXES: Record<string, string> = {
  'strategy callout': 'learn-callout-strategy',
  'strategy': 'learn-callout-strategy',
  'example': 'learn-callout-example',
  'example box': 'learn-callout-example',
  'warning': 'learn-callout-warning',
  'warning box': 'learn-callout-warning',
  'evidence': 'learn-callout-evidence',
  'evidence box': 'learn-callout-evidence',
  'quote': 'learn-callout-quote',
}

function getCalloutClass(children: React.ReactNode): string | null {
  const text = typeof children === 'string' ? children : ''
  const firstLine = text.split('\n')[0]?.toLowerCase().trim() ?? ''
  for (const [key, cls] of Object.entries(CALLOUT_PREFIXES)) {
    if (firstLine.startsWith(key)) return cls
  }
  return null
}

function Blockquote({ children, ...props }: React.ComponentPropsWithoutRef<'blockquote'>) {
  const content = Array.isArray(children) ? children : [children]
  const firstChild = content[0]
  let calloutClass: string | null = null
  if (firstChild && typeof firstChild === 'object' && 'props' in firstChild) {
    const nodeProps = firstChild as { props?: { children?: React.ReactNode } }
    calloutClass = getCalloutClass(nodeProps.props?.children ?? '')
  }
  return (
    <blockquote
      className={calloutClass ? `learn-callout ${calloutClass}` : undefined}
      {...props}
    >
      {children}
    </blockquote>
  )
}

interface ArticleContentProps {
  content: string
  className?: string
  slugify?: (text: string) => string
}

export function ArticleContent({ content, className = '', slugify: slugifyFn = (t) => t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'section' }: ArticleContentProps) {
  const theme = useTheme()
  const components: Components = useMemo(() => ({
    blockquote: Blockquote,
    h1: ({ children, ...p }) => <h1 className="learn-h1" style={{ color: theme.textPrimary }} {...p}>{children}</h1>,
    h2: ({ children, ...p }) => {
      const text = typeof children === 'string' ? children : (Array.isArray(children) ? children.join('') : '')
      const id = slugifyFn(String(text).replace(/#+$/, '').trim())
      return <h2 id={id} className="learn-h2" style={{ color: theme.textPrimary, borderColor: theme.border }} {...p}>{children}</h2>
    },
    h3: ({ children, ...p }) => {
      const text = typeof children === 'string' ? children : (Array.isArray(children) ? children.join('') : '')
      const id = slugifyFn(String(text).replace(/#+$/, '').trim())
      return <h3 id={id} className="learn-h3" style={{ color: theme.textPrimary }} {...p}>{children}</h3>
    },
    p: ({ children, ...p }) => <p className="learn-body" style={{ color: theme.textSecondary }} {...p}>{children}</p>,
    li: ({ children, ...p }) => <li style={{ color: theme.textSecondary }} {...p}>{children}</li>,
    strong: ({ children, ...p }) => <strong style={{ color: theme.textPrimary }} {...p}>{children}</strong>,
    code: ({ className: c, children, ...p }) => (
      <code className={c} style={{ background: theme.hoverBg }} {...p}>{children}</code>
    ),
    pre: ({ children, ...p }) => (
      <pre style={{ background: theme.hoverBg, border: `1px solid ${theme.border}` }} {...p}>{children}</pre>
    ),
  }), [theme, slugifyFn])

  return (
    <div
      className={`learn-prose ${className}`}
      style={{ color: theme.textSecondary }}
    >
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  )
}
