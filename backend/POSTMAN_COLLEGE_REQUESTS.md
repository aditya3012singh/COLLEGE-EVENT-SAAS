# Postman Requests for College Creation

## Create College Request

### Endpoint
```
POST http://localhost:3000/api/colleges
```

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

### Request Body Schema
```json
{
  "name": "string (min 2 chars, required)",
  "code": "string (min 2 chars, required, unique)",
  "logo": "string (valid URL, optional)"
}
```

---

## Example Request Bodies

### Example 1: MIT (Massachusetts Institute of Technology)
```json
{
  "name": "Massachusetts Institute of Technology",
  "code": "MIT",
  "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/200px-MIT_logo.svg.png"
}
```

### Example 2: Stanford University
```json
{
  "name": "Stanford University",
  "code": "STANFORD",
  "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/Stanford_University_seal_2003.svg/200px-Stanford_University_seal_2003.svg.png"
}
```

### Example 3: Harvard University
```json
{
  "name": "Harvard University",
  "code": "HARVARD",
  "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/2/2f/Harvard_University_logo.svg/200px-Harvard_University_logo.svg.png"
}
```

### Example 4: Indian Institute of Technology Delhi
```json
{
  "name": "Indian Institute of Technology Delhi",
  "code": "IITD",
  "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/IIT_Delhi_Logo.svg/200px-IIT_Delhi_Logo.svg.png"
}
```

### Example 5: University of California, Berkeley
```json
{
  "name": "University of California, Berkeley",
  "code": "UCB",
  "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Seal_of_University_of_California%2C_Berkeley.svg/200px-Seal_of_University_of_California%2C_Berkeley.svg.png"
}
```

### Example 6: Oxford University
```json
{
  "name": "University of Oxford",
  "code": "OXFORD",
  "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/University_of_Oxford_logo.svg/200px-University_of_Oxford_logo.svg.png"
}
```

### Example 7: Cambridge University
```json
{
  "name": "University of Cambridge",
  "code": "CAMBRIDGE",
  "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/University_of_Cambridge_coat_of_arms.svg/200px-University_of_Cambridge_coat_of_arms.svg.png"
}
```

### Example 8: National Institute of Technology (Generic)
```json
{
  "name": "National Institute of Technology, Warangal",
  "code": "NITW",
  "logo": null
}
```

### Example 9: Local College (No Logo)
```json
{
  "name": "City College of Technology",
  "code": "CCT",
  "logo": null
}
```

### Example 10: Community College
```json
{
  "name": "Metropolitan Community College",
  "code": "MCC",
  "logo": "https://example.com/logos/mcc-logo.png"
}
```

### Example 11: State University
```json
{
  "name": "State University of New York",
  "code": "SUNY",
  "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/SUNY_logo.svg/200px-SUNY_logo.svg.png"
}
```

### Example 12: Private University
```json
{
  "name": "Princeton University",
  "code": "PRINCETON",
  "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Princeton_seal.svg/200px-Princeton_seal.svg.png"
}
```

### Example 13: Technical Institute
```json
{
  "name": "California Institute of Technology",
  "code": "CALTECH",
  "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Caltech_logo.svg/200px-Caltech_logo.svg.png"
}
```

### Example 14: Medical College
```json
{
  "name": "Johns Hopkins University",
  "code": "JHU",
  "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Johns_Hopkins_University_seal.svg/200px-Johns_Hopkins_University_seal.svg.png"
}
```

### Example 15: Business School
```json
{
  "name": "Wharton School of Business",
  "code": "WHARTON",
  "logo": null
}
```

---

## cURL Commands

### Basic cURL (without logo)
```bash
curl -X POST http://localhost:3000/api/colleges \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "name": "Massachusetts Institute of Technology",
    "code": "MIT",
    "logo": null
  }'
```

### cURL with logo
```bash
curl -X POST http://localhost:3000/api/colleges \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "name": "Stanford University",
    "code": "STANFORD",
    "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/Stanford_University_seal_2003.svg/200px-Stanford_University_seal_2003.svg.png"
  }'
```

