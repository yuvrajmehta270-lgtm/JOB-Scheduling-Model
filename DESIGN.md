---
name: JobFlow Dashboard System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006591'
  on-secondary: '#ffffff'
  secondary-container: '#39b8fd'
  on-secondary-container: '#004666'
  tertiary: '#005338'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e4b'
  on-tertiary-container: '#67f4b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#89ceff'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#004c6e'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 30px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
  metric-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system is engineered for high-velocity operational dispatchers, workforce coordinators, and enterprise field management teams. It balances crisp utility with an inviting, modern aesthetic. The emotional tone projects calm authority, real-time precision, and cognitive clarity under heavy operational workloads.

The design movement blends **Modern SaaS Enterprise** with subtle **Tactile & Glass-Soft Card Accents**. Inspired by high-performing SaaS portals, it uses a rich deep-indigo foundation paired with electric cyan/teal accents, balanced by clean canvas whites, slate typography, and distinct operational status tags. Surfaces feel layered and crisp rather than heavy, ensuring users process scheduling density, conflict alerts, and worker assignments without visual fatigue.

## Colors

The palette establishes hierarchy through functional color coding and clear semantic delineation:

- **Primary (`#4F46E5` - Royal Indigo):** Anchors navigation panels, high-priority actions, active state selections, and key metric summaries.
- **Secondary (`#0EA5E9` - Sky/Teal Accent):** Drives secondary interactions, data visualization series, dispatched workforce statuses, and live filters.
- **Tertiary (`#10B981` - Emerald):** Signifies completed jobs, healthy team capacity, on-time milestones, and positive KPI deltas.
- **Neutral (`#0F172A` - Deep Slate):** Forms the backbone of high-contrast text and primary headings, counterbalanced with `#475569` for secondary metadata and `#64748B` for subtle indicators.
- **Backgrounds & Borders:** Base app canvas sits on `#F8FAFC`, transitioning to `#FFFFFF` for elevated data cards and scheduling blocks. Dividers and container outlines utilize `#E2E8F0` for crisp boundaries that prevent visual bleed.
- **Operational Status Palette:**
  - **Pending:** `#F59E0B` (Amber) on `#FEF3C7`
  - **In-Progress:** `#0EA5E9` (Sky Blue) on `#E0F2FE`
  - **Completed:** `#10B981` (Emerald) on `#D1FAE5`
  - **Overdue / Alert:** `#F43F5E` (Rose) on `#FFE4E6`

## Typography

The type scale marries the geometric warmth and brand confidence of **Plus Jakarta Sans** for headlines, KPI figures, and card headers with the clinical readability of **Inter** for dense tabular records, shift calendars, and form controls. 

- Use `metric-display` for top-line scheduling statistics and summary card totals.
- Numeric displays in tables and dispatch calendars should enable tabular figures (`font-variant-numeric: tabular-nums`) to ensure strict columnar vertical alignment across updating metrics.
- Keep label tracking tight and uppercase styling strictly reserved for badge labels and micro-headers (`label-sm`) with `letter-spacing: 0.05em`.

## Layout & Spacing

The dashboard operates on a dynamic 12-column fluid grid tailored to high-density SaaS workflows:

- **Desktop (1280px+):** Fixed lateral navigation bar (260px or collapsed to 80px), accompanied by a 12-column fluid content area with `gutter: 1.25rem` (20px) and outer canvas `margin: 1.5rem` (24px).
- **Tablet (768px - 1279px):** Sidebar converts to an overlay drawer or a compact icon rail. Main content scales to an 8-column layout with 16px gutters and 20px padding.
- **Mobile (<768px):** Single-column stacked workflow. Top app header with sliding bottom drawers for filters and job details. Canvas margin shifts to `1rem` (16px).
- **Density Guidelines:**
  - `space-xs` (4px) and `space-sm` (8px) govern tight component internals (badge padding, icon-to-label gaps, table cell horizontal buffers).
  - `space-md` (16px) controls standard card padding, form field gaps, and dispatch item rows.
  - `space-lg` (24px) establishes section boundaries and KPI widget clusters.
  - `space-xl` (32px) defines major operational quadrant separations.

