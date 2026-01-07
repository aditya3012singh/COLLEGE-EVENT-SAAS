import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {
  fetchClubs,
  fetchClubById,
  createClub,
  updateClub,
  deleteClub,
  fetchMyClubs,
  fetchMyMemberships,
  joinClub,
  fetchMembershipRequests,
  updateMembershipStatus,
} from "../api/club.thunk";
import { clearError, setSelectedClub } from "../slices/club.slice";

/**
 * Hook for club operations
 * Provides methods and state for managing clubs and memberships
 */
export const useClub = () => {
  const dispatch = useDispatch();
  const {
    clubs,
    selectedClub,
    myClubs,
    myMemberships,
    membershipRequests,
    loading,
    error,
    pagination,
  } = useSelector((state) => state.club);

  /**
   * Fetch all clubs
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {number} params.collegeId - Filter by college ID
   */
  const handleFetchClubs = useCallback(
    async (params = {}) => {
      return dispatch(fetchClubs(params)).unwrap();
    },
    [dispatch]
  );

  /**
   * Fetch club by ID
   * @param {number} clubId - Club ID
   */
  const handleFetchClubById = useCallback(
    async (clubId) => {
      return dispatch(fetchClubById(clubId)).unwrap();
    },
    [dispatch]
  );

  /**
   * Create new club (ORGANIZER/ADMIN only)
   * @param {Object} clubData - Club data
   * @param {string} clubData.name - Club name
   * @param {number} clubData.collegeId - College ID
   * @param {string} clubData.description - Club description (optional)
   * @param {string} clubData.department - Department (optional)
   * @param {string} clubData.domain - Domain/field (optional)
   */
  const handleCreateClub = useCallback(
    async (clubData) => {
      return dispatch(createClub(clubData)).unwrap();
    },
    [dispatch]
  );

  /**
   * Update club (Creator/ADMIN only)
   * @param {number} clubId - Club ID
   * @param {Object} clubData - Updated club data
   */
  const handleUpdateClub = useCallback(
    async (clubId, clubData) => {
      return dispatch(updateClub({ clubId, clubData })).unwrap();
    },
    [dispatch]
  );

  /**
   * Delete club (Creator/ADMIN only)
   * @param {number} clubId - Club ID
   */
  const handleDeleteClub = useCallback(
    async (clubId) => {
      return dispatch(deleteClub(clubId)).unwrap();
    },
    [dispatch]
  );

  /**
   * Fetch user's created clubs
   */
  const handleFetchMyClubs = useCallback(async () => {
    return dispatch(fetchMyClubs()).unwrap();
  }, [dispatch]);

  /**
   * Fetch user's club memberships
   */
  const handleFetchMyMemberships = useCallback(async () => {
    return dispatch(fetchMyMemberships()).unwrap();
  }, [dispatch]);

  /**
   * Join a club
   * @param {number} clubId - Club ID
   */
  const handleJoinClub = useCallback(
    async (clubId) => {
      return dispatch(joinClub(clubId)).unwrap();
    },
    [dispatch]
  );

  /**
   * Fetch pending membership requests for user's clubs
   */
  const handleFetchMembershipRequests = useCallback(async () => {
    return dispatch(fetchMembershipRequests()).unwrap();
  }, [dispatch]);

  /**
   * Approve or reject membership request
   * @param {number} membershipId - Membership ID
   * @param {Object} data - Update data
   * @param {string} data.status - APPROVED or REJECTED
   */
  const handleUpdateMembershipStatus = useCallback(
    async (membershipId, data) => {
      return dispatch(updateMembershipStatus({ membershipId, data })).unwrap();
    },
    [dispatch]
  );

  /**
   * Set selected club
   * @param {Object} club - Club object
   */
  const handleSetSelectedClub = useCallback(
    (club) => {
      dispatch(setSelectedClub(club));
    },
    [dispatch]
  );

  /**
   * Clear club errors
   */
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State
    clubs,
    selectedClub,
    myClubs,
    myMemberships,
    membershipRequests,
    loading,
    error,
    pagination,
    
    // Actions
    fetchClubs: handleFetchClubs,
    fetchClubById: handleFetchClubById,
    createClub: handleCreateClub,
    updateClub: handleUpdateClub,
    deleteClub: handleDeleteClub,
    fetchMyClubs: handleFetchMyClubs,
    fetchMyMemberships: handleFetchMyMemberships,
    joinClub: handleJoinClub,
    fetchMembershipRequests: handleFetchMembershipRequests,
    updateMembershipStatus: handleUpdateMembershipStatus,
    setSelectedClub: handleSetSelectedClub,
    clearError: handleClearError,
  };
};
