// pages/Home.jsx
"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const HomePage = ({ user, college }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Mock data - will come from Redux store
  const userData = user || {
    name: 'John Doe',
    eventsRegistered: 5,
    clubsJoined: 3
  };

  const stats = [
    { label: 'Active Clubs', value: '45', icon: 'clubs', color: 'blue' },
    { label: 'This Week Events', value: '12', icon: 'events', color: 'purple' },
    { label: 'Total Students', value: '2.5K', icon: 'students', color: 'green' },
    { label: 'Recruitments', value: '8', icon: 'recruitment', color: 'orange' }
  ];

  const categories = [
    { id: 'all', name: 'All Events', icon: '🎯' },
    { id: 'tech', name: 'Technology', icon: '💻' },
    { id: 'cultural', name: 'Cultural', icon: '🎭' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'workshop', name: 'Workshops', icon: '🛠️' },
    { id: 'competition', name: 'Competitions', icon: '🏆' }
  ];

  const featuredEvents = [
    {
      id: 1,
      title: 'Tech Fest 2024',
      club: 'Computer Science Club',
      date: 'Nov 20, 2024',
      time: '10:00 AM',
      location: 'Main Auditorium',
      image: null,
      registrations: 234,
      category: 'tech',
      featured: true
    },
    {
      id: 2,
      title: 'Annual Sports Meet',
      club: 'Sports Committee',
      date: 'Nov 25, 2024',
      time: '8:00 AM',
      location: 'Sports Ground',
      image: null,
      registrations: 456,
      category: 'sports',
      featured: true
    },
    {
      id: 3,
      title: 'Cultural Night',
      club: 'Cultural Society',
      date: 'Dec 1, 2024',
      time: '6:00 PM',
      location: 'Open Theater',
      image: null,
      registrations: 189,
      category: 'cultural',
      featured: true
    }
  ];

  const upcomingEvents = [
    {
      id: 4,
      title: 'AI Workshop',
      club: 'ML Club',
      date: 'Nov 18, 2024',
      time: '2:00 PM',
      registrations: 89,
      category: 'workshop'
    },
    {
      id: 5,
      title: 'Hackathon 2024',
      club: 'Coding Club',
      date: 'Nov 22, 2024',
      time: '9:00 AM',
      registrations: 156,
      category: 'competition'
    },
    {
      id: 6,
      title: 'Dance Competition',
      club: 'Dance Society',
      date: 'Nov 28, 2024',
      time: '5:00 PM',
      registrations: 67,
      category: 'cultural'
    },
    {
      id: 7,
      title: 'Cricket Tournament',
      club: 'Cricket Club',
      date: 'Dec 5, 2024',
      time: '7:00 AM',
      registrations: 198,
      category: 'sports'
    },
    {
      id: 8,
      title: 'Web Dev Bootcamp',
      club: 'Tech Society',
      date: 'Dec 10, 2024',
      time: '10:00 AM',
      registrations: 123,
      category: 'workshop'
    }
  ];

  const activityFeed = [
    { id: 1, type: 'registration', event: 'Tech Fest 2024', time: '2 hours ago' },
    { id: 2, type: 'club_follow', club: 'Robotics Club', time: '5 hours ago' },
    { id: 3, type: 'event_reminder', event: 'AI Workshop', time: '1 day ago' }
  ];

  const announcements = [
    {
      id: 1,
      title: 'Registration Deadline Extended',
      message: 'Tech Fest registration extended till Nov 18th',
      priority: 'high',
      date: 'Nov 14, 2024'
    },
    {
      id: 2,
      title: 'New Club Formation',
      message: 'Photography Club is now accepting members',
      priority: 'medium',
      date: 'Nov 13, 2024'
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Dispatch search action
    router.push(`/search?q=${searchQuery}`);
  };

  const filteredEvents = activeCategory === 'all' 
    ? upcomingEvents 
    : upcomingEvents.filter(event => event.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-white text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {userData.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-400 text-lg">
            Discover and join amazing events happening at your campus
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg 
                className="w-6 h-6 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, clubs, or recruitments..."
              className="w-full bg-[#152238] text-white pl-14 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 border border-gray-700/50"
            />
          </div>
        </form>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[#152238] border border-gray-700/50 rounded-xl p-5 hover:border-gray-600 transition-all"
            >
              <div className={`w-12 h-12 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center mb-3`}>
                <svg 
                  className={`w-6 h-6 text-${stat.color}-400`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  {stat.icon === 'clubs' && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  )}
                  {stat.icon === 'events' && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  )}
                  {stat.icon === 'students' && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  )}
                  {stat.icon === 'recruitment' && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  )}
                </svg>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Announcements Banner */}
        {announcements.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">{announcements[0].title}</h3>
                  <p className="text-gray-300 text-sm">{announcements[0].message}</p>
                </div>
                <Link href="/announcements" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                  View all
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Featured Events Carousel */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-2xl font-bold">Featured Events</h2>
            <Link href="/events" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-[#152238] border border-gray-700/50 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all group cursor-pointer"
                onClick={() => router.push(`/events/${event.id}`)}
              >
                <div className="relative h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <div className="text-6xl">{categories.find(c => c.id === event.category)?.icon}</div>
                  <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Featured
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-blue-400 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">{event.club}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {event.date} • {event.time}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">
                      {event.registrations} registered
                    </span>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Register
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-white text-2xl font-bold mb-4">Browse by Category</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-[#152238] text-gray-300 hover:bg-[#1a2d4a] border border-gray-700/50'
                }`}
              >
                <span>{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Events */}
          <div className="lg:col-span-2">
            <h2 className="text-white text-2xl font-bold mb-4">Upcoming Events</h2>
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-[#152238] border border-gray-700/50 rounded-xl p-5 hover:border-blue-500/50 transition-all cursor-pointer group"
                  onClick={() => router.push(`/events/${event.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{categories.find(c => c.id === event.category)?.icon}</span>
                        <div>
                          <h3 className="text-white font-bold group-hover:text-blue-400 transition-colors">
                            {event.title}
                          </h3>
                          <p className="text-gray-400 text-sm">{event.club}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {event.registrations} registered
                        </span>
                      </div>
                    </div>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap">
                      Register
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed Sidebar */}
          <div>
            <h2 className="text-white text-xl font-bold mb-4">Your Activity</h2>
            <div className="bg-[#152238] border border-gray-700/50 rounded-xl p-5 mb-6">
              <div className="space-y-4">
                {activityFeed.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'registration' ? 'bg-green-500/10 text-green-400' :
                      activity.type === 'club_follow' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">
                        {activity.type === 'registration' && `Registered for ${activity.event}`}
                        {activity.type === 'club_follow' && `Joined ${activity.club}`}
                        {activity.type === 'event_reminder' && `Reminder: ${activity.event}`}
                      </p>
                      <p className="text-gray-500 text-xs">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <h2 className="text-white text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/clubs"
                className="flex items-center gap-3 bg-[#152238] border border-gray-700/50 hover:border-blue-500/50 rounded-xl p-4 transition-all group"
              >
                <div className="bg-blue-500/10 p-2 rounded-lg group-hover:bg-blue-500/20 transition-all">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium group-hover:text-blue-400 transition-colors">Browse All Clubs</p>
                  <p className="text-gray-400 text-xs">Discover new communities</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/calendar"
                className="flex items-center gap-3 bg-[#152238] border border-gray-700/50 hover:border-purple-500/50 rounded-xl p-4 transition-all group"
              >
                <div className="bg-purple-500/10 p-2 rounded-lg group-hover:bg-purple-500/20 transition-all">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium group-hover:text-purple-400 transition-colors">View Calendar</p>
                  <p className="text-gray-400 text-xs">See all upcoming events</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/recruitments"
                className="flex items-center gap-3 bg-[#152238] border border-gray-700/50 hover:border-green-500/50 rounded-xl p-4 transition-all group"
              >
                <div className="bg-green-500/10 p-2 rounded-lg group-hover:bg-green-500/20 transition-all">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium group-hover:text-green-400 transition-colors">Recruitments</p>
                  <p className="text-gray-400 text-xs">Explore career opportunities</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;