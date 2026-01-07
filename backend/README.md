# College Event SaaS - Backend

A comprehensive event management system for colleges, featuring club management, event creation, and user registration with payment integration.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Setup](#-environment-setup)
- [Database Setup](#-database-setup)
- [API Documentation](#-api-documentation)
- [Postman Testing](#-postman-testing)
- [Architecture](#-architecture)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)

## ⭐ Features

### Core Functionality
- ✅ **Multi-College Support** - Multiple colleges with unique codes
- ✅ **User Management** - Students, Organizers, and Admins with role-based access
- ✅ **Club Management** - Create and manage college clubs with memberships
- ✅ **Event Management** - Create events with visibility controls (Own/Selected/All colleges)
- ✅ **Event Registration** - Students can register for events with QR code generation
- ✅ **Payment Integration** - Razorpay integration for paid events
- ✅ **Attendance Tracking** - QR code-based check-in system
- ✅ **Club Memberships** - Join clubs with approval workflow

### Technical Features
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Role-Based Access Control** - Granular permissions per user role
- ✅ **Input Validation** - Zod schemas for request validation
- ✅ **Error Handling** - Centralized error management
- ✅ **Logging** - Structured request/response logging
- ✅ **Rate Limiting** - 200 requests per 15 minutes
- ✅ **CORS Protection** - Configurable cross-origin requests
- ✅ **API Documentation** - Swagger/OpenAPI specification
- ✅ **Database Migrations** - Version-controlled schema changes
- ✅ **Password Security** - bcrypt hashing

## 🔧 Tech Stack

### Backend
- **Node.js** (v18+) - Runtime environment
- **Express.js** (v5) - Web framework
- **Prisma** (v6) - ORM and database toolkit
- **PostgreSQL** - Primary database
- **JWT** - Authentication tokens
- **Zod** - Schema validation
- **Bcrypt** - Password hashing

### Tools & Libraries
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - Request throttling
- **Swagger** - API documentation
- **QRCode** - QR code generation
- **Razorpay** - Payment gateway
- **Nodemon** - Development auto-reload


## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** v14 or higher ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd college-event-saas/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the backend directory:
   ```env
   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/college_events"

   # JWT Configuration
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRE="7d"

   # Server Configuration
   NODE_ENV="development"
   PORT=3000

   # CORS Configuration
   FRONTEND_ORIGIN="http://localhost:5173"

   # Razorpay Configuration (Optional - for paid events)
   RAZORPAY_KEY_ID="your-razorpay-key-id"
   RAZORPAY_SECRET="your-razorpay-secret"
   ```

4. **Configure PostgreSQL**
   
   Create a new PostgreSQL database:
   ```bash
   # Connect to PostgreSQL
   psql -U postgres

   # Create database
   CREATE DATABASE college_events;

   # Create user (optional)
   CREATE USER your_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE college_events TO your_user;
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

6. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

8. **Verify the server is running**
   
   Open your browser and navigate to:
   - **API Health**: http://localhost:3000/api/health
   - **API Docs**: http://localhost:3000/api-docs

### Quick Test

Test the API with a simple health check:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-07T10:00:00.000Z",
  "environment": "development"
}
```

## 🔐 Environment Setup

### Required Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` | Yes |
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key-min-32-chars` | Yes |
| `NODE_ENV` | Environment mode | `development` or `production` | Yes |
| `PORT` | Server port | `3000` | No (default: 3000) |
| `FRONTEND_ORIGIN` | Allowed CORS origin | `http://localhost:5173` | Yes |

### Optional Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_EXPIRE` | JWT token expiration | `7d`, `24h`, `60m` |
| `RAZORPAY_KEY_ID` | Razorpay API key | `rzp_test_xxxxx` |
| `RAZORPAY_SECRET` | Razorpay secret key | `secret_xxxxx` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `10` |
| `LOG_LEVEL` | Logging level | `info`, `debug`, `error` |

### Environment Validation

The server validates all required environment variables on startup. Missing variables will cause the server to fail with a clear error message.

## 💾 Database Setup

### Schema Overview

The database schema includes the following models:

- **College** - Educational institutions
- **User** - Students, Organizers, Admins
- **Club** - College clubs/organizations
- **Event** - College events
- **Registration** - Event registrations
- **ClubMembership** - Club member relationships
- **ClubRecruitment** - Recruitment campaigns
- **ClubDomainLead** - Domain leadership roles
- **ClubAchievement** - Club and member achievements
- **RefreshToken** - JWT refresh tokens
- **EmailVerification** - Email verification tokens
- **AuditLog** - System audit trail

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name description_of_change

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (GUI for database)
npx prisma studio

# Validate schema
npx prisma validate

# Format schema file
npx prisma format
```

### Database Relationships

```
College
  ├── Users (one-to-many)
  ├── Clubs (one-to-many)
  └── Events (one-to-many)

Club
  ├── Events (one-to-many)
  ├── Memberships (one-to-many)
  ├── Recruitments (one-to-many)
  ├── Domain Leads (one-to-many)
  └── Achievements (one-to-many)

Event
  ├── Registrations (one-to-many)
  └── Allowed Colleges (many-to-many)

User
  ├── Registrations (one-to-many)
  ├── Club Memberships (one-to-many)
  ├── Created Clubs (one-to-many)
  ├── Created Events (one-to-many)
  └── Scanned Registrations (one-to-many)
```


## 📖 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

Most endpoints require a JWT token. Include it in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Response Format

#### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "issues": [ ... ]  // For validation errors
  }
}
```

### API Endpoints

#### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login user |
| GET | `/auth/me` | Yes | Get current user |
| GET | `/auth/verify` | Yes | Verify token |

#### 🏫 Colleges (`/api/colleges`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/colleges` | No | - | List all colleges |
| GET | `/colleges/:id` | No | - | Get college details |
| POST | `/colleges` | Yes | ADMIN | Create college |
| PUT | `/colleges/:id` | Yes | ADMIN | Update college |
| DELETE | `/colleges/:id` | Yes | ADMIN | Delete college |

#### 🎯 Clubs (`/api/clubs`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/clubs` | No | - | List all clubs |
| GET | `/clubs/:id` | No | - | Get club details |
| POST | `/clubs` | Yes | ORGANIZER, ADMIN | Create club |
| PUT | `/clubs/:id` | Yes | Creator, ADMIN | Update club |
| DELETE | `/clubs/:id` | Yes | Creator, ADMIN | Delete club |
| GET | `/clubs/my/list` | Yes | - | Get user's clubs |
| GET | `/clubs/my/memberships` | Yes | - | Get user's memberships |
| POST | `/clubs/:id/join` | Yes | - | Join club |
| GET | `/clubs/membership-requests` | Yes | ORGANIZER, ADMIN | Get pending requests |
| PUT | `/clubs/memberships/:id` | Yes | Club Owner | Approve/reject request |

#### 🎉 Events (`/api/events`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/events` | Yes | - | List events |
| GET | `/events/:id` | Yes | - | Get event details |
| POST | `/events` | Yes | ORGANIZER, ADMIN | Create event |
| PUT | `/events/:id` | Yes | Creator, ADMIN | Update event |
| DELETE | `/events/:id` | Yes | Creator, ADMIN | Delete event |
| PUT | `/events/:id/visibility` | Yes | Creator, ADMIN | Update visibility |

#### 📝 Registrations (`/api/registrations`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/registrations` | Yes | STUDENT | Register for event |
| GET | `/registrations/:id` | Yes | - | Get registration |
| PUT | `/registrations/:id/cancel` | Yes | Owner | Cancel registration |
| POST | `/registrations/checkin` | Yes | ORGANIZER, ADMIN | Check-in attendee |
| POST | `/registrations/webhook/razorpay` | No | - | Payment webhook |

#### 🔧 System

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |
| GET | `/api-docs` | No | Swagger UI |
| POST | `/bootstrap` | No | Initial setup |

## 🧪 Postman Testing

### Setting Up Postman

1. **Install Postman** - [Download here](https://www.postman.com/downloads/)

2. **Create a new Collection** - Name it "College Event SaaS"

3. **Set up Environment Variables**
   
   Create a new environment with these variables:
   ```
   base_url: http://localhost:3000/api
   auth_token: (will be set automatically)
   college_id: (will be set after creating college)
   club_id: (will be set after creating club)
   event_id: (will be set after creating event)
   registration_id: (will be set after registration)
   ```

### Test Flow & Examples

#### 1️⃣ Bootstrap System (First Time Setup)

**Request:**
```http
POST {{base_url}}/../bootstrap
Content-Type: application/json

{
  "adminName": "System Admin",
  "adminEmail": "admin@example.com",
  "adminPassword": "admin123456",
  "collegeName": "Massachusetts Institute of Technology",
  "collegeCode": "MIT"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "admin": {
      "id": 1,
      "name": "System Admin",
      "email": "admin@example.com",
      "role": "ADMIN",
      "collegeId": 1
    },
    "college": {
      "id": 1,
      "name": "Massachusetts Institute of Technology",
      "code": "MIT"
    }
  },
  "message": "System bootstrapped successfully"
}
```

**Postman Test Script:**
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("college_id", response.data.college.id);
}
```

#### 2️⃣ User Registration

**Request:**
```http
POST {{base_url}}/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@mit.edu",
  "password": "password123",
  "role": "STUDENT",
  "collegeId": {{college_id}}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "name": "John Doe",
      "email": "john@mit.edu",
      "role": "STUDENT",
      "collegeId": 1
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Postman Test Script:**
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("auth_token", response.data.token);
}
```

#### 3️⃣ Login

**Request:**
```http
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "john@mit.edu",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "name": "John Doe",
      "email": "john@mit.edu",
      "role": "STUDENT"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Postman Test Script:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("auth_token", response.data.token);
}
```

#### 4️⃣ Get Current User

**Request:**
```http
GET {{base_url}}/auth/me
Authorization: Bearer {{auth_token}}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "John Doe",
    "email": "john@mit.edu",
    "role": "STUDENT",
    "collegeId": 1,
    "college": {
      "id": 1,
      "name": "Massachusetts Institute of Technology",
      "code": "MIT"
    }
  }
}
```

#### 5️⃣ Create College (ADMIN Only)

**Request:**
```http
POST {{base_url}}/colleges
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "name": "Stanford University",
  "code": "STANFORD",
  "logo": "https://example.com/stanford-logo.png"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Stanford University",
    "code": "STANFORD",
    "logo": "https://example.com/stanford-logo.png",
    "createdAt": "2026-01-07T10:00:00.000Z"
  }
}
```

#### 6️⃣ List All Colleges

**Request:**
```http
GET {{base_url}}/colleges
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Massachusetts Institute of Technology",
      "code": "MIT",
      "logo": null,
      "_count": {
        "users": 5,
        "clubs": 3,
        "events": 10
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

#### 7️⃣ Create Club (ORGANIZER/ADMIN)

**Request:**
```http
POST {{base_url}}/clubs
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "name": "Computer Science Club",
  "collegeId": {{college_id}},
  "description": "A club for CS enthusiasts",
  "department": "Computer Science",
  "domain": "Technology"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Computer Science Club",
    "collegeId": 1,
    "createdBy": 2,
    "description": "A club for CS enthusiasts",
    "department": "Computer Science",
    "domain": "Technology",
    "createdAt": "2026-01-07T10:00:00.000Z"
  }
}
```

**Postman Test Script:**
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("club_id", response.data.id);
}
```

#### 8️⃣ Join Club

**Request:**
```http
POST {{base_url}}/clubs/{{club_id}}/join
Authorization: Bearer {{auth_token}}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 2,
    "clubId": 1,
    "status": "PENDING",
    "createdAt": "2026-01-07T10:00:00.000Z"
  },
  "message": "Membership request submitted successfully"
}
```

#### 9️⃣ Create Event

**Request:**
```http
POST {{base_url}}/events
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "title": "Tech Meetup 2026",
  "description": "Annual technology meetup for students",
  "dateTime": "2026-02-15T18:00:00.000Z",
  "venue": "Main Auditorium",
  "collegeId": {{college_id}},
  "clubId": {{club_id}},
  "visibility": "ALL",
  "isPaid": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Tech Meetup 2026",
    "description": "Annual technology meetup for students",
    "dateTime": "2026-02-15T18:00:00.000Z",
    "venue": "Main Auditorium",
    "collegeId": 1,
    "clubId": 1,
    "createdBy": 2,
    "visibility": "ALL",
    "isPaid": false,
    "createdAt": "2026-01-07T10:00:00.000Z"
  }
}
```

**Postman Test Script:**
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("event_id", response.data.id);
}
```

