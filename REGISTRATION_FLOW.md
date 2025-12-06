# Registration Flow & Hierarchy

This document explains the registration flow and hierarchical structure of the College Event SaaS application.

## System Hierarchy

```
College (Top Level)
  ├── Users (Students, Organizers, Admins)
  └── Clubs
      └── Events
          └── Registrations
```

## Registration Flow

### 1. College Registration (First Step)

**Who can register**: ADMIN users only

**Endpoint**: `POST /api/colleges`

**Request**:
```json
{
  "name": "Massachusetts Institute of Technology",
  "code": "MIT",
  "logo": "https://example.com/logo.png" // optional
}
```

**Process**:
1. ADMIN user must be authenticated
2. College code must be unique
3. College is created in database
4. Returns college with ID

**Frontend**: 
- Route: `/colleges/new` (ADMIN only)
- Component: `CollegeForm.jsx` (currently removed, needs to be recreated)

**Note**: There's a bootstrap problem - to create a college, you need an ADMIN user, but to register as a user, you need a college. Solutions:
- Seed initial admin user and college via database migration/seed
- Or allow first college creation without auth (bootstrap endpoint)

---

### 2. User Registration (Second Step)

**Who can register**: Anyone (public endpoint)

**Endpoint**: `POST /api/auth/register`

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "STUDENT" | "ORGANIZER" | "ADMIN",
  "collegeId": 1
}
```

**Process**:
1. Validates college exists (404 if not found)
2. Checks email uniqueness (409 if duplicate)
3. Hashes password with bcrypt
4. Creates user with collegeId
5. Returns JWT token and user object

**Frontend**:
- Route: `/auth` (public)
- Component: `AuthPage.jsx`
- Shows college dropdown (fetches from `/api/colleges`)
- User must select a college before registering

**Validation**:
- College must exist in database
- Email must be unique
- Password min 6 characters
- Role must be valid enum

---

### 3. Club Registration (Third Step)

**Who can register**: ORGANIZER or ADMIN users

**Endpoint**: `POST /api/clubs`

**Request**:
```json
{
  "name": "Computer Science Club",
  "collegeId": 1
}
```

**Process**:
1. User must be authenticated (ORGANIZER or ADMIN)
2. Validates college exists
3. Prevents duplicate club names in same college (case-insensitive)
4. Sets `createdBy` to current user ID
5. Creates club linked to college

**Frontend**:
- Route: `/clubs/new` (ORGANIZER/ADMIN only)
- Component: `ClubForm.jsx` (needs to be created)
- Should show user's college or allow selection

**Validation**:
- College must exist
- Club name must be unique within college
- User must have ORGANIZER or ADMIN role

---

## Complete Registration Sequence

### Scenario 1: Fresh Installation

1. **Bootstrap** (Manual/Seed):
   - Create first ADMIN user directly in database
   - OR seed initial admin user and college

2. **Admin creates college**:
   ```
   POST /api/colleges
   Auth: Bearer <admin_token>
   Body: { name: "MIT", code: "MIT" }
   ```

3. **Students/Organizers register**:
   ```
   POST /api/auth/register
   Body: { name, email, password, role: "STUDENT", collegeId: 1 }
   ```

4. **Organizers create clubs**:
   ```
   POST /api/clubs
   Auth: Bearer <organizer_token>
   Body: { name: "CS Club", collegeId: 1 }
   ```

### Scenario 2: Existing System

1. **New college registration**:
   - Admin logs in
   - Creates new college via `/colleges/new`
   - College becomes available in registration dropdown

2. **New users register**:
   - Visit `/auth`
   - Select college from dropdown
   - Fill registration form
   - Get JWT token

3. **Organizers create clubs**:
   - Organizer logs in
   - Creates club via `/clubs/new`
   - Club linked to organizer's college

---

## Database Relationships

### College → Users
- One-to-Many relationship
- User must have a `collegeId`
- Cascade delete: if college deleted, users deleted

### College → Clubs
- One-to-Many relationship
- Club must have a `collegeId`
- Cascade delete: if college deleted, clubs deleted

### Club → Events
- One-to-Many relationship
- Event can optionally have a `clubId`
- Events can also be college-wide (clubId = null)

### User → Clubs (via createdBy)
- Organizer creates clubs
- Club stores `createdBy` (user ID)

---

## Current Implementation Status

### ✅ Implemented

1. **User Registration** (`AuthPage.jsx`)
   - Fetches colleges on mount
   - Shows college dropdown
   - Validates college selection
   - Sends collegeId to backend

2. **Backend Endpoints**
   - College creation (ADMIN only)
   - User registration (public, requires collegeId)
   - Club creation (ORGANIZER/ADMIN, requires collegeId)

### ⚠️ Needs Implementation

1. **College Creation Form**
   - Component: `CollegeForm.jsx` (was created but removed)
   - Route: `/colleges/new` (ADMIN only)
   - Should be recreated

2. **Club Creation Form**
   - Component: `ClubForm.jsx` (doesn't exist)
   - Route: `/clubs/new` (ORGANIZER/ADMIN only)
   - Should auto-select user's college or allow selection

3. **Bootstrap Solution**
   - Seed script for initial admin + college
   - OR bootstrap endpoint for first college creation

---

## Recommendations

### For Bootstrap (Initial Setup)

**Option 1: Database Seed**
```javascript
// backend/prisma/seed.js
- Create default college
- Create default admin user
- Link admin to college
```

**Option 2: Bootstrap Endpoint**
```javascript
// POST /api/bootstrap
- Create first college (no auth required)
- Create first admin user
- Return admin credentials
```

**Option 3: Manual Setup**
- Admin creates college via database directly
- Then uses registration form with that college

### For Club Creation

**Option 1: Auto-select user's college**
- Use `req.user.collegeId` from token
- Don't show college dropdown
- Simpler UX for organizers

**Option 2: Allow selection**
- Show college dropdown
- Useful for admins who manage multiple colleges

---

## Security Considerations

1. **College Creation**: ADMIN only - prevents unauthorized college creation
2. **User Registration**: Public but validates college exists - prevents orphaned users
3. **Club Creation**: ORGANIZER/ADMIN only - ensures clubs are created by authorized users
4. **College Validation**: All endpoints validate college exists before creating related entities

---

## API Flow Diagram

```
┌─────────────┐
│   ADMIN     │
│   User      │
└──────┬──────┘
       │
       │ POST /api/colleges
       │ { name, code }
       ▼
┌─────────────┐
│   College   │
│   Created   │
└──────┬──────┘
       │
       │ Available in dropdown
       ▼
┌─────────────┐
│   Public    │
│ Registration│
└──────┬──────┘
       │
       │ POST /api/auth/register
       │ { name, email, password, role, collegeId }
       ▼
┌─────────────┐
│   User      │
│   Created   │
└──────┬──────┘
       │
       │ If ORGANIZER/ADMIN
       │ POST /api/clubs
       │ { name, collegeId }
       ▼
┌─────────────┐
│   Club      │
│   Created   │
└─────────────┘
```

---

## Next Steps

1. ✅ User registration with college selection - **DONE**
2. ⚠️ Recreate `CollegeForm.jsx` for admin college creation
3. ⚠️ Create `ClubForm.jsx` for organizer club creation
4. ⚠️ Implement bootstrap solution (seed or endpoint)
5. ⚠️ Add validation to ensure users can only create clubs in their own college

