# Backend-Frontend Connection Check

## ✅ Configuration Summary

### Backend (Express Server)
- **Port**: 3000 (default)
- **Base URL**: `http://localhost:3000`
- **API Prefix**: `/api`
- **Full API URL**: `http://localhost:3000/api`
- **CORS Origin**: `http://localhost:5173` (Vite default port)

### Frontend (Vite + React)
- **Port**: 5173 (Vite default)
- **API Base URL**: `http://localhost:3000/api` (from `VITE_API_BASE` env var or default)
- **Axios Config**: `withCredentials: true` (for cookies/auth)

## ✅ Connection Status

### Ports Match ✓
- Backend: `3000`
- Frontend API target: `3000` ✓

### CORS Configuration ✓
- Backend allows: `http://localhost:5173`
- Frontend runs on: `http://localhost:5173` ✓

### API Endpoints Match ✓

| Frontend Route | Backend Route | Auth Required | Status |
|---------------|---------------|---------------|--------|
| `POST /api/auth/register` | `POST /api/auth/register` | No | ✓ |
| `POST /api/auth/login` | `POST /api/auth/login` | No | ✓ |
| `GET /api/auth/verify` | `GET /api/auth/verify` | Yes | ✓ |
| `GET /api/colleges` | `GET /api/colleges` | No | ✓ |
| `GET /api/clubs` | `GET /api/clubs` | No | ✓ |
| `GET /api/events` | `GET /api/events` | Yes | ✓ |
| `GET /api/events/:id` | `GET /api/events/:id` | Yes | ✓ |
| `POST /api/events` | `POST /api/events` | Yes (ORGANIZER/ADMIN) | ✓ |
| `POST /api/registrations` | `POST /api/registrations` | Yes (STUDENT) | ⚠️ |

## ⚠️ Potential Issues

### 1. Registration Role Restriction
**Issue**: Backend requires `STUDENT` role for event registration
- **Backend**: `router.post('/registrations', authMiddleware, roleMiddleware(['STUDENT']), registerForEvent)`
- **Impact**: Organizers and Admins cannot register for events (might be intentional)

**Solution Options**:
- If you want all roles to register: Change backend to `roleMiddleware(['STUDENT', 'ORGANIZER', 'ADMIN'])`
- If intentional: Keep as is, but update frontend to show appropriate message for non-students

### 2. Events GET Routes Require Auth
**Issue**: Backend requires authentication for viewing events
- **Backend**: `router.get('/events', authMiddleware, getEvents)`
- **Frontend**: Protected routes ensure user is logged in before accessing
- **Status**: ✓ This is fine since frontend has protected routes

### 3. Environment Variables
**Required Backend `.env`**:
```env
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=your_database_url
FRONTEND_ORIGIN=http://localhost:5173
PORT=3000
```

**Required Frontend `.env`**:
```env
VITE_API_BASE=http://localhost:3000/api
VITE_RAZORPAY_KEY=your_razorpay_key_id
```

## ✅ Authentication Flow

1. **Login/Register**: Frontend calls `/api/auth/login` or `/api/auth/register`
2. **Token Storage**: Backend returns JWT token, frontend stores in localStorage
3. **Token Attachment**: Frontend `setAuthToken()` adds `Authorization: Bearer <token>` header
4. **Auto-Verify**: On app load, `bootstrapAuth()` calls `/api/auth/verify` to validate token
5. **Protected Routes**: Frontend routes check auth state before rendering

## ✅ Testing Connection

### 1. Start Backend
```bash
cd backend
npm install
# Set up .env file with JWT_SECRET, DATABASE_URL, etc.
npm start  # or node src/server.js
```

### 2. Start Frontend
```bash
cd college-event
npm install
# Set up .env file with VITE_API_BASE
npm run dev
```

### 3. Test Endpoints
- Open browser console
- Check Network tab for API calls
- Verify CORS headers in response
- Check for authentication errors

## 🔧 Troubleshooting

### CORS Errors
- **Symptom**: `Access-Control-Allow-Origin` errors in console
- **Fix**: Ensure `FRONTEND_ORIGIN` in backend `.env` matches frontend URL (default: `http://localhost:5173`)

### 401 Unauthorized
- **Symptom**: API calls return 401
- **Fix**: 
  - Check token is being sent in headers
  - Verify `JWT_SECRET` matches between token creation and verification
  - Check token expiration

### Connection Refused
- **Symptom**: `ERR_CONNECTION_REFUSED`
- **Fix**: 
  - Ensure backend is running on port 3000
  - Check `VITE_API_BASE` in frontend `.env`
  - Verify no firewall blocking port 3000

### Events Not Loading
- **Symptom**: Events list is empty or shows error
- **Fix**: 
  - Verify user is logged in (events require auth)
  - Check backend `getEvents` controller
  - Check database connection

## 📝 Notes

- All API calls use `withCredentials: true` for cookie support
- Token is stored in localStorage and added to headers automatically
- Protected routes ensure user is authenticated before making API calls
- Backend uses JWT tokens with configurable expiration (default: 1h)

