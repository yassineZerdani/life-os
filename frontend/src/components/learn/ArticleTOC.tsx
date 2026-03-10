import { useTheme } from '../../hooks/useTheme'

export interface TocItem {
  id: string
  text: string
  level: number
}

interface ArticleTOCProps {
  items: TocItem[]
  activeId?: string
}

export function ArticleTOC({ items, activeId }: ArticleTOCProps) {
  const theme = useTheme()
  if (items.length === 0) return null
  return (
    <nav className="learn-toc" aria-label="Table of contents">
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: theme.textMuted, marginBottom: 12 }}>
        On this page
      </div>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={`${item.level === 3 ? 'toc-h3' : 'toc-h2'}${item.id === activeId ? ' active' : ''}`}
          style={{ marginLeft: item.level === 3 ? 12 : 0 }}
          onClick={(e) => {
            e.preventDefault()
            document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          {item.text}
        </a>
      ))}
    </nav>
  )
}

/** Extract heading slugs and text from markdown for TOC */
export function extractTocFromMarkdown(markdown: string): TocItem[] {
  const items: TocItem[] = []
  const lines = markdown.split('\n')
  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)$/)
    const h3 = line.match(/^###\s+(.+)$/)
    if (h2) {
      const text = h2[1].replace(/#+$/, '').trim()
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      items.push({ id: id || 'section', text, level: 2 })
    } else if (h3) {
      const text = h3[1].replace(/#+$/, '').trim()
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      items.push({ id: id || 'section', text, level: 3 })
    }
  }
  return items
}
