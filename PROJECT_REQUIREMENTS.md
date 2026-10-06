# Project Requirements Document: JobFlow — Smart Job Scheduling System

---

## 1. Product Overview

### 1.1 Product Name
**JobFlow — Smart Job Scheduling System**

### 1.2 Purpose
JobFlow is an enterprise-grade, cloud-native Job Scheduling and Workforce Management Software-as-a-Service (SaaS) application designed to streamline job creation, assignment, scheduling, tracking, and analytics. It bridges the operational gap between management teams and frontline personnel by enabling real-time task coordination, schedule conflict resolution, transparent job progression, and operational reporting.

### 1.3 Target Users
* **Service Organizations & Field Teams:** Maintenance, HVAC, plumbing, IT field service, logistics, and facilities management companies.
* **Internal Operations & Project Teams:** Corporate departments managing multi-step internal tasks, equipment deployments, and cross-functional operational workflows.
* **Team Leads & Operations Managers:** Supervisors who schedule, dispatch, monitor, and audit daily operations.

### 1.4 Main Business Problems Solved
1. **Schedule Conflicts & Double-Booking:** Eliminates overlapping worker assignments via automated client-side conflict checking and visual calendar management.
2. **Lack of Operational Visibility:** Provides real-time job status tracking (Pending → Scheduled → In Progress → Completed / Overdue) across desktop and mobile devices.
3. **Inefficient Dispatch & Communication:** Reduces phone calls and message lag by providing instant activity logs and target notifications for assignments and schedule updates.
4. **Poor Accountability & Auditability:** Captures complete historical activity timelines for every job modification, user reassignment, and status transition.
5. **Data Silos & Weak Reporting:** Aggregates operational performance metrics into visual dashboards and exportable report summaries.

### 1.5 Key Features
* Role-based access control (Administrator, Manager, Employee).
* Comprehensive Job Management (CRUD, priority matrix, status pipeline, search/filter/sort).
* Interactive multi-view Calendar (Month, Week, Day, Agenda/List) with drag-and-drop rescheduling.
* Real-time Dashboard with KPI cards, completion metrics, and Recharts visualization.
* User Management with role assignment and account state handling.
* Granular Activity History & In-App Notification hub.
* Secure Firebase integration (Firebase Auth, Cloud Firestore, Security Rules).
* Automated client-side data validation using Zod and React Hook Form.

---

## 2. User Roles & Permissions Matrix

JobFlow enforces strict Role-Based Access Control (RBAC) across both the client-side UI and Firestore Security Rules.

### 2.1 Administrator
* **Scope:** Full system governance.
* **Capabilities:**
  * Create, view, update, deactivate, and manage all system users.
  * Assign and change user roles (Administrator, Manager, Employee).
  * Full Job Management: Create, edit, reassign, reschedule, and delete any job.
  * System-wide calendar and multi-employee schedule overview.
  * View complete system reports, audit analytics, and system settings.
  * Access system activity history logs.

### 2.2 Manager
* **Scope:** Operational management and team supervision.
* **Capabilities:**
  * Create, edit, assign, reassign, and reschedule jobs within their department/scope.
  * Update job status and priorities.
  * View team-wide calendar, employee availability, and conflict warnings.
  * View operational reports, job completion rates, and team analytics.
  * Access job activity history.
  * **Restrictions:** Cannot manage users, alter user roles, delete system-critical logs, or access Administrator system settings.

### 2.3 Employee
* **Scope:** Individual workload execution.
* **Capabilities:**
  * View personal job assignments, daily/weekly schedules, and job details.
  * Update assigned job status (e.g., transition from `scheduled` → `in_progress` → `completed`).
  * Add notes or completion remarks to assigned jobs.
  * Receive notifications regarding new assignments or job modifications.
  * **Restrictions:** Cannot create, edit (other than status/notes), reschedule, or delete jobs; cannot reassign jobs; cannot view other employees' restricted data; cannot access User Management, System Reports, or System Settings.

---

## 3. Job Management Specification

### 3.1 Job Data Entity Schema

