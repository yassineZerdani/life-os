# Life OS — UI/UX Architecture

A premium command center for personal life management. The UI should feel like a high-end SaaS dashboard combined with a futuristic control room.

---

## Design Principles

- **Clarity** — Information is immediately understandable
- **Visual hierarchy** — Most important data surfaces first
- **Information density** — Rich data without clutter
- **Modularity** — Reusable, composable components
- **Scalability** — Layout and components scale across pages
- **Consistency** — Unified patterns across the app

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React + TypeScript |
| Build | Vite |
| UI Library | Ant Design |
| Data | React Query |
| State | Zustand |
| Charts | Recharts or ECharts |
| Graph | React Flow |

---

## Global Layout

```
AppLayout
├── Sidebar (collapsible)
├── TopBar
└── MainContent (grid-capable)
```

### AppLayout
- Full viewport height
- Sidebar + TopBar + MainContent structure
- MainContent supports responsive grid dashboards

### Sidebar
- Collapsible to icon-only mode
- Fixed width when expanded (~220px)
- Dark theme (#0f172a base)
- Section headers for grouping

### TopBar
- Full width, fixed height (~56px)
- Contains: search, quick add, notifications, profile
- Sticky on scroll

### MainContent
- Flexible, scrollable area
- 24px padding
- 8px grid system for internal layouts

---

## Sidebar Navigation Structure

### Primary
| Item | Path | Icon |
|------|------|------|
| Control Room | /control-room | RocketOutlined |
| Timeline | /timeline | HistoryOutlined |
| Analytics | /analytics | BarChartOutlined |

### Life Domains
| Item | Path | Icon |
|------|------|------|
| Health | /health | HeartOutlined |
| Wealth | /wealth | DollarOutlined |
| Skills | /skills | BookOutlined |
| Network | /network | TeamOutlined |
| Career | /career | TrophyOutlined |
| Relationships | /relationships | UserOutlined |
| Experiences | /experiences | CompassOutlined |
| Identity | /identity | SmileOutlined |

### Strategy
| Item | Path | Icon |
|------|------|------|
| Simulation | /simulation | ExperimentOutlined |
| Recommendations | /recommendations | AimOutlined |

### Gamification
| Item | Path | Icon |
|------|------|------|
| Quests | /quests | FlagOutlined |
| Achievements | /achievements | CrownOutlined |

### Knowledge
| Item | Path | Icon |
|------|------|------|
| Life Graph | /life-graph | ApartmentOutlined |

### Tools
| Item | Path | Icon |
|------|------|------|
| Time Tracking | /time-tracking | ClockCircleOutlined |
| Metrics | /metrics | LineChartOutlined |
| Goals | /goals | FlagOutlined |
| Insights | /insights | BulbOutlined |

### System
| Item | Path | Icon |
|------|------|------|
| Settings | /settings | SettingOutlined |

---

## Top Navbar

### Components
1. **Global Search** — Quick search across entities (Ctrl+K)
2. **Quick Add** — Dropdown for fast creation
3. **Notifications** — Alert badge + dropdown
4. **Profile Menu** — Avatar + dropdown

### Quick Add Options
- Time Block
- Experience
- Metric
- Relationship
- Goal
- Life Event

---

## Control Room Dashboard

**Goal:** User understands entire life state in under 10 seconds.

### Layout (Responsive Grid)
```
┌─────────────────────────────────────────────────────────┐
│ Hero Row (full width)                                    │
├─────────────────────────────┬────────────────────────────┤
│ Domain Command Cards (8)    │ Alerts Panel               │
├─────────────────────────────┼────────────────────────────┤
│ Recommended Actions        │ Weekly Balance              │
├─────────────────────────────┼────────────────────────────┤
│ Insights Panel             │ Future Forecast             │
├─────────────────────────────┼────────────────────────────┤
│ Life Timeline              │ Quests & Achievements        │
├─────────────────────────────┴────────────────────────────┤
│ Life Graph Preview (full width)                          │
└─────────────────────────────────────────────────────────┘
```

### Hero Card
- Life score (circular progress)
- Total level
- Total XP
- Monthly trend (↑/↓)
- Status message (e.g., "Your life is improving, but relationships need attention.")

### Domain Command Cards
Per domain: Health, Wealth, Skills, Network, Career, Relationships, Experiences, Identity
- Domain score (0–100)
- Level badge
- XP progress bar
- Weekly trend
- Last activity date
- Risk label: strong | stable | neglected | declining

### Alerts Panel
- Urgent warnings with severity (high/medium/low)
- Examples: "No health activity in 6 days", "Career took 70% of weekly time"

### Recommended Actions Panel
- Action title, domain, estimated impact, reason, estimated time
- From Life Decision Engine

### Weekly Balance Panel
- Domain time pie chart
- Weekly stacked bar chart
- Balance score

### Insights Panel
- Type, severity, domain, message
- Examples: "Health dropped this week", "Skills XP +32%"

### Future Forecast Panel
- 6-month projection
- Domain score changes (e.g., Health 68 → 79)
- Line charts optional

### Life Timeline Panel
- XP events, achievements, experiences, goals, notes
- Scrollable feed

### Quests & Achievements Panel
- Active quests with progress (e.g., 2/3 workouts)
- Recent achievements

### Life Graph Preview
- Mini node preview
- "Open full Life Graph" button

---

## Domain Pages

Consistent layout per domain (e.g., Health):

1. **Score Overview** — Life score, level, XP
2. **Metrics** — Domain-specific metrics
3. **Activities** — Time blocks, XP events
4. **Goals** — Domain goals
5. **History** — Recent activity

---

## Timeline Page

- Full chronological life history
- Filters: event type, domain, date range

---

## Analytics Page

- Time Heatmap
- Domain Score Trends
- XP Growth Charts
- Life Balance Charts

---

## Simulation Page

- Months ahead slider
- Scenario controls: extra workouts, learning hours, networking events
- Projected score charts

---

## Quests Page

- Daily quests
- Weekly quests
- Completed quests
- Progress bars

---

## Achievements Page

- Achievement grid
- Categories: Health, Skills, Wealth, Relationships
- Unlocked = highlighted

---

## Life Graph Page

- React Flow interactive graph
- Nodes: people, skills, experiences, projects, goals
- Edges: relationships

---

## Design System

### Base Components
| Component | Purpose |
|-----------|---------|
| Card | Container with optional title |
| Badge | Status/tag indicator |
| ProgressBar | Progress visualization |
| MetricTile | Single metric display |
| ChartCard | Chart wrapper |
| InsightCard | Insight with type/severity |
| RecommendationCard | Action recommendation |

### Spacing
- 8px grid system
- Base unit: 8px
- Common: 8, 16, 24, 32, 48

### Domain Colors
| Domain | Hex |
|--------|-----|
| Health | #22c55e |
| Wealth | #eab308 |
| Skills | #6366f1 |
| Network | #8b5cf6 |
| Career | #f97316 |
| Relationships | #ec4899 |
| Experiences | #06b6d4 |
| Identity | #64748b |

### Visual Style
- Modern, premium, data-dense
- Futuristic but minimal
- Dark mode support
- Soft shadows, card separation

---

## Component Structure

```
src/
├── components/
│   ├── layout/          # AppLayout, Sidebar, TopBar
│   ├── dashboard/       # Control room components
│   ├── domains/         # Domain-specific components
│   ├── analytics/       # Charts, heatmaps
│   ├── timeline/        # Timeline components
│   ├── graph/           # React Flow, graph preview
│   ├── quests/          # Quest components
│   ├── achievements/    # Achievement components
│   └── shared/          # Card, Badge, ProgressBar, etc.
├── pages/
│   ├── ControlRoomPage
│   ├── DomainPage
│   ├── TimelinePage
│   ├── AnalyticsPage
│   ├── SimulationPage
│   ├── QuestsPage
│   ├── AchievementsPage
│   ├── LifeGraphPage
│   └── SettingsPage
├── hooks/
├── services/
├── store/
└── types/
```

---

## Success Criteria

1. **10-second rule** — Control Room conveys full life state at a glance
2. **Consistency** — Same patterns across all pages
3. **Modularity** — Components reusable and composable
4. **Scalability** — Easy to add new domains/features
5. **Premium feel** — High-end, polished, professional