---

## Postman Setup Steps

### 1. Create New Request
- Method: `POST`
- URL: `http://localhost:3000/api/colleges`

### 2. Set Headers
- `Content-Type`: `application/json`
- `Authorization`: `Bearer YOUR_ADMIN_JWT_TOKEN`

### 3. Set Body
- Select: `raw` → `JSON`
- Paste one of the example JSON bodies above

### 4. Get Admin Token First

Before creating colleges, you need an ADMIN user token. Here's how:

#### Step 1: Register/Login as Admin
```
POST http://localhost:3000/api/auth/register
Body:
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "ADMIN",
  "collegeId": 1
}
```

**Note**: This requires a college to exist first! This is the bootstrap problem.

#### Solution: Create First College via Database or Seed

**Option A: Direct Database Insert**
```sql
INSERT INTO "College" (name, code, "createdAt", "updatedAt")
VALUES ('Default College', 'DEFAULT', NOW(), NOW());
```

**Option B: Use Prisma Studio**
```bash
cd backend
npx prisma studio
```
Then manually create a college in the UI.

**Option C: Temporarily Remove Auth Requirement**
Temporarily modify the backend to allow first college creation without auth (for bootstrap only).

---

## Expected Responses

### Success (201 Created)
```json
{
  "message": "College created successfully",
  "college": {
    "id": 1,
    "name": "Massachusetts Institute of Technology",
    "code": "MIT",
    "logo": "https://...",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error: Unauthorized (403)
```json
{
  "error": "Only admins can create colleges"
}
```

### Error: Missing Token (401)
```json
{
  "error": "Missing token"
}
```

### Error: Invalid Input (400)
```json
{
  "error": "Invalid input",
  "issues": {
    "name": {
      "_errors": ["String must contain at least 2 character(s)"]
    },
    "code": {
      "_errors": ["String must contain at least 2 character(s)"]
    }
  }
}
```

### Error: Duplicate Code (409)
```json
{
  "error": "College code already exists"
}
```

---

## Quick Test Sequence

### 1. Bootstrap: Create First College (if needed)
If no colleges exist, you may need to create one via database or seed script.

### 2. Register Admin User
```
POST http://localhost:3000/api/auth/register
{
  "name": "System Admin",
  "email": "admin@college.edu",
  "password": "admin123",
  "role": "ADMIN",
  "collegeId": 1
}
```

### 3. Login to Get Token
```
POST http://localhost:3000/api/auth/login
{
  "email": "admin@college.edu",
  "password": "admin123"
}
```

### 4. Use Token to Create More Colleges
```
POST http://localhost:3000/api/colleges
Headers: Authorization: Bearer <token_from_step_3>
Body: (use any example above)
```

---

## Postman Collection JSON

You can import this into Postman:

```json
{
  "info": {
    "name": "College Event SaaS - Colleges",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create College - MIT",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{admin_token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Massachusetts Institute of Technology\",\n  \"code\": \"MIT\",\n  \"logo\": \"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/200px-MIT_logo.svg.png\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/colleges",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "colleges"]
        }
      }
    },
    {
      "name": "Create College - Stanford",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{admin_token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Stanford University\",\n  \"code\": \"STANFORD\",\n  \"logo\": null\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/colleges",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "colleges"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "admin_token",
      "value": "",
      "type": "string"
    }
  ]
}
```

---

## Environment Variables for Postman

Create a Postman environment with:
- `base_url`: `http://localhost:3000`
- `admin_token`: (set after login)

Then use: `{{base_url}}/api/colleges` and `Bearer {{admin_token}}`

---

## Notes

1. **College Code**: Will be automatically converted to UPPERCASE
2. **Uniqueness**: College code must be unique across all colleges
3. **Logo**: Must be a valid URL if provided, or `null`
4. **Authentication**: Requires ADMIN role
5. **Bootstrap Issue**: First college may need to be created via database/seed

