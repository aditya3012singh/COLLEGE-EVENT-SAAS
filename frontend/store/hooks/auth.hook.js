import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {
  register,
  login,
  getCurrentUser,
  verifyToken,
  logout,
} from "../api/auth.thunk";
import { clearError } from "../slices/auth.slice";

/**
 * Hook for authentication operations
 * Provides methods and state for user authentication
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's full name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @param {string} userData.role - User role (STUDENT, ORGANIZER, ADMIN)
   * @param {number} userData.collegeId - College ID
   */
  const handleRegister = useCallback(
    async (userData) => {
      return dispatch(register(userData)).unwrap();
    },
    [dispatch]
  );

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   */
  const handleLogin = useCallback(
    async (credentials) => {
      return dispatch(login(credentials)).unwrap();
    },
    [dispatch]
  );

  /**
   * Get current authenticated user
   */
  const handleGetCurrentUser = useCallback(async () => {
    return dispatch(getCurrentUser()).unwrap();
  }, [dispatch]);

  /**
   * Verify authentication token
   */
  const handleVerifyToken = useCallback(async () => {
    return dispatch(verifyToken()).unwrap();
  }, [dispatch]);

  /**
   * Logout current user
   */
  const handleLogout = useCallback(async () => {
    return dispatch(logout()).unwrap();
  }, [dispatch]);

  /**
   * Clear authentication errors
   */
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State
    user,
    token,
    isAuthenticated,
    loading,
    error,
    
    // Actions
    register: handleRegister,
    login: handleLogin,
    getCurrentUser: handleGetCurrentUser,
    verifyToken: handleVerifyToken,
    logout: handleLogout,
    clearError: handleClearError,
  };
};
