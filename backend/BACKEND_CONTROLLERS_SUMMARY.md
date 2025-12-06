# Backend Controllers Summary

This document provides a comprehensive overview of all backend controllers, their endpoints, validation schemas, authentication requirements, and functionality.

---

## 1. Auth Controller (`authController.js`)

### Purpose
Handles user authentication, registration, and token verification.

### Endpoints

#### `POST /api/auth/register`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "name": "string (min 2 chars)",
    "email": "valid email",
    "password": "string (min 6 chars)",
    "role": "STUDENT | ORGANIZER | ADMIN",
    "collegeId": "number or string"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "message": "User registered",
    "token": "JWT token",
    "user": { ... }
  }
  ```
- **Features**:
  - Validates college exists
  - Checks email uniqueness
  - Hashes password with bcrypt (12 rounds)
  - Returns JWT token
  - Returns user with college info

#### `POST /api/auth/login`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "valid email",
    "password": "string"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "message": "Login successful",
    "token": "JWT token",
    "user": { ... }
  }
  ```
- **Features**:
  - Validates credentials
  - Returns JWT token
  - Returns user (without password)

#### `GET /api/auth/me`
- **Auth Required**: Yes (via `authMiddleware`)
- **Response**: `200 OK`
  ```json
  {
    "user": { ... }
  }
  ```
- **Features**: Returns current authenticated user

#### `GET /api/auth/verify`
- **Auth Required**: Yes (via `authMiddleware`)
- **Response**: `200 OK`
  ```json
  {
    "valid": true,
    "user": { id, email, role, collegeId }
  }
  ```
- **Features**: Token validation endpoint

### Middleware

#### `authMiddleware`
- Verifies JWT token from `Authorization: Bearer <token>` header
- Attaches `req.user` with user data
- Returns 401 if token invalid/expired/missing

### Configuration
- `JWT_SECRET`: Required in production
- `JWT_EXPIRES_IN`: Default `1h`
- `BCRYPT_ROUNDS`: Default `12`

---

## 2. College Controller (`collegeController.js`)

### Purpose
Manages college CRUD operations (Admin only for create/update/delete).

### Endpoints

#### `GET /api/colleges`
- **Auth Required**: No
- **Query Params**:
  - `limit`: number (default: 100, max: 200)
  - `skip`: number (default: 0)
- **Response**: `200 OK`
  ```json
  {
    "message": "Colleges retrieved successfully",
    "count": number,
    "total": number,
    "colleges": [...],
    "pagination": { skip, limit, totalPages }
  }
  ```
- **Features**:
  - Returns only non-deleted colleges
  - Ordered by name ascending
  - Pagination support

#### `GET /api/colleges/:id`
- **Auth Required**: No
- **Response**: `200 OK`
  ```json
  {
    "message": "College fetched successfully",
    "college": {
      "id": number,
      "name": string,
      "code": string,
      "logo": string | null,
      "clubs": [...],
      "events": [...]
    }
  }
  ```
- **Features**:
  - Includes related clubs and events (non-deleted)
  - Events limited to 10, ordered by dateTime desc

#### `POST /api/colleges`
- **Auth Required**: Yes (ADMIN only)
- **Request Body**:
  ```json
  {
    "name": "string (min 2 chars)",
    "code": "string (min 2 chars, unique)",
    "logo": "valid URL (optional)"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "message": "College created successfully",
    "college": { ... }
  }
  ```
- **Features**:
  - Code is auto-uppercased
  - Checks code uniqueness
  - Returns 409 if code exists

#### `PUT /api/colleges/:id`
- **Auth Required**: Yes (ADMIN only)
- **Request Body**: Same as POST (all fields optional)
- **Response**: `200 OK`
- **Features**: Updates college, validates code uniqueness if changed

#### `DELETE /api/colleges/:id`
- **Auth Required**: Yes (ADMIN only)
- **Response**: `200 OK`
- **Features**:
  - Soft delete if `isDeleted` field exists
  - Hard delete otherwise
  - Returns 409 if college has associated records

---

## 3. Club Controller (`clubController.js`)

### Purpose
Manages club CRUD operations (Organizer/Admin for create/update/delete).

### Endpoints

#### `GET /api/clubs`
- **Auth Required**: No
- **Query Params**:
  - `collegeId`: number (optional filter)
  - `page`: number (default: 1)
  - `limit`: number (default: 20, max: 100)
