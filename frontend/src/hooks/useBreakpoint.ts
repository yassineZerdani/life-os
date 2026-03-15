/**
 * Responsive breakpoints. Ant Design defaults: xs < 576, sm >= 576, md >= 768, lg >= 992, xl >= 1200, xxl >= 1600.
 */
import { Grid } from 'antd'

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

export function useBreakpoint() {
  return Grid.useBreakpoint()
}

/** True when viewport is below md (sidebar should be drawer). */
export function useIsMobileOrTablet(): boolean {
  const bp = useBreakpoint()
  return !bp.md
}

/** True when viewport is xs (phone). */
export function useIsPhone(): boolean {
  const bp = useBreakpoint()
  return bp.xs === true
}
