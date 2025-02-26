import React from 'react';

export default function Settings() {
  return (
    <div className="min-h-screen py-8">
      <div className=" bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Settings</h1>
        <p className="text-gray-600 mb-6">Customize your preferences below.</p>
        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-medium text-gray-700">Profile Settings</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full mt-1 px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <input
                  type="email"
                  placeholder="john.doe@example.com"
                  className="w-full mt-1 px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-medium text-gray-700">Account Settings</h2>
            <div className="mt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Two-Factor Authentication</span>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                  Enable
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Change Password</span>
                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                  Update
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <h2 className="text-lg font-medium text-gray-700">Notification Settings</h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-gray-700">Email Notifications</label>
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-gray-700">Push Notifications</label>
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