#### 🔟 Register for Event

**Request:**
```http
POST {{base_url}}/registrations
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "eventId": {{event_id}}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 2,
    "eventId": 1,
    "qrPayload": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "qrImageUrl": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "attended": false,
    "paymentStatus": null,
    "createdAt": "2026-01-07T10:00:00.000Z"
  },
  "message": "Successfully registered for event"
}
```

**Postman Test Script:**
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("registration_id", response.data.id);
}
```

#### 1️⃣1️⃣ Check-in to Event (QR Scan)

**Request:**
```http
POST {{base_url}}/registrations/checkin
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "qrPayload": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 2,
    "eventId": 1,
    "attended": true,
    "scannedAt": "2026-02-15T17:30:00.000Z",
    "scannedBy": 3,
    "user": {
      "name": "John Doe",
      "email": "john@mit.edu"
    },
    "event": {
      "title": "Tech Meetup 2026"
    }
  },
  "message": "Check-in successful"
}
```

#### 1️⃣2️⃣ Get My Registrations

**Request:**
```http
GET {{base_url}}/registrations/my/list
Authorization: Bearer {{auth_token}}
```

#### 1️⃣3️⃣ Cancel Registration

**Request:**
```http
PUT {{base_url}}/registrations/{{registration_id}}/cancel
Authorization: Bearer {{auth_token}}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration cancelled successfully"
}
```

### Postman Collection Structure

```
College Event SaaS/
├── Auth/
│   ├── Register
│   ├── Login
│   ├── Get Me
│   └── Verify Token
├── Colleges/
│   ├── List Colleges
│   ├── Get College
│   ├── Create College (ADMIN)
│   ├── Update College (ADMIN)
│   └── Delete College (ADMIN)
├── Clubs/
│   ├── List Clubs
│   ├── Get Club
│   ├── Create Club (ORGANIZER)
│   ├── Update Club
│   ├── Delete Club
│   ├── Get My Clubs
│   ├── Join Club
│   ├── Get My Memberships
│   ├── Get Membership Requests
│   └── Approve/Reject Membership
├── Events/
│   ├── List Events
│   ├── Get Event
│   ├── Create Event
│   ├── Update Event
│   ├── Delete Event
│   └── Update Visibility
├── Registrations/
│   ├── Register for Event
│   ├── Get Registration
│   ├── Cancel Registration
│   ├── Check-in
│   └── Get My Registrations
└── System/
    ├── Health Check
    ├── Bootstrap
    └── API Docs
