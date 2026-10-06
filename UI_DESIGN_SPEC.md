# UI Design System & UX Specification — JobFlow

---

## 1. Design Aesthetics & Visual Philosophy
JobFlow delivers a high-end enterprise SaaS dashboard aesthetic inspired by modern productivity platforms (e.g. Stripe, Linear, Vercel). It avoids generic AI layouts, flashy non-functional gradients, and overcrowded visuals in favor of clean information hierarchy, restrained shadows, precise typography, and accessible contrast ratios.

---

## 2. Color Tokens & Theme System

### 2.1 Neutral Base Palette (Slate)
* **Background Light:** `bg-slate-50` (`#f8fafc`)
* **Card & Surface Background:** `bg-white` (`#ffffff`)
* **Dark Sidebar Background:** `bg-slate-900` (`#0f172a`)
* **Borders:** `border-slate-200` (`#e2e8f0`)
* **Text Primary:** `text-slate-900` (`#0f172a`)
* **Text Muted / Subtitle:** `text-slate-500` (`#64748b`)

### 2.2 Brand Accent Palette (Indigo)
* **Brand Primary:** `bg-indigo-600` (`#4f46e5`)
* **Brand Hover:** `hover:bg-indigo-700` (`#4338ca`)
* **Brand Light Soft:** `bg-indigo-50` (`#e0e7ff`)
* **Focus Ring:** `focus:ring-2 focus:ring-indigo-500`

### 2.3 Status Badge Color Matrix

| Status | Background Token | Text Token | Border Token | Visual Cue |
| :--- | :--- | :--- | :--- | :--- |
| **Pending** | `bg-slate-100` | `text-slate-700` | `border-slate-200` | Neutral solid dot |
| **Scheduled** | `bg-blue-50` | `text-blue-700` | `border-blue-200` | Blue solid dot |
| **In Progress** | `bg-amber-50` | `text-amber-700` | `border-amber-200` | Amber solid dot |
| **Completed** | `bg-emerald-50` | `text-emerald-700` | `border-emerald-200` | Emerald solid dot |
| **Cancelled** | `bg-slate-100` | `text-slate-500` | `border-slate-200` | Strikethrough text |
| **Overdue** | `bg-rose-50` | `text-rose-700` | `border-rose-200` | Pulse animation |

---

## 3. Typography & Elevation Scale

### Typography Stack
* **Font Family:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`.
* **Page Titles:** `text-xl font-bold text-slate-900 tracking-tight`
* **Section Headers:** `text-base font-semibold text-slate-900`
* **Body Text:** `text-sm text-slate-700`
* **Caption / Badges:** `text-xs font-medium text-slate-500`

### Shadows & Elevation
* **Cards / Panels:** `shadow-xs border border-slate-200/80 rounded-xl bg-white`
* **Hover Elevation:** `hover:shadow-md transition-shadow duration-200`
* **Modals & Popovers:** `shadow-xl border border-slate-200 bg-white rounded-xl`

---

## 4. Responsive Layout & Component Guidelines

### 4.1 Layout Shell Structure
* **Collapsible Left Sidebar:** Fixed position, `w-64` expanded, `w-20` collapsed, `bg-slate-900` background.
* **Top Navigation Bar:** Sticky top, `h-16`, featuring breadcrumb page title, search bar, notification counter badge, and profile dropdown menu.
* **Main Content Container:** `max-w-7xl mx-auto p-4 sm:p-6 lg:p-8`.

### 4.2 Form & Component Best Practices
* **Floating Input Labels:** Clear, accessible form input labels with error messages rendered beneath inputs in `text-rose-600`.
* **Action Buttons:**
  * **Primary Action:** `bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs px-4 py-2 text-sm font-medium rounded-lg`
  * **Secondary Action:** `bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 text-sm font-medium rounded-lg`
  * **Destructive Action:** `bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-sm font-medium rounded-lg`
* **Accessibility (a11y):** Keyboard ESC dismissal for modals, focus rings on all interactive elements (`focus:outline-none focus:ring-2`), aria roles on modal overlays and tooltips.
