import { Order } from '@/lib/orderService';

interface OrderModalProps {
  order: Order;
  onClose: () => void;
}

export default function OrderModal({ order, onClose }: OrderModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Order #{order.order_number}
            </h2>
            <p className="text-gray-400 mt-1">
              Created {new Date(order.createdAt).toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
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
            {/* Order Status and Payment */}
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Order Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'paid' ? 'bg-green-900/50 text-green-400' :
                    order.status === 'pending' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-pink-900/50 text-pink-300'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fulfillment</span>
                  <span className="text-gray-300">{order.fulfillment_status || 'Not fulfilled'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Method</span>
                  <span className="text-gray-300">
                    {order.payment_details.credit_card_company || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Customer</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 block">Name</span>
                  <span className="text-gray-300">
                    {order.customer.first_name} {order.customer.last_name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Email</span>
                  <span className="text-gray-300">{order.customer.email}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Phone</span>
                  <span className="text-gray-300">{order.customer.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Orders</span>
                  <span className="text-gray-300">{order.customer.orders_count} orders</span>
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Billing Address</h3>
              <div className="space-y-2 text-gray-300">
                <p>{order.billing_address.first_name} {order.billing_address.last_name}</p>
                {order.billing_address.company && (
                  <p>{order.billing_address.company}</p>
                )}
                <p>{order.billing_address.address1}</p>
                {order.billing_address.address2 && (
                  <p>{order.billing_address.address2}</p>
                )}
                <p>
                  {order.billing_address.city}, {order.billing_address.province}
                  {order.billing_address.province_code && ` (${order.billing_address.province_code})`}
                </p>
                <p>{order.billing_address.country} {order.billing_address.zip}</p>
                <p>{order.billing_address.phone}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Shipping Address</h3>
              <div className="space-y-2 text-gray-300">
                <p>{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
                {order.shipping_address.company && (
                  <p>{order.shipping_address.company}</p>
                )}
                <p>{order.shipping_address.address1}</p>
                {order.shipping_address.address2 && (
                  <p>{order.shipping_address.address2}</p>
                )}
                <p>
                  {order.shipping_address.city}, {order.shipping_address.province}
                  {order.shipping_address.province_code && ` (${order.shipping_address.province_code})`}
                </p>
                <p>{order.shipping_address.country} {order.shipping_address.zip}</p>
                <p>{order.shipping_address.phone}</p>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Items</h3>
            <div className="bg-gray-900/50 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 text-gray-400">Item</th>
                    <th className="text-center p-4 text-gray-400">Quantity</th>
                    <th className="text-right p-4 text-gray-400">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.line_items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-700/50">
                      <td className="p-4 text-gray-300">
                        <div>
                          <span className="font-medium">{item.title}</span>
                          {item.variant_title && (
                            <span className="text-gray-500 text-sm block">{item.variant_title}</span>
                          )}
                          {item.sku && (
                            <span className="text-gray-500 text-sm block">SKU: {item.sku}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center text-gray-300">{item.quantity}</td>
                      <td className="p-4 text-right text-gray-300">₹{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-6 bg-gray-900/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-gray-300">₹{order.subtotal_price}</span>
              </div>
              {order.shipping_lines.map((shipping) => (
                <div key={shipping.id} className="flex justify-between">
                  <span className="text-gray-400">
                    Shipping ({shipping.title})
                  </span>
                  <span className="text-gray-300">₹{shipping.price}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-gray-400">Tax</span>
                <span className="text-gray-300">₹{order.total_tax}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-700">
                <span className="text-white font-medium">Total</span>
                <span className="text-white font-medium">₹{order.total_price}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.note && (
            <div className="mt-6 bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{order.note}</p>
            </div>
          )}

          {/* Tags */}
          {order.tags && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {order.tags.split(',').map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
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