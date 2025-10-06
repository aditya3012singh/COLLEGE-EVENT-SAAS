import React from "react";

export default function WelcomeStudent({ name = "Student", profilePic }) {
  return (
    <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      {profilePic ? (
        <img
          src={profilePic}
          alt={`${name} Profile`}
          className="w-16 h-16 rounded-full object-cover border-2 border-blue-600"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Welcome back, {name}!
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Here's your personalized dashboard overview.
        </p>
      </div>
    </div>
  );
}
