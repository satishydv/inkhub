'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateProduct() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: null as File | null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productId = Date.now().toString();
      const currentDate = new Date().toISOString();
      
      // Create the request body matching the required format
      const productData = {
        id: productId,
        Item: {
          id: productId,
          title: formData.name,
          body_html: formData.description,
          vendor: "INKHUB",
          product_type: "",
          created_at: currentDate,
          handle: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          updated_at: currentDate,
          published_at: currentDate,
          status: "active",
          published_scope: "web",
          tags: formData.category,
          variants: [
            {
              id: Date.now().toString(),
              product_id: productId,
              title: "medium - 3.5 inch",
              price: formData.price,
              sku: "",
              position: 1,
              inventory_policy: "deny",
              compare_at_price: null,
              fulfillment_service: "manual",
              inventory_management: null,
              option1: "medium - 3.5 inch",
              option2: null,
              option3: null,
              created_at: currentDate,
              updated_at: currentDate,
              taxable: true,
              barcode: null,
              grams: 0,
              weight: 0,
              weight_unit: "kg",
              inventory_item_id: Date.now().toString(),
              inventory_quantity: 0,
              old_inventory_quantity: 0,
              requires_shipping: true,
            }
          ],
          options: [
            {
              id: Date.now().toString(),
              product_id: productId,
              name: "Size",
              position: 1,
              values: ["medium - 3.5 inch"]
            }
          ],
          images: formData.image ? [
            {
              id: Date.now().toString(),
              product_id: productId,
              position: 1,
              created_at: currentDate,
              updated_at: currentDate,
              alt: null,
              width: 800,
              height: 800,
              src: URL.createObjectURL(formData.image),
              variant_ids: [],
              admin_graphql_api_id: `gid://shopify/ProductImage/${Date.now()}`
            }
          ] : [],
          image: formData.image ? {
            id: Date.now().toString(),
            product_id: productId,
            position: 1,
            created_at: currentDate,
            updated_at: currentDate,
            alt: null,
            width: 800,
            height: 800,
            src: URL.createObjectURL(formData.image),
            variant_ids: [],
            admin_graphql_api_id: `gid://shopify/ProductImage/${Date.now()}`
          } : null
        },
        timestamp: new Date().toISOString()
      };

      // Make the POST request
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      const result = await response.json();
      console.log('Product created successfully!');
      console.log('Product ID:', productId);
      console.log('Full product data:', productData);

      // Redirect back to admin page on success
      router.push('/admin');
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-green-400 mb-6">Create New Product</h1>
        
        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button 
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            onClick={() => router.push('/admin')}
          >
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

      {/* Form Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Product Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
              placeholder="Enter product description"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
              Price
            </label>
            <input
              type="number"
              id="price"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
              placeholder="Enter price"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
            >
              <option value="">Select category</option>
              <option value="armband">Armband</option>
              <option value="around-arm-tattoo">Around Arm Tattoo</option>
              <option value="extra-large">Extra Large</option>
              <option value="forearm">Forearm</option>
              <option value="seo">SEO</option>
              <option value="xxl-12-inch">XXL - 12 inch</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload Image
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => document.getElementById('image-upload')?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upload Image
              </button>
              {formData.image && (
                <span className="text-sm text-gray-400">
                  {formData.image.name}
                </span>
              )}
            </div>
            <input
              type="file"
              id="image-upload"
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          <div className="flex justify-center mt-8">
            <button
              type="submit"
              className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 