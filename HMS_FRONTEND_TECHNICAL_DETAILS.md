# HMS Frontend: Technical Deep Dive

This document provides an exhaustive technical reference for the core infrastructure of the HMS frontend, including detailed breakdowns of security guards, interceptors, and every service file.

## 🔒 Security Infrastructure

### 🛡️ `auth.guard.ts` (Authentication Guard)
A functional guard that ensures users are logged in before accessing protected routes.
- **`isAuthenticated()` Check**: Uses `AuthService` to verify the presence of a valid session/token.
- **Return URL Storage**: Automatically captures the attempted path in `queryParams`. After login, the system uses this to redirect the user back to their intended destination.
- **Mandatory Password Change**: Checks the `requirePasswordChange` flag. If `true`, it overrides normal navigation and redirects the user to `/auth/change-password`.

### 🛡️ `role.guard.ts` (Role-Based Authorization)
A flexible guard factory that enforces Role-Based Access Control (RBAC).
- **Allowed Roles**: Accepts an array of `UserRole` (ADMIN, STAFF, CUSTOMER).
- **Cross-Role Redirection**: If a user is logged in but attempts to access a route belonging to another role, the guard redirects them to their respective role's dashboard (e.g., a Customer trying to access Admin pages is sent to `/customer/home`).

### ⚙️ `auth.interceptor.ts` (HTTP Interceptor)
A functional interceptor that handles the global attachment of security credentials.
- **Bearer Token Injection**: Retrieves the JWT from `localStorage` via the `AuthService`.
- **Request Cloning**: Clones every outgoing `HttpRequest` and injects the `Authorization: Bearer <token>` header, ensuring stateless authentication with the Spring Boot backend.

---

## 🛠️ Core Infrastructure Services

### `ApiService.ts`
The base communication layer that abstracts Angular's `HttpClient`.
- **Standardized Methods**: `get`, `post`, `put`, `delete`, `patch`.
- **Global Error Handling**: `handleError` maps backend exceptions into consistent JavaScript `Error` objects with user-friendly messages.
- **Base URL Injection**: Automatically prepends the `API_BASE_URL` to all endpoints.

### `AuthService.ts`
Manages the entire user lifecycle and session state.
- **Reactive State**: Exposes `currentUser$` as an `Observable` based on a `BehaviorSubject`.
- **Session Management**: Handles `localStorage` persistence for both the `User` object and the `JWT` string.
- **Security Logic**: Includes `isAuthenticated()`, `setSession()`, and `clearSession()`.
- **Auth Endpoints**: Wraps `/auth/login`, `/auth/register`, `/auth/logout`, and `/users/change-password`.

### `ToastService.ts`
A reactive notification system.
- **Toast Queue**: Uses a `Subject<Toast>` to broadcast notifications app-wide.
- **Severity Levels**: Provides `success()`, `error()`, `warning()`, and `info()` methods with customizable durations.

---

## 🔐 JWT & LocalStorage Management

The application uses `localStorage` for persistent authentication. This ensures that users remain logged in even after refreshing the browser or closing the tab.

### 📁 Responsible Files
1.  **`src/app/core/services/auth.service.ts`**: The "Manager". It contains the logic for reading from, writing to, and clearing `localStorage`.
2.  **`src/app/core/interceptors/auth.interceptor.ts`**: The "Consumer". It retrieves the token from the manager and injects it into HTTP headers.
3.  **`src/app/shared/utils/constants.ts`**: The "configuraion". It defines the specific keys used to identify data in the browser's storage.

### 💾 Stored Data Details
The system maintains two primary items in the browser's `localStorage`:

| Data Item | Storage Key | Content Description |
| :--- | :--- | :--- |
| **JWT Token** | `hms_auth_token` | The raw encoded JWT string received from the Spring Boot backend. |
| **User Profile** | `hms_user_data` | A JSON-stringified object containing `userId`, `username`, `fullName`, `email`, and `role`. |

### 🔄 JWT Lifecycle
1.  **Acquisition**: Upon a successful POST request to `/api/v1/auth/login`, the backend returns a JWT.
2.  **Persistence**: `AuthService.setSession()` is called, which executes `localStorage.setItem()` for both the token and the user object.
3.  **Automatic usage**: Every time a component uses `HttpClient`, the `authInterceptor` triggers. It calls `authService.getToken()`, which reads from `localStorage` and attaches it as a `Bearer` token.
4.  **Security Checks**: `AuthGuard` and `RoleGuard` check the `AuthService`, which in turn verifies the current state against the stored `localStorage` values.
5.  **Termination**: When `AuthService.logout()` is called, `localStorage.removeItem()` is executed for all keys, instantly revoking the browser's access.

---

## 🏗️ Feature-Specific Services

### `AdminService.ts`
The central hub for administrative dashboard logic.
- **Metrics**: `getDashboardStats()` for high-level summaries.
- **Complaints**: Orchestrates the multi-role complaint lifecycle (`assignComplaint`, `resolveComplaint`).

### `AdminRoomService.ts`
Exhaustive management of the hotel's room inventory.
- **Inventory CRUD**: Full Create, Read, Update functionality for `Room` entities.
- **Bulk Operations**: `bulkImportRooms(file)` handles CSV parsing and server-side ingestion.
- **Asset Logic**: `downloadTemplate()` retrieves the sample CSV for bulk operations.

### `AdminReservationService.ts`
Advanced control over bookings across the entire hotel.
- **Search & Filter**: `getReservations()` with complex parameters for date ranges, status, and room types.
- **Direct Control**: `createReservation()`, `updateReservation()`, and `cancelReservation()` by an authority.

### `AdminBillService.ts`
Financial management and oversight.
- **Oversight**: `getAllBills()` with advanced filtering for payment status and amount ranges.
- **Transaction Logic**: `generateBill()`, `markBillAsPaid()`, and `addBillItem()`.

### `AdminUserService.ts`
Complete user database management.
- **RBAC Management**: Create and update users with specific roles and statuses.
- **Security Actions**: `resetPassword()`, `activateUser()`, and `deactivateUser()`.

### `BookingService.ts`
Coordinates the guest-facing reservation workflow.
- **Workflow**: `createReservation()` -> `confirmPayment()`.
- **Guest Control**: `getMyBookings()`, `modifyReservation()`, and `cancelReservation()`.

### `ComplaintService.ts` & `CustomerService.ts`
Handle the guest's interaction with the hotel staff.
- **Registration**: `registerComplaint()` (in `ComplaintService`) and `createComplaint()` (in `CustomerService`).
- **Profile**: `CustomerService.updateProfile()` handles guest account updates.

### `StaffService.ts`
Specialized for hotel employees.
- **Work Queue**: `getMyComplaints()` filters by the assigned staff member.
- **Action Logs**: `addAction()` and `updateStatus()` provide audit trails for issue resolution.

### `InvoiceService.ts`
Client-side document generation utility.
- **PDF Engine**: Uses `jsPDF` and `jspdf-autotable`.
- **Logic**: Transforms `Reservation` data into a professional invoice with detailed line items for base price, tax, and discounts.
