'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  onCollapse?: (isCollapsed: boolean) => void;
}

export default function Sidebar({ onCollapse }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const handleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapse?.(newState);
  };

  return (
    <aside 
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gray-900 border-r border-gray-800 transition-all duration-300 ease-in-out z-40
        ${isCollapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Navigation Links */}
      <nav className="p-4 space-y-2">
        <Link
          href="/"
          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
            pathname === '/' ? 'bg-blue-600/10 text-blue-500' : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            Orders
          </span>
        </Link>

        <Link
          href="/products"
          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
            pathname === '/products' ? 'bg-blue-600/10 text-blue-500' : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            Products
          </span>
        </Link>

        <Link
          href="/customers"
          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
            pathname === '/customers' ? 'bg-blue-600/10 text-blue-500' : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            Customers
          </span>
        </Link>

        <Link
          href="/admin"
          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
            pathname === '/admin' ? 'bg-blue-600/10 text-blue-500' : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            Admin
          </span>
        </Link>
      </nav>

      {/* Collapse Button */}
      <button
        onClick={handleCollapse}
        className="absolute -right-3 top-3 p-1.5 rounded-full bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg 
          className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? '-rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
    </aside>
  );
} 