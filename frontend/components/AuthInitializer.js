"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "@/store/slices/auth.slice";

/**
 * This component initializes the Redux auth state from localStorage on app mount
 * This ensures that user data persists across page reloads and middleware checks pass
 */
export default function AuthInitializer() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once, and only if not already authenticated
    if (!hasInitialized.current && !isAuthenticated && typeof window !== "undefined") {
      hasInitialized.current = true;
      
      const storedUser = localStorage.getItem("user");
      console.log("[AuthInitializer] Checking localStorage. Stored user:", storedUser);
      
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          console.log("[AuthInitializer] Restoring user from localStorage:", user);
          dispatch(setCredentials({ user, token: null }));
        } catch (error) {
          console.error("[AuthInitializer] Error restoring user from localStorage:", error);
          localStorage.removeItem("user");
        }
      } else {
        console.log("[AuthInitializer] No user found in localStorage");
      }
    }
  }, [isAuthenticated, dispatch]);

  return null;
}
