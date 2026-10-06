# Test Plan — JobFlow: Smart Job Scheduling System

---

## 1. Testing Strategy Overview

JobFlow implements a multi-tiered testing strategy ensuring functional accuracy, type safety, role security, schedule conflict prevention, and cross-browser responsiveness.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        END-TO-END TESTS (Playwright)                   │
│  User Workflows • Authentication • Job Lifecycle • Role Verification    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     COMPONENT & INTEGRATION TESTS (Vitest)             │
│  Badge Renderers • Modal Behavior • Sidebar Filtering • Header Popovers│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         UNIT TESTS (Vitest + Zod)                      │
│  ConflictDetector Engine • Date Formatters • Form Schema Boundaries    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Test Execution Matrix

### 2.1 Unit Tests (Vitest)

| Category | Target Module | Test Scenarios | Expected Result |
| :--- | :--- | :--- | :--- |
| **Conflict Detector** | `conflictDetector.ts` | Test overlapping timestamps $(start_1 < end_2) \land (end_1 > start_2)$ | `hasConflict == true`, returns conflicting job array |
| **Conflict Detector** | `conflictDetector.ts` | Test non-overlapping adjacent jobs ($end_1 \le start_2$) | `hasConflict == false` |
| **Date Formatters** | `formatters.ts` | Test ISO date string formatting (`formatDateTime`, `formatTimeRange`) | Renders localized human-readable string |
| **Validation Schema**| `validationSchemas.ts` | Test Zod schema when `endTime <= startTime` | Fails validation with "End time must be after start time" |
| **Validation Schema**| `validationSchemas.ts` | Test valid job input object | Passes validation cleanly |

---

### 2.2 Component & Layout Tests (Vitest + React Testing Library)

| Component | Target File | Test Scenarios | Expected Result |
| :--- | :--- | :--- | :--- |
| **StatusBadge** | `StatusBadge.tsx` | Render each status (`pending`, `overdue`, etc.) | Renders correct label & status CSS classes |
| **PriorityBadge** | `PriorityBadge.tsx` | Render priority levels | Displays corresponding icon & priority label |
| **Modal** | `Modal.tsx` | Press `Escape` key when modal is open | Calls `onClose()` handler |
| **Sidebar** | `Sidebar.tsx` | Render for `userRole = 'employee'` | Hides restricted `/users` and `/reports` links |
| **Header** | `Header.tsx` | Click notification bell | Opens notifications popover menu |

---

### 2.3 End-to-End User Workflows (Playwright)

1. **Authentication Flow:** Navigate to `/login` → enter valid credentials → redirect to `/dashboard` → verify user profile in header → click Logout → redirect to `/login`.
2. **Job Scheduling Workflow:** Click "Create Job" → fill form details → pick start and end times → submit → verify job card appears on Job List and Calendar.
3. **Conflict Prevention Workflow:** Create Job A for Employee X (9:00 AM - 11:00 AM) → attempt to create Job B for Employee X (10:00 AM - 12:00 PM) → verify conflict modal warning appears.
4. **Status Update Workflow:** Employee logs in → opens assigned job details → clicks "Start Work" (status transitions to `In Progress`) → clicks "Mark Complete" (status transitions to `Completed`).

---

## 3. Automated CI/CD Pipeline Checks

Before any production code deployment or release, the following commands must execute with 100% success:

1. **Type Check:** `cmd /c npx tsc --noEmit` (Must output 0 errors).
2. **Linting Check:** `cmd /c npm run lint` (Must pass cleanly).
3. **Unit Tests:** `cmd /c npm test` (Must pass 100% of test suites).
4. **Production Build:** `cmd /c npm run build` (Must generate optimized static bundles without build errors).
