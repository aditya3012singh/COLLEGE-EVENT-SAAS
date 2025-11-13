// pages/Events.jsx
"use client"
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const EventsPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'tech', name: 'Technology' },
    { id: 'cultural', name: 'Cultural' },
    { id: 'sports', name: 'Sports' },
    { id: 'workshop', name: 'Workshop' },
    { id: 'competition', name: 'Competition' }
  ];

  // Mock events data - will come from Redux store
  const allEvents = [
    {
      id: 1,
      title: 'Campus Hackathon 2024',
      date: 'Tue, Dec 10, 10:00 AM',
      location: 'Tech Club - Main Auditorium',
      club: 'Tech Club',
      category: 'tech',
      status: 'upcoming',
      image: 'gradient-1',
      registrations: 234,
      isRegistered: false
    },
    {
      id: 2,
      title: 'Startup Networking Night',
      date: 'Wed, Nov 6, 6:00 PM',
      location: 'Entrepreneurship Club - Grand Hall',
      club: 'Entrepreneurship Club',
      category: 'tech',
      status: 'upcoming',
      image: 'gradient-2',
      registrations: 156,
      isRegistered: true
    },
    {
      id: 3,
      title: 'Fall Fest Music Concert',
      date: 'Fri, Nov 15, 8:00 PM',
      location: 'Music Society - Campus Green',
      club: 'Music Society',
      category: 'cultural',
      status: 'upcoming',
      image: 'gradient-3',
      registrations: 489,
      isRegistered: false
    },
    {
      id: 4,
      title: 'AI & Machine Learning Workshop',
      date: 'Sat, Nov 23, 11:00 AM',
      location: 'Computer Science Dept - Lab 301',
      club: 'ML Club',
      category: 'workshop',
      status: 'upcoming',
      image: 'gradient-4',
      registrations: 89,
      isRegistered: false
    },
    {
      id: 5,
      title: 'Annual Sports Meet 2024',
      date: 'Mon, Oct 28, 9:00 AM',
      location: 'Sports Committee - Main Ground',
      club: 'Sports Committee',
      category: 'sports',
      status: 'ongoing',
      image: 'gradient-5',
      registrations: 567,
      isRegistered: true
    },
    {
      id: 6,
      title: 'Tech Talk: Web Development',
      date: 'Sun, Oct 20, 3:00 PM',
      location: 'Coding Club - Conference Room',
      club: 'Coding Club',
      category: 'tech',
      status: 'past',
      image: 'gradient-6',
      registrations: 123,
      isRegistered: true
    },
    {
      id: 7,
      title: 'Dance Competition Finals',
      date: 'Sat, Oct 12, 6:00 PM',
      location: 'Dance Society - Amphitheater',
      club: 'Dance Society',
      category: 'competition',
      status: 'past',
      image: 'gradient-7',
      registrations: 201,
      isRegistered: false
    }
  ];

  const gradients = {
    'gradient-1': 'from-orange-500 via-pink-500 to-blue-500',
    'gradient-2': 'from-purple-500 via-blue-500 to-cyan-500',
    'gradient-3': 'from-yellow-500 via-orange-500 to-red-500',
    'gradient-4': 'from-green-500 via-teal-500 to-blue-500',
    'gradient-5': 'from-blue-500 via-purple-500 to-pink-500',
    'gradient-6': 'from-indigo-500 via-purple-500 to-pink-500',
    'gradient-7': 'from-red-500 via-orange-500 to-yellow-500'
  };

  // Filter events
  const filteredEvents = allEvents.filter(event => {
    const matchesTab = event.status === activeTab;
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.club.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesCategory && matchesSearch;
  });

  const handleRegister = (eventId, e) => {
    e.stopPropagation();
    // TODO: Dispatch Redux action
    // dispatch(registerForEvent(eventId))
    console.log('Register for event:', eventId);
  };

  const handleEventClick = (eventId) => {
    router.push(`/event-details`);
  };

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-3xl md:text-4xl font-bold mb-2">
            Events
          </h1>
          <p className="text-gray-400">
            Discover and join exciting events happening at your campus
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg 
                className="w-5 h-5 text-gray-400" 
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
              placeholder="Search events..."
              className="w-full bg-[#152238] text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 border border-gray-700/50"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-3 font-medium transition-all relative ${
              activeTab === 'upcoming'
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Upcoming
            {activeTab === 'upcoming' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`px-6 py-3 font-medium transition-all relative ${
              activeTab === 'ongoing'
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Ongoing
            {activeTab === 'ongoing' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-6 py-3 font-medium transition-all relative ${
              activeTab === 'past'
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Past
            {activeTab === 'past' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>
            )}
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#152238] text-gray-300 hover:bg-[#1a2d4a] border border-gray-700/50'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => handleEventClick(event.id)}
                className="bg-[#152238] border border-gray-700/50 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all cursor-pointer group"
              >
                {/* Event Image/Gradient */}
                <div className={`h-40 bg-gradient-to-br ${gradients[event.image]} relative`}>
                  {event.isRegistered && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Registered
                    </div>
                  )}
                  {activeTab === 'ongoing' && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      Live Now
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div className="p-5">
                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="line-clamp-1">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {event.registrations}
                    </div>
                    
                    {activeTab === 'upcoming' && (
                      <button
                        onClick={(e) => handleRegister(event.id, e)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          event.isRegistered
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                        disabled={event.isRegistered}
                      >
                        {event.isRegistered ? 'Registered' : 'Register'}
                      </button>
                    )}
                    
                    {activeTab === 'ongoing' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/events/${event.id}/live`);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                      >
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        Join Now
                      </button>
                    )}

                    {activeTab === 'past' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/events/${event.id}/recap`);
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      >
                        View Recap
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-[#152238] border border-gray-700/50 rounded-xl p-12 max-w-md mx-auto">
              <svg 
                className="w-20 h-20 text-gray-600 mx-auto mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              <h3 className="text-white text-xl font-bold mb-2">No Events Found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery 
                  ? `No events match "${searchQuery}"`
                  : `No ${activeTab} events available at the moment`
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;