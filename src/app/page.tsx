'use client';

import { useEffect, useState } from 'react';
import { Order, PaginatedResponse, getOrders, getOrdersBatch } from '@/lib/orderService';
import OrderModal from './components/OrderModal';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { DynamoDB } from 'aws-sdk';

const ITEMS_PER_PAGE = 18;
const CACHE_KEY = 'orderflow_orders';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Add status options
const STATUS_OPTIONS = ['all', 'paid', 'pending', 'failed'] as const;
type OrderStatus = (typeof STATUS_OPTIONS)[number];

// Add loading states
interface LoadingState {
  initial: boolean;
  refresh: boolean;
  pagination: boolean;
}

// Helper function to format date
const formatDate = (date: string | Date | undefined) => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

interface CachedData {
  orders: Order[];
  timestamp: number;
}

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    initial: true,
    refresh: false,
    pagination: false
  });
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cardsPerRow, setCardsPerRow] = useState(6);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<DynamoDB.DocumentClient.Key | undefined>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreOrders, setHasMoreOrders] = useState(true);

  // Debounce search to avoid too many re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Function to check if cache is valid
  const isCacheValid = (timestamp: number) => {
    return Date.now() - timestamp < CACHE_DURATION;
  };

  // Function to get cached orders
  const getCachedOrders = (): CachedData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const parsedCache = JSON.parse(cached) as CachedData;
      if (!isCacheValid(parsedCache.timestamp)) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      
      return parsedCache;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  };

  // Function to set cached orders
  const setCachedOrders = (orders: Order[]) => {
    try {
      const cacheData: CachedData = {
        orders,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  };

  // Function to fetch orders batch
  const fetchOrdersBatch = async (lastKey?: DynamoDB.DocumentClient.Key) => {
    try {
      setIsLoadingMore(true);
      const response = await getOrdersBatch(lastKey);
      
      if (!lastKey) {
        // First batch
        setOrders(response.orders);
      } else {
        // Append new orders
        setOrders(prev => [...prev, ...response.orders]);
      }
      
      setLastEvaluatedKey(response.lastEvaluatedKey);
      setHasMoreOrders(!!response.lastEvaluatedKey);
      setTotalOrders(prev => prev + response.orders.length);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders batch:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Function to fetch fresh orders
  const fetchFreshOrders = async () => {
    setLoading(prev => ({ ...prev, refresh: true }));
    setLastEvaluatedKey(undefined);
    setTotalOrders(0);
    try {
      await fetchOrdersBatch();
    } finally {
      setLoading(prev => ({ ...prev, refresh: false }));
    }
  };

  // Load more orders when scrolling near bottom
  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight * 1.5;
    
    if (bottom && !isLoadingMore && hasMoreOrders) {
      fetchOrdersBatch(lastEvaluatedKey);
    }
  };

  // Filter orders based on search query and status
  const filteredOrders = orders.filter(order => {
    // First apply status filter
    if (selectedStatus !== 'all' && order.status !== selectedStatus) {
      return false;
    }
    
    // Then apply search filter
    if (!searchQuery.trim()) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const orderData = [
      order.order_id,
      order.billing_address?.first_name,
      order.billing_address?.last_name,
      order.customerEmail,
      order.billing_address?.phone,
      order.status,
      order.billing_address?.city,
      order.billing_address?.country
    ].map(item => (item || '').toString().toLowerCase());

    return orderData.some(data => data.includes(searchLower));
  });

  // Sort filtered orders by creation time
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const timeA = new Date(a.createdAt || '').getTime();
    const timeB = new Date(b.createdAt || '').getTime();
    return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
  });

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentOrders = sortedOrders.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Generate grid columns class based on cardsPerRow
  const getGridColumnsClass = () => {
    const baseClass = "grid gap-x-4 gap-y-8 mb-6";
    const columnClasses = {
      xs: "grid-cols-1",
      sm: "sm:grid-cols-2",
      md: "md:grid-cols-3",
      lg: "lg:grid-cols-4",
      xl: `xl:grid-cols-${cardsPerRow}`
    };
    return `${baseClass} ${Object.values(columnClasses).join(' ')}`;
  };

  const showOrderDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 6; // Show 6 numbered pages as in the image
    
    // If total pages is less than max visible, show all pages
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always include pages 1 through 4
    for (let i = 1; i <= 4; i++) {
      pages.push(i);
    }

    // Add ellipsis and include pages near the end
    if (currentPage <= 4) {
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push('...');
      for (let i = totalPages - 2; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push('...');
      pages.push(currentPage);
      if (currentPage + 1 < totalPages) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  useEffect(() => {
    const loadInitialOrders = async () => {
      setLoading(prev => ({ ...prev, initial: true }));
      await fetchOrdersBatch();
      setLoading(prev => ({ ...prev, initial: false }));
    };

    loadInitialOrders();
  }, []);

  if (loading.initial) {
    return (
      <div className="h-screen bg-gray-900">
        <Header />
        <Sidebar onCollapse={setIsSidebarCollapsed} />
        <div className={`flex items-center justify-center h-[calc(100vh-4rem)] mt-16 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="text-xl font-semibold text-blue-400">
            <span className="inline-block animate-spin mr-2">⭐</span>
            Loading orders...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-900">
        <Header />
        <Sidebar onCollapse={setIsSidebarCollapsed} />
        <div className={`flex items-center justify-center h-[calc(100vh-4rem)] mt-16 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="text-xl text-red-400 bg-gray-800 p-4 rounded-lg shadow-lg border border-red-500/20">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="h-screen bg-gray-900">
        <Header />
        <Sidebar onCollapse={setIsSidebarCollapsed} />
        <div className={`flex items-center justify-center h-[calc(100vh-4rem)] mt-16 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="text-xl text-gray-300 bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            No orders found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900">
      <Header />
      <Sidebar onCollapse={setIsSidebarCollapsed} />
      <main 
        className={`p-8 mt-16 overflow-auto h-[calc(100vh-4rem)] transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}
        onScroll={handleScroll}
      >
        <div className="max-w-[1920px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                  Orders{' '}
                  <span className="text-blue-400">
                    ({filteredOrders.length.toLocaleString()} / {totalOrders.toLocaleString()})
                  </span>
                </h1>
                <button
                  onClick={fetchFreshOrders}
                  disabled={loading.refresh}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    loading.refresh
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  title="Refresh orders"
                >
                  <svg
                    className={`w-5 h-5 ${loading.refresh ? 'animate-spin' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-4 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <input
                      type="range"
                      min="2"
                      max="8"
                      value={cardsPerRow}
                      onChange={(e) => setCardsPerRow(Number(e.target.value))}
                      className="w-24 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-sm font-medium text-blue-400 min-w-[1.5rem]">{cardsPerRow}</span>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search orders..."
                    className="w-64 px-4 py-2 pl-10 text-sm text-gray-300 bg-gray-800/50 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {searchValue && (
                    <button
                      onClick={() => setSearchValue('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    title="Filter orders"
                  >
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="text-sm font-medium">
                      {selectedStatus === 'all' ? 'All' : selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
                    </span>
                  </button>

                  {isFilterOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-2 z-50">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setSelectedStatus(status);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-700 ${
                            selectedStatus === status
                              ? 'text-blue-400 bg-gray-700/50'
                              : 'text-gray-300'
                          }`}
                        >
                          {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={toggleSortOrder}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                  title={sortOrder === 'asc' ? "Sort by newest" : "Sort by oldest"}
                >
                  <svg 
                    className={`w-5 h-5 transition-transform duration-200 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9M3 12h5m8 0l-4-4m4 4l-4 4" />
                  </svg>
                  <span className="text-sm font-medium">
                    {sortOrder === 'asc' ? 'Oldest first' : 'Newest first'}
                  </span>
                </button>
              </div>
            </div>

            <div className="text-gray-400 text-sm">
              Showing {(startIndex + 1).toLocaleString()}-{Math.min(endIndex, filteredOrders.length).toLocaleString()} of {filteredOrders.length.toLocaleString()} orders
            </div>
          </div>

          {filteredOrders.length === 0 && searchQuery && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No orders found</h3>
              <p className="text-gray-500">Try adjusting your search query</p>
            </div>
          )}

          {filteredOrders.length > 0 && (
            <>
              <div className={getGridColumnsClass()}>
                {currentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-gray-600 flex flex-col group"
                  >
                    {/* Basic Info - Always Visible */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm font-medium text-blue-400 group-hover:text-blue-300 transition-colors">Order ID</p>
                        <p className="text-base font-bold text-blue-300 group-hover:text-blue-200 transition-colors">{order.order_id || 'N/A'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'paid' ? 'bg-green-900/50 text-green-400 group-hover:bg-green-900/70' :
                        order.status === 'pending' ? 'bg-yellow-900/50 text-yellow-400 group-hover:bg-yellow-900/70' :
                        'bg-pink-900/50 text-pink-300 group-hover:bg-pink-900/70'
                      } transition-colors`}>
                        {order.status || 'N/A'}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs font-medium text-purple-400 group-hover:text-purple-300 transition-colors">Customer</p>
                          <p className="text-sm font-semibold text-purple-300 group-hover:text-purple-200 transition-colors truncate">
                            {order.billing_address?.first_name} {order.billing_address?.last_name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-amber-400 group-hover:text-amber-300 transition-colors">Total</p>
                          <p className="text-sm font-bold text-amber-300 group-hover:text-amber-200 transition-colors">
                            ₹{typeof order.totalPrice === 'number' ? order.totalPrice.toFixed(2) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Created At Time */}
                    <div className="mt-auto mb-3">
                      <p className="text-xs font-medium text-gray-500">Created</p>
                      <p className="text-sm text-gray-400">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    {/* More Details Button */}
                    <button
                      onClick={() => showOrderDetails(order)}
                      className="w-full px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-1 text-sm group-hover:bg-gray-600"
                    >
                      <span>More Details</span>
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {isLoadingMore && (
                <div className="flex justify-center items-center py-8">
                  <div className="text-lg font-semibold text-blue-400">
                    <span className="inline-block animate-spin mr-2">⭐</span>
                    Loading more orders...
                  </div>
                </div>
              )}

              {!hasMoreOrders && (
                <div className="text-center py-8 text-gray-400">
                  No more orders to load
                </div>
              )}
            </>
          )}

          {/* Updated Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  currentPage === 1
                  ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Previous
              </button>
              
              <div className="flex gap-2">
                {getPageNumbers().map((page, index) => (
                  typeof page === 'number' ? (
                    <button
                      key={index}
                      onClick={() => goToPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={index} className="w-10 h-10 flex items-center justify-center text-gray-500">
                      {page}
                    </span>
                  )
                ))}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  currentPage === totalPages
                  ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {selectedOrder && (
          <OrderModal
            order={selectedOrder}
            onClose={closeModal}
          />
        )}
      </main>
    </div>
  );
}
