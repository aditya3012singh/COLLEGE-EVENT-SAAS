# Complete API to Redux Mapping

This document maps all backend API endpoints to their corresponding Redux thunk actions.

## 📡 Backend API → Redux Actions

### Authentication (`/api/auth`)

| Backend Endpoint | Method | Redux Thunk | Hook Usage |
|-----------------|--------|-------------|------------|
| `/auth/register` | POST | `register(userData)` | `useAuth().register` |
| `/auth/login` | POST | `login(credentials)` | `useAuth().login` |
| `/auth/me` | GET | `getCurrentUser()` | `useAuth().getCurrentUser` |
| `/auth/verify` | GET | `verifyToken()` | `useAuth().verifyToken` |
| N/A | N/A | `logout()` | `useAuth().logout` |

**Example:**
```javascript
const { register, login, getCurrentUser, logout } = useAuth();

// Register
await register({
  name: "John Doe",
  email: "john@example.com",
  password: "password123",
  role: "STUDENT",
  collegeId: 1
});

// Login
await login({
  email: "john@example.com",
  password: "password123"
});

// Get current user
await getCurrentUser();

// Logout
await logout();
```

---

### Colleges (`/api/colleges`)

| Backend Endpoint | Method | Redux Thunk | Hook Usage |
|-----------------|--------|-------------|------------|
| `/colleges` | GET | `getAllColleges({ page, limit })` | `useColleges().getAllColleges` |
| `/colleges/:id` | GET | `getCollegeById(id)` | `useColleges().getCollegeById` |
| `/colleges` | POST | `createCollege(data)` | `useColleges().createCollege` |
| `/colleges/:id` | PUT | `updateCollege({ id, data })` | `useColleges().updateCollege` |
| `/colleges/:id` | DELETE | `deleteCollege(id)` | `useColleges().deleteCollege` |

**Example:**
```javascript
const { getAllColleges, createCollege, updateCollege } = useColleges();

// Get all colleges
await getAllColleges({ page: 1, limit: 20 });

// Create college (ADMIN only)
await createCollege({
  name: "MIT",
  code: "MIT",
  logo: "https://example.com/logo.png"
});

// Update college
await updateCollege(1, {
  name: "Massachusetts Institute of Technology"
});
```

---

### Clubs (`/api/clubs`)

| Backend Endpoint | Method | Redux Thunk | Hook Usage |
|-----------------|--------|-------------|------------|
| `/clubs` | GET | `getAllClubs({ page, limit, collegeId })` | `useClubs().getAllClubs` |
| `/clubs/:id` | GET | `getClubById(id)` | `useClubs().getClubById` |
| `/clubs/my/list` | GET | `getMyClubs()` | `useClubs().getMyClubs` |
| `/clubs/my/memberships` | GET | `getMyMemberships()` | `useClubs().getMyMemberships` |
| `/clubs` | POST | `createClub(data)` | `useClubs().createClub` |
| `/clubs/:id` | PUT | `updateClub({ id, data })` | `useClubs().updateClub` |
| `/clubs/:id` | DELETE | `deleteClub(id)` | `useClubs().deleteClub` |
| `/clubs/:id/join` | POST | `joinClub(clubId)` | `useClubs().joinClub` |
| `/clubs/membership-requests` | GET | `getMembershipRequests()` | `useClubs().getMembershipRequests` |
| `/clubs/memberships/:id` | PUT | `updateMembershipStatus({ id, status })` | `useClubs().updateMembershipStatus` |

**Example:**
```javascript
const { 
  getAllClubs, 
  createClub, 
  joinClub, 
  updateMembershipStatus 
} = useClubs();

// Get all clubs
await getAllClubs({ page: 1, limit: 20, collegeId: 1 });

// Create club (ORGANIZER/ADMIN)
await createClub({
  name: "Computer Science Club",
  collegeId: 1,
  description: "For CS enthusiasts",
  department: "Computer Science",
  domain: "Technology"
});

// Join club
await joinClub(5);

// Approve membership (Club owner)
await updateMembershipStatus(10, "APPROVED");
```

---

### Events (`/api/events`)

| Backend Endpoint | Method | Redux Thunk | Hook Usage |
|-----------------|--------|-------------|------------|
| `/events` | GET | `getAllEvents({ page, limit, visibility, clubId })` | `useEvents().getAllEvents` |
| `/events/:id` | GET | `getEventById(id)` | `useEvents().getEventById` |
| `/events` | POST | `createEvent(data)` | `useEvents().createEvent` |
| `/events/:id` | PUT | `updateEvent({ id, data })` | `useEvents().updateEvent` |
| `/events/:id` | DELETE | `deleteEvent(id)` | `useEvents().deleteEvent` |
| `/events/:id/visibility` | PUT | `updateEventVisibility({ id, visibility, allowedColleges })` | `useEvents().updateEventVisibility` |

**Example:**
```javascript
const { getAllEvents, createEvent, updateEventVisibility } = useEvents();

// Get all events
await getAllEvents({ 
  page: 1, 
  limit: 20, 
  visibility: "ALL" 
});

// Create event (ORGANIZER/ADMIN)
await createEvent({
  title: "Tech Meetup 2026",
  description: "Annual tech event",
  dateTime: "2026-02-15T18:00:00.000Z",
  venue: "Main Auditorium",
  collegeId: 1,
  clubId: 2,
  visibility: "ALL",
  isPaid: false
});

// Update visibility
await updateEventVisibility(5, "SELECTED", [1, 2, 3]);
```