| Field Name | Type | Description / Constraints |
| :--- | :--- | :--- |
| `id` | `string` | Unique document identifier (Firestore generated UID) |
| `title` | `string` | Job summary title (Required, 3-100 characters) |
| `description` | `string` | Detailed instructions and location/notes (Required) |
| `assignedTo` | `string` (UID) \| `null` | References `users` collection UID |
| `assignedToName`| `string` \| `null` | Denormalized employee full name for fast rendering |
| `createdBy` | `string` (UID) | References `users` collection UID (Creator) |
| `createdByName` | `string` | Denormalized creator full name |
| `priority` | `enum` | `'low' \| 'medium' \| 'high' \| 'critical'` |
| `status` | `enum` | `'pending' \| 'scheduled' \| 'in_progress' \| 'completed' \| 'cancelled' \| 'overdue'` |
| `startTime` | `string` (ISO 8601) | Planned start date and time |
| `endTime` | `string` (ISO 8601) | Planned end date and time (`endTime` > `startTime`) |
| `createdAt` | `string` (ISO 8601) | Document creation timestamp |
| `updatedAt` | `string` (ISO 8601) | Document last modification timestamp |

### 3.2 Priorities Definition
* `low`: Non-urgent tasks with loose deadlines (Visual badge: Blue / Slate).
* `medium`: Normal operational tasks (Visual badge: Emerald / Green).
* `high`: Urgent tasks requiring prompt scheduling (Visual badge: Amber / Orange).
* `critical`: High-impact emergencies requiring immediate attention (Visual badge: Red / Rose).

### 3.3 Statuses Definition & Lifecycle
```
                 ┌──────────────┐
                 │   pending    │
                 └──────┬───────┘
                        │ (Assign & Schedule)
                        ▼
                 ┌──────────────┐
  ┌─────────────►│  scheduled   │◄─────────────┐
  │              └──────┬───────┘              │
  │                     │ (Work Begins)        │ (Reschedule)
  │                     ▼                      │
  │              ┌──────────────┐              │
  │              │ in_progress  │              │
  │              └──────┬───────┘              │
  │                     │                      │
  │          ┌──────────┴──────────┐           │
  │          ▼                     ▼           │
  │   ┌─────────────┐       ┌─────────────┐    │
  │   │  completed  │       │  cancelled  │    │
  │   └─────────────┘       └─────────────┘    │
  │                                            │
  └───────────────── (overdue) ────────────────┘
   (Automatically flagged if `endTime` < Now && status != `completed`)
```

### 3.4 Functional Requirements for Job Management
* **Create Job:** Accessible to Admin/Manager. Modal/Form validated via Zod schema.
* **View Jobs:** Tabular list view and Kanban/Grid views with pagination or virtual scrolling.
* **Edit Job:** Accessible to Admin/Manager. Full field editing capability.
* **Delete Job:** Destructive action restricted to Admin. Requires explicit modal confirmation prompt.
* **Assign / Reassign Job:** Update `assignedTo` field; instantly updates activity log and dispatches notification.
* **Reschedule Job:** Update `startTime` / `endTime` with automatic schedule overlap verification.
* **Status & Priority Shifts:** Single-click inline dropdown or action button transitions.
* **Search, Filter & Sort:**
  * **Search:** Free-text indexing across `title`, `description`, and `assignedToName`.
  * **Filter:** Filter by `status`, `priority`, `assignedTo`, date ranges.
  * **Sort:** Multi-column sorting by `startTime`, `priority`, `status`, and `createdAt`.
* **State Management Handling:** Explicit visual handling for loading skeletons, empty state illustrations, and clean error alert banners.

---

## 4. Scheduling & Calendar Requirements

### 4.1 Views & Layouts
1. **Monthly View:** High-level overview of job density across the calendar month.
2. **Weekly View:** Time-grid view detailing hour-by-hour employee workload.
3. **Daily View:** Granular schedule breakdown per employee for the active day.
4. **Agenda / List View:** Chronological list view optimized for mobile devices and quick scanning.

### 4.2 Interactive Functionality
* **Drag-and-Drop Rescheduling:** Admins and Managers can drag job blocks on Week/Day/Month views to update `startTime` and `endTime` automatically.
* **Time Duration Adjustments:** Interactive edge handles on calendar events to modify event duration.
* **Conflict Detection Engine:**
  * Client-side utility verifies whether the target `assignedTo` user already has an active job where `(newStart < existingEnd) AND (newEnd > existingStart)`.
  * Warns the user with a modal banner before final save, allowing force-override (Admin) or cancellation.
* **Timezone Standard:** All timestamps stored in ISO 8601 UTC string format and rendered in the client browser's local timezone.

---

## 5. Dashboard Specification

The JobFlow Dashboard serves as the central command hub, providing real-time data visualizers and key metrics driven directly by Firestore queries.

