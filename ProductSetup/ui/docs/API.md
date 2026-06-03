# API Documentation

This document describes all available mock API endpoints for the Credit Card Product Setup application.

---

## Table of Contents

- [Product Records API](#product-records-api)
- [Authentication API](#authentication-api)
- [System Approvals API](#system-approvals-api)

---

## Product Records API

**Service:** `src/services/mock-api.ts`

Manages product configuration records including submission, retrieval, approval, and deletion.

### `submitProduct`

Submits a new product configuration for review.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `productData` | `ProductData` | Yes | The product configuration data |
| `userId` | `string` | No | ID of the submitting user |
| `userEmail` | `string` | No | Email of the submitting user |

**Response:** `Promise<ProductRecord>`

```typescript
{
  id: string;              // Unique record ID (e.g., "prod_1234567890_abc123")
  productData: ProductData;
  status: "pending";       // Always "pending" on creation
  createdAt: string;       // ISO 8601 timestamp
  updatedAt: string;       // ISO 8601 timestamp
  submittedBy: string;     // User email or "User"
  submittedByUserId?: string;
}
```

**Example:**
```typescript
const record = await mockApi.submitProduct(
  {
    productName: "Premium Card",
    brands: ["lloyds", "halifax"],
    additionalCardholders: 3,
    features: [...],
    externalSystems: [...]
  },
  "user-123",
  "user@lloyds.com"
);
```

---

### `getAllRecords`

Retrieves all product records.

**Parameters:** None

**Response:** `Promise<ProductRecord[]>`

**Example:**
```typescript
const records = await mockApi.getAllRecords();
```

---

### `getRecordsByUser`

Retrieves product records submitted by a specific user.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userId` | `string` | Yes | The user ID to filter by |

**Response:** `Promise<ProductRecord[]>`

**Example:**
```typescript
const myRecords = await mockApi.getRecordsByUser("user-123");
```

---

### `getRecordsByStatus`

Retrieves product records filtered by status.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `status` | `RecordStatus` | Yes | One of: `"pending"`, `"approved"`, `"rejected"` |

**Response:** `Promise<ProductRecord[]>`

**Example:**
```typescript
const pendingRecords = await mockApi.getRecordsByStatus("pending");
const approvedRecords = await mockApi.getRecordsByStatus("approved");
```

---

### `getRecordById`

Retrieves a single product record by ID.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | Yes | The record ID |

**Response:** `Promise<ProductRecord | null>`

Returns `null` if record not found.

**Example:**
```typescript
const record = await mockApi.getRecordById("prod_1234567890_abc123");
if (record) {
  console.log(record.productData.productName);
}
```

---

### `updateRecordStatus`

Updates the status of a product record (approve/reject).

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | Yes | The record ID |
| `status` | `RecordStatus` | Yes | New status: `"pending"`, `"approved"`, `"rejected"` |
| `reviewerEmail` | `string` | No | Email of the reviewer |
| `reviewNotes` | `string` | No | Notes about the review decision |

**Response:** `Promise<ProductRecord | null>`

Returns `null` if record not found.

**Example:**
```typescript
const updated = await mockApi.updateRecordStatus(
  "prod_123",
  "approved",
  "manager@lloyds.com",
  "Approved for production deployment"
);
```

---

### `deleteRecord`

Deletes a product record.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | Yes | The record ID to delete |

**Response:** `Promise<boolean>`

Returns `true` if deleted, `false` if not found.

**Example:**
```typescript
const deleted = await mockApi.deleteRecord("prod_123");
```

---

## Authentication API

**Service:** `src/services/mock-auth-service.ts`

Manages user authentication, registration, and activity logging.

### `getCurrentUser`

Gets the currently logged-in user from session.

**Parameters:** None

**Response:** `AppUser | null`

```typescript
{
  uid: string;
  email: string;
  role: "admin" | "business_manager" | "business_user";
  createdAt: string;
  createdBy?: string;
}
```

**Example:**
```typescript
const user = mockAuthService.getCurrentUser();
if (user) {
  console.log(`Logged in as ${user.email}`);
}
```

---

### `loginAsRole`

Logs in with a predefined demo role.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `role` | `UserRole` | Yes | One of: `"admin"`, `"business_manager"`, `"business_user"` |

**Response:** `Promise<AppUser>`

**Predefined Users:**

| Role | Email |
|------|-------|
| `admin` | admin@lloyds.com |
| `business_manager` | manager@lloyds.com |
| `business_user` | user@lloyds.com |

**Example:**
```typescript
const admin = await mockAuthService.loginAsRole("admin");
```

---

### `login`

Authenticates a user with email and password.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `email` | `string` | Yes | User's email address |
| `password` | `string` | Yes | User's password |

**Response:** `Promise<AppUser>`

**Throws:** `Error("Invalid credentials")` if authentication fails.

**Example:**
```typescript
try {
  const user = await mockAuthService.login("user@example.com", "password123");
} catch (error) {
  console.error("Login failed:", error.message);
}
```

---

### `signup`

Registers a new user account.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `email` | `string` | Yes | User's email address |
| `password` | `string` | Yes | User's password |

**Response:** `Promise<AppUser>`

**Notes:**
- First user to signup becomes `admin`
- Subsequent users become `business_user`

**Throws:** `Error("User already exists")` if email is taken.

**Example:**
```typescript
const newUser = await mockAuthService.signup("new@example.com", "password123");
```

---

### `logout`

Logs out the current user.

**Parameters:** None

**Response:** `Promise<void>`

**Example:**
```typescript
await mockAuthService.logout();
```

---

### `createUser`

Creates a new user account (admin function).

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `email` | `string` | Yes | New user's email |
| `password` | `string` | Yes | New user's password |
| `role` | `UserRole` | Yes | Role to assign |
| `createdBy` | `string` | Yes | UID of creating admin |

**Response:** `Promise<AppUser>`

**Throws:** `Error("User already exists")` if email is taken.

**Example:**
```typescript
const newUser = await mockAuthService.createUser(
  "newuser@lloyds.com",
  "password123",
  "business_user",
  adminUser.uid
);
```

---

### `getAllUsers`

Retrieves all registered users.

**Parameters:** None

**Response:** `Promise<AppUser[]>`

**Example:**
```typescript
const users = await mockAuthService.getAllUsers();
```

---

### `logActivity`

Logs a user activity for audit trail.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userId` | `string` | Yes | ID of the user |
| `userEmail` | `string` | Yes | Email of the user |
| `action` | `string` | Yes | Action name (e.g., "login", "submit_product") |
| `details` | `string` | No | Additional details |
| `page` | `string` | No | Page where action occurred |

**Response:** `Promise<void>`

**Example:**
```typescript
await mockAuthService.logActivity(
  user.uid,
  user.email,
  "submit_product",
  "Submitted Premium Card for review",
  "/dashboard"
);
```

---

### `getActivityLogs`

Retrieves activity logs, optionally filtered by user.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userId` | `string` | No | Filter by user ID |

**Response:** `Promise<ActivityLog[]>`

```typescript
{
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details?: string;
  page?: string;
  timestamp: string;  // ISO 8601, sorted newest first
}
```

**Example:**
```typescript
// Get all logs
const allLogs = await mockAuthService.getActivityLogs();

// Get logs for specific user
const userLogs = await mockAuthService.getActivityLogs("user-123");
```

---

## System Approvals API

**Service:** `src/services/mock-system-approvals.ts`

Manages third-party system integration approvals for approved products.

### `getSystemApprovals`

Gets or creates system approvals for a product record.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `productRecordId` | `string` | Yes | The product record ID |

**Response:** `Promise<ThirdPartySystemApproval[]>`

```typescript
{
  id: string;
  systemName: string;  // e.g., "Core Banking System", "Payment Gateway"
  status: "pending" | "in_review" | "approved" | "rejected";
  lastUpdated: string;  // ISO 8601 timestamp
  updatedBy?: string;
  notes?: string;
}
```

**Notes:**
- Creates 10 system approvals on first call
- Returns existing approvals on subsequent calls

**Third-Party Systems:**
1. Core Banking System
2. Credit Bureau Integration
3. Fraud Detection System
4. Payment Gateway
5. KYC/AML System
6. Card Management System
7. Rewards Platform
8. Statement Generation
9. Mobile Banking API
10. Customer Data Platform

**Example:**
```typescript
const systems = await mockSystemApprovalsApi.getSystemApprovals("prod_123");
console.log(`${systems.length} systems to approve`);
```

---

### `updateSystemStatus`

Updates the approval status of a third-party system.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `productRecordId` | `string` | Yes | The product record ID |
| `systemId` | `string` | Yes | The system approval ID |
| `status` | `SystemApprovalStatus` | Yes | New status |
| `updatedBy` | `string` | No | Who made the update |
| `notes` | `string` | No | Additional notes |

**Status Values:**
- `"pending"` - Not yet reviewed
- `"in_review"` - Currently being reviewed
- `"approved"` - Integration approved
- `"rejected"` - Integration rejected

**Response:** `Promise<ThirdPartySystemApproval | null>`

Returns `null` if product or system not found.

**Example:**
```typescript
const updated = await mockSystemApprovalsApi.updateSystemStatus(
  "prod_123",
  "sys_prod_123_0",
  "approved",
  "admin@lloyds.com",
  "Security audit passed"
);
```

---

## Type Definitions

### ProductData

```typescript
interface ProductData {
  productName: string;
  brands: Brand[];  // "lloyds" | "halifax" | "bos" | "mbna"
  additionalCardholders: number;
  features: ProductFeature[];
  externalSystems: ExternalSystemId[];
}
```

### ProductFeature

```typescript
interface ProductFeature {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  value?: string;
  notes?: string;
  effectiveDate?: string;
  priority?: number;
}
```

### ProductRecord

```typescript
interface ProductRecord {
  id: string;
  productData: ProductData;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
  submittedBy?: string;
  submittedByUserId?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

type RecordStatus = "pending" | "approved" | "rejected";
```

### AppUser

```typescript
interface AppUser {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: string;
  createdBy?: string;
}

type UserRole = "admin" | "business_manager" | "business_user";
```

### ActivityLog

```typescript
interface ActivityLog {
  id?: string;
  userId: string;
  userEmail: string;
  action: string;
  details?: string;
  page?: string;
  timestamp: string;
}
```

---

## Error Handling

All API methods simulate network delays (200-500ms) for realistic behavior.

Common error patterns:

```typescript
// Record not found
const record = await mockApi.getRecordById("invalid-id");
if (!record) {
  console.error("Record not found");
}

// Authentication failure
try {
  await mockAuthService.login("user@example.com", "wrong-password");
} catch (error) {
  console.error(error.message); // "Invalid credentials"
}

// Duplicate user
try {
  await mockAuthService.signup("existing@example.com", "password");
} catch (error) {
  console.error(error.message); // "User already exists"
}
```

---

## Storage

All data is persisted in `localStorage` with the following keys:

| Key | Description |
|-----|-------------|
| `product_records` | Product submission records |
| `mock_users` | Registered user accounts |
| `mock_current_user` | Currently logged-in user |
| `mock_activity_logs` | Activity audit trail |
| `system_approvals` | Third-party system approvals |

To reset all data, clear localStorage:
```typescript
localStorage.clear();
```