## Elevation & Depth

Visual hierarchy leverages crisp card boundaries backed by diffused, low-opacity ambient shadows tinted slightly with indigo-slate:

- **Level 0 (Flat / Canvas):** Used for base surfaces (`#F8FAFC`). No shadow, no outline.
- **Level 1 (Card & Module Resting):** Applied to summary blocks, dispatch schedule containers, and table sheets. Uses a subtle boundary (`1px solid #E2E8F0`) paired with an ambient tinted drop shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
- **Level 2 (Hover / Interactive):** Applied to active timeline items, hovering job rows, and dropdown menus. Uses `0 10px 15px -3px rgba(15, 23, 42, 0.06), 0 4px 6px -4px rgba(15, 23, 42, 0.04)` with a brightened border accent (`#CBD5E1`).
- **Level 3 (Modals / Floating Panels / Context Dispatch Menus):** High floating components receive `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)`.
- **Navigation Depth:** The left sidebar employs an optional deep indigo block fill (`#4338CA` to `#312E81`) with inset highlights, giving solid physical docking against the white-and-slate canvas.

## Shapes

The interface balances sharp data efficiency with friendly, approachable geometry:

- **Cards and Panels:** Standard modules use `rounded-lg` (16px / 1rem) for an inviting, contemporary software feel matching modern dashboard patterns.
- **Input Fields & Buttons:** Standard controls adhere to `rounded` (8px / 0.5rem), maintaining clean visual alignment with table rows and grid systems.
- **Status Badges, Avatars, and Action Tags:** Use full pill rounding (`rounded-full` / 9999px) to immediately distinguish operational flags, category chips, and team member indicators from structured data containers.

## Components

### Buttons & Interactive Controls
- **Primary Buttons:** Rich indigo fill (`#4F46E5`), crisp white typography, `rounded` (8px), 10px vertical by 18px horizontal padding. Subtle shadow on idle, darkening to `#4338CA` on hover.
- **Secondary Buttons:** Crisp white background, `1px solid #E2E8F0` border, `#0F172A` text. Shifts to `#F8FAFC` surface with primary-tinted text on hover.
- **Icon Actions:** 36x36px square buttons with `rounded-md`, neutral gray icons that animate to `#4F46E5` on focus.

### Status Pills & Category Chips
- Rendered in full-pill geometry (`rounded-full`) with uppercase or semi-bold `label-sm` text.
- **Amber (Pending Dispatch):** Background `#FEF3C7`, text `#B45309`, optional leading status dot (`#F59E0B`).
- **Sky (In-Progress):** Background `#E0F2FE`, text `#0369A1`, optional glowing ping dot (`#0EA5E9`).
- **Emerald (Completed):** Background `#D1FAE5`, text `#047857`.
- **Rose (Overdue / Hazard):** Background `#FFE4E6`, text `#BE123C`.

### Data Cards & Metric Blocks
- White background (`#FFFFFF`), `1px solid #E2E8F0`, `rounded-lg` (16px), containing a 48px square tinted icon container with `rounded-md` (e.g., indigo icon on `#EEF2FF`).
- Metric numbers rendered in `metric-display` with bold weight, accompanied by tiny trend indicators (+12% in emerald pill).

### Input Fields & Search Bars
- Background `#FFFFFF` or `#F1F5F9`, `1px solid #E2E8F0`, `rounded` (8px). Text in `#0F172A` with `#94A3B8` placeholder.
- Focus state reveals a 2px outer ring in `rgba(79, 70, 229, 0.2)` with border turning `#4F46E5`.
- Integrated search bars in table toolbars include an icon prefix at 16px size and a keyboard shortcut tag (`⌘K`) right-aligned.

### Workforce Calendar / Timeline Slots
- Calendar task blocks feature a thick left edge accent (3px solid matching priority/category), translucent fill in the respective hue at 10% opacity, and high-contrast slate text within.
- Overlaps and unassigned shifts display dashed `#CBD5E1` borders to signal actionable dropzones.