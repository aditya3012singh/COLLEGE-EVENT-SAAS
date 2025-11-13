// components/Landing/CampusConnect.jsx
"use client"
import { useState } from 'react';
import Link from 'next/link';

const CollegeSelect = () => {
  const [showCollegeList, setShowCollegeList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState(null);

  // Mock college data - Replace with Redux store data later
  const colleges = [
    { id: 1, name: 'Massachusetts Institute of Technology', location: 'Cambridge, MA', students: 11520 },
    { id: 2, name: 'Stanford University', location: 'Stanford, CA', students: 17249 },
    { id: 3, name: 'Harvard University', location: 'Cambridge, MA', students: 23731 },
    { id: 4, name: 'California Institute of Technology', location: 'Pasadena, CA', students: 2397 },
    { id: 5, name: 'University of California Berkeley', location: 'Berkeley, CA', students: 45057 },
    { id: 6, name: 'Princeton University', location: 'Princeton, NJ', students: 8419 },
    { id: 7, name: 'Yale University', location: 'New Haven, CT', students: 13609 },
    { id: 8, name: 'Cornell University', location: 'Ithaca, NY', students: 25593 },
    { id: 9, name: 'Columbia University', location: 'New York, NY', students: 33413 },
    { id: 10, name: 'University of Chicago', location: 'Chicago, IL', students: 18452 },
  ];

  // Filter colleges based on search query
  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    college.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCollege = (college) => {
    setSelectedCollege(college);
    // TODO: Dispatch Redux action to set selected college
    // dispatch(setSelectedCollege(college))
    
    // Navigate to college-specific page or login
    // router.push(`/college/${college.id}/login`)
  };

  const handleShowColleges = () => {
    setShowCollegeList(true);
  };

  const handleBackToHome = () => {
    setShowCollegeList(false);
    setSearchQuery('');
    setSelectedCollege(null);
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {!showCollegeList ? (
            // Landing Page View
            <>
              {/* Logo */}
              <div className="flex items-center justify-start mb-12">
                <div className="bg-blue-500 rounded-lg p-2 mr-3">
                  <svg 
                    className="w-6 h-6 text-white" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                  </svg>
                </div>
                <span className="text-white text-xl font-semibold">CampusConnect</span>
              </div>

              {/* Hero Section */}
              <div className="mb-8">
                <h1 className="text-white text-4xl font-bold mb-4 leading-tight">
                  Your Campus,<br />Connected.
                </h1>
                <p className="text-gray-400 text-base">
                  Discover, plan, and join all your college events in one place.
                </p>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleShowColleges}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-lg transition-colors mb-8"
              >
                Select Your College
              </button>

              {/* Partner Colleges */}
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-6">
                  Trusted by over 50 partner colleges
                </p>
                
                {/* College Icons */}
                <div className="flex justify-center items-center gap-8">
                  {/* Icon 1 */}
                  <div className="text-gray-600">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 13.5l-7-3.82v5l7 3.82 7-3.82v-5l-7 3.82z"/>
                    </svg>
                  </div>
                  
                  {/* Icon 2 */}
                  <div className="text-gray-600">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
                    </svg>
                  </div>
                  
                  {/* Icon 3 */}
                  <div className="text-gray-600">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3z"/>
                    </svg>
                  </div>
                  
                  {/* Icon 4 */}
                  <div className="text-gray-600">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // College Selection View
            <>
              {/* Back Button and Header */}
              <div className="mb-6">
                <button
                  onClick={handleBackToHome}
                  className="flex items-center text-gray-400 hover:text-white transition-colors mb-4"
                >
                  <svg 
                    className="w-5 h-5 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 19l-7-7 7-7" 
                    />
                  </svg>
                  Back
                </button>
                
                <h2 className="text-white text-3xl font-bold mb-2">
                  Select Your College
                </h2>
                <p className="text-gray-400 text-sm">
                  Choose your institution to get started
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
                    placeholder="Search colleges..."
                    className="w-full bg-[#152238] text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* College List */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                {filteredColleges.length > 0 ? (
                  filteredColleges.map((college) => (
                    <button
                      key={college.id}
                      onClick={() => handleSelectCollege(college)}
                      className="w-full bg-[#152238] hover:bg-[#1a2d4a] text-left p-4 rounded-lg transition-all duration-200 group border border-transparent hover:border-blue-500"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                            {college.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center">
                              <svg 
                                className="w-4 h-4 mr-1" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                                />
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                                />
                              </svg>
                              {college.location}
                            </span>
                            <span className="flex items-center">
                              <svg 
                                className="w-4 h-4 mr-1" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
                                />
                              </svg>
                              {college.students.toLocaleString()} students
                            </span>
                          </div>
                        </div>
                        <svg 
                          className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 5l7 7-7 7" 
                          />
                        </svg>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <svg 
                      className="w-16 h-16 text-gray-600 mx-auto mb-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    <p className="text-gray-400 text-sm">
                      No colleges found matching "{searchQuery}"
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      {!showCollegeList && (
        <div className="py-6">
          <div className="flex justify-center items-center gap-6 text-gray-500 text-sm">
            <Link href="/privacy-policy" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-gray-700">•</span>
            <Link href="/contact" className="hover:text-gray-300 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #152238;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2d3e57;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3d4e67;
        }
      `}</style>
    </div>
  );
};

export default CollegeSelect;