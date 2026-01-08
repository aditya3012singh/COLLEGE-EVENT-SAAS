# Cookie Authentication - Visual Flow Diagrams

## 🔐 Authentication Flow Comparison

### BEFORE: localStorage Token Storage
```
┌─────────────────────────────────────────────────────────────┐
│                    LOGIN FLOW (OLD)                          │
└─────────────────────────────────────────────────────────────┘

User                    Frontend              Backend
 │                        │                      │
 │─── Fill form ───────→  │                      │
 │                        │                      │
 │                        │─── POST /login ─────→│
 │                        │                      │
 │                        │  Response:           │
 │                        │  {                   │
 │                        │    token: "jwt...",  │
 │                        │    user: {...}       │
 │                        │  }                   │
 │                        │←──────────────────── │
 │                        │                      │
 │                        │ Store in:            │
 │                        │ localStorage.set     │
 │                        │ ("authToken", token) │
 │                        │                      │
 │  ✅ Logged In          │                      │
 │  (but token vulnerable to XSS ⚠️)            │

Next Request:
┌───────────────────────────────────────────────┐
│  Frontend reads token from localStorage       │
│  Manually adds: Authorization: Bearer token   │
│  ⚠️ JavaScript can access token (XSS risk)    │
└───────────────────────────────────────────────┘
```

### AFTER: HTTP-Only Cookie Storage
```
┌─────────────────────────────────────────────────────────────┐
│                    LOGIN FLOW (NEW)                          │
└─────────────────────────────────────────────────────────────┘

User                    Frontend              Backend
 │                        │                      │
 │─── Fill form ───────→  │                      │
 │                        │                      │
 │                        │─── POST /login ─────→│
 │                        │                      │
 │                        │  Set-Cookie header:  │
 │                        │  authToken=jwt...;   │
 │                        │  HttpOnly;           │
 │                        │  Secure;             │
 │                        │  SameSite=Lax;       │
 │                        │                      │
 │                        │  Response:           │
 │                        │  {                   │
 │                        │    user: {...}       │
 │                        │  }                   │
 │                        │←──────────────────── │
 │                        │                      │
 │                        │ Browser stores       │
 │                        │ cookie automatically │
 │                        │                      │
 │  ✅ Logged In (Secure!)                       │
 │  ✅ Token NOT accessible to JavaScript        │

Next Request:
┌──────────────────────────────────────┐
│  Browser automatically includes:     │
│  Cookie: authToken=jwt...           │
│  ✅ JavaScript CANNOT access token  │
│  ✅ XSS-safe                        │
└──────────────────────────────────────┘
```

## 🔄 Cookie vs localStorage

```
┌─────────────────────────────────────────────────────────────┐
│                    FEATURE COMPARISON                        │
├──────────────────────┬──────────────┬───────────────────────┤
│ Feature              │ localStorage │ HTTP-only Cookie      │
├──────────────────────┼──────────────┼───────────────────────┤
│ XSS Protection       │ ❌ None      │ ✅ Protected (HttpO)  │
│ CSRF Protection      │ ❌ None      │ ✅ Protected (SameSi) │
│ Auto Transmission    │ ❌ Manual    │ ✅ Automatic          │
│ JS Accessibility     │ ⚠️ Yes       │ ✅ No (HttpOnly)      │
│ Secure Flag (HTTPS)  │ ❌ N/A       │ ✅ Supported          │
│ Expiration           │ ❌ Manual    │ ✅ Automatic          │
│ Domain Scoped        │ ❌ No        │ ✅ Yes                │
│ Path Scoped          │ ❌ No        │ ✅ Yes                │
│ Request Header Mgmt  │ ⚠️ Manual    │ ✅ Automatic          │
│ Server Control       │ ❌ None      │ ✅ Full               │
└──────────────────────┴──────────────┴───────────────────────┘
```

## 🌊 Complete Request/Response Cycle

### PROTECTED ROUTE REQUEST (After Login)

```
┌──────────────────────────────────────────────────────────────┐
│           ACCESSING PROTECTED ROUTE WITH COOKIE              │
└──────────────────────────────────────────────────────────────┘

Step 1: Browser Makes Request
┌─────────────────────────────────────┐
│ Frontend: api.get("/auth/me")       │
│ Browser automatically adds:         │
│   Cookie: authToken=jwt_token...    │
└─────────────────────────────────────┘
           ↓
Step 2: Backend Receives Request
┌─────────────────────────────────────┐
│ Headers: {                          │
│   Cookie: authToken=jwt_token...    │
│ }                                   │
└─────────────────────────────────────┘
           ↓
Step 3: Auth Middleware Processes
┌─────────────────────────────────────┐
│ authMiddleware:                     │
│ 1. Extract token from req.cookies   │
│ 2. Verify JWT signature             │
│ 3. Decode user info                 │
│ 4. Attach user to req.user          │
│ 5. Call next()                      │
└─────────────────────────────────────┘
           ↓
Step 4: Route Handler Executes
┌─────────────────────────────────────┐
│ router.get("/me", middleware,       │
│   getMeController)                  │
│                                     │
│ Controller:                         │
│ if (!req.user) return 401           │
│ return res.json({ user: req.user }) │
└─────────────────────────────────────┘
           ↓
Step 5: Response Sent to Frontend
┌─────────────────────────────────────┐
│ Status: 200                         │
│ Body: { user: {...} }               │
│ Headers: Set-Cookie: none           │
│ (Cookie remains in browser)         │
└─────────────────────────────────────┘
```

