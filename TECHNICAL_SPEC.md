# Technical Specification — JobFlow: Smart Job Scheduling System

---

## 1. System Architecture Overview

JobFlow is designed as a single-page application (SPA) built with React 19, TypeScript, and Vite, featuring a modular architecture and serverless Firebase infrastructure.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                              │
│  React 19 Components • Tailwind CSS • Lucide Icons • Recharts          │
│  FullCalendar (@fullcalendar/react) • React Hook Form + Zod            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        STATE & CONTEXT LAYER                           │
│  AuthContext (RBAC) • JobContext (CRUD & Filters) • UserContext        │
│  NotificationContext • ActivityLogContext                              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BUSINESS & UTILITY LAYER                        │
│  ConflictDetector Engine • Date & Time Formatters                      │
│  Validation Schemas • Permission Guard Utilities                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        PERSISTENCE & SECURITY LAYER                    │
│  Firebase Authentication • Cloud Firestore • Security Rules            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technical Stack Specification

| Subsystem | Technology | Version | Key Justification |
| :--- | :--- | :--- | :--- |
| **Framework** | React | 19.x | Modern concurrent rendering and declarative UI architecture |
| **Language** | TypeScript | 5.x / 6.x | End-to-end type safety and static contract validation |
| **Build Tool** | Vite | 8.x | Instant Hot Module Replacement (HMR) and fast build bundling |
| **Styling Engine** | Tailwind CSS | 3.4.x | Utility-first design system with design token consistency |
| **Client Routing** | React Router | 7.x | Declarative route protection and layout outlets |
| **Calendar Engine** | FullCalendar | 6.x / 7.x | Robust Month, Week, Day, and Agenda drag-and-drop scheduling |
| **Form Engine** | React Hook Form | 7.x | High-performance form state management without re-render lag |
| **Validation** | Zod | 3.x / 4.x | Schema validation with automated TypeScript inferrence |
| **Charts & Data Visualization** | Recharts | 3.x | Declarative SVG-based dashboard chart rendering |
| **Database & Auth** | Firebase | 12.x | Serverless Auth state & Cloud Firestore real-time DB |
| **Unit Testing** | Vitest | 5.x | Ultra-fast unit & component test execution |
| **E2E Testing** | Playwright | 1.x | Cross-browser automated user workflow validation |

---

## 3. Conflict Detection Algorithm Specification

The Conflict Detection Engine prevents double-booking an employee for overlapping work shifts.

### Overlap Condition Formula
Given a candidate job interval $[T_{\text{start, new}}, T_{\text{end, new}}]$ and an existing job interval $[T_{\text{start, existing}}, T_{\text{end, existing}}]$ for the same `assignedTo` employee ID:

$$\text{Overlap} \iff (T_{\text{start, new}} < T_{\text{end, existing}}) \land (T_{\text{end, new}} > T_{\text{start, existing}})$$

### Algorithmic Logic (`src/utils/conflictDetector.ts`)
1. Filter existing jobs by `assignedTo == targetUserId`.
2. Filter for active statuses (`pending`, `scheduled`, `in_progress`).
3. Ignore self-job ID if updating an existing record (`ignoreJobId`).
4. Evaluate overlap formula using UNIX millisecond timestamps (`getTime()`).
5. Return boolean flag `hasConflict` and array of `conflictingJobs`.

---

## 4. State Management Architecture

State is managed via React Context modules:
* `AuthContext`: Manages current authenticated user session, token state, and RBAC role profile.
* `JobContext`: Manages total job store, search/filter criteria, CRUD handlers, and conflict warning flags.
* `UserContext`: Manages user account directory, creation, role modification, and status toggles.
* `NotificationContext`: Manages real-time in-app notification state and unread count.

---

## 5. Security & Performance Guidelines
* **Type Safety:** 100% strict TypeScript checks (`tsc --noEmit`).
* **Environment Secrets:** Secrets stored exclusively in `.env` variables (`VITE_FIREBASE_API_KEY`).
* **Protected Routes:** All routes under `AppLayout` require valid `currentUser` auth state and role authorization.
* **Code Splitting:** Route-level dynamic imports (`React.lazy()`) for heavy feature views like Reports and Calendar.
