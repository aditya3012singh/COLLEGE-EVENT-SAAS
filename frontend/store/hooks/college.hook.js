import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {
  fetchColleges,
  fetchCollegeById,
  createCollege,
  updateCollege,
  deleteCollege,
} from "../api/college.thunk";
import { clearError, setSelectedCollege } from "../slices/college.slice";

/**
 * Hook for college operations
 * Provides methods and state for managing colleges
 */
export const useCollege = () => {
  const dispatch = useDispatch();
  const { colleges, selectedCollege, loading, error, pagination } = useSelector(
    (state) => state.college
  );

  /**
   * Fetch all colleges
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   */
  const handleFetchColleges = useCallback(
    async (params = {}) => {
      return dispatch(fetchColleges(params)).unwrap();
    },
    [dispatch]
  );

  /**
   * Fetch college by ID
   * @param {number} collegeId - College ID
   */
  const handleFetchCollegeById = useCallback(
    async (collegeId) => {
      return dispatch(fetchCollegeById(collegeId)).unwrap();
    },
    [dispatch]
  );

  /**
   * Create new college (ADMIN only)
   * @param {Object} collegeData - College data
   * @param {string} collegeData.name - College name
   * @param {string} collegeData.code - Unique college code
   * @param {string} collegeData.logo - College logo URL (optional)
   */
  const handleCreateCollege = useCallback(
    async (collegeData) => {
      return dispatch(createCollege(collegeData)).unwrap();
    },
    [dispatch]
  );

  /**
   * Update college (ADMIN only)
   * @param {number} collegeId - College ID
   * @param {Object} collegeData - Updated college data
   */
  const handleUpdateCollege = useCallback(
    async (collegeId, collegeData) => {
      return dispatch(updateCollege({ collegeId, collegeData })).unwrap();
    },
    [dispatch]
  );

  /**
   * Delete college (ADMIN only)
   * @param {number} collegeId - College ID
   */
  const handleDeleteCollege = useCallback(
    async (collegeId) => {
      return dispatch(deleteCollege(collegeId)).unwrap();
    },
    [dispatch]
  );

  /**
   * Set selected college
   * @param {Object} college - College object
   */
  const handleSetSelectedCollege = useCallback(
    (college) => {
      dispatch(setSelectedCollege(college));
    },
    [dispatch]
  );

  /**
   * Clear college errors
   */
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State
    colleges,
    selectedCollege,
    loading,
    error,
    pagination,
    
    // Actions
    fetchColleges: handleFetchColleges,
    fetchCollegeById: handleFetchCollegeById,
    createCollege: handleCreateCollege,
    updateCollege: handleUpdateCollege,
    deleteCollege: handleDeleteCollege,
    setSelectedCollege: handleSetSelectedCollege,
    clearError: handleClearError,
  };
};