```

### Common Postman Tests

Add these to your collection's Pre-request Script for automatic token handling:

```javascript
// Pre-request Script (Collection level)
const token = pm.environment.get("auth_token");
if (token) {
    pm.request.headers.add({
        key: "Authorization",
        value: `Bearer ${token}`
    });
}
```

Add these to your collection's Tests for better error handling:

```javascript
// Tests (Collection level)
pm.test("Status code is successful", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

pm.test("Response has success property", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property("success");
});

pm.test("No server errors", function () {
    pm.expect(pm.response.code).to.not.be.oneOf([500, 502, 503]);
});
```


## 🏗️ Architecture

### System Architecture

The backend follows a **3-layer architecture** pattern:

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Frontend)                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Layer 1: Routes                         │
│  • Define endpoints                                      │
│  • Apply middleware (auth, validation)                   │
│  • Route to controllers                                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                Layer 2: Controllers                      │
│  • Handle HTTP requests/responses                        │
│  • Call service layer                                    │
│  • Return formatted responses                            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                 Layer 3: Services                        │
│  • Business logic                                        │
│  • Database operations (Prisma)                          │
│  • External API calls                                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Database (PostgreSQL)                   │
└─────────────────────────────────────────────────────────┘
```

### Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   └── swagger.js       # Swagger/OpenAPI config
│   │
│   ├── controllers/         # HTTP request handlers
│   │   ├── auth.controller.js
│   │   ├── bootstrap.controller.js
│   │   ├── club.controller.js
│   │   ├── college.controller.js
│   │   ├── event.controller.js
│   │   └── registration.controller.js
│   │
│   ├── middleware/          # Express middleware
│   │   ├── authMiddleware.js          # JWT authentication
│   │   ├── requestLoggingMiddleware.js # Request logging
│   │   └── validateRequest.js          # Validation middleware
│   │
│   ├── routes/              # API route definitions
│   │   ├── auth.route.js
│   │   ├── bootstrap.route.js
│   │   ├── club.route.js
│   │   ├── college.route.js
│   │   ├── event.route.js
│   │   └── registration.route.js
│   │
│   ├── services/            # Business logic layer
│   │   ├── auth.service.js
│   │   ├── bootstrap.service.js
│   │   ├── club.service.js
│   │   ├── college.service.js
│   │   ├── event.service.js
│   │   └── registration.service.js
│   │
│   ├── utils/               # Utility functions
│   │   ├── asyncHandler.js     # Async error wrapper
│   │   ├── env.js              # Environment validation
│   │   ├── errorHandler.js     # Error formatter
│   │   ├── jwt.js              # JWT utilities
│   │   ├── logger.js           # Logging utility
│   │   ├── pagination.js       # Pagination helper
│   │   ├── prisma.js           # Prisma singleton
│   │   └── validation.js       # Validation utilities
│   │
│   ├── validators/          # Zod validation schemas
│   │   ├── auth.validator.js
│   │   ├── bootstrap.validator.js
│   │   ├── club.validator.js
│   │   ├── college.validator.js
│   │   ├── event.validator.js
│   │   └── registration.validator.js
│   │
│   ├── app.js               # Express app setup
│   ├── server.js            # Server startup
│   └── routes.js            # Main router
│
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── seed.js              # Database seeding
│   └── migrations/          # Database migrations
│
├── package.json             # Dependencies
├── .env                     # Environment variables
└── README.md                # This file
```

### Design Patterns

#### 1. Singleton Pattern (Prisma Client)
```javascript
// utils/prisma.js
let prisma;

