import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-green-400 mb-6">Admin Dashboard</h1>
        
        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link 
            href="/admin/create-product"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Product
          </Link>
          
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Products
          </button>
          
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
        <p className="text-gray-400">Welcome to the admin dashboard. Select an action above to get started.</p>
      </div>
    </div>
  );
} 