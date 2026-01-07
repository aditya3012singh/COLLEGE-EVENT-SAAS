# Redux Store Quick Reference

## 🎯 Common Usage Patterns

### 1. Authentication

```javascript
"use client";
import { useAuth } from "@/store/hooks";

export default function LoginPage() {
  const { login, loading, error, isAuthenticated } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    await login({
      email: formData.get("email"),
      password: formData.get("password"),
    });
  };

  if (isAuthenticated) {
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error.message}</div>}
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

### 2. Listing Events

```javascript
"use client";
import { useEffect } from "react";
import { useEvents } from "@/store/hooks";

export default function EventsList() {
  const { events, getAllEvents, loading, error, pagination } = useEvents();

  useEffect(() => {
    getAllEvents({ page: 1, limit: 20 });
  }, [getAllEvents]);

  if (loading) return <div>Loading events...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {events.map((event) => (
        <div key={event.id}>
          <h3>{event.title}</h3>
          <p>{event.description}</p>
          <p>Date: {new Date(event.dateTime).toLocaleDateString()}</p>
          <p>Venue: {event.venue}</p>
        </div>
      ))}
      <div>
        Page {pagination.page} of {pagination.totalPages}
      </div>
    </div>
  );
}
```

### 3. Creating a Club

```javascript
"use client";
import { useClubs } from "@/store/hooks";
import { useRouter } from "next/navigation";

export default function CreateClubForm() {
  const { createClub, loading, error } = useClubs();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const result = await createClub({
      name: formData.get("name"),
      description: formData.get("description"),
      department: formData.get("department"),
      domain: formData.get("domain"),
      collegeId: parseInt(formData.get("collegeId")),
    });

    if (result.type.endsWith("/fulfilled")) {
      router.push("/clubs");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error.message}</div>}
      <input name="name" placeholder="Club Name" required />
      <textarea name="description" placeholder="Description" />
      <input name="department" placeholder="Department" />
      <input name="domain" placeholder="Domain" />
      <select name="collegeId" required>
        <option value="">Select College</option>
        {/* Map colleges here */}
      </select>
      <button disabled={loading}>
        {loading ? "Creating..." : "Create Club"}
      </button>
    </form>
  );
}
```

### 4. Event Registration

```javascript
"use client";
import { useRegistrations } from "@/store/hooks";

export default function EventRegistration({ eventId }) {
  const { registerForEvent, loading, error } = useRegistrations();

  const handleRegister = async () => {
    const result = await registerForEvent(eventId);
    
    if (result.type.endsWith("/fulfilled")) {
      alert("Successfully registered! Check your email for QR code.");
    }
  };

  return (
    <div>
      {error && <div className="error">{error.message}</div>}
      <button onClick={handleRegister} disabled={loading}>
        {loading ? "Registering..." : "Register for Event"}
      </button>
    </div>
  );
}
```

### 5. Role-Based Rendering

```javascript
"use client";
import { useUserRole } from "@/store/hooks";

export default function Dashboard() {
  const { isAdmin, isOrganizer, isStudent } = useUserRole();

  return (
    <div>
      {isAdmin && <AdminPanel />}
      {isOrganizer && <OrganizerPanel />}
      {isStudent && <StudentPanel />}
    </div>
  );
}
```

### 6. Protected Route

```javascript
"use client";
import { useEffect } from "react";
import { useAuth } from "@/store/hooks";
import { useRouter } from "next/navigation";

export default function ProtectedPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return <div>Protected Content</div>;
}
```

### 7. Auto-login on App Load

```javascript
// app/layout.js
"use client";
import { useEffect } from "react";
import { useAuth } from "@/store/hooks";
import ReduxProvider from "@/store/provider";

function AuthInitializer({ children }) {
  const { getCurrentUser, verifyToken } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      verifyToken().then((result) => {
        if (result.type.endsWith("/fulfilled")) {
          getCurrentUser();
        }
      });
    }
  }, []);

  return children;
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <AuthInitializer>
            {children}
          </AuthInitializer>
        </ReduxProvider>
      </body>
    </html>
  );
}
```

### 8. Pagination

```javascript
"use client";
import { useEvents } from "@/store/hooks";

export default function EventsWithPagination() {
  const { events, pagination, getAllEvents } = useEvents();

  const handlePageChange = (newPage) => {
    getAllEvents({ page: newPage, limit: 20 });
  };

  return (
    <div>
      {events.map((event) => (
        <div key={event.id}>{event.title}</div>
      ))}
      
      <div className="pagination">
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
        >
          Previous
        </button>
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### 9. Club Membership Approval

```javascript
"use client";
import { useEffect } from "react";
import { useClubs } from "@/store/hooks";

export default function MembershipRequests() {
  const { 
    membershipRequests, 
    getMembershipRequests, 
    updateMembershipStatus,
    loading 
  } = useClubs();

  useEffect(() => {
    getMembershipRequests();
  }, [getMembershipRequests]);

  const handleApprove = (requestId) => {
    updateMembershipStatus(requestId, "APPROVED");
  };

  const handleReject = (requestId) => {
    updateMembershipStatus(requestId, "REJECTED");
  };

  return (
    <div>
      {membershipRequests.map((request) => (
        <div key={request.id}>
          <p>{request.user.name} wants to join {request.club.name}</p>
          <button onClick={() => handleApprove(request.id)}>
            Approve
          </button>
          <button onClick={() => handleReject(request.id)}>
            Reject
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 10. Error Handling

```javascript
"use client";
import { useEffect } from "react";
import { useEvents } from "@/store/hooks";

export default function EventsWithErrorHandling() {
  const { events, getAllEvents, loading, error } = useEvents();

  useEffect(() => {
    getAllEvents().catch((err) => {
      console.error("Failed to load events:", err);
    });
  }, [getAllEvents]);

  if (loading) {
    return <div className="spinner">Loading...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Events</h3>
        <p>{error.message}</p>
        {error.issues && (
          <ul>
            {error.issues.map((issue, i) => (
              <li key={i}>{issue.message}</li>
            ))}
          </ul>
        )}
        <button onClick={() => getAllEvents()}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      {events.map((event) => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  );
}
```

## 🎨 State Selectors

If you need direct access to state without hooks:

```javascript
import { useSelector } from "react-redux";
import { 
  selectUser, 
  selectAllEvents, 
  selectIsAuthenticated 
} from "@/store/selectors";

export default function MyComponent() {
  const user = useSelector(selectUser);
  const events = useSelector(selectAllEvents);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return <div>...</div>;
}
```

## ⚡ Performance Tips

1. **Memoize selectors** for derived state:
```javascript
import { useMemo } from "react";
import { useEvents } from "@/store/hooks";

const upcomingEvents = useMemo(() => {
  return events.filter(e => new Date(e.dateTime) > new Date());
}, [events]);
```

2. **Avoid unnecessary re-renders** with `useCallback`:
```javascript
const handleClick = useCallback(() => {
  createEvent(data);
}, [createEvent, data]);
```

3. **Use selective updates** when updating state:
```javascript
// Instead of fetching all events after creating one
// The slice automatically adds the new event to the array
await createEvent(newEventData);
// No need to call getAllEvents() again
```