export const getPrismaClient = () => {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
};
```

#### 2. Async Handler Wrapper
```javascript
// utils/asyncHandler.js
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

#### 3. Centralized Error Handling
```javascript
// utils/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  // Format and send error response
};
```

#### 4. Middleware Chain
```javascript
// routes/event.route.js
router.post('/',
  authMiddleware,                    // Authentication
  roleMiddleware(['ORGANIZER']),     // Authorization
  validateRequest(eventValidator),   // Validation
  createEventController             // Handler
);
```

### Security Features

#### Password Security
- **Bcrypt hashing** with configurable rounds (default: 10)
- Salt automatically generated per password
- Passwords never stored in plain text

#### JWT Security
- **HS256 algorithm** for token signing
- Configurable expiration (default: 7 days)
- Token includes: userId, role, collegeId
- Verified on every protected route

#### Input Validation
- **Zod schemas** for all inputs
- Type checking and transformation
- Custom error messages
- Nested object validation

#### HTTP Security
- **Helmet** - Sets security headers
- **CORS** - Configurable origins
- **Rate Limiting** - 200 req/15min per IP
- **SQL Injection Prevention** - Prisma parameterized queries

#### Environment Security
- Required variables validated on startup
- Sensitive data in `.env` file
- `.env` added to `.gitignore`

