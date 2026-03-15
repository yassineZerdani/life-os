import { useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Form, Input, Select, Button, Card, Spin } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { profileService } from '../../services/profile'
import { useTheme } from '../../hooks/useTheme'
import {
  SettingsPageLayout,
  SettingsHeader,
  SettingsProgressCard,
  SettingsSectionCard,
} from '../../components/settings'

const { TextArea } = Input

export interface HealthCondition {
  name?: string
  status?: string
  notes?: string
}

export interface HealthSymptom {
  name?: string
  severity?: string
  notes?: string
}

export interface HealthProfileForm {
  conditions: HealthCondition[]
  symptoms: HealthSymptom[]
  sleep_issues: string[]
  eating_style?: string
  movement_habits: string[]
  exercise_habits: string[]
  substance_use_tracking: string[]
  energy_issues: string[]
  digestive_issues: string[]
  providers: string[]
  key_lab_markers: string[]
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'managed', label: 'Managed' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'monitoring', label: 'Monitoring' },
]

const SEVERITY_OPTIONS = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
  { value: 'fluctuating', label: 'Fluctuating' },
]

const EATING_STYLE_OPTIONS = [
  { value: 'omnivore', label: 'Omnivore' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'flexible', label: 'Flexible / Intuitive' },
  { value: 'other', label: 'Other' },
]

function normalizeList<T>(val: unknown): T[] {
  if (!val) return []
  if (Array.isArray(val)) return val as T[]
  return []
}

function normalizeCondition(v: unknown): HealthCondition {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const o = v as Record<string, unknown>
    return {
      name: typeof o.name === 'string' ? o.name : '',
      status: typeof o.status === 'string' ? o.status : undefined,
      notes: typeof o.notes === 'string' ? o.notes : '',
    }
  }
  return { name: '', status: undefined, notes: '' }
}

function normalizeSymptom(v: unknown): HealthSymptom {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const o = v as Record<string, unknown>
    return {
      name: typeof o.name === 'string' ? o.name : '',
      severity: typeof o.severity === 'string' ? o.severity : undefined,
      notes: typeof o.notes === 'string' ? o.notes : '',
    }
  }
  return { name: '', severity: undefined, notes: '' }
}

function normalizeStringList(val: unknown): string[] {
  const arr = normalizeList<unknown>(val)
  return arr.map((x) => (typeof x === 'string' ? x : typeof x === 'object' && x && 'name' in x ? String((x as { name: unknown }).name) : '')).filter(Boolean)
}

