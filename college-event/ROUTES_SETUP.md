# Routes Setup Guide

This document explains how to set up the routing and environment variables for the College Event SaaS application.

## Required Dependencies

Make sure you have the following packages installed:

```bash
npm install react-router-dom @reduxjs/toolkit react-redux axios
```

## Environment Variables

Create a `.env` file in the `college-event` directory (or update your existing `.env` file) with the following variables:

```env
# API Base URL
VITE_API_BASE=http://localhost:3000/api

# Razorpay Public Key (required for payment integration)
VITE_RAZORPAY_KEY=your_razorpay_key_id_here
```

### Getting Your Razorpay Key

1. Sign up for a Razorpay account at https://razorpay.com
2. Go to Settings → API Keys
3. Generate a new key pair
4. Copy the "Key ID" and paste it as `VITE_RAZORPAY_KEY` in your `.env` file

**Note:** For development, you can use Razorpay's test keys. For production, use your live keys.

## Route Structure

The application uses React Router v6 with the following routes:

### Public Routes
- `/auth` - Login and Registration page

### Protected Routes (require authentication)
- `/` - Dashboard (home page)
- `/colleges` - List of colleges
- `/colleges/:id` - College detail page (if implemented)
- `/clubs` - List of clubs
- `/clubs/:id` - Club detail page
- `/events` - List of events (with search and pagination)
- `/events/:id` - Event detail page
- `/events/:id/register` - Event registration form

### Role-Protected Routes (require ORGANIZER or ADMIN role)
- `/events/new` - Create new event
- `/events/:id/edit` - Edit existing event

## Protected Route Component

The `ProtectedRoute` component in `App.jsx` handles:
- Authentication checks (redirects to `/auth` if not logged in)
- Role-based access control (redirects to `/` if unauthorized)
- Loading states during auth verification

## Authentication Flow

1. On app mount, `bootstrapAuth` thunk is dispatched to restore session from localStorage
2. If token exists, it's verified with the backend
3. If verification fails, user is redirected to login
4. On successful login/register, token is stored and user is redirected to dashboard

## Razorpay Integration

The `RegistrationForm` component:
1. Loads Razorpay checkout script dynamically
2. When a paid event registration is submitted, the backend returns a `razorpayOrder`
3. The checkout modal opens automatically
4. On payment success, the handler callback is executed
5. You may want to add a backend endpoint to verify payment signatures

## Usage Notes

- All routes use functional components with React hooks
- Redux Toolkit is used for state management
- Axios is configured in `src/api.js` with automatic token attachment
- Error handling displays user-friendly messages
- Loading states are shown during async operations
- Form validation is performed client-side before submission

## Testing Routes

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:5173` (or your Vite port)
3. You'll be redirected to `/auth` if not logged in
4. After login, you'll be redirected to `/` (Dashboard)
5. Use the navigation links to explore different pages

## Troubleshooting

- **Routes not working**: Ensure `react-router-dom` is installed
- **Razorpay not loading**: Check that `VITE_RAZORPAY_KEY` is set in `.env` and restart dev server
- **API calls failing**: Verify `VITE_API_BASE` is correct and backend is running
- **Auth redirects**: Check browser console for errors and verify token is being stored

