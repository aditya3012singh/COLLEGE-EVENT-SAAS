# Bootstrap Admin - Create First Admin and College

This document explains how to create the first admin user and college to bootstrap your system.

## Problem
There's a chicken-and-egg problem:
- To create a college, you need an ADMIN user
- To register a user, you need a college to exist

## Solutions

---

## Solution 1: Bootstrap Endpoint (Recommended)

### Endpoint
```
POST http://localhost:3000/api/bootstrap
```

### Features
- ✅ No authentication required (public endpoint)
- ✅ Only works if no colleges exist (safety check)
- ✅ Creates first college and admin in a single transaction
- ✅ Hashes password automatically
- ✅ Returns college and admin details

### Postman Request

**Method:** `POST`  
**URL:** `http://localhost:3000/api/bootstrap`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "college": {
    "name": "KIET Group of Institutions",
    "code": "KIET",
    "logo": null
  },
  "admin": {
    "name": "System Administrator",
    "email": "admin@kiet.edu",
    "password": "admin123"
  }
}
```

### Example Requests

#### Example 1: KIET College
```json
{
  "college": {
    "name": "KIET Group of Institutions",
    "code": "KIET",
    "logo": null
  },
  "admin": {
    "name": "Admin KIET",
    "email": "admin@kiet.edu",
    "password": "admin123"
  }
}
```

#### Example 2: MIT
```json
{
  "college": {
    "name": "Massachusetts Institute of Technology",
    "code": "MIT",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/200px-MIT_logo.svg.png"
  },
  "admin": {
    "name": "MIT Admin",
    "email": "admin@mit.edu",
    "password": "mitadmin123"
  }
}
```

#### Example 3: Generic College
```json
{
  "college": {
    "name": "Default College",
    "code": "DEFAULT",
    "logo": null
  },
  "admin": {
    "name": "System Admin",
    "email": "admin@college.edu",
    "password": "SecurePassword123!"
  }
}
```

### Expected Response (Success - 201)
```json
{
  "message": "Bootstrap completed successfully. Admin and college created.",
  "college": {
    "id": 1,
    "name": "KIET Group of Institutions",
    "code": "KIET",
    "logo": null,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "admin": {
    "id": 1,
    "name": "System Administrator",
    "email": "admin@kiet.edu",
    "role": "ADMIN",
    "collegeId": 1,
    "password": "***hidden***"
  },
  "note": "Please login with the admin credentials to access the system."
}
```

### Error Responses

#### System Already Initialized (403)
```json
{
  "error": "Bootstrap is only allowed when no colleges exist. System already initialized."
}
```

#### Invalid Input (400)
```json
{
  "error": "Invalid input",
  "issues": { ... }
}
```

#### Duplicate (409)
```json
{
  "error": "College code or email already exists"
}
```

---

## Solution 2: Database Seed Script

### Command
```bash
cd backend
npx prisma db seed
```

Or if seed is configured in package.json:
```bash
npm run seed
```

### What It Does
- Creates 2 colleges (KIET, ABES)
- Creates admin, organizer, and student users for each
- Creates sample clubs and events
- Passwords are hashed with bcrypt

### Default Credentials

#### KIET College
- **Admin**: `admin@kiet.edu` / `admin123`
- **Organizer**: `organizer@kiet.edu` / `organizer123`
- **Student**: `student@kiet.edu` / `student123`

#### ABES College
- **Admin**: `admin@abes.edu` / `admin123`
- **Organizer**: `organizer@abes.edu` / `organizer123`
- **Student**: `student@abes.edu` / `student123`

### Add Seed Script to package.json
```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

---

## Solution 3: Manual Database Insert (Advanced)

### Step 1: Create College
```sql
INSERT INTO "College" (name, code, "createdAt", "updatedAt")
VALUES ('Default College', 'DEFAULT', NOW(), NOW());
```

### Step 2: Get College ID
```sql
SELECT id FROM "College" WHERE code = 'DEFAULT';
```

### Step 3: Hash Password
Use Node.js to hash:
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('admin123', 12);
console.log(hash);
```

### Step 4: Create Admin User
```sql
INSERT INTO "User" (name, email, password, role, "collegeId", "createdAt", "updatedAt")
VALUES (
  'System Admin',
  'admin@college.edu',
  '$2b$12$hashed_password_here',
  'ADMIN',
  1,
  NOW(),
  NOW()
);
```

---

## Quick Start Guide

### Using Bootstrap Endpoint (Easiest)

1. **Start your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Open Postman and create request:**
   - Method: `POST`
   - URL: `http://localhost:3000/api/bootstrap`
   - Body (raw JSON):
   ```json
   {
     "college": {
       "name": "KIET Group of Institutions",
       "code": "KIET",
       "logo": null
     },
     "admin": {
       "name": "Admin User",
       "email": "admin@kiet.edu",
       "password": "admin123"
     }
   }
   ```

3. **Send request** - You'll get the college and admin details

4. **Login with admin credentials:**
   ```
   POST http://localhost:3000/api/auth/login
   Body: {
     "email": "admin@kiet.edu",
     "password": "admin123"
   }
   ```

5. **Use the token** to create more colleges or manage the system

---

## Using Seed Script

1. **Add seed script to package.json** (if not already there):
   ```json
   {
     "prisma": {
       "seed": "node prisma/seed.js"
     }
   }
   ```

2. **Run seed:**
   ```bash
   cd backend
   npx prisma db seed
   ```

3. **Login with any of the default credentials**

---

## cURL Commands

### Bootstrap
```bash
curl -X POST http://localhost:3000/api/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "college": {
      "name": "KIET Group of Institutions",
      "code": "KIET",
      "logo": null
    },
    "admin": {
      "name": "Admin User",
      "email": "admin@kiet.edu",
      "password": "admin123"
    }
  }'
```

### Login After Bootstrap
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kiet.edu",
    "password": "admin123"
  }'
```

---

## Security Notes

1. **Bootstrap endpoint** is only available when no colleges exist
2. **Change default passwords** immediately after bootstrap
3. **Use strong passwords** for production
4. **Remove or disable bootstrap** endpoint in production after initial setup
5. **Seed script** uses default passwords - change them after seeding

---

## Recommended Workflow

1. **First Time Setup:**
   - Use bootstrap endpoint to create first admin and college
   - Login with admin credentials
   - Create additional colleges via `/colleges/new` (frontend) or API

2. **Development/Testing:**
   - Use seed script for quick setup with sample data

3. **Production:**
   - Use bootstrap endpoint once for initial setup
   - Consider disabling bootstrap endpoint after first use
   - All subsequent admins should be created through normal registration

