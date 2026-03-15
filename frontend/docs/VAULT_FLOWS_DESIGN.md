# Money Vault Action Flows — Design Specification

Premium, trustworthy financial UX for the Wealth domain of Life OS.

---

## Design Principles

- **Clear** — No ambiguity about amounts, dates, or consequences
- **Safe** — Explicit confirmations, no accidental destructive actions
- **Serious** — Premium fintech aesthetic, not a casual budgeting toy
- **Trustworthy** — Always show fees, penalties, and pending states
- **Easy to understand** — Step-based flows with review before confirm
- **Hard to misuse** — Friction on destructive actions (break early)

---

## Flow A — Add Money to Vault

### Trigger
User opens vault detail → clicks **Add Money**

### Steps

| Step | Component | Content |
|------|-----------|---------|
| 1 | `FundingSourceStep` | Choose source: bank, debit card, credit card (if enabled), available balance. Show label, estimated fee, processing time, verified/unverified state. |
| 2 | `AmountEntryStep` | Amount input. Show: current vault amount, target amount, resulting new amount, remaining to target. |
| 3 | `FundingReviewStep` | Vault name, funding source, amount, fee, net amount, estimated arrival time. Show whether funds will be locked immediately or remain available first. |
| 4 | Confirm | Primary CTA: **Confirm funding** |

### Success State
- Funding submitted
- Transaction reference
- Funds pending or posted

### Implementation
- **FundingFlowModal** — 4-step modal (Source → Amount → Review → Confirm)
- **FundingSourceStep** — embedded in FundingFlowModal
- **AmountEntryStep** — embedded in FundingFlowModal
- **FundingReviewStep** — embedded in FundingFlowModal
- **BalanceImpactCard** — shows current vs resulting vault balance

### Copy
- "Add money to vault"
- "Estimated arrival: Instant"
- "Funds will be available in the vault immediately."
- "Confirm funding"

---

## Flow B — Confirm Lock Rules

### Trigger
User has funded vault → clicks **Lock vault**

### Content
- Vault name
- Amount being locked
- Unlock date
- Break-early allowed yes/no
- Penalty if applicable
- Payout destination after unlock
- Vault mode: soft or real
- **Important note:** "Locked funds cannot be withdrawn before the unlock date unless early break is allowed."

### Confirmation
- Checkbox: "I understand the lock rules and confirm I want to lock these funds."
- CTA: **Lock funds** (disabled until acknowledged)

### Implementation
- **LockReviewModal** — single modal with all rules and explicit acknowledgment

### Copy
- "Review before locking funds"
- "Locked funds cannot be withdrawn before the unlock date unless early break is allowed."

---

## Flow C — Lock Funds

### Transition State
- "Locking funds..."
- "Moving amount from available to locked balance"

### Success State
- Amount locked
- Vault name
- Unlock date
- Days remaining
- Current total vault balance
- CTA: "Continue" or "View vault details"

### Optional Message
"Your money is now locked until [date]."

### Implementation
- **LockSuccessCard** — success confirmation with days remaining, amount, CTA

### Copy
- "Your money is now locked"
- "until [date]"
- "Days remaining"

---

## Flow D — Unlock Funds

### States
| State | UI | Actions |
|-------|-----|---------|
| Not yet eligible | Info banner | Unlockable on [date] |
| Unlockable now | Success banner | **Unlock now** |
| Auto-unlocked | Passive info | Transaction status |
| Unlocked and available | Success state | Payout available |
| Payout in progress | Processing banner | — |
| Payout completed | Success confirmation | — |

### Unlock Screen Content
- Vault name
- Unlock eligibility
- Amount to unlock
- Payout destination
- What happens next

### Actions
- **Unlock now**
- **Send to available balance**
- **Send to payout destination**

### Implementation
- **UnlockEligibilityBanner** — shows eligibility, "Unlockable on [date]" or "Unlock available now"
- **UnlockFlowCard** — full unlock flow card (optional; for dedicated unlock flow)

### Copy
- "Unlock available now"
- "Unlockable on [date]"
- "Funds will become available on the unlock date."

---

## Flow E — Break Early

### Design Principle
Friction-filled, intentional. Two-step confirmation.

### Screen 1 — Warning
- Explain vault is scheduled to unlock later
- Explain penalty if any
- Amount that will be received
- Consequences

### Screen 2 — Confirmation
- Require explicit confirmation text: "BREAK VAULT"
- Button visually dangerous (red)
- Label: **Break vault early**

### Screen 3 — Result
- New amount after penalty
- Where funds were moved
- Transaction link

