"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "./ui/resizable-navbar";
import { useState } from "react";
import { Bell, User, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Sample colleges list
const colleges = [
  {
    id: 1,
    code: "kiet",
    name: "KIET Group Of Institutions",
    logo:
      "https://www.kindpng.com/picc/m/464-4645124_kiet-group-of-institutions-logo-hd-png-download.png",
  },
  {
    id: 2,
    code: "abes",
    name: "ABES Engineering College",
    logo:
      "https://tse1.mm.bing.net/th/id/OIP.b-lEjhcpK22L7jTn0SJEPQHaD1?pid=Api&P=0&h=220",
  },
  {
    id: 3,
    code: "iitd",
    name: "IIT Delhi",
    logo:
      "https://tse1.mm.bing.net/th/id/OIP.3U9o4Dc8a1euh4XaH2o1AAHaHa?pid=Api&P=0&h=220",
  },
];

export function NavbarDemo({ collegeCode = "kiet" }) {
  const navItems = [
    { name: "Home", link: "/kiet" },
    { name: "Clubs", link: "/kiet/clubs" },
    { name: "Events", link: "/kiet/events" },
    { name: "Registrations", link: "/kiet/registrations" },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const college =
    colleges.find((c) => c.code === collegeCode) || {
      name: "Unknown College",
      logo: "",
    };

  return (
    <div className="relative w-full p-0.5 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm">
      <Navbar>
        <NavBody className="flex items-center justify-between w-full gap-6">
          {/* Left: College logo + name */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {college.logo && (
              <img
                src={college.logo}
                alt={college.name}
                className="w-10 h-10 object-contain rounded-md shadow"
              />
            )}
            <span className="font-bold text-lg text-gray-900 dark:text-gray-100 whitespace-nowrap">
              {college.name}
            </span>
          </div>

          {/* Middle: Nav items (desktop only) */}
          <div className="hidden md:flex gap-6 flex-shrink-0">
            <NavItems items={navItems} />
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              aria-label="Notifications"
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <Bell className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              <span className="absolute top-1 right-1 inline-flex h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            <button
              aria-label="Profile"
              onClick={() => setIsProfileOpen(true)}
              className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <User className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Mobile menu toggle */}
            <div className="md:hidden">
              <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300 py-2 block"
              >
                {item.name}
              </a>
            ))}
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* === Right Drawer: Notifications === */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationsOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 w-80 h-full bg-white dark:bg-gray-900 shadow-lg z-50 flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween" }}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold">Notifications</h2>
                <button onClick={() => setIsNotificationsOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-4 space-y-3 overflow-y-auto">
                <p className="text-sm text-gray-600 dark:text-gray-300">🔔 New event in your college.</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">✅ Your club request was approved.</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">📢 New announcement available.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* === Right Drawer: Profile === */}
      <AnimatePresence>
        {isProfileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 w-80 h-full bg-white dark:bg-gray-900 shadow-lg z-50 flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween" }}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold">Profile</h2>
                <button onClick={() => setIsProfileOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">John Doe</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">johndoe@example.com</p>
                  </div>
                </div>
                <button className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                  Edit Profile
                </button>
                <button className="w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