export function HealthSettingsPage() {
  const theme = useTheme()
  const queryClient = useQueryClient()
  const [form] = Form.useForm<HealthProfileForm>()

  const { data, isLoading } = useQuery({
    queryKey: ['profile', 'health'],
    queryFn: () => profileService.getHealth(),
  })

  const updateMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => profileService.updateHealth(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  })

  const initialValues = useMemo((): HealthProfileForm => {
    if (!data) {
      return {
        conditions: [],
        symptoms: [],
        sleep_issues: [],
        eating_style: undefined,
        movement_habits: [],
        exercise_habits: [],
        substance_use_tracking: [],
        energy_issues: [],
        digestive_issues: [],
        providers: [],
        key_lab_markers: [],
      }
    }
    const conditions = (normalizeList<unknown>(data.conditions) || []).map(normalizeCondition)
    const symptoms = (normalizeList<unknown>(data.symptoms) || []).map(normalizeSymptom)
    return {
      conditions,
      symptoms,
      sleep_issues: normalizeStringList(data.sleep_issues).length
        ? normalizeStringList(data.sleep_issues)
        : [],
      eating_style: typeof data.eating_style === 'string' ? data.eating_style : undefined,
      movement_habits: normalizeStringList(data.movement_habits),
      exercise_habits: normalizeStringList(data.exercise_habits),
      substance_use_tracking: normalizeStringList(data.substance_use_tracking),
      energy_issues: normalizeStringList(data.energy_issues),
      digestive_issues: normalizeStringList(data.digestive_issues),
      providers: normalizeStringList(data.providers),
      key_lab_markers: normalizeStringList(data.key_lab_markers),
    }
  }, [data])

  const formValues = Form.useWatch([], form)
  const completionPercent = useMemo(() => {
    const vals = (formValues ?? form.getFieldsValue()) as HealthProfileForm
    let filled = 0
    const total = 8
    if ((vals?.conditions ?? []).some((c) => c?.name?.trim())) filled++
    if ((vals?.symptoms ?? []).some((s) => s?.name?.trim())) filled++
    if ((vals?.sleep_issues ?? []).length > 0) filled++
    if (vals?.eating_style?.trim()) filled++
    if ((vals?.movement_habits ?? []).length > 0 || (vals?.exercise_habits ?? []).length > 0) filled++
    if ((vals?.substance_use_tracking ?? []).length > 0) filled++
    if ((vals?.energy_issues ?? []).length > 0 || (vals?.digestive_issues ?? []).length > 0) filled++
    if ((vals?.providers ?? []).length > 0 || (vals?.key_lab_markers ?? []).length > 0) filled++
    return Math.round((filled / total) * 100)
  }, [formValues, form])

  const handleFinish = (values: HealthProfileForm) => {
    const payload: Record<string, unknown> = {
      conditions: (values.conditions ?? []).filter((c) => c?.name?.trim()).map((c) => ({ name: c.name, status: c.status || null, notes: c.notes || null })),
      symptoms: (values.symptoms ?? []).filter((s) => s?.name?.trim()).map((s) => ({ name: s.name, severity: s.severity || null, notes: s.notes || null })),
      sleep_issues: (values.sleep_issues ?? []).filter(Boolean),
      eating_style: values.eating_style || null,
      movement_habits: values.movement_habits ?? [],
      exercise_habits: values.exercise_habits ?? [],
      substance_use_tracking: values.substance_use_tracking ?? [],
      energy_issues: values.energy_issues ?? [],
      digestive_issues: values.digestive_issues ?? [],
      providers: values.providers ?? [],
      key_lab_markers: values.key_lab_markers ?? [],
    }
    updateMutation.mutate(payload)
  }

  useEffect(() => {
    if (!isLoading && data !== undefined) {
      form.setFieldsValue(initialValues)
    }
  }, [isLoading, data, initialValues, form])

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleFinish}
    >
      <SettingsPageLayout
        header={
          <>
            <SettingsHeader
              title="Health Profile"
              description="Track conditions, symptoms, sleep, nutrition, movement, and medical support. This data helps personalize health strategies and recommendations."
            />
            <div style={{ marginTop: 16 }}>
              <SettingsProgressCard percent={completionPercent} label="Profile completion" />
            </div>
          </>
        }
      >
        <div className="settings-sections-grid">
          <SettingsSectionCard title="Conditions" description="Chronic or ongoing health conditions">
            <Form.List name="conditions">
              {(fields, { add, remove }) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {fields.length === 0 ? (
                    <div
                      style={{
                        padding: 24,
                        textAlign: 'center',
                        background: theme.hoverBg ?? '#f8fafc',
                        borderRadius: theme.radius ?? 8,
                        border: `1px dashed ${theme.contentCardBorder ?? theme.border}`,
                      }}
                    >
                      <span style={{ color: theme.textMuted, display: 'block', marginBottom: 12 }}>
                        No conditions yet
                      </span>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => add({ name: '', status: undefined, notes: '' })}>
                        Add condition
                      </Button>
                    </div>
                  ) : (
                    fields.map(({ key, name }) => (
                      <Card
                        key={key}
                        size="small"
                        style={{
                          background: theme.contentCardBg ?? theme.cardBg,
                          border: `1px solid ${theme.contentCardBorder ?? theme.border}`,
                          borderRadius: theme.radius ?? 8,
                        }}
                        bodyStyle={{ padding: 16 }}
                        extra={
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                            aria-label="Remove"
                          />
                        }
                      >
                        <Form.Item name={[name, 'name']} label="Condition" rules={[{ required: true, message: 'Name required' }]}>
                          <Input placeholder="e.g. Type 2 diabetes" />
                        </Form.Item>
                        <Form.Item name={[name, 'status']} label="Status">
                          <Select allowClear placeholder="Select status" options={STATUS_OPTIONS} />
                        </Form.Item>
                        <Form.Item name={[name, 'notes']} label="Notes">
                          <TextArea rows={2} placeholder="Optional notes" />
                        </Form.Item>
                      </Card>
                    ))
                  )}
                  {fields.length > 0 && (
                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => add({ name: '', status: undefined, notes: '' })} block>
                      Add condition
                    </Button>
                  )}
                </div>
              )}
            </Form.List>
          </SettingsSectionCard>

          <SettingsSectionCard title="Symptoms" description="Current or recurring symptoms">
            <Form.List name="symptoms">
              {(fields, { add, remove }) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {fields.length === 0 ? (
                    <div
                      style={{
                        padding: 24,
                        textAlign: 'center',
                        background: theme.hoverBg ?? '#f8fafc',
                        borderRadius: theme.radius ?? 8,
                        border: `1px dashed ${theme.contentCardBorder ?? theme.border}`,
                      }}
                    >
                      <span style={{ color: theme.textMuted, display: 'block', marginBottom: 12 }}>
                        No symptoms yet
                      </span>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => add({ name: '', severity: undefined, notes: '' })}>
                        Add symptom
                      </Button>
                    </div>
                  ) : (
                    fields.map(({ key, name }) => (
                      <Card
                        key={key}
                        size="small"
                        style={{
                          background: theme.contentCardBg ?? theme.cardBg,
                          border: `1px solid ${theme.contentCardBorder ?? theme.border}`,
                          borderRadius: theme.radius ?? 8,
                        }}
                        bodyStyle={{ padding: 16 }}
                        extra={
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                            aria-label="Remove"
                          />
                        }
                      >
                        <Form.Item name={[name, 'name']} label="Symptom" rules={[{ required: true, message: 'Name required' }]}>
                          <Input placeholder="e.g. Headaches" />
                        </Form.Item>
                        <Form.Item name={[name, 'severity']} label="Severity">
                          <Select allowClear placeholder="Select severity" options={SEVERITY_OPTIONS} />
                        </Form.Item>
                        <Form.Item name={[name, 'notes']} label="Notes">
                          <TextArea rows={2} placeholder="Optional notes" />
                        </Form.Item>
                      </Card>
                    ))
                  )}
                  {fields.length > 0 && (
                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => add({ name: '', severity: undefined, notes: '' })} block>
                      Add symptom
                    </Button>
                  )}
                </div>
              )}
            </Form.List>
          </SettingsSectionCard>

          <SettingsSectionCard title="Sleep" description="Sleep issues or patterns">
            <Form.List name="sleep_issues">
              {(fields, { add, remove }) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {fields.map(({ key, name }) => (
                    <div key={key} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <Form.Item name={name} style={{ flex: 1, marginBottom: 0 }}>
                        <Input placeholder="e.g. Difficulty falling asleep" />
                      </Form.Item>
                      <Button type="text" danger onClick={() => remove(name)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add('')} block>
                    Add sleep issue
                  </Button>
                </div>
              )}
            </Form.List>
          </SettingsSectionCard>

          <SettingsSectionCard title="Nutrition" description="Eating style and dietary patterns">
            <Form.Item name="eating_style" label="Eating style">
              <Select allowClear placeholder="Select" options={EATING_STYLE_OPTIONS} />
            </Form.Item>
          </SettingsSectionCard>

          <SettingsSectionCard title="Movement" description="Movement and exercise habits">
            <Form.List name="movement_habits">
              {(fields, { add, remove }) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {fields.map(({ key, name }) => (
                    <div key={key} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <Form.Item name={name} style={{ flex: 1, marginBottom: 0 }}>
                        <Input placeholder="e.g. Walk 30 min daily" />
                      </Form.Item>
                      <Button type="text" danger onClick={() => remove(name)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add('')} block>
                    Add movement habit
                  </Button>
                </div>
              )}
            </Form.List>
            <Form.List name="exercise_habits">
              {(fields, { add, remove }) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  <span style={{ fontSize: 12, color: theme.textMuted }}>Exercise habits</span>
                  {fields.map(({ key, name }) => (
                    <div key={key} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <Form.Item name={name} style={{ flex: 1, marginBottom: 0 }}>
                        <Input placeholder="e.g. Gym 3x/week" />
                      </Form.Item>
                      <Button type="text" danger onClick={() => remove(name)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add('')} block>
                    Add exercise habit
                  </Button>
                </div>
              )}
            </Form.List>
          </SettingsSectionCard>

          <SettingsSectionCard title="Substances" description="Caffeine, alcohol, or other substance tracking">
            <Form.List name="substance_use_tracking">
              {(fields, { add, remove }) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {fields.map(({ key, name }) => (
                    <div key={key} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <Form.Item name={name} style={{ flex: 1, marginBottom: 0 }}>
                        <Input placeholder="e.g. Caffeine - 2 cups/day" />
                      </Form.Item>
                      <Button type="text" danger onClick={() => remove(name)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add('')} block>
                    Add substance
                  </Button>
                </div>
              )}
            </Form.List>
          </SettingsSectionCard>

          <SettingsSectionCard title="Energy & Recovery" description="Energy issues and digestive health">
            <Form.List name="energy_issues">
              {(fields, { add, remove }) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 12, color: theme.textMuted }}>Energy issues</span>
                  {fields.map(({ key, name }) => (
                    <div key={key} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <Form.Item name={name} style={{ flex: 1, marginBottom: 0 }}>
                        <Input placeholder="e.g. Afternoon slump" />
                      </Form.Item>
                      <Button type="text" danger onClick={() => remove(name)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add('')} block>
                    Add
                  </Button>
                </div>
              )}
            </Form.List>
            <Form.List name="digestive_issues">
              {(fields, { add, remove }) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  <span style={{ fontSize: 12, color: theme.textMuted }}>Digestive issues</span>
                  {fields.map(({ key, name }) => (
                    <div key={key} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <Form.Item name={name} style={{ flex: 1, marginBottom: 0 }}>
                        <Input placeholder="e.g. Occasional bloating" />
                      </Form.Item>
                      <Button type="text" danger onClick={() => remove(name)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add('')} block>
                    Add
                  </Button>
                </div>
              )}
            </Form.List>
          </SettingsSectionCard>

          <SettingsSectionCard title="Medical Support" description="Providers and key lab markers">
            <Form.List name="providers">
              {(fields, { add, remove }) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 12, color: theme.textMuted }}>Healthcare providers</span>
                  {fields.map(({ key, name }) => (
                    <div key={key} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <Form.Item name={name} style={{ flex: 1, marginBottom: 0 }}>
                        <Input placeholder="e.g. Dr. Smith - PCP" />
                      </Form.Item>
                      <Button type="text" danger onClick={() => remove(name)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add('')} block>
                    Add provider
                  </Button>
                </div>
              )}
            </Form.List>
            <Form.List name="key_lab_markers">
              {(fields, { add, remove }) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  <span style={{ fontSize: 12, color: theme.textMuted }}>Key lab markers</span>
                  {fields.map(({ key, name }) => (
                    <div key={key} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <Form.Item name={name} style={{ flex: 1, marginBottom: 0 }}>
                        <Input placeholder="e.g. HbA1c - 5.8" />
                      </Form.Item>
                      <Button type="text" danger onClick={() => remove(name)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add('')} block>
                    Add lab marker
                  </Button>
                </div>
              )}
            </Form.List>
          </SettingsSectionCard>

          <div style={{ gridColumn: '1 / -1' }}>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
                Save changes
              </Button>
            </Form.Item>
          </div>
        </div>
      </SettingsPageLayout>
    </Form>
  )
}
