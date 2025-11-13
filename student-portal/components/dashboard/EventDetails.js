// pages/EventDetails.jsx
"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const EventDetailsPage = ({ eventId }) => {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Mock event data - will come from Redux store
  const event = {
    id: eventId || 1,
    title: 'Annual Tech Symposium 2024',
    description: 'Join us for the Annual Tech Symposium, a premier event bringing together the brightest minds in technology. This full-day event features inspiring keynote speeches from industry leaders, hands-on workshops, and networking opportunities with top tech companies. Whether you\'re a student, a professional, or a tech enthusiast, you\'ll gain valuable insights into the future of technology, from AI and machine learning to cybersecurity and beyond. Don\'t miss this chance to learn, connect, and shape your tech career!',
    date: 'October 26, 2024',
    startTime: '10:00 AM',
    endTime: '4:00 PM',
    location: 'Main Auditorium, Engineering Building',
    price: 'Free for students',
    organizer: {
      name: 'Innovators Tech Club',
      logo: null,
      followers: 234
    },
    tags: ['OPEN', 'PUBLIC', 'TECH'],
    image: 'gradient-tech',
    registrations: 234,
    capacity: 500,
    category: 'Technology',
    speakers: [
      { name: 'Dr. Sarah Johnson', role: 'AI Research Lead at Google', avatar: null },
      { name: 'Mark Chen', role: 'CTO at TechCorp', avatar: null },
      { name: 'Emily Roberts', role: 'Cybersecurity Expert', avatar: null }
    ],
    agenda: [
      { time: '10:00 AM', title: 'Registration & Networking', duration: '30 min' },
      { time: '10:30 AM', title: 'Opening Keynote: Future of AI', duration: '45 min' },
      { time: '11:15 AM', title: 'Workshop: Machine Learning Basics', duration: '60 min' },
      { time: '12:15 PM', title: 'Lunch Break', duration: '45 min' },
      { time: '1:00 PM', title: 'Panel Discussion: Tech Careers', duration: '60 min' },
      { time: '2:00 PM', title: 'Networking Session', duration: '60 min' },
      { time: '3:00 PM', title: 'Closing Remarks & Q&A', duration: '60 min' }
    ]
  };

  const handleRegister = () => {
    // TODO: Dispatch Redux action
    // dispatch(registerForEvent(event.id))
    setIsRegistered(true);
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const handleBack = () => {
    router.back();
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* Header */}
      <div className="bg-[#1a2332] border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-white font-semibold text-lg">Event Details</h1>
          <div className="relative">
            <button
              onClick={handleShare}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            
            {/* Share Menu */}
            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1a2332] border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                <button className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-800 transition-colors flex items-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Share on Facebook
                </button>
                <button className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-800 transition-colors flex items-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Share on Twitter
                </button>
                <button className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-800 transition-colors flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Event Hero Image */}
        <div className="h-64 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl mb-6"></div>

        {/* Event Title & Tags */}
        <div className="mb-6">
          <h1 className="text-white text-3xl font-bold mb-4">{event.title}</h1>
          <div className="flex gap-2 flex-wrap">
            {event.tags.map((tag, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  tag === 'OPEN' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  tag === 'PUBLIC' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Event Info Cards */}
        <div className="space-y-3 mb-6">
          {/* Date & Time */}
          <div className="bg-[#152238] border border-gray-700/50 rounded-xl p-4 flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Date & Time</p>
              <p className="text-white font-medium">{event.date}, {event.startTime} – {event.endTime}</p>
            </div>
          </div>

          {/* Location */}
          <div className="bg-[#152238] border border-gray-700/50 rounded-xl p-4 flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Location</p>
              <p className="text-white font-medium">{event.location}</p>
            </div>
          </div>

          {/* Price */}
          <div className="bg-[#152238] border border-gray-700/50 rounded-xl p-4 flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Entry Fee</p>
              <p className="text-white font-medium">{event.price}</p>
            </div>
          </div>
        </div>

        {/* Organizer */}
        <div className="bg-[#152238] border border-gray-700/50 rounded-xl p-4 mb-6">
          <p className="text-gray-400 text-sm mb-3">Hosted by</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {getInitials(event.organizer.name)}
                </span>
              </div>
              <div>
                <p className="text-white font-semibold">{event.organizer.name}</p>
                <p className="text-gray-400 text-sm">{event.organizer.followers} followers</p>
              </div>
            </div>
            <button className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg font-medium transition-all border border-blue-500/30">
              Follow
            </button>
          </div>
        </div>

        {/* About This Event */}
        <div className="mb-6">
          <h2 className="text-white text-xl font-bold mb-3">About this event</h2>
          <div className="bg-[#152238] border border-gray-700/50 rounded-xl p-5">
            <p className="text-gray-300 leading-relaxed">{event.description}</p>
          </div>
        </div>

        {/* Speakers */}
        {event.speakers && event.speakers.length > 0 && (
          <div className="mb-6">
            <h2 className="text-white text-xl font-bold mb-3">Featured Speakers</h2>
            <div className="space-y-3">
              {event.speakers.map((speaker, index) => (
                <div key={index} className="bg-[#152238] border border-gray-700/50 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {getInitials(speaker.name)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{speaker.name}</p>
                    <p className="text-gray-400 text-sm">{speaker.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agenda */}
        {event.agenda && event.agenda.length > 0 && (
          <div className="mb-6">
            <h2 className="text-white text-xl font-bold mb-3">Event Agenda</h2>
            <div className="bg-[#152238] border border-gray-700/50 rounded-xl p-5 space-y-4">
              {event.agenda.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="text-blue-400 font-semibold min-w-[80px]">{item.time}</div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.title}</p>
                    <p className="text-gray-400 text-sm">{item.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Registration Stats */}
        <div className="bg-[#152238] border border-gray-700/50 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">Registrations</p>
            <p className="text-white font-semibold">{event.registrations} / {event.capacity}</p>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${(event.registrations / event.capacity) * 100}%` }}
            ></div>
          </div>
          <p className="text-gray-400 text-xs mt-2">
            {event.capacity - event.registrations} spots remaining
          </p>
        </div>

        {/* Register Button */}
        <button
          onClick={handleRegister}
          disabled={isRegistered}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            isRegistered
              ? 'bg-green-500 text-white cursor-default'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isRegistered ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Registered Successfully
            </span>
          ) : (
            'Register Now'
          )}
        </button>
      </div>

      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
};

export default EventDetailsPage;