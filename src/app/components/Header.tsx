'use client';

import { useState, useEffect } from 'react';

interface HeaderProps {
  onSearch: (query: string) => void;
}

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-50">
      <div className="flex items-center justify-between h-full px-8 max-w-[1920px] mx-auto">
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
          OrderFlow
        </span>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-300 hover:text-white rounded-lg transition-colors duration-200 hover:bg-gray-800">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
} 