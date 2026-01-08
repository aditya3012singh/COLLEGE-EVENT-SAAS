"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

function getRoleBasedRedirect(role) {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin";
    case "ORGANIZER":
      return "/dashboard/organiser";
    case "STUDENT":
      return "/dashboard/student";
    default:
      return "/auth/login";
  }
}

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log("[Root Page] Auth state:", { isAuthenticated, user });
    
    if (isAuthenticated && user) {
      // Redirect authenticated users to their dashboard
      const redirectPath = getRoleBasedRedirect(user.role);
      console.log("[Root Page] User authenticated, redirecting to:", redirectPath);
      router.replace(redirectPath);
    } else {
      // Redirect unauthenticated users to login
      console.log("[Root Page] User not authenticated, redirecting to login");
      router.replace("/auth/login");
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}