### 5.1 Key Performance Indicators (KPI Cards)
1. **Total Jobs:** Aggregate count of non-deleted jobs.
2. **Scheduled Jobs:** Count of jobs in `scheduled` status.
3. **In-Progress Jobs:** Count of jobs actively undergoing work (`in_progress`).
4. **Completed Jobs:** Count of jobs marked `completed`.
5. **Overdue Jobs:** Count of jobs where `endTime` < current timestamp and status != `completed`.
6. **Cancelled Jobs:** Count of jobs marked `cancelled`.
7. **Completion Rate:** Percentage metric calculated as `(Completed Jobs / Total Non-Cancelled Jobs) * 100`.

### 5.2 Data Visualization Widgets (Recharts)
* **Jobs by Status:** Pie/Donut Chart visualizing distribution across Pending, Scheduled, In Progress, Completed, Overdue, Cancelled.
* **Jobs by Priority:** Bar Chart showing work breakdown across Low, Medium, High, and Critical priorities.
* **Employee Workload Distribution:** Horizontal Bar Chart comparing active job assignments per employee.
* **Completion Trend over Time:** Area/Line Chart displaying job completions per day/week.

### 5.3 Operational Feed Sections
* **Upcoming Jobs List:** Interactive preview of the next 5 scheduled jobs.
* **Recent Activity Log Widget:** Streaming list of the 8 most recent activity actions.

---

## 6. Authentication & Access Control

### 6.1 Authentication Mechanism
* **Provider:** Firebase Authentication (Email / Password).
* **State Persistence:** Local storage session persistence managed via Firebase SDK auth listener (`onAuthStateChanged`).

### 6.2 Authentication Flows
* **Login:** Email and password input with client-side Zod validation and structured Firebase Auth error handling (e.g., `auth/user-not-found`, `auth/wrong-password`).
* **Logout:** Invalidation of active Firebase session with redirect to `/login`.
* **Password Reset:** Email-based password reset link dispatch via Firebase Auth (`sendPasswordResetEmail`).

### 6.3 Routing & Protection
* **Protected Routes Component:** Wraps private views. Unauthenticated users are redirected to `/login` with location memory.
* **Role-Based Authorization Wrapper:** Restricts routes and UI actions according to the authenticated user's custom user profile role stored in Firestore.

---

## 7. Application Page Structures

| Page Route | Page Title | Allowed Roles | Core Functionality |
| :--- | :--- | :--- | :--- |
| `/login` | Login | Public | User authentication and password recovery |
| `/dashboard` | Dashboard | Admin, Manager, Employee | Analytical KPIs, overview charts, upcoming jobs feed |
| `/jobs` | Job Management | Admin, Manager, Employee | Tabular job list, search, filter, job creation/edit triggers |
| `/jobs/:id` | Job Details | Admin, Manager, Employee | Deep view of job details, assignment timeline, status history |
| `/calendar` | Schedule Calendar | Admin, Manager, Employee | FullCalendar view (Month, Week, Day, Agenda) |
| `/users` | User Directory | Admin | Manage user accounts, status, and role assignments |
| `/reports` | Analytics & Reports| Admin, Manager | Exportable analytics, date-range job metrics, performance charts |
| `/settings` | System Settings | Admin, Manager, Employee | Personal profile preferences, theme toggles, notification settings |
| `*` | 404 Not Found | Public | Friendly fallback page with navigation actions |

---

## 8. User Management System

### 8.1 User Profile Entity Schema

| Field | Type | Description |
| :--- | :--- | :--- |
| `uid` | `string` | Primary key matching Firebase Auth UID |
| `email` | `string` | User email address |
| `displayName` | `string` | Full name of the user |
| `role` | `enum` | `'admin' \| 'manager' \| 'employee'` |
| `department` | `string` | Assigned organizational unit |
| `status` | `enum` | `'active' \| 'inactive'` |
| `createdAt` | `string` | Profile creation ISO date |

### 8.2 User Management Capabilities
* **User Listing:** Datatable featuring search by name/email, role filtering, and status filtering.
* **Account Creation / Provisioning:** Admin tool to provision user accounts and initialize default profiles in Firestore.
* **Role Modification:** Instant role reassignment with immediate permission updates.
* **Deactivation:** Soft-delete mechanism toggling status to `inactive` to block application access.

---

## 9. Reports & Analytics Specification

### 9.1 Report Metrics Breakdown
* Job volume metrics (Total, Completed, Pending, Overdue, Cancelled).
* SLA & Completion rate calculations.
* Employee performance metrics (Jobs assigned vs. jobs completed on time).
* Average job completion duration.

