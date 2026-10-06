# Database Schema & Firestore Architecture — JobFlow

---

## 1. Cloud Firestore Collection Structure

```
Firestore Root
 ├── users/ {uid}
 ├── jobs/ {jobId}
 ├── activities/ {activityId}
 └── notifications/ {notificationId}
```

---

## 2. Detailed Collection Schemas

### 2.1 Collection: `users`
Stores user profile information and RBAC authorization roles.

| Field Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `uid` | `string` | Yes | Primary Document ID matching Firebase Auth UID |
| `email` | `string` | Yes | User email address |
| `displayName` | `string` | Yes | User full name |
| `role` | `string` (Enum) | Yes | `'admin' \| 'manager' \| 'employee'` |
| `department` | `string` | Yes | Organizational department (e.g. "Field Operations") |
| `status` | `string` (Enum) | Yes | `'active' \| 'inactive'` |
| `createdAt` | `string` (ISO) | Yes | Account creation timestamp |
| `avatarUrl` | `string` | No | Optional profile avatar URL |

---

### 2.2 Collection: `jobs`
Main document repository for job records and schedule items.

| Field Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Primary Document ID (Auto-generated UID) |
| `title` | `string` | Yes | Summary title of the job |
| `description` | `string` | Yes | Detailed description and instructions |
| `assignedTo` | `string` \| `null` | No | Assigned user UID (references `users.uid`) |
| `assignedToName`| `string` \| `null` | No | Denormalized full name for fast rendering |
| `createdBy` | `string` | Yes | Creator user UID |
| `createdByName` | `string` | Yes | Denormalized creator name |
| `priority` | `string` (Enum) | Yes | `'low' \| 'medium' \| 'high' \| 'critical'` |
| `status` | `string` (Enum) | Yes | `'pending' \| 'scheduled' \| 'in_progress' \| 'completed' \| 'cancelled' \| 'overdue'` |
| `startTime` | `string` (ISO) | Yes | Scheduled job start timestamp |
| `endTime` | `string` (ISO) | Yes | Scheduled job end timestamp |
| `createdAt` | `string` (ISO) | Yes | Record creation timestamp |
| `updatedAt` | `string` (ISO) | Yes | Record update timestamp |
| `location` | `string` | No | Optional job physical address/site |
| `notes` | `string` | No | Execution or completion notes |

---

### 2.3 Collection: `activities`
Stores audit history records of operations performed in the system.

| Field Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Document ID |
| `jobId` | `string` \| `null` | No | Target job UID if applicable |
| `performedBy` | `string` | Yes | Actor user UID |
| `performedByName` | `string` | Yes | Actor user full name |
| `actionType` | `string` (Enum) | Yes | `job_created` \| `job_updated` \| `job_assigned` \| `job_rescheduled` \| `status_changed` \| `priority_changed` \| `job_deleted` \| `user_updated` |
| `details` | `string` | Yes | Human-readable log message |
| `timestamp` | `string` (ISO) | Yes | Action execution timestamp |

---

### 2.4 Collection: `notifications`
In-app user notifications repository.

| Field Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Document ID |
| `recipientId` | `string` | Yes | Target user UID |
| `title` | `string` | Yes | Short header summary |
| `message` | `string` | Yes | Notification context |
| `link` | `string` | Yes | Application route link |
| `read` | `boolean` | Yes | Read/unread flag |
| `createdAt` | `string` (ISO) | Yes | Creation timestamp |

---

## 3. Firestore Indexing Strategy

To support fast querying and analytical dashboards, the following Firestore composite indexes are defined:

1. **`jobs` Index 1:** `assignedTo` (ASC) + `status` (ASC) + `startTime` (ASC)
2. **`jobs` Index 2:** `status` (ASC) + `priority` (ASC) + `createdAt` (DESC)
3. **`activities` Index 1:** `timestamp` (DESC)
4. **`notifications` Index 1:** `recipientId` (ASC) + `read` (ASC) + `createdAt` (DESC)

---

## 4. Firestore Security Rules Specification

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check authentication
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to fetch current user profile role
    aria getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && getUserRole() == 'admin';
    }

    match /jobs/{jobId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAuthenticated() && (getUserRole() == 'admin' || getUserRole() == 'manager');
      // Employees can update status & notes on assigned jobs
      allow update: if isAuthenticated() && getUserRole() == 'employee' && resource.data.assignedTo == request.auth.uid;
    }

    match /activities/{activityId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
    }

    match /notifications/{notifId} {
      allow read, update: if isAuthenticated() && resource.data.recipientId == request.auth.uid;
      allow create: if isAuthenticated();
    }
  }
}
```
