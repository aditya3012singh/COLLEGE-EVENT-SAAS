import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {
  fetchEvents,
  fetchEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventVisibility,
} from "../api/event.thunk";
import { clearError, setSelectedEvent } from "../slices/event.slice";

/**
 * Hook for event operations
 * Provides methods and state for managing events
 */
export const useEvent = () => {
  const dispatch = useDispatch();
  const { events, selectedEvent, loading, error, pagination } = useSelector(
    (state) => state.event
  );

  /**
   * Fetch all events
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {number} params.collegeId - Filter by college ID
   * @param {number} params.clubId - Filter by club ID
   * @param {string} params.visibility - Filter by visibility (OWN, SELECTED, ALL)
   */
  const handleFetchEvents = useCallback(
    async (params = {}) => {
      return dispatch(fetchEvents(params)).unwrap();
    },
    [dispatch]
  );

  /**
   * Fetch event by ID
   * @param {number} eventId - Event ID
   */
  const handleFetchEventById = useCallback(
    async (eventId) => {
      return dispatch(fetchEventById(eventId)).unwrap();
    },
    [dispatch]
  );

  /**
   * Create new event (ORGANIZER/ADMIN only)
   * @param {Object} eventData - Event data
   * @param {string} eventData.title - Event title
   * @param {string} eventData.description - Event description
   * @param {string} eventData.dateTime - Event date and time (ISO string)
   * @param {string} eventData.venue - Event venue
   * @param {number} eventData.collegeId - College ID
   * @param {number} eventData.clubId - Club ID (optional)
   * @param {string} eventData.visibility - Visibility (OWN, SELECTED, ALL)
   * @param {boolean} eventData.isPaid - Whether event is paid
   * @param {number} eventData.price - Price in smallest currency unit (optional)
   * @param {string} eventData.currency - Currency code (optional)
   * @param {number[]} eventData.allowedCollegeIds - Allowed college IDs for SELECTED visibility
   */
  const handleCreateEvent = useCallback(
    async (eventData) => {
      return dispatch(createEvent(eventData)).unwrap();
    },
    [dispatch]
  );

  /**
   * Update event (Creator/ADMIN only)
   * @param {number} eventId - Event ID
   * @param {Object} eventData - Updated event data
   */
  const handleUpdateEvent = useCallback(
    async (eventId, eventData) => {
      return dispatch(updateEvent({ eventId, eventData })).unwrap();
    },
    [dispatch]
  );

  /**
   * Delete event (Creator/ADMIN only)
   * @param {number} eventId - Event ID
   */
  const handleDeleteEvent = useCallback(
    async (eventId) => {
      return dispatch(deleteEvent(eventId)).unwrap();
    },
    [dispatch]
  );

  /**
   * Update event visibility
   * @param {number} eventId - Event ID
   * @param {Object} visibilityData - Visibility data
   * @param {string} visibilityData.visibility - New visibility (OWN, SELECTED, ALL)
   * @param {number[]} visibilityData.allowedCollegeIds - Allowed college IDs (for SELECTED)
   */
  const handleUpdateEventVisibility = useCallback(
    async (eventId, visibilityData) => {
      return dispatch(updateEventVisibility({ eventId, visibilityData })).unwrap();
    },
    [dispatch]
  );

  /**
   * Set selected event
   * @param {Object} event - Event object
   */
  const handleSetSelectedEvent = useCallback(
    (event) => {
      dispatch(setSelectedEvent(event));
    },
    [dispatch]
  );

  /**
   * Clear event errors
   */
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State
    events,
    selectedEvent,
    loading,
    error,
    pagination,
    
    // Actions
    fetchEvents: handleFetchEvents,
    fetchEventById: handleFetchEventById,
    createEvent: handleCreateEvent,
    updateEvent: handleUpdateEvent,
    deleteEvent: handleDeleteEvent,
    updateEventVisibility: handleUpdateEventVisibility,
    setSelectedEvent: handleSetSelectedEvent,
    clearError: handleClearError,
  };
};
