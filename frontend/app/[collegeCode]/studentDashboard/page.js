"use client";

import WelcomeStudent from "../../../components/WelcomeStudent";
import { NavbarDemo } from "../../../components/Navbar";
import UpcomingEvents from "../../../components/UpcomingEvents";
import ClubsJoined from "../../../components/ClubsJoined";
import { Notifications } from "../../../components/Notifications";
import { RegistrationsSummary } from "../../../components/RegistrationsSummary";
import { QuickActions } from "../../../components/QuickActions";
import { PerformanceStats } from "../../../components/PerformanceStats";
import HeroPage from "../../../components/HeroPage";

export default function StudentDashboard() {
  const events = [
    {
      id: 1,
      title: "Annual Tech Fest",
      dateTime: "2025-11-15T10:00:00",
      venue: "Auditorium",
      description: "A fun-filled day with tech competitions and guest lectures.",
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "Annual Tech Fest",
      dateTime: "2025-11-15T10:00:00",
      venue: "Auditorium",
      description: "A fun-filled day with tech competitions and guest lectures.",
      color: "bg-green-500",
    },
    {
      id: 3,
      title: "Annual Tech Fest",    
        dateTime: "2025-11-15T10:00:00",
        venue: "Auditorium",
        description: "A fun-filled day with tech competitions and guest lectures.",
        color: "bg-blue-500",
    },
    // other events
  ];

  const joinedClubs = [
    {
      id: 1,
      name: "Tech Innovators",
      description:
        "A club dedicated to exploring cutting-edge technology and software development.",
    },
    {
      id: 2,
      name: "Literature Circle",
      description: "Join us to discuss books, poetry, and literary arts.",
    },
    // More clubs...
  ];

  const dummyNotifications = [
    {
      id: 1,
      title: "Event Update",
      message: "The Annual Tech Fest has been postponed to next month.",
    },
    {
      id: 2,
      title: "Club Meeting",
      message: "Tech Innovators monthly meetup is scheduled for Friday evening.",
    },
  ];

  const dummyRegistrations = [
    {
      id: 1,
      eventTitle: "Annual Tech Fest",
      status: "confirmed",
      paymentStatus: "paid",
    },
    {
      id: 2,
      eventTitle: "Photography Workshop",
      status: "pending",
      paymentStatus: "pending",
    },
  ];

  const dummyQuickActions = [
    { id: 1, label: "Register for Events", onClick: () => alert("Register clicked") },
    { id: 2, label: "Join New Clubs", onClick: () => alert("Join Clubs clicked") },
    { id: 3, label: "Help & Support", onClick: () => alert("Support clicked") },
  ];

  const dummyPerformanceStats = {
    eventsAttended: 12,
    clubsJoined: 3,
    points: 250,
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <NavbarDemo />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        <HeroPage/>
        <WelcomeStudent
          name="Aman"
          profilePic="https://tse2.mm.bing.net/th/id/OIP.AiejiScyDD1oRYMs-mh-pwHaHT?pid=Api&P=0&h=220"
        />
        <UpcomingEvents events={events} />
        <ClubsJoined clubs={joinedClubs} />
        <Notifications notifications={dummyNotifications} />
        <RegistrationsSummary registrations={dummyRegistrations} />
        <QuickActions actions={dummyQuickActions} />
        <PerformanceStats stats={dummyPerformanceStats} />
      </div>
    </div>
  );
}
