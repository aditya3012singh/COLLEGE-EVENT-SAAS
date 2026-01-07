import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {
  fetchRegistrations,
  fetchRegistrationById,
  registerForEvent,
  cancelRegistration,
  checkInEvent,
} from "../api/registration.thunk";
import { clearError, setSelectedRegistration } from "../slices/registration.slice";

/**
 * Hook for registration operations
 * Provides methods and state for managing event registrations
 */
export const useRegistration = () => {
  const dispatch = useDispatch();
  const { registrations, selectedRegistration, loading, error, pagination } =
    useSelector((state) => state.registration);

  /**
   * Fetch all registrations (user's registrations)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {number} params.eventId - Filter by event ID
   */
  const handleFetchRegistrations = useCallback(
    async (params = {}) => {
      return dispatch(fetchRegistrations(params)).unwrap();
    },
    [dispatch]
  );

  /**
   * Fetch registration by ID
   * @param {number} registrationId - Registration ID
   */
  const handleFetchRegistrationById = useCallback(
    async (registrationId) => {
      return dispatch(fetchRegistrationById(registrationId)).unwrap();
    },
    [dispatch]
  );

  /**
   * Register for an event (STUDENT only)
   * @param {Object} registrationData - Registration data
   * @param {number} registrationData.eventId - Event ID
   */
  const handleRegisterForEvent = useCallback(
    async (registrationData) => {
      return dispatch(registerForEvent(registrationData)).unwrap();
    },
    [dispatch]
  );

  /**
   * Cancel registration
   * @param {number} registrationId - Registration ID
   */
  const handleCancelRegistration = useCallback(
    async (registrationId) => {
      return dispatch(cancelRegistration(registrationId)).unwrap();
    },
    [dispatch]
  );

  /**
   * Check-in to event using QR code (ORGANIZER/ADMIN only)
   * @param {Object} checkInData - Check-in data
   * @param {string} checkInData.qrPayload - QR code payload
   */
  const handleCheckInEvent = useCallback(
    async (checkInData) => {
      return dispatch(checkInEvent(checkInData)).unwrap();
    },
    [dispatch]
  );

  /**
   * Set selected registration
   * @param {Object} registration - Registration object
   */
  const handleSetSelectedRegistration = useCallback(
    (registration) => {
      dispatch(setSelectedRegistration(registration));
    },
    [dispatch]
  );

  /**
   * Clear registration errors
   */
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State
    registrations,
    selectedRegistration,
    loading,
    error,
    pagination,
    
    // Actions
    fetchRegistrations: handleFetchRegistrations,
    fetchRegistrationById: handleFetchRegistrationById,
    registerForEvent: handleRegisterForEvent,
    cancelRegistration: handleCancelRegistration,
    checkInEvent: handleCheckInEvent,
    setSelectedRegistration: handleSetSelectedRegistration,
    clearError: handleClearError,
  };
};
