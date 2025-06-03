'use client';

import { useState } from 'react';
import { useConference } from '../contexts/ConferenceContext';
import SpeakersTab from './SpeakersTab';
import SessionsTab from './SessionsTab';
import YouTab from './YouTab';

type Tab = 'speakers' | 'sessions' | 'you';

export default function ConferenceApp() {
  const [activeTab, setActiveTab] = useState<Tab>('speakers');
  const { loading, error } = useConference();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conference data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Data</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Conference Explorer</h1>
            
            {/* Tab Navigation */}
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('speakers')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'speakers'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Speakers
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'sessions'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Sessions
              </button>
              <button
                onClick={() => setActiveTab('you')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'you'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                You
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'speakers' && <SpeakersTab />}
        {activeTab === 'sessions' && <SessionsTab />}
        {activeTab === 'you' && <YouTab />}
      </main>
    </div>
  );
} 