import React, { useState } from 'react';

interface ProductModalProps {
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    image_url?: string;
    vendor: string;
    tags?: string[];
    variants?: any[];
    images?: any[];
    created_at: string;
    updated_at: string;
  } | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  if (!product) return null;

  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  // Function to handle image click
  const handleImageClick = (imageUrl: string) => {
    setEnlargedImage(imageUrl);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Enlarged Image Overlay */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={enlargedImage}
              alt="Enlarged view"
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEnlargedImage(null);
              }}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div 
        className="bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {product.title}
            </h2>
            <p className="text-gray-400 mt-1">
              Added {new Date(product.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Images */}
            <div className="space-y-4">
              {product.image_url ? (
                <div 
                  className="aspect-square w-full rounded-lg overflow-hidden bg-gray-900 cursor-zoom-in hover:opacity-90 transition-opacity"
                  onClick={() => handleImageClick(product.image_url!)}
                >
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="aspect-square w-full bg-gray-900 rounded-lg flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              
              {/* Additional Images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(0, 4).map((image: any, index: number) => (
                    <div 
                      key={image.id} 
                      className="aspect-square rounded-lg overflow-hidden bg-gray-900 cursor-zoom-in hover:opacity-90 transition-opacity"
                      onClick={() => handleImageClick(image.src)}
                    >
                      <img
                        src={image.src}
                        alt={`${product.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Price and Vendor */}
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-blue-400">
                    ₹{product.price.toFixed(2)}
                  </span>
                  {product.vendor && (
                    <span className="text-gray-400">
                      by {product.vendor}
                    </span>
                  )}
                </div>

                {/* Variants */}
                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-400">Available Options:</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant: any) => (
                        <span
                          key={variant.id}
                          className="px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-300"
                        >
                          {variant.title} - ₹{parseFloat(variant.price).toFixed(2)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Description:</h3>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 