### Performance Optimizations

#### Database
- **Connection pooling** via Prisma
- **Singleton Prisma instance** - single connection
- **Indexed fields** - Fast lookups on foreign keys
- **Pagination** - Prevents loading large datasets
- **Select specific fields** - Reduce data transfer

#### API
- **Async/await** throughout codebase
- **Error handling** doesn't block server
- **Request logging** for debugging
- **Response caching** (ready to implement)

### Error Handling

#### Error Types
```javascript
// Custom error codes
const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
};
```

#### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "issues": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Logging

#### Request Logging
```
[2026-01-07T10:00:00.000Z] INFO: POST /api/auth/login 200 45ms
```

#### Error Logging
```
[2026-01-07T10:00:00.000Z] ERROR: Database connection failed
  at PrismaClient.connect (/path/to/file.js:123:45)
```

#### Structured Logging
```javascript
logger.info('User registered', {
  userId: user.id,
  email: user.email,
  role: user.role
});
```

## 💻 Development

### Available Scripts

```bash
# Development server with auto-reload
npm run dev

# Production server
npm start

# Run database migrations
npm run migrate

# Seed database with sample data
npm run seed

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (Database GUI)
npx prisma studio

# Format code
npm run format

# Lint code
npm run lint
```

### Development Workflow

#### Adding a New Feature