## 🚪 Logout Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      LOGOUT FLOW                             │
└──────────────────────────────────────────────────────────────┘

User clicks Logout
      ↓
Frontend calls: api.post("/auth/logout")
      ↓
Browser sends:
      ├─ Cookie: authToken=jwt_token...
      └─ (automatic)
      ↓
Backend receives:
      ├─ logoutController is called
      ├─ res.clearCookie('authToken', {...})
      └─ Set-Cookie: authToken=; expires=past; ...
      ↓
Response sent:
      ├─ Status: 200
      ├─ Message: "Logout successful"
      └─ Set-Cookie header clears cookie
      ↓
Browser receives:
      ├─ Processes Set-Cookie header
      ├─ Deletes authToken cookie
      └─ Future requests won't include it
      ↓
Frontend:
      ├─ Clears localStorage (user data)
      ├─ Redirects to /auth
      └─ User must login again
```

## 🎯 Cookie Attributes Explained

```
res.cookie('authToken', token, {
  
  // 🔐 SECURITY OPTIONS
  httpOnly: true,
    └─ JavaScript CANNOT access via document.cookie
    └─ Protection: XSS attacks
    
  secure: true,
    └─ Sent ONLY over HTTPS (in production)
    └─ Protection: Man-in-the-middle attacks
    
  sameSite: 'lax',
    └─ Only sent on same-site requests
    └─ 'lax' = sent on navigation, not cross-site
    └─ Protection: CSRF attacks
  
  // ⏱️ LIFETIME
  maxAge: 3600000,
    └─ Expiration in milliseconds
    └─ 3600000ms = 1 hour
    └─ After 1 hour, cookie automatically deleted
    
  // 🌍 SCOPE
  path: '/',
    └─ Cookie sent to all paths under /
    └─ Not sent to /admin if path was '/api'
    
  domain: undefined,
    └─ Current domain only (implicit)
    └─ Not sent to other domains
})
```

## 📊 State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│              REDUX STATE AFTER CHANGES                       │
└─────────────────────────────────────────────────────────────┘

BEFORE:
state.auth = {
  user: {id, name, email, ...},
  token: "eyJhbGciOiJIUzI1NiI...",  ← Stored here
  isAuthenticated: true,
  loading: false,
  error: null
}

AFTER:
state.auth = {
  user: {id, name, email, ...},
  token: null,                        ← Removed (in cookie)
  isAuthenticated: true,              ← Still tracks auth state
  loading: false,
  error: null
}

WHERE IS TOKEN NOW?
├─ NOT in localStorage
├─ NOT in Redux state
├─ NOT in response body
└─ ✅ In HTTP-only cookie (browser storage)
```

## 🔌 Axios Interceptor Changes

```
BEFORE:
┌───────────────────────────────────────┐
│ Request Interceptor                   │
├───────────────────────────────────────┤
│ 1. Read token from localStorage       │
│ 2. Check if token exists              │
│ 3. If yes:                            │
│    Add header: Authorization: Bearer  │
│ 4. Return modified config             │
│                                       │
│ ⚠️ Manual, repetitive, XSS risk      │
└───────────────────────────────────────┘

AFTER:
┌───────────────────────────────────────┐
│ REMOVED Request Interceptor           │
│ withCredentials: true handles it!     │
├───────────────────────────────────────┤
│ withCredentials: true               │
│   └─ Tells axios to:                 │
│      1. Send cookies automatically   │
│      2. Include credentials in CORS  │
│      3. Respect browser cookie rules │
│                                       │
│ ✅ Automatic, secure, XSS-safe      │
└───────────────────────────────────────┘
```

## ✅ Security Timeline

```
Timestamp    Event                           Cookie Status
─────────────────────────────────────────────────────────
T+0          User logs in                   ⚪ Not set
T+0.1s       Server creates JWT            ⚪ Created
T+0.2s       Server sets cookie            🟢 Set (HttpOnly)
T+0.3s       Response sent to frontend     🟢 Active
T+0.4s       Browser stores cookie         🟢 Stored
T+1s         User makes request            🟢 Included
T+30min      Cookie still valid            🟢 Active
T+1hour      Cookie expires                ❌ Expired
T+1hour 1s   User makes request            ❌ Not included
T+1hour 2s   401 Unauthorized response     ❌ Redirects to login
```

## 🎓 Key Points

```
┌─────────────────────────────────────────────────────────────┐
│                    REMEMBER                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 1️⃣  TOKEN LOCATION                                          │
│    └─ Stored in HTTP-only cookie, NOT in state/storage     │
│                                                              │
│ 2️⃣  AUTOMATIC TRANSMISSION                                 │
│    └─ Browser sends cookie automatically with requests     │
│    └─ No manual header management needed                   │
│                                                              │
│ 3️⃣  SECURITY                                               │
│    └─ httpOnly: Protects from XSS                          │
│    └─ sameSite: Protects from CSRF                         │
│    └─ secure: Protects from MITM (HTTPS only)             │
│                                                              │
│ 4️⃣  EXPIRATION                                             │
│    └─ Automatic 1-hour expiration                          │
│    └─ Browser deletes after expiry                         │
│                                                              │
│ 5️⃣  NO CODE CHANGES IN COMPONENTS                          │
│    └─ useAuth hook still works the same                    │
│    └─ Just call login() or logout()                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

**Visual Guide Complete!** Use these diagrams to understand how the cookie authentication works in your application.
