# Redux Store Documentation

This directory contains the Redux Toolkit store configuration, API thunks, slices, selectors, and custom hooks for the College Event SaaS frontend.

## 📁 Structure

```
store/
├── api/                    # API thunks (async actions)
│   ├── auth.thunk.js      # Authentication API calls
│   ├── college.thunk.js   # College API calls
│   ├── club.thunk.js      # Club API calls
│   ├── event.thunk.js     # Event API calls
│   ├── registration.thunk.js # Registration API calls
│   ├── bootstrap.thunk.js # Bootstrap API calls
│   └── index.js           # Export all thunks
├── slices/                 # Redux slices (state + reducers)
│   ├── auth.slice.js      # Auth state management
│   ├── college.slice.js   # College state management
│   ├── club.slice.js      # Club state management
│   ├── event.slice.js     # Event state management
│   ├── registration.slice.js # Registration state management
│   └── index.js           # Export all slices
├── store.js               # Store configuration
├── provider.js            # Redux Provider component
├── selectors.js           # State selectors
├── hooks.js               # Custom hooks
└── index.js               # Main exports
```

## 🚀 Usage Examples

### Using Custom Hooks (Recommended)

```javascript
"use client";
import { useAuth, useEvents, useUserRole } from "@/store/hooks";

export default function MyComponent() {
  // Auth hook
  const { user, login, logout, isAuthenticated } = useAuth();
  
  // Events hook
  const { events, getAllEvents, createEvent, loading } = useEvents();
  
  // User role hook
  const { isAdmin, isOrganizer, isStudent } = useUserRole();
  
  // Use in your component
  useEffect(() => {
    if (isAuthenticated) {
      getAllEvents();
    }
  }, [isAuthenticated, getAllEvents]);
  
  return (
    <div>
      {loading ? "Loading..." : events.map(event => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  );
}
```

### Using Dispatch and Selectors Directly

```javascript
"use client";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/store/api/auth.thunk";
import { selectUser, selectAuthLoading } from "@/store/selectors";

export default function LoginForm() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const credentials = {
      email: formData.get("email"),
      password: formData.get("password"),
    };
    
    await dispatch(login(credentials));
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

## 📚 Available Hooks

### Auth Hook (`useAuth`)
```javascript
const {
  user,           // Current user object
  isAuthenticated, // Boolean
  loading,        // Boolean
  error,          // Error object or null
  register,       // Function(userData)
  login,          // Function(credentials)
  logout,         // Function()
  getCurrentUser, // Function()
  verifyToken,    // Function()
} = useAuth();
```

### Colleges Hook (`useColleges`)
```javascript
const {
  colleges,        // Array of colleges
  selectedCollege, // Selected college object
  pagination,      // Pagination info
  loading,         // Boolean
  error,           // Error object or null
  getAllColleges,  // Function({ page, limit })
  getCollegeById,  // Function(id)
  createCollege,   // Function(data)
  updateCollege,   // Function(id, data)
  deleteCollege,   // Function(id)
} = useColleges();
```

### Clubs Hook (`useClubs`)
```javascript
const {
  clubs,                  // All clubs
  myClubs,                // User's created clubs
  myMemberships,          // User's club memberships
  membershipRequests,     // Pending membership requests
  selectedClub,           // Selected club object
  pagination,             // Pagination info
  loading,                // Boolean
  error,                  // Error object or null
  getAllClubs,            // Function({ page, limit, collegeId })
  getClubById,            // Function(id)
  getMyClubs,             // Function()
  getMyMemberships,       // Function()
  createClub,             // Function(data)
  updateClub,             // Function(id, data)
  deleteClub,             // Function(id)
  joinClub,               // Function(clubId)
  getMembershipRequests,  // Function()
  updateMembershipStatus, // Function(id, status)
} = useClubs();
```

### Events Hook (`useEvents`)
```javascript
const {
  events,                  // Array of events
  selectedEvent,           // Selected event object
  pagination,              // Pagination info
  loading,                 // Boolean
  error,                   // Error object or null
  getAllEvents,            // Function({ page, limit, visibility, clubId })
  getEventById,            // Function(id)
  createEvent,             // Function(data)
  updateEvent,             // Function(id, data)
  deleteEvent,             // Function(id)
  updateEventVisibility,   // Function(id, visibility, allowedColleges)
} = useEvents();
```

### Registrations Hook (`useRegistrations`)
```javascript
const {
  registrations,        // Array of registrations
  selectedRegistration, // Selected registration object
  loading,              // Boolean
  error,                // Error object or null
  registerForEvent,     // Function(eventId)
  getRegistrationById,  // Function(id)
  cancelRegistration,   // Function(id)
  checkInEvent,         // Function(qrPayload)
} = useRegistrations();
```

### User Role Hook (`useUserRole`)
```javascript
const {
  role,        // User role string
  isAdmin,     // Boolean
  isOrganizer, // Boolean
  isStudent,   // Boolean
  collegeId,   // User's college ID
} = useUserRole();
```

### Bootstrap Hook (`useBootstrap`)
```javascript
const {
  bootstrapSystem, // Function(data)
} = useBootstrap();
```

## 🔧 API Response Handling

All API calls return promises and handle success/error states automatically:

```javascript
const { login } = useAuth();

