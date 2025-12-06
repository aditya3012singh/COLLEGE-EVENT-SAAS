# Frontend Redux Slices Summary

This document provides a comprehensive overview of all Redux slices, their thunks, selectors, and how they map to backend controllers.

---

## 1. Auth Slice (`authSlice.js`)

### Purpose
Manages user authentication state, token management, and user session.

### Thunks

#### `register(payload)`
- **Backend**: `POST /api/auth/register`
- **Payload**: `{ name, email, password, role, collegeId }`
- **Response**: `{ message, token, user }`
- **Status**: ✅ Matches backend

#### `login(payload)`
- **Backend**: `POST /api/auth/login`
- **Payload**: `{ email, password }`
- **Response**: `{ message, token, user }`
- **Status**: ✅ Matches backend

#### `verify()`
- **Backend**: `GET /api/auth/verify`
- **Response**: `{ valid: true, user: {...} }`
- **Status**: ✅ Matches backend

#### `bootstrapAuth()`
- **Frontend Only**: Loads token from localStorage and verifies
- **Status**: ✅ No backend equivalent (frontend utility)

#### `getMe()` - ⚠️ MISSING
- **Backend**: `GET /api/auth/me`
- **Response**: `{ user: {...} }`
- **Status**: ❌ Not implemented in slice

### State
```javascript
{
  user: null,
  token: null,
  status: 'idle' | 'loading' | 'succeeded' | 'failed',
  registering: false,
  loggingIn: false,
  verifying: false,
  error: null
}
```

### Actions
- `logout()` - Clears auth state
- `setToken(token)` - Sets token directly
- `clearAuthError()` - Clears error

### Selectors
- `selectAuth(state)` - Full auth state
- `selectUser(state)` - Current user
- `selectToken(state)` - JWT token
- `selectAuthStatus(state)` - Loading states
- `selectAuthError(state)` - Error state

---

## 2. Colleges Slice (`collegesSlice.js`)

### Purpose
Manages college CRUD operations and state.

### Thunks

#### `fetchColleges({ limit, skip })`
- **Backend**: `GET /api/colleges?limit=100&skip=0`
- **Response**: `{ message, count, total, colleges: [...], pagination: {...} }`
- **Status**: ⚠️ Needs fix - backend returns object with `colleges` array, not direct array

#### `fetchCollegeById(id)`
- **Backend**: `GET /api/colleges/:id`
- **Response**: `{ message, college: {...} }`
- **Status**: ✅ Matches backend

#### `createCollege(payload)`
- **Backend**: `POST /api/colleges` (ADMIN only)
- **Payload**: `{ name, code, logo? }`
- **Response**: `{ message, college: {...} }`
- **Status**: ✅ Matches backend

#### `updateCollege({ id, ...data })`
- **Backend**: `PUT /api/colleges/:id` (ADMIN only)
- **Response**: `{ message, college: {...} }`
- **Status**: ✅ Matches backend

#### `deleteCollege(id)`
- **Backend**: `DELETE /api/colleges/:id` (ADMIN only)
- **Response**: `{ message, college?: {...} }` or `{ message }`
- **Status**: ✅ Matches backend

### State
```javascript
{
  items: [],
  current: null,
  status: 'idle',
  loadingMap: { fetching, creating, updating, deleting },
  error: null
}
```

### Issues
- ❌ Missing pagination state (total, totalPages, etc.)
- ⚠️ `fetchColleges` response parsing needs update

---

## 3. Clubs Slice (`clubsSlice.js`)

### Purpose
Manages club CRUD operations and state.

### Thunks

#### `fetchClubs({ collegeId?, page, limit })`
- **Backend**: `GET /api/clubs?collegeId=&page=1&limit=20`
- **Response**: `{ message, data: [...], pagination: { total, page, limit, totalPages } }`
- **Status**: ✅ Matches backend

#### `fetchClubById(id)`
- **Backend**: `GET /api/clubs/:id`
- **Response**: `{ message, data: {...} }`
- **Status**: ✅ Matches backend

#### `createClub(payload)`
- **Backend**: `POST /api/clubs` (ORGANIZER/ADMIN)
- **Payload**: `{ name, collegeId }`
- **Response**: `{ message, data: {...} }`
- **Status**: ✅ Matches backend

#### `updateClub({ id, ...data })`
- **Backend**: `PUT /api/clubs/:id` (ORGANIZER/ADMIN)
- **Payload**: `{ name? }`
- **Response**: `{ message, data: {...} }`
- **Status**: ✅ Matches backend

