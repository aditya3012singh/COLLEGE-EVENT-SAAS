"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Redirect to role-specific dashboard
    if (isAuthenticated && user?.role) {
      switch (user.role) {
        case "ADMIN":
          router.replace("/dashboard/admin");
          break;
        case "ORGANIZER":
          router.replace("/dashboard/organiser");
          break;
        case "STUDENT":
          router.replace("/dashboard/student");
          break;
        default:
          router.replace("/auth/login");
      }
    } else {
      router.replace("/auth/login");
    }
  }, [user, isAuthenticated, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
