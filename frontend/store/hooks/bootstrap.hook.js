import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { bootstrapSystem } from "../api/bootstrap.thunk";

/**
 * Hook for system bootstrap operations
 * Used for initial system setup (first admin and college)
 */
export const useBootstrap = () => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.bootstrap || {});

  /**
   * Bootstrap the system with first admin and college
   * @param {Object} bootstrapData - Bootstrap data
   * @param {string} bootstrapData.adminName - Admin user name
   * @param {string} bootstrapData.adminEmail - Admin email
   * @param {string} bootstrapData.adminPassword - Admin password
   * @param {string} bootstrapData.collegeName - College name
   * @param {string} bootstrapData.collegeCode - Unique college code
   */
  const handleBootstrapSystem = useCallback(
    async (bootstrapData) => {
      return dispatch(bootstrapSystem(bootstrapData)).unwrap();
    },
    [dispatch]
  );

  return {
    // State
    loading,
    error,
    success,
    
    // Actions
    bootstrapSystem: handleBootstrapSystem,
  };
};
