"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/store/api/auth.thunk";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const navigation = [
    { name: "Dashboard", href: "/dashboard/admin", icon: "📊" },
    { name: "Colleges", href: "/dashboard/admin/colleges", icon: "🏫" },
    { name: "Users", href: "/dashboard/admin/users", icon: "👥" },
    { name: "Events", href: "/dashboard/admin/events", icon: "📅" },
    { name: "Clubs", href: "/dashboard/admin/clubs", icon: "🎯" },
    { name: "Analytics", href: "/dashboard/admin/analytics", icon: "📈" },
    { name: "Settings", href: "/dashboard/admin/settings", icon: "⚙️" },
  ];

  const handleLogout = async () => {
    await dispatch(logout());
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 h-16 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600 shadow-sm"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 transition-all rounded-lg hover:bg-red-50"
            >
              <span className="mr-3 text-lg">🚪</span>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-8 py-4">
            <h2 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h2>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}