const handleLogin = async () => {
  try {
    const result = await login({ email, password });
    // result.payload contains the response data
    console.log("Logged in:", result.payload);
  } catch (error) {
    // error is available in the hook's error state
    console.error("Login failed:", error);
  }
};
```

## 🎯 State Structure

### Auth State
```javascript
{
  user: { id, name, email, role, collegeId, ... } | null,
  token: "jwt-token" | null,
  isAuthenticated: boolean,
  loading: boolean,
  error: { message, code, issues } | null
}
```

### Colleges State
```javascript
{
  colleges: [{ id, name, code, logo, ... }],
  selectedCollege: { id, name, ... } | null,
  pagination: { page, limit, total, totalPages },
  loading: boolean,
  error: { message, code } | null
}
```

### Clubs State
```javascript
{
  clubs: [{ id, name, collegeId, ... }],
  myClubs: [{ id, name, ... }],
  myMemberships: [{ id, clubId, status, ... }],
  membershipRequests: [{ id, userId, clubId, status, ... }],
  selectedClub: { id, name, ... } | null,
  pagination: { page, limit, total, totalPages },
  loading: boolean,
  error: { message, code } | null
}
```

### Events State
```javascript
{
  events: [{ id, title, dateTime, venue, ... }],
  selectedEvent: { id, title, ... } | null,
  pagination: { page, limit, total, totalPages },
  loading: boolean,
  error: { message, code } | null
}
```

### Registrations State
```javascript
{
  registrations: [{ id, eventId, userId, qrPayload, ... }],
  selectedRegistration: { id, eventId, ... } | null,
  loading: boolean,
  error: { message, code } | null
}
```

## 🔐 Authentication Flow

```javascript
// 1. Login
const { login } = useAuth();
await login({ email, password });
// Token is automatically saved to localStorage
// User data is stored in Redux state

// 2. Auto-login on page load
useEffect(() => {
  const token = localStorage.getItem("authToken");
  if (token) {
    getCurrentUser(); // Fetch current user with token
  }
}, []);

// 3. Protected routes
const { isAuthenticated } = useAuth();
if (!isAuthenticated) {
  router.push("/auth");
}

// 4. Logout
const { logout } = useAuth();
await logout();
// Token is removed from localStorage
// User is cleared from Redux state
```

## 📝 Best Practices

1. **Use Custom Hooks**: They provide a clean API and handle common use cases
2. **Handle Loading States**: Show loading indicators while `loading` is true
3. **Handle Errors**: Display error messages from the `error` state
4. **Clear Errors**: Call `clearError` action when dismissing error messages
5. **Type Safety**: Consider adding TypeScript for better type safety
6. **Memoization**: Hooks use `useCallback` to prevent unnecessary re-renders

## 🔄 Data Flow

```
Component → Hook → Thunk → API Call → Response → Reducer → State Update → Component Re-render
```

## 🎨 Integration with Next.js

Wrap your app with the Redux Provider in `layout.js`:

```javascript
// app/layout.js
import ReduxProvider from "@/store/provider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
```

## 🧪 Testing

```javascript
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "@/store";
import MyComponent from "./MyComponent";

test("renders component with Redux", () => {
  render(
    <Provider store={store}>
      <MyComponent />
    </Provider>
  );
  // Your test assertions
});
```

## 📖 Additional Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Redux Hooks](https://react-redux.js.org/api/hooks)
- [Next.js with Redux](https://nextjs.org/docs/pages/building-your-application/data-fetching/redux)