### 9.2 Filtering Parameters
* **Quick Filters:** Today, This Week, This Month, This Quarter.
* **Custom Range:** Datepicker for start date and end date selection.
* **Dimensions:** Filter report metrics by specific Employee or Priority level.

---

## 10. Activity History Specification

To ensure auditability, JobFlow automatically generates an activity record in the `activities` collection whenever key events occur.

### 10.1 Activity Document Schema
* `id` (`string`): Unique activity ID.
* `jobId` (`string` | `null`): Associated job UID if applicable.
* `performedBy` (`string`): UID of the user initiating the action.
* `performedByName` (`string`): Full name of the acting user.
* `actionType` (`enum`): `job_created` | `job_updated` | `job_assigned` | `job_rescheduled` | `status_changed` | `priority_changed` | `job_deleted` | `user_updated`.
* `details` (`string`): Human-readable summary of the action (e.g., *"John Doe updated status from Scheduled to In Progress"*).
* `timestamp` (`string`): ISO 8601 timestamp.

---

## 11. In-App Notification System

### 11.1 Notification Triggers
* **Assignment:** Sent to Employee when a job is assigned or reassigned to them.
* **Schedule Change:** Sent to Employee when job `startTime` or `endTime` is modified.
* **Status Update:** Sent to Manager/Admin when a job is marked `completed` or `cancelled`.
* **Upcoming Alert:** Triggered for jobs starting within 1 hour.

### 11.2 Notification Schema
* `id` (`string`): Document ID.
* `recipientId` (`string`): Target user UID.
* `title` (`string`): Short summary header.
* `message` (`string`): Detailed notification context.
* `link` (`string`): Route URL to redirect upon click (e.g., `/jobs/JOB-123`).
* `read` (`boolean`): Read/unread flag.
* `createdAt` (`string`): ISO timestamp.

---

## 12. Database Architecture (Cloud Firestore)

### 12.1 Firestore Collections Summary

```
Firestore Root
 ├── users/ {uid}
 ├── jobs/ {jobId}
 ├── activities/ {activityId}
 └── notifications/ {notificationId}
```

#### Collection: `users`
* **Purpose:** Stores user profiles and RBAC role classifications.
* **Document ID:** Firebase Auth `uid`.
* **Key Fields:** `email`, `displayName`, `role`, `department`, `status`, `createdAt`.

#### Collection: `jobs`
* **Purpose:** Main repository for job records.
* **Document ID:** Auto-generated Firestore document ID.
* **Key Fields:** `title`, `description`, `assignedTo`, `assignedToName`, `createdBy`, `priority`, `status`, `startTime`, `endTime`, `createdAt`, `updatedAt`.

#### Collection: `activities`
* **Purpose:** Immutable audit trial of system operations.
* **Document ID:** Auto-generated document ID.
* **Key Fields:** `jobId`, `performedBy`, `performedByName`, `actionType`, `details`, `timestamp`.

#### Collection: `notifications`
* **Purpose:** User notifications repository.
* **Document ID:** Auto-generated document ID.
* **Key Fields:** `recipientId`, `title`, `message`, `link`, `read`, `createdAt`.

---

## 13. Security Architecture & Rules

### 13.1 Authentication & Secrets
* Store Firebase config keys in `.env` variables (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc.).
* Enforce `.gitignore` rules to prevent credentials from entering Git repositories.

### 13.2 Firestore Security Principles
* **Default Deny:** All unauthenticated access is strictly blocked.
* **Role Verification:** Security rules query `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role` to validate permissions.
* **Access Rules:**
  * `users`: Admins read/write all. Users read their own profile.
  * `jobs`: Admins and Managers read/write all. Employees read jobs assigned to them, and update `status` / `updatedAt` on assigned jobs.
  * `activities`: Authenticated users create activity logs; read access governed by role.
  * `notifications`: Users read/update `read` status where `recipientId == request.auth.uid`.

---

## 14. UI/UX Design System Specification

### 14.1 Design Philosophy
JobFlow adopts a modern, restrained, professional SaaS design aesthetic inspired by high-end enterprise platforms (e.g., Stripe Dashboard, Linear, Vercel).