1. **Design the feature**
   - Define requirements
   - Sketch data model
   - Plan API endpoints

2. **Update database schema**
   ```bash
   # Edit prisma/schema.prisma
   npx prisma migrate dev --name add_feature_name
   ```

3. **Create validator**
   ```javascript
   // src/validators/feature.validator.js
   import { z } from 'zod';
   
   export const createFeatureSchema = z.object({
     field: z.string().min(1)
   });
   ```

4. **Create service**
   ```javascript
   // src/services/feature.service.js
   export const createFeature = async (data) => {
     // Business logic and database operations
   };
   ```

5. **Create controller**
   ```javascript
   // src/controllers/feature.controller.js
   export const createFeatureController = asyncHandler(async (req, res) => {
     const result = await createFeature(req.body);
     res.status(201).json({ success: true, data: result });
   });
   ```

6. **Create routes**
   ```javascript
   // src/routes/feature.route.js
   router.post('/', authMiddleware, createFeatureController);
   ```

7. **Add to main router**
   ```javascript
   // src/routes.js
   import featureRoutes from './routes/feature.route.js';
   router.use('/features', featureRoutes);
   ```

8. **Test the feature**
   - Use Postman or cURL
   - Test happy path
   - Test error cases
   - Verify database changes

#### Code Style Guidelines

- Use **ES6+ features** (async/await, arrow functions, destructuring)
- Use **meaningful variable names** (no single letters except loops)
- Keep functions **small and focused** (single responsibility)
- Add **comments** for complex logic
- Use **consistent formatting** (Prettier recommended)
- Follow **naming conventions**:
  - Files: `camelCase.js`
  - Functions: `camelCase()`
  - Classes: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`

#### Git Workflow

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "feat: add feature description"

# Push to remote
git push origin feature/feature-name

# Create pull request
# After review, merge to main
```

#### Commit Message Convention

```
feat: Add new feature
fix: Fix bug in feature
docs: Update documentation
style: Format code
refactor: Refactor feature
test: Add tests
chore: Update dependencies
```

### Testing

#### Manual Testing with cURL

```bash
# Health check
curl http://localhost:3000/api/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "STUDENT",
    "collegeId": 1
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get current user (with token)
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Testing with Swagger UI

1. Start the server: `npm run dev`
2. Open browser: `http://localhost:3000/api-docs`
3. Click "Authorize" button
4. Enter JWT token: `Bearer YOUR_TOKEN`
5. Test endpoints directly in the UI

### Database Management

#### Creating Migrations

```bash
# After changing schema.prisma
npx prisma migrate dev --name descriptive_name

# Example names:
# - add_user_avatar
# - create_notifications_table
# - update_event_visibility
```

#### Seeding Data

```bash
# Run seed file
npm run seed

# Or directly
node prisma/seed.js
```

#### Viewing Database

```bash
# Open Prisma Studio
npx prisma studio

# Opens at http://localhost:5555
```

#### Backup and Restore

```bash
# Backup
pg_dump -U username -d college_events > backup.sql

# Restore
psql -U username -d college_events < backup.sql
```

## 🐛 Troubleshooting

### Common Issues

#### Server won't start

**Problem**: `Error: Cannot find module`
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Problem**: `Error: Port 3000 is already in use`
```bash
# Solution 1: Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill

# Solution 2: Use different port
# In .env: PORT=3001
```