### Implementation
- **BreakEarlyWarningModal** — two-step: Warning → Type "BREAK VAULT" to confirm
- **BreakEarlyReviewCard** — result screen after break

### Copy
- "You are about to break the vault before the unlock date."
- "Breaking this vault early may reduce the amount returned."
- "Type 'BREAK VAULT' to confirm"

---

## Flow F — Payout

### Trigger
Funds unlocked → user initiates payout

### Steps
| Step | Content |
|------|---------|
| 1 | Choose destination: linked bank, available balance, configured payout |
| 2 | Review: destination, amount, fee, expected arrival |
| 3 | Confirm payout |
| 4 | Processing / pending state |
| 5 | Success / failed result |

### Implementation
- **PayoutFlowModal** — 3-step: Destination → Review → Confirm
- **PayoutDestinationStep** — embedded
- **PayoutReviewStep** — embedded

### Copy
- "Payout unlocked funds"
- "Review payout details before confirming."
- "Confirm payout"

---

## Flow G — Status Handling

### Statuses
| Status | Badge | Use |
|--------|-------|-----|
| pending | Pending | Funding initiated |
| processing | Processing | Lock/unlock/payout in progress |
| posted | Posted | Completed |
| failed | Failed | Failed funding |
| canceled | Canceled | User canceled |
| reversed | Reversed | Transaction reversed |
| requires_action | Action required | User must act |

### Components
- **TransactionStatusBanner** — full-width alert for pending/processing/failed/action_required
- **FinancialStatusBadge** — inline badge for transaction status

### Implementation
- **TransactionStatusBanner** — Alert with icon, title, description, transaction ref, retry
- **FinancialStatusBadge** — Tag with status color and icon

---

## Flow H — Confirmation Screens

### After Every Important Action
- Action title
- Amount
- Vault name
- Timestamp
- Status
- Next expected step
- CTA to return to vault or view transactions

### Examples
- "Money added successfully"
- "Funds locked"
- "Unlock completed"
- "Payout submitted"
- "Break-early completed"

### Implementation
- **VaultActionConfirmation** — reusable success card with title, amount, vault, status, next step, CTAs

---

## Reusable Components

| Component | Purpose |
|-----------|---------|
| FundingFlowModal | Add money flow |
| FundingSourceStep | Step 1 of funding |
| AmountEntryStep | Step 2 of funding |
| FundingReviewStep | Step 3 of funding |
| LockReviewModal | Confirm lock rules |
| LockSuccessCard | Lock success |
| UnlockFlowCard | Unlock flow |
| UnlockEligibilityBanner | Unlock eligibility |
| BreakEarlyWarningModal | Break early warning |
| BreakEarlyReviewCard | Break early result |
| PayoutFlowModal | Payout flow |
| PayoutDestinationStep | Payout step 1 |
| PayoutReviewStep | Payout step 2 |
| VaultActionConfirmation | Generic success |
| TransactionStatusBanner | Status alerts |
| FinancialStatusBadge | Status badge |
| BalanceImpactCard | Balance change |

---

## Error / Edge Cases

| Case | UI |
|------|-----|
| Insufficient available balance | Error card, "Insufficient balance" |
| Funding source not verified | Warning, "Verify your funding source" |
| Unlock requested too early | Disabled button, "Unlockable on [date]" |
| Payout destination missing | "Add a payout destination" |
| Provider timeout | Failed banner, retry |

### Error Cards
- Polished error message
- Clear reason
- Retry action when applicable

---

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Desktop | Modals (480px), drawers, centered multi-step cards |
| Tablet | Stacked step content, large buttons, modal max 90vw |
| Mobile | Full-screen step flows, sticky bottom CTA, large amount inputs |

### Mobile Rules
- Sticky bottom CTA bar (flex-end, marginTop: 24)
- Large amount inputs (InputNumber size="large")
- Simple review screens (single column)
- No cramped multi-column layouts
- Modal: `width={Math.min(480, window.innerWidth - 32)}` for small screens

---

## Visual Design

- **Style:** Elegant, serious, calm, dark-mode friendly
- **Elements:** Stepper UI, review cards, balance cards, timeline/status cards
- **Avoid:** Playful gimmicks, hype language

---

## Copy Guidelines

| Do | Don't |
|----|-------|
| "Review before locking funds" | "You're almost there!" |
| "These funds will remain locked until the scheduled unlock date" | "Your money is safe" |
| "Estimated arrival time" | "Super fast!" |
| "Breaking this vault early may reduce the amount returned" | "Oops, you'll lose some" |