#### `deleteClub(id)`
- **Backend**: `DELETE /api/clubs/:id` (ORGANIZER/ADMIN)
- **Response**: `{ message }`
- **Status**: ✅ Matches backend

### State
```javascript
{
  items: [],
  current: null,
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  status: 'idle',
  loadingMap: { fetching, creating, updating, deleting },
  error: null
}
```

### Status
✅ Fully aligned with backend

---

## 4. Events Slice (`eventsSlice.js`)

### Purpose
Manages event CRUD operations, listing with search/filter, and state.

### Thunks

#### `fetchEvents({ page, limit, search, visibility })`
- **Backend**: `GET /api/events?page=1&limit=10&search=&visibility=`
- **Response**: `{ message, pagination: {...}, events: [...] }`
- **Status**: ✅ Matches backend

#### `fetchEventById(id)`
- **Backend**: `GET /api/events/:id`
- **Response**: `{ message, event: {...} }`
- **Status**: ✅ Matches backend

#### `createEvent(payload)`
- **Backend**: `POST /api/events` (ORGANIZER/ADMIN)
- **Payload**: `{ title, description?, dateTime, venue, clubId?, visibility, allowedColleges?, isPaid?, price?, currency? }`
- **Response**: `{ message, event: {...} }`
- **Status**: ✅ Matches backend

#### `updateEvent({ id, ...data })`
- **Backend**: `PUT /api/events/:id` (ORGANIZER/ADMIN)
- **Response**: `{ message, event: {...} }`
- **Status**: ✅ Matches backend

#### `deleteEvent(id)`
- **Backend**: `DELETE /api/events/:id` (ORGANIZER/ADMIN)
- **Response**: `{ message, deletedEventId: id }`
- **Status**: ✅ Matches backend

### State
```javascript
{
  items: [],
  current: null,
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  status: 'idle',
  loadingMap: { fetching, creating, updating, deleting },
  error: null
}
```

### Status
✅ Fully aligned with backend

---

## 5. Registrations Slice (`registrationsSlice.js`)

### Purpose
Manages event registrations, QR codes, payment orders, and attendance.

### Thunks

#### `registerForEvent(payload)`
- **Backend**: `POST /api/registrations` (STUDENT only)
- **Payload**: `{ eventId, currency? }`
- **Response**: `{ message, registration: {...}, razorpayOrder?: {...} }`
- **Status**: ✅ Matches backend

#### `fetchRegistrationsForEvent(eventId)`
- **Backend**: `GET /api/registrations/event/:eventId` (ORGANIZER/ADMIN)
- **Response**: `{ message, count, registrations: [...] }`
- **Status**: ✅ Matches backend

#### `fetchMyRegistrations()` - ⚠️ BACKEND NOT IMPLEMENTED
- **Backend**: `GET /api/registrations/my` (doesn't exist)
- **Status**: ❌ Backend route not implemented

#### `checkInEvent(payload)` - ⚠️ MISSING
- **Backend**: `POST /api/registrations/checkin` (ORGANIZER/ADMIN)
- **Payload**: `{ qrToken }`
- **Response**: `{ message, registrationId }`
- **Status**: ❌ Not implemented in slice

### State
```javascript
{
  items: [],
  current: null,
  status: 'idle',
  registering: false,
  lastCreated: null,
  lastOrder: null,
  error: null
}
```

### Issues
- ❌ Missing `checkInEvent` thunk
- ⚠️ `fetchMyRegistrations` references non-existent backend route

---

## Summary of Required Changes

### 1. Auth Slice
- ✅ Add `getMe` thunk

### 2. Colleges Slice
- ⚠️ Fix `fetchColleges` response parsing to handle `{ colleges: [...], pagination: {...} }`
- ❌ Add pagination state (total, totalPages)

### 3. Clubs Slice
- ✅ No changes needed

### 4. Events Slice
- ✅ No changes needed

### 5. Registrations Slice
- ❌ Add `checkInEvent` thunk
- ⚠️ Remove or comment `fetchMyRegistrations` (backend doesn't support it)

---

## Response Format Mapping

| Backend Response | Slice Expectation | Status |
|-----------------|-------------------|--------|
| `{ colleges: [...], pagination: {...} }` | Array or `colleges` property | ⚠️ Needs fix |
| `{ data: [...], pagination: {...} }` | `data` property | ✅ OK |
| `{ events: [...], pagination: {...} }` | `events` property | ✅ OK |
| `{ registration, razorpayOrder }` | `registration` and `razorpayOrder` | ✅ OK |
| `{ college: {...} }` | `college` property | ✅ OK |
| `{ event: {...} }` | `event` property | ✅ OK |
| `{ data: {...} }` | `data` property | ✅ OK |

