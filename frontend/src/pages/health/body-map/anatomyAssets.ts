/**
 * Anatomical assets: body silhouette + organ-shaped paths.
 * ViewBox: 0 0 400 820. Symmetry x=200 for front.
 * Premium anatomy explorer — believable proportions, organ-shaped overlays.
 */

/** Front body: proportional head, neck, shoulders, arms, torso, waist, hips, legs with gap, feet. */
export const FRONT_BODY_SILHOUETTE =
  'M200 38 C242 38 278 52 304 82 C324 108 336 142 336 178 L336 202 C336 232 326 262 308 288 L288 312 L288 352 C288 382 294 412 298 442 L302 492 L304 542 L304 592 L302 642 L298 692 L292 742 L284 792 L272 818 L200 818 L128 818 L116 792 L108 742 L102 692 L98 642 L96 592 L96 542 L98 492 L102 442 L106 412 L112 382 L112 352 L112 312 L92 288 C74 262 64 232 64 202 L64 178 C64 142 76 108 96 82 C122 52 158 38 200 38 Z'

/** Back body silhouette. */
export const BACK_BODY_SILHOUETTE =
  'M200 38 C244 38 280 54 306 84 C326 110 338 144 338 180 L338 204 C338 234 328 264 310 290 L290 314 L290 354 C290 384 296 414 300 444 L304 494 L306 544 L306 594 L304 644 L300 694 L294 744 L286 794 L274 818 L200 818 L126 818 L114 794 L106 744 L100 694 L96 644 L94 594 L94 544 L96 494 L100 444 L104 414 L110 384 L110 354 L110 314 L90 290 C72 264 62 234 62 204 L62 180 C62 144 74 110 94 84 C120 54 156 38 200 38 Z'

/** Organ shape: SVG path string (d) for overlay, or null to use ellipse. */
export interface OrganShapeDef {
  id: string
  label: string
  /** Organ-shaped path in viewBox 0 0 400 820. */
  path: string
  backOnly?: boolean
}

/** Brain: two-lobe shape, head region. */
const BRAIN_PATH =
  'M200 42 C248 42 282 58 302 82 C318 102 328 128 328 158 C328 188 318 212 298 228 C278 244 242 252 200 252 C158 252 122 244 102 228 C82 212 72 188 72 158 C72 128 82 102 98 82 C118 58 152 42 200 42 Z'

/** Thyroid: small oval at neck. */
const THYROID_PATH =
  'M200 118 C218 118 232 126 232 136 C232 146 218 154 200 154 C182 154 168 146 168 136 C168 126 182 118 200 118 Z'

/** Heart: small central shape between lungs. */
const HEART_PATH =
  'M200 208 C228 208 248 222 252 244 C254 258 248 272 232 284 C218 294 200 298 182 294 C166 290 152 276 150 260 C148 242 168 208 200 208 Z'

/** Left lung (viewer's right). */
const LUNG_LEFT_PATH =
  'M258 168 C292 168 318 182 328 208 C336 232 332 262 318 288 C302 312 272 328 242 332 L242 332 C218 334 198 324 188 302 C178 280 182 252 198 228 C214 202 238 168 258 168 Z'

/** Right lung (viewer's left). */
const LUNG_RIGHT_PATH =
  'M142 168 C182 168 208 202 224 228 C240 252 244 280 234 302 C224 324 204 334 180 332 L180 332 C150 328 120 312 104 288 C90 262 86 232 94 208 C104 182 130 168 142 168 Z'

/** Lungs combined region (both). */
const LUNGS_PATH = `${LUNG_LEFT_PATH} ${LUNG_RIGHT_PATH}`

/** Liver: right upper abdomen, wedge shape. */
const LIVER_PATH =
  'M232 288 C268 288 298 302 312 328 C324 352 328 382 318 412 C308 438 282 458 252 462 L218 460 C198 456 182 442 176 418 C170 392 178 362 198 338 C212 318 232 288 232 288 Z'

/** Stomach: left upper abdomen, J-like. */
const STOMACH_PATH =
  'M168 328 C192 328 212 338 222 358 C232 378 236 402 228 428 C220 452 198 468 172 468 C152 468 134 458 124 438 C114 418 118 392 132 368 C146 344 168 328 168 328 Z'

/** Spleen: left side, small oblong. */
const SPLEEN_PATH =
  'M158 328 C178 328 192 342 194 362 C196 382 186 398 168 402 C150 406 134 394 132 374 C130 354 138 328 158 328 Z'

/** Intestines: lower abdomen, coiled region. */
const INTESTINES_PATH =
  'M156 418 C196 418 244 418 244 418 C268 418 292 432 302 458 C312 484 308 518 286 542 C264 566 228 578 200 578 C172 578 136 566 114 542 C92 518 88 484 98 458 C108 432 132 418 156 418 Z'

/** Bladder: pelvis. */
const BLADDER_PATH =
  'M176 508 C208 508 232 518 240 538 C248 558 246 582 228 598 C210 614 190 618 176 608 C162 598 164 558 172 538 C180 518 204 508 176 508 Z'

/** Core / muscles: torso + core area. */
const MUSCLES_PATH =
  'M148 352 L252 352 L258 420 L254 520 L248 620 L242 718 L200 728 L158 718 L152 620 L146 520 L142 420 Z'

/** Spine: vertical strip, back. */
const SPINE_PATH =
  'M188 200 L212 200 L214 620 L210 800 L200 808 L190 800 L186 620 Z'

/** Kidney left, back. */
const KIDNEY_LEFT_PATH =
  'M158 318 C182 318 200 332 204 358 C208 384 198 412 172 422 C146 432 122 418 118 392 C114 366 134 318 158 318 Z'

/** Kidney right, back. */
const KIDNEY_RIGHT_PATH =
  'M242 318 C266 318 284 332 288 358 C292 384 282 412 256 422 C230 432 206 418 202 392 C198 366 218 318 242 318 Z'

/** Back muscles. */
const BACK_MUSCLES_PATH =
  'M130 320 L270 320 L272 420 L268 520 L262 620 L258 720 L200 738 L142 720 L138 620 L132 520 L128 420 Z'

export const FRONT_ORGAN_SHAPES: OrganShapeDef[] = [
  { id: 'brain', label: 'Brain', path: BRAIN_PATH },
  { id: 'thyroid', label: 'Thyroid', path: THYROID_PATH },
  { id: 'heart', label: 'Heart', path: HEART_PATH },
  { id: 'lungs', label: 'Lungs', path: LUNGS_PATH },
  { id: 'liver', label: 'Liver', path: LIVER_PATH },
  { id: 'stomach', label: 'Stomach', path: STOMACH_PATH },
  { id: 'spleen', label: 'Spleen', path: SPLEEN_PATH },
  { id: 'intestines', label: 'Intestines', path: INTESTINES_PATH },
  { id: 'bladder', label: 'Bladder', path: BLADDER_PATH },
  { id: 'muscles', label: 'Core & muscles', path: MUSCLES_PATH },
]

export const BACK_ORGAN_SHAPES: OrganShapeDef[] = [
  { id: 'brain', label: 'Brain', path: BRAIN_PATH },
  { id: 'spine', label: 'Spine', path: SPINE_PATH },
  { id: 'kidney_left', label: 'Kidney (L)', path: KIDNEY_LEFT_PATH, backOnly: true },
  { id: 'kidney_right', label: 'Kidney (R)', path: KIDNEY_RIGHT_PATH, backOnly: true },
  { id: 'muscles', label: 'Back muscles', path: BACK_MUSCLES_PATH },
]