---

### Registrations (`/api/registrations`)

| Backend Endpoint | Method | Redux Thunk | Hook Usage |
|-----------------|--------|-------------|------------|
| `/registrations` | POST | `registerForEvent(eventId)` | `useRegistrations().registerForEvent` |
| `/registrations/:id` | GET | `getRegistrationById(id)` | `useRegistrations().getRegistrationById` |
| `/registrations/:id/cancel` | PUT | `cancelRegistration(id)` | `useRegistrations().cancelRegistration` |
| `/registrations/checkin` | POST | `checkInEvent(qrPayload)` | `useRegistrations().checkInEvent` |

**Example:**
```javascript
const { registerForEvent, cancelRegistration, checkInEvent } = useRegistrations();

// Register for event (STUDENT)
await registerForEvent(10);

// Cancel registration
await cancelRegistration(5);

// Check-in (ORGANIZER/ADMIN)
await checkInEvent("qr-payload-string");
```

---

### Bootstrap (`/bootstrap`)

| Backend Endpoint | Method | Redux Thunk | Hook Usage |
|-----------------|--------|-------------|------------|
| `/bootstrap` | POST | `bootstrapSystem(data)` | `useBootstrap().bootstrapSystem` |

**Example:**
```javascript
const { bootstrapSystem } = useBootstrap();

// Bootstrap system (first-time setup)
await bootstrapSystem({
  adminName: "System Admin",
  adminEmail: "admin@example.com",
  adminPassword: "admin123456",
  collegeName: "MIT",
  collegeCode: "MIT"
});
```

---

## 🎯 Complete Usage Example

```javascript
"use client";
import { useEffect } from "react";
import {
  useAuth,
  useColleges,
  useClubs,
  useEvents,
  useRegistrations,
  useUserRole
} from "@/store/hooks";

export default function Dashboard() {
  const { user, isAuthenticated, getCurrentUser } = useAuth();
  const { colleges, getAllColleges } = useColleges();
  const { clubs, getAllClubs } = useClubs();
  const { events, getAllEvents } = useEvents();
  const { registrations } = useRegistrations();
  const { isAdmin, isOrganizer, isStudent } = useUserRole();

  useEffect(() => {
    if (isAuthenticated) {
      // Load all necessary data
      getCurrentUser();
      getAllColleges();
      getAllClubs();
      getAllEvents();
    }
  }, [isAuthenticated]);

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      
      {isAdmin && (
        <div>
          <h2>Colleges ({colleges.length})</h2>
          {/* Display colleges */}
        </div>
      )}
      
      {isOrganizer && (
        <div>
          <h2>My Clubs ({clubs.length})</h2>
          {/* Display clubs */}
        </div>
      )}
      
      {isStudent && (
        <div>
          <h2>Available Events ({events.length})</h2>
          {/* Display events */}
        </div>
      )}
    </div>
  );
}
```

## 📊 State Structure Reference

```javascript
// Complete Redux state tree
{
  auth: {
    user: { id, name, email, role, collegeId },
    token: "jwt-token",
    isAuthenticated: true,
    loading: false,
    error: null
  },
  
  colleges: {
    colleges: [{ id, name, code, logo }],
    selectedCollege: { id, name, ... },
    pagination: { page: 1, limit: 20, total: 100, totalPages: 5 },
    loading: false,
    error: null
  },
  
  clubs: {
    clubs: [{ id, name, collegeId, ... }],
    myClubs: [{ id, name, ... }],
    myMemberships: [{ id, clubId, status, ... }],
    membershipRequests: [{ id, userId, clubId, ... }],
    selectedClub: { id, name, ... },
    pagination: { page: 1, limit: 20, total: 50, totalPages: 3 },
    loading: false,
    error: null
  },
  
  events: {
    events: [{ id, title, dateTime, venue, ... }],
    selectedEvent: { id, title, ... },
    pagination: { page: 1, limit: 20, total: 200, totalPages: 10 },
    loading: false,
    error: null
  },
  
  registrations: {
    registrations: [{ id, eventId, userId, qrPayload, ... }],
    selectedRegistration: { id, eventId, ... },
    loading: false,
    error: null
  }
}
```

## 🔄 Common Workflows

### Student Registration Flow
```javascript
// 1. Student views available events
await getAllEvents();

// 2. Student registers for an event
await registerForEvent(eventId);

// 3. Student receives QR code (in registration object)
// 4. At event, organizer scans QR code
await checkInEvent(qrPayload);
```

### Club Creation and Management Flow
```javascript
// 1. Organizer creates club
await createClub({ name, collegeId, ... });

// 2. Students join club
await joinClub(clubId);

// 3. Organizer reviews membership requests
await getMembershipRequests();

// 4. Organizer approves/rejects requests
await updateMembershipStatus(requestId, "APPROVED");
```

### Event Creation and Registration Flow
```javascript
// 1. Organizer creates event
await createEvent({ title, dateTime, venue, ... });

// 2. Set event visibility
await updateEventVisibility(eventId, "SELECTED", [collegeId1, collegeId2]);

// 3. Students register
await registerForEvent(eventId);

// 4. Event day - check-in attendees
await checkInEvent(qrPayload);
```
