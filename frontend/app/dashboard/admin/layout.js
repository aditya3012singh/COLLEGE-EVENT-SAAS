"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/store/api/auth.thunk";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [activeMenu, setActiveMenu] = useState(null);

  const navigation = [
    {
      label: "Dashboard",
      path: "/dashboard/admin",
    },
    {
      label: "Colleges",
      children: [
        { label: "All Colleges", path: "/dashboard/admin/colleges" },
        { label: "Add College", path: "/dashboard/admin/colleges/add" },
      ],
    },
    {
      label: "Users",
      children: [
        { label: "All Users", path: "/dashboard/admin/users" },
        { label: "Add User", path: "/dashboard/admin/users/add" },
      ],
    },
    {
      label: "Events",
      children: [
        { label: "All Events", path: "/dashboard/admin/events" },
        { label: "Create Event", path: "/dashboard/admin/events/create" },
      ],
    },
    {
      label: "Clubs",
      children: [
        { label: "All Clubs", path: "/dashboard/admin/clubs" },
        { label: "Add Club", path: "/dashboard/admin/clubs/add" },
      ],
    },
    {
      label: "Analytics",
      path: "/dashboard/admin/analytics",
    },
    {
      label: "Settings",
      children: [
        { label: "Profile", path: "/dashboard/admin/settings/profile" },
        { label: "System", path: "/dashboard/admin/settings" },
      ],
    },
  ];

  const handleMenuClick = (item) => {
    if (item.children) {
      setActiveMenu(activeMenu === item.label ? null : item.label);
    } else {
      router.push(item.path);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout());
    } finally {
      router.push("/auth/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div
          onClick={() => router.push("/dashboard/admin")}
          className="px-6 py-4 border-b border-gray-200 cursor-pointer sticky top-0 z-10 bg-white"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isOpen = activeMenu === item.label;
            const isActive = pathname === item.path;

            return (
              <div key={item.label}>
                {/* Parent Menu */}
                <button
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : isOpen
                      ? "bg-indigo-50 text-indigo -600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span>{item.label}</span>

                  {item.children && (
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </button>

                {/* Children Menu */}
                {isOpen && item.children && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.path;
                      return (
                        <Link
                          key={child.label}
                          href={child.path}
                          className={`block px-4 py-2 text-sm rounded-lg transition-all ${
                            isChildActive
                              ? "text-indigo-600 bg-indigo-50 font-medium"
                              : "text-gray-600 hover:text-white/85 hover:bg-gray-50"
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-200 sticky bottom-0 bg-white">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 px-4 py-3 rounded-lg w-full transition-all text-sm font-medium"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-8 py-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Admin Dashboard
            </h2>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}