**Problem**: `Error: Environment variable DATABASE_URL is required`
```bash
# Solution: Create .env file with required variables
# See Environment Setup section
```

#### Database Issues

**Problem**: `Can't reach database server`
```bash
# Check if PostgreSQL is running
# Windows
sc query postgresql-x64-14

# Linux/Mac
pg_isready

# Start PostgreSQL
# Windows: Services → PostgreSQL → Start
# Linux: sudo systemctl start postgresql
# Mac: brew services start postgresql
```

**Problem**: `Authentication failed for user`
```bash
# Check DATABASE_URL in .env
# Format: postgresql://user:password@host:port/database
# Verify username and password are correct
```

**Problem**: `Database does not exist`
```bash
# Create database
psql -U postgres
CREATE DATABASE college_events;
\q
```

**Problem**: `Migration failed`
```bash
# Reset database (WARNING: deletes data)
npx prisma migrate reset

# Or manually fix migration
# 1. Check error message
# 2. Fix schema.prisma
# 3. Try migration again
```

#### Authentication Issues

**Problem**: `401 Unauthorized` on protected routes
```bash
# Check Authorization header format
Authorization: Bearer <token>

# Verify token hasn't expired
# Default expiration: 7 days

# Login again to get fresh token
```

**Problem**: `403 Forbidden` error
```bash
# Check user role
# Endpoint may require specific role (ADMIN, ORGANIZER)

# Verify roleMiddleware is configured correctly
```

**Problem**: `Token verification failed`
```bash
# Check JWT_SECRET matches in .env
# Token signed with different secret won't verify

# Ensure JWT_SECRET is at least 32 characters
```

#### Validation Errors

**Problem**: `400 Bad Request` with validation errors
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "issues": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```
```bash
# Solution: Check request body matches schema
# See validator files in src/validators/
# Use Swagger UI to see expected format
```

#### Prisma Issues

**Problem**: `PrismaClient is not configured`
```bash
# Generate Prisma Client
npx prisma generate
```

**Problem**: `Unknown type/field in schema`
```bash
# Format schema
npx prisma format

# Validate schema
npx prisma validate
```

**Problem**: `Migration history conflicts`
```bash
# Reset migration history
npx prisma migrate reset

# WARNING: This deletes all data
```

### Performance Issues

**Problem**: Slow query responses
```bash
# Check database indexes
# Open prisma/schema.prisma
# Add @@index([field]) to frequently queried fields

# Example:
model Event {
  // ...
  @@index([dateTime])
  @@index([visibility])
}
```

**Problem**: High memory usage
```bash
# Check for N+1 queries
# Use Prisma's include wisely
# Add pagination to list endpoints
```

**Problem**: Rate limit errors
```bash
# Default: 200 requests per 15 minutes
# Increase limit in app.js if needed
# Or implement IP whitelist
```

### Debugging Tips

#### Enable Debug Logging

```env
# In .env
LOG_LEVEL=debug
DEBUG=*
```

#### Check Server Logs

```bash
# Request/response logs
# Look for timestamps, status codes, response times

[2026-01-07T10:00:00.000Z] INFO: POST /api/auth/login 200 45ms

# Error logs
[2026-01-07T10:00:00.000Z] ERROR: Database query failed
```

#### Use Prisma Studio

```bash
# View and edit database records
npx prisma studio

# Opens GUI at http://localhost:5555
```

#### Test with cURL/Postman

```bash
# Isolate endpoint issues
# Test authentication separately
# Verify request format
```

### Getting Help

1. **Check Documentation**
   - Read this README
   - Check Swagger UI at `/api-docs`
   - Review error messages

2. **Check Logs**
   - Server console output
   - Database logs
   - Request/response logs

3. **Search Issues**
   - Check GitHub issues (if applicable)
   - Search Stack Overflow
   - Check Prisma docs

4. **Ask for Help**
   - Provide error messages
   - Include relevant code
   - Describe what you've tried

## 📝 License

ISC

## 👥 Contributors

- Your Name - Initial work

## 🙏 Acknowledgments

- Express.js team
- Prisma team
- All open-source contributors

---

**Built with ❤️ for college event management**