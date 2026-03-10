import { Card, Typography } from 'antd'
import { SettingOutlined } from '@ant-design/icons'

const { Title } = Typography

export function SettingsPage() {
  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <SettingOutlined style={{ fontSize: 24, color: '#6366f1' }} />
        <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
          Settings
        </Title>
      </div>
      <Card
        title="General"
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <p style={{ color: '#64748b' }}>Settings coming soon.</p>
      </Card>
    </div>
  )
}
