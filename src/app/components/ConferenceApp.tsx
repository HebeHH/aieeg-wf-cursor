'use client';

import { useState } from 'react';
import { useConference } from '../contexts/ConferenceContext';
import { ModalProvider } from '../contexts/ModalContext';
import SpeakersTab from './SpeakersTab';
import SessionsTab from './SessionsTab';
import YouTab from './YouTab';
import CalendarTab from './CalendarTab';
import ModalManager from './ModalManager';

type Tab = 'speakers' | 'sessions' | 'you' | 'calendar';

export default function ConferenceApp() {
  const [activeTab, setActiveTab] = useState<Tab>('speakers');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    <ModalProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-violet-500 border-b border-rose-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center space-x-4">
              <a href="https://www.shebecoding.com/" target="_blank" className="text-lg md:text-2xl font-bold text-rose-50">
                <span className="block md:inline">WF Explorer</span>
                <span className="hidden md:inline text-sm text-rose-100">by Hebe Hilhorst</span>
                <span className="md:hidden text-sm text-rose-100">by Hebe</span>
              </a>
              <div className="flex space-x-2">
                <a href="https://github.com/hebehh" target="_blank">
                  <img src="/layout/github.svg" alt="Github" className="w-5 h-5 md:w-6 md:h-6" />
                </a>
                <a href="https://x.com/hebehilhorst" target="_blank">
                  <img src="/layout/twitter.svg" alt="Twitter" className="w-5 h-5 md:w-6 md:h-6" />
                </a>
                <a href="https://www.linkedin.com/in/hebehilhorst/" target="_blank">
                  <img src="/layout/linkedin.svg" alt="LinkedIn" className="w-5 h-5 md:w-6 md:h-6" />
                </a>
              </div>
            </div>
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-rose-50 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                </svg>
              </button>
            </div>
            <nav className="hidden md:flex space-x-4 md:space-x-8 justify-center">
              <button
                onClick={() => setActiveTab('sessions')}
                className={`px-4 py-2 text-md font-medium rounded-lg shadow-md transition-colors ${
                  activeTab === 'sessions'
                    ? 'bg-rose-200 text-violet-900'
                    : 'text-rose-100 hover:text-rose-200 hover:bg-violet-600'
                }`}
              >
                Sessions
              </button>
              <button
                onClick={() => setActiveTab('speakers')}
                className={`px-4 py-2 text-md font-medium rounded-lg shadow-md transition-colors ${
                  activeTab === 'speakers'
                    ? 'bg-rose-200 text-violet-900'
                    : 'text-rose-100 hover:text-rose-200 hover:bg-violet-600'
                }`}
              >
                Speakers
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-4 py-2 text-md font-medium rounded-lg shadow-md transition-colors ${
                  activeTab === 'calendar'
                    ? 'bg-rose-200 text-violet-900'
                    : 'text-rose-100 hover:text-rose-200 hover:bg-violet-600'
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setActiveTab('you')}
                className={`px-4 py-2 text-md font-medium rounded-lg shadow-md transition-colors ${
                  activeTab === 'you'
                    ? 'bg-rose-200 text-violet-900'
                    : 'text-rose-100 hover:text-rose-200 hover:bg-violet-600'
                }`}
              >
                You
              </button>
            </nav>
          </div>
          
          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-violet-600 border-t border-violet-400">
              <div className="px-4 py-3 space-y-2">
                <button
                  onClick={() => {
                    setActiveTab('speakers');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-md font-medium rounded-lg transition-colors ${
                    activeTab === 'speakers'
                      ? 'bg-rose-200 text-violet-900'
                      : 'text-rose-100 hover:text-rose-200 hover:bg-violet-500'
                  }`}
                >
                  Speakers
                </button>
                <button
                  onClick={() => {
                    setActiveTab('sessions');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-md font-medium rounded-lg transition-colors ${
                    activeTab === 'sessions'
                      ? 'bg-rose-200 text-violet-900'
                      : 'text-rose-100 hover:text-rose-200 hover:bg-violet-500'
                  }`}
                >
                  Sessions
                </button>
                <button
                  onClick={() => {
                    setActiveTab('you');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-md font-medium rounded-lg transition-colors ${
                    activeTab === 'you'
                      ? 'bg-rose-200 text-violet-900'
                      : 'text-rose-100 hover:text-rose-200 hover:bg-violet-500'
                  }`}
                >
                  You
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'speakers' && <SpeakersTab />}
          {activeTab === 'sessions' && <SessionsTab />}
          {activeTab === 'calendar' && <CalendarTab />}
          {activeTab === 'you' && <YouTab />}
        </main>

        {/* Modal Manager */}
        <ModalManager />
      </div>
    </ModalProvider>
  );
} 