- **Response**: `200 OK`
  ```json
  {
    "message": "Clubs fetched successfully",
    "data": [...],
    "pagination": { total, page, limit, totalPages }
  }
  ```
- **Features**:
  - Includes college and events info
  - Filters by collegeId if provided
  - Only non-deleted clubs

#### `GET /api/clubs/:id`
- **Auth Required**: No
- **Response**: `200 OK`
  ```json
  {
    "message": "Club fetched successfully",
    "data": {
      "id": number,
      "name": string,
      "college": { ... },
      "events": [...]
    }
  }
  ```
- **Features**: Includes college and events

#### `POST /api/clubs`
- **Auth Required**: Yes (ORGANIZER or ADMIN)
- **Request Body**:
  ```json
  {
    "name": "string (min 2 chars)",
    "collegeId": "number or string"
  }
  ```
- **Response**: `201 Created`
- **Features**:
  - Validates college exists
  - Prevents duplicate club names in same college (case-insensitive)
  - Sets `createdBy` to current user ID

#### `PUT /api/clubs/:id`
- **Auth Required**: Yes (ORGANIZER or ADMIN)
- **Request Body**:
  ```json
  {
    "name": "string (min 2 chars, optional)"
  }
  ```
- **Response**: `200 OK`
- **Features**: Prevents duplicate names in same college

#### `DELETE /api/clubs/:id`
- **Auth Required**: Yes (ORGANIZER or ADMIN)
- **Response**: `200 OK`
- **Features**:
  - Soft delete (sets `isDeleted: true`)
  - Returns 400 if club has existing events

---

## 4. Event Controller (`eventController.js`)

### Purpose
Manages event CRUD operations and event listing with visibility filtering.

### Endpoints

#### `GET /api/events`
- **Auth Required**: Yes
- **Query Params**:
  - `page`: number (default: 1)
  - `limit`: number (default: 10, max: 100)
  - `search`: string (optional, searches title/description)
  - `visibility`: "OWN" | "SELECTED" | "ALL" (optional filter)
- **Response**: `200 OK`
  ```json
  {
    "message": "Events fetched successfully",
    "pagination": { total, page, limit, totalPages },
    "events": [...]
  }
  ```
- **Features**:
  - Filters events based on user's college:
    - Events from user's college
    - Events with `visibility: 'ALL'`
    - Events with `visibility: 'SELECTED'` that include user's college
  - Includes club, allowedColleges, and registration count
  - Search is case-insensitive

#### `GET /api/events/:id`
- **Auth Required**: Yes
- **Response**: `200 OK`
  ```json
  {
    "message": "Event details fetched successfully",
    "event": {
      "id": number,
      "title": string,
      "description": string,
      "dateTime": ISO string,
      "venue": string,
      "visibility": "OWN" | "SELECTED" | "ALL",
      "isPaid": boolean,
      "price": number | null,
      "currency": string | null,
      "college": { ... },
      "club": { ... },
      "allowedColleges": [...],
      "registrationCount": number
    }
  }
  ```
- **Features**:
  - Authorization check: user must have access based on visibility rules
  - Returns 403 if user's college not allowed

#### `POST /api/events`
- **Auth Required**: Yes (ORGANIZER or ADMIN)
- **Request Body**:
  ```json
  {
    "title": "string (min 2 chars)",
    "description": "string (optional)",
    "dateTime": "ISO string or timestamp",
    "venue": "string (min 2 chars)",
    "clubId": "number or null (optional)",
    "visibility": "OWN" | "SELECTED" | "ALL",
    "allowedColleges": [number, ...] (required if visibility is SELECTED),
    "isPaid": boolean (optional),
    "price": number (optional, in smallest currency unit),
    "currency": "string (optional)"
  }
  ```
- **Response**: `201 Created`
- **Features**:
  - Validates club belongs to user's college if provided
  - For `SELECTED` visibility: validates allowedColleges array
  - Removes user's own college from allowedColleges (redundant)
  - Creates EventAllowedCollege records in transaction
  - Sets `createdBy` to current user ID
  - Uses user's `collegeId` for event

#### `PUT /api/events/:id`
- **Auth Required**: Yes (ORGANIZER or ADMIN)
- **Request Body**: Same as POST (all fields optional)
- **Response**: `200 OK`
- **Features**:
  - Only organizer of event's college or admin can update
  - Validates club if changed
  - Updates allowedColleges if visibility changed
  - Transaction-based update