### 14.2 Color Palette & Styling Tokens
* **Base Neutral:** Slate / Zinc shades (`bg-slate-50` light background, `bg-slate-900` dark sidebar, `text-slate-900` primary typography, `border-slate-200` subtle borders).
* **Primary Brand Accent:** Indigo / Sapphire (`bg-indigo-600`, `hover:bg-indigo-700`, `text-indigo-600`).
* **Status Colors:**
  * Pending: Slate (`bg-slate-100`, `text-slate-700`)
  * Scheduled: Blue (`bg-blue-50`, `text-blue-700`)
  * In Progress: Amber (`bg-amber-50`, `text-amber-700`)
  * Completed: Emerald (`bg-emerald-50`, `text-emerald-700`)
  * Cancelled: Rose (`bg-rose-50`, `text-rose-700`)
  * Overdue: Red (`bg-red-100`, `text-red-800`, animated pulse badge)
* **Shadows & Elevation:** Subtle, restrained drop shadows (`shadow-sm`, `shadow-md` for popovers/modals).
* **Typography:** Clean sans-serif font stack (`Inter`, `system-ui`) with strict scale and weight hierarchy.

### 14.3 Component Standards
* **Layout Structure:** Collapsible left sidebar navigation + top header with breadcrumbs, user profile dropdown, and notification badge.
* **Data Tables:** Hoverable rows, status pill badges, column sorting indicators, pagination bar, responsive scroll container.
* **Forms & Inputs:** Floating/labeled inputs, inline validation error text in red, accessible focus rings (`focus:ring-2 focus:ring-indigo-500`).
* **Modal Dialogs:** Backdrop blur overlay, keyboard ESC dismissal, focus trapping, clear action vs. cancel buttons.

---

## 15. Technology Stack Specification

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18+ | Component-based UI engine |
| **Language** | TypeScript 5+ | Static type checker and schema contract enforcer |
| **Build System** | Vite | Ultra-fast HMR and bundling |
| **Styling** | Tailwind CSS v3+ | Utility-first responsive design framework |
| **Routing** | React Router v6+ | Client-side routing and protected navigation |
| **Backend & Auth** | Firebase (Auth & Firestore) | Serverless database, authentication & security rules |
| **Calendar Engine** | FullCalendar (`@fullcalendar/react`) | Multi-view interactive calendar component |
| **Form Management** | React Hook Form | High-performance form state handling |
| **Validation** | Zod | Runtime schema validation |
| **Data Visualization** | Recharts | Composable SVG chart visualizers |
| **Icons** | Lucide React | Modern, clean iconography |
| **Unit Testing** | Vitest + React Testing Library | Fast unit and component test runner |
| **E2E Testing** | Playwright | End-to-end user workflow verification |
| **Hosting** | Firebase Hosting | Production CDN static hosting |

---

## 16. Testing Strategy

### 16.1 Unit & Component Testing (Vitest)
* Form schema validation unit tests (Zod schema boundary tests).
* Helper utility testing (Conflict detection engine, date formatters, status calculation).
* Isolated component testing (KPI Cards, Badge rendering, Modal behavior).

### 16.2 Integration & Role Permission Testing
* Route guard testing for Admin, Manager, and Employee roles.
* RBAC UI element visibility testing (e.g., verifying Employee cannot view "Create Job" button).

### 16.3 End-to-End Testing (Playwright)
* Authentication workflow (Login → Dashboard load → Logout).
* Job Lifecycle flow (Create Job → Schedule on Calendar → Update Status → Complete Job).
* Responsive layout verification on Mobile (iPhone viewport) and Desktop viewports.

---

## 17. Deployment Requirements

### 17.1 Production Environment Setup
* Configuration of `.env.production` containing production Firebase project keys.
* Setup of `firebase.json` for Firebase Hosting SPA rewrite rules (`"destination": "/index.html"`).

### 17.2 Build Verification & Pipeline Checks
* Type check step: `tsc --noEmit` must return 0 errors.
* Linting step: `eslint` verification.
* Unit test execution: `vitest run` must pass 100%.
* Production bundle compilation: `vite build` must generate clean static assets.

---

## 18. Non-Functional Requirements

1. **Performance:** First Contentful Paint (FCP) < 1.2s; LightHouse Performance score > 90.
2. **Accessibility (a11y):** WCAG 2.1 Level AA compliance; semantic HTML5 elements; accessible contrast ratios (>= 4.5:1 for normal text); full keyboard navigation.
3. **Security:** Zero plaintext credentials; strict Firestore Security Rules; protected routes; inputs sanitized against XSS.
4. **Maintainability:** Modular directory structure; strict TypeScript interfaces; centralized custom hooks for data fetching.
5. **Responsiveness:** Seamless layout adapting across Mobile (<640px), Tablet (640px-1024px), and Desktop (>1024px).
6. **Browser Compatibility:** Chrome, Edge, Safari, Firefox (latest 2 versions).
