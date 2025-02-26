import React from "react";

export default function Account() {
  return (
    <div className="min-h-screen bg-gray-100 rounded-md py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-6">
        {/* Header with Profile Image */}
        <div className="flex items-center space-x-6 mb-8">
          <div className="relative w-24 h-24">
            <img
              src="/asset/images/avatar.png"
              alt="Profile"
              className="w-full h-full object-cover rounded-full border border-gray-300 shadow"
            />
            <label
              htmlFor="profile-upload"
              className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </label>
            <input
              type="file"
              id="profile-upload"
              accept="image/*"
              className="hidden"
            />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">My Account</h1>
            <p className="text-gray-600">Manage your profile and account settings</p>
          </div>
        </div>

        {/* Account Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Full Name</label>
                <input
                  type="text"
                  value="John Doe"
                  className="w-full mt-1 px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <input
                  type="email"
                  value="john.doe@example.com"
                  className="w-full mt-1 px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Phone</label>
                <input
                  type="tel"
                  value="+1234567890"
                  className="w-full mt-1 px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Account Settings</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Change Password</span>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                  Update
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Two-Factor Authentication</span>
                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                  Enable
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Deactivate Account</span>
                <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="mt-8 flex justify-end">
          <button className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