#### `DELETE /api/events/:id`
- **Auth Required**: Yes (ORGANIZER or ADMIN)
- **Response**: `200 OK`
- **Features**:
  - Only organizer of event's college or admin can delete
  - Deletes related EventAllowedCollege records
  - Deletes related registrations (or keep for audit)
  - Transaction-based deletion

---

## 5. Registration Controller (`registrationController.js`)

### Purpose
Handles event registrations, QR code generation, payment processing (Razorpay), and attendance check-in.

### Endpoints

#### `POST /api/registrations`
- **Auth Required**: Yes (STUDENT role only)
- **Request Body**:
  ```json
  {
    "eventId": "number or string",
    "currency": "string (optional, default: INR)"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "message": "Registered successfully",
    "registration": {
      "id": number,
      "qrPayload": "signed token",
      "qrImageUrl": "data URL",
      "paymentStatus": "PENDING" | "PAID",
      ...
    },
    "razorpayOrder": {
      "id": "order_id",
      "amount": number,
      "currency": "string",
      ...
    } | null
  }
  ```
- **Features**:
  - Prevents duplicate registrations
  - Creates Razorpay order if event is paid
  - Generates signed QR token (HMAC-SHA256, 6-hour TTL)
  - Generates QR code image (data URL)
  - Transaction-based: rolls back if Razorpay fails
  - Payment status: `PAID` for free events, `PENDING` for paid events

#### `POST /api/registrations/checkin`
- **Auth Required**: Yes (ORGANIZER or ADMIN)
- **Request Body**:
  ```json
  {
    "qrToken": "string (min 10 chars)"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "message": "Attendance marked successfully",
    "registrationId": number
  }
  ```
- **Features**:
  - Verifies QR token signature and expiry
  - Finds registration by QR token
  - Race-safe update (only if not already attended)
  - Sets `attended: true`, `scannedAt`, `scannedBy`
  - Returns 409 if already checked in

#### `GET /api/registrations/event/:eventId`
- **Auth Required**: Yes (ORGANIZER or ADMIN)
- **Response**: `200 OK`
  ```json
  {
    "message": "Registrations fetched",
    "count": number,
    "registrations": [...]
  }
  ```
- **Features**: Returns all registrations for an event with user info

#### `POST /api/registrations/webhook/razorpay`
- **Auth Required**: No (webhook endpoint)
- **Request**: Raw body (must use `express.raw()` middleware)
- **Headers**: `x-razorpay-signature`
- **Response**: `200 OK`
- **Features**:
  - Verifies webhook signature (HMAC-SHA256)
  - Handles payment events:
    - `payment.captured`, `order.paid`, `payment.authorized` → sets `paymentStatus: 'PAID'`
    - `payment.failed` → sets `paymentStatus: 'FAILED'`
  - Updates registration by `paymentId` (Razorpay order ID)

### Helpers

#### `createSignedQRToken(userId, eventId, ttlSeconds)`
- Creates HMAC-signed token with expiry
- Format: `userId:eventId:expiresAt:randomHex:signature`
- Base64URL encoded
- Default TTL: 6 hours

#### `verifySignedQRToken(token)`
- Verifies signature and expiry
- Returns `{ userId, eventId }` or `null`

### Configuration
- `RAZORPAY_KEY`: Razorpay key ID
- `RAZORPAY_SECRET`: Razorpay key secret
- `RAZORPAY_WEBHOOK_SECRET`: Webhook signature secret
- `QR_SECRET`: Secret for QR token signing

---

## Common Patterns

### Authentication
- Most endpoints require `authMiddleware` (JWT verification)
- Role-based access controlled via `roleMiddleware` in routes
- User info available in `req.user` after middleware

### Validation
- All controllers use Zod schemas for input validation
- Returns 400 with detailed error messages on validation failure
- Query params validated and transformed

### Error Handling
- Prisma errors handled (P2002: unique constraint, P2003: foreign key)
- Development mode: includes error messages
- Production mode: generic error messages

### Transactions
- Complex operations use `prisma.$transaction()` for atomicity
- Used in: event create/update, registration creation

### Soft Deletes
- Colleges and Clubs use `isDeleted` flag
- Events use hard delete (with cascade)
- Filtered queries exclude soft-deleted records

### Pagination
- List endpoints support pagination
- Default limits and max limits enforced
- Returns pagination metadata

---

## Route Mapping

See `backend/src/routes.js` for complete route definitions and middleware assignments.

