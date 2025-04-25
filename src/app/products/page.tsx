'use client';

import { useEffect, useState } from 'react';
import { DynamoDB, config } from 'aws-sdk';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProductModal from '../components/ProductModal';

// Add useResponsiveGrid hook
const useResponsiveGrid = (desiredColumns: number) => {
  const [columns, setColumns] = useState(desiredColumns);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) { // sm
        setColumns(1);
      } else if (width < 768) { // md
        setColumns(Math.min(2, desiredColumns));
      } else if (width < 1024) { // lg
        setColumns(Math.min(3, desiredColumns));
      } else if (width < 1280) { // xl
        setColumns(Math.min(6, desiredColumns));
      } else if (width < 1536) { // 2xl
        setColumns(Math.min(8, desiredColumns));
      } else {
        setColumns(desiredColumns);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [desiredColumns]);

  return columns;
};

// Add utility function to strip HTML tags
const stripHtmlTags = (html: string) => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .trim(); // Remove leading/trailing whitespace
};

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url?: string;
  vendor: string;
  product_type: string;
  created_at: string;
  updated_at: string;
  status?: string;
  tags?: string[];
  variants?: any[];
  images?: any[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [cardsPerRow, setCardsPerRow] = useState(4);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const actualColumns = useResponsiveGrid(cardsPerRow);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Validate AWS credentials
        const accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY;

        if (!accessKeyId || !secretAccessKey) {
          throw new Error('AWS credentials are not properly configured. Please check your environment variables.');
        }

        // Configure AWS SDK
        config.update({
          region: 'us-east-1',
          accessKeyId,
          secretAccessKey,
        });

        const dynamodb = new DynamoDB.DocumentClient();

        const params = {
          TableName: 'shopify_inkhub_get_products',
          // Add error handling for empty results
          Select: 'ALL_ATTRIBUTES'
        };

        const result = await dynamodb.scan(params).promise();
        
        // Add detailed console logging
        console.log('Raw DynamoDB Response:', JSON.stringify(result, null, 2));
        console.log('Raw Items from DynamoDB:', JSON.stringify(result.Items, null, 2));
        
        if (!result.Items || result.Items.length === 0) {
          setProducts([]);
          setError('No products found in the database.');
          setLoading(false);
          return;
        }

        // Transform the Shopify product data
        const validProducts = result.Items.map(item => {
          const productData = item.Item || item; // Handle nested Item structure
          return {
            id: item.id || 'N/A',
            title: productData.title || 'Untitled Product',
            description: stripHtmlTags(productData.body_html || ''),
            price: productData.variants?.[0]?.price ? parseFloat(productData.variants[0].price) : 0,
            image_url: productData.image?.src || productData.images?.[0]?.src || '',
            vendor: productData.vendor || '',
            product_type: productData.product_type || '',
            created_at: productData.created_at || new Date().toISOString(),
            updated_at: productData.updated_at || new Date().toISOString(),
            status: productData.status || 'active',
            tags: productData.tags ? productData.tags.split(', ') : [],
            variants: productData.variants || [],
            images: productData.images || []
          };
        });

        console.log('Transformed Products:', JSON.stringify(validProducts, null, 2));
        setProducts(validProducts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        let errorMessage = 'Failed to fetch products. ';
        
        if (err instanceof Error) {
          if (err.message.includes('credentials')) {
            errorMessage += 'AWS credentials are invalid or missing.';
          } else if (err.message.includes('network')) {
            errorMessage += 'Please check your internet connection.';
          } else if (err.message.includes('ResourceNotFoundException')) {
            errorMessage += 'The specified table does not exist.';
          } else {
            errorMessage += err.message;
          }
        } else {
          errorMessage += 'An unexpected error occurred.';
        }

        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-gray-900">
        <Header />
        <Sidebar onCollapse={setIsSidebarCollapsed} />
        <div className={`flex items-center justify-center h-[calc(100vh-4rem)] mt-16 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="text-xl font-semibold text-blue-400">
            <span className="inline-block animate-spin mr-2">⭐</span>
            Loading products...
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
          <div className="text-xl text-red-400 bg-gray-800 p-6 rounded-lg shadow-lg border border-red-500/20">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Error</span>
            </div>
            <p className="text-base text-red-300">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900">
      <Header />
      <Sidebar onCollapse={setIsSidebarCollapsed} />
      <main className={`p-8 mt-16 overflow-auto h-[calc(100vh-4rem)] transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="max-w-[1920px] mx-auto">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                Products <span className="text-blue-400">({products.length})</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-400">Cards per row:</span>
                <input
                  type="range"
                  min="1"
                  max="16"
                  step="1"
                  value={cardsPerRow}
                  onChange={(e) => setCardsPerRow(Number(e.target.value))}
                  className="w-40 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-sm font-medium text-blue-400 min-w-[2rem] text-center">{cardsPerRow}</span>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {[2, 3, 4, 6, 8, 10, 12, 14, 16].map((num) => (
                  <button
                    key={num}
                    onClick={() => setCardsPerRow(num)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      cardsPerRow === num
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Products Found</h3>
              <p className="text-gray-500">There are no products available at the moment.</p>
            </div>
          ) : (
            <div 
              className="grid gap-3 transition-all duration-300"
              style={{
                gridTemplateColumns: `repeat(${actualColumns}, minmax(0, 1fr))`,
                gap: '0.75rem'
              }}
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-gray-600 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  {product.image_url ? (
                    <div className="aspect-square w-full overflow-hidden bg-gray-900">
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-square w-full bg-gray-900 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2 truncate">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-bold text-blue-400">
                        ₹{product.price.toFixed(2)}
                      </span>
                      {product.vendor && (
                        <span className="text-sm text-gray-500">
                          {product.vendor}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.tags && product.tags.slice(0, 1).map((tag, index) => (
                        <span key={index} className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Product Modal */}
      <ProductModal 
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
} 