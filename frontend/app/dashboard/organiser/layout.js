
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/store/api/auth.thunk";

export default function OrganiserLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const navigation = [
    { name: "Dashboard", href: "/dashboard/organiser", icon: "📊" },
    { name: "Events", href: "/dashboard/organiser/events", icon: "📅" },
    { name: "Clubs", href: "/dashboard/organiser/clubs", icon: "🎯" },
    { name: "Analytics", href: "/dashboard/organiser/events/analytics", icon: "📈" },
  ];

  const handleLogout = async () => {
    await dispatch(logout());
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-green-600">
            <h1 className="text-xl font-bold text-white">Organiser Panel</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-green-50 text-green-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 transition-colors rounded-lg hover:bg-red-50"
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
        <div className="bg-white shadow-sm">
          <div className="px-8 py-4">
            <h2 className="text-2xl font-bold text-gray-800">Organiser Dashboard</h2>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
