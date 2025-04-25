import { DynamoDB } from 'aws-sdk';

const dynamoDB = new DynamoDB.DocumentClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ''
  }
});

export interface BillingAddress {
  first_name: string;
  last_name: string;
  company: string | null;
  address1: string;
  address2: string | null;
  city: string;
  province: string;
  province_code: string;
  country: string;
  country_code: string;
  zip: string;
  phone: string;
  latitude: string | null;
  longitude: string | null;
}

export interface Order {
  id: string;
  order_id: string;
  order_number: number;
  email: string;
  customerEmail: string;
  total_price: string;
  totalPrice: number;
  subtotal_price: string;
  total_tax: string;
  currency: string;
  financial_status: string;
  status: 'paid' | 'pending' | 'failed';
  fulfillment_status: string | null;
  processed_at: string;
  createdAt: string;
  billing_address: BillingAddress;
  shipping_address: BillingAddress;
  customer: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    created_at: string;
    orders_count: number;
    total_spent: string;
    tax_exempt: boolean;
  };
  line_items: Array<{
    id: number;
    title: string;
    quantity: number;
    price: string;
    sku: string | null;
    variant_title: string | null;
    vendor: string | null;
    product_id: number | null;
    requires_shipping: boolean;
    taxable: boolean;
    gift_card: boolean;
  }>;
  shipping_lines: Array<{
    id: number;
    title: string;
    price: string;
    code: string | null;
    source: string;
  }>;
  payment_details: {
    credit_card_bin: string | null;
    avs_result_code: string | null;
    cvv_result_code: string | null;
    credit_card_number: string | null;
    credit_card_company: string | null;
  };
  note: string | null;
  tags: string;
  source_name: string;
}

function processDynamoDBItem(item: any): Order {
  console.log('Raw DynamoDB Item:', JSON.stringify(item, null, 2));
  
  // Extract the actual order data from the Item field
  const orderData = item.Item || item;
  
  // Process billing address
  const billing_address = orderData.billing_address || {};
  const shipping_address = orderData.shipping_address || {};
  const customer = orderData.customer || {};
  const payment_details = orderData.payment_details || {};
  const line_items = orderData.line_items || [];
  const shipping_lines = orderData.shipping_lines || [];

  const processedOrder = {
    id: item.id || '',
    order_id: orderData.order_number?.toString() || '',
    order_number: parseInt(orderData.order_number || '0', 10),
    email: orderData.email || '',
    customerEmail: orderData.email || '',
    total_price: orderData.total_price || '0.00',
    totalPrice: parseFloat(orderData.total_price || '0'),
    subtotal_price: orderData.subtotal_price || '0.00',
    total_tax: orderData.total_tax || '0.00',
    currency: orderData.currency || 'INR',
    financial_status: orderData.financial_status || '',
    status: (orderData.financial_status as 'paid' | 'pending' | 'failed') || 'pending',
    fulfillment_status: orderData.fulfillment_status,
    processed_at: orderData.processed_at || '',
    createdAt: orderData.created_at || orderData.processed_at || new Date().toISOString(),
    billing_address: {
      first_name: billing_address.first_name || '',
      last_name: billing_address.last_name || '',
      company: billing_address.company || null,
      address1: billing_address.address1 || '',
      address2: billing_address.address2 || null,
      city: billing_address.city || '',
      province: billing_address.province || '',
      province_code: billing_address.province_code || '',
      country: billing_address.country || '',
      country_code: billing_address.country_code || '',
      zip: billing_address.zip || '',
      phone: billing_address.phone || '',
      latitude: billing_address.latitude || null,
      longitude: billing_address.longitude || null
    },
    shipping_address: {
      first_name: shipping_address.first_name || '',
      last_name: shipping_address.last_name || '',
      company: shipping_address.company || null,
      address1: shipping_address.address1 || '',
      address2: shipping_address.address2 || null,
      city: shipping_address.city || '',
      province: shipping_address.province || '',
      province_code: shipping_address.province_code || '',
      country: shipping_address.country || '',
      country_code: shipping_address.country_code || '',
      zip: shipping_address.zip || '',
      phone: shipping_address.phone || '',
      latitude: shipping_address.latitude || null,
      longitude: shipping_address.longitude || null
    },
    customer: {
      id: customer.id || 0,
      email: customer.email || '',
      first_name: customer.first_name || '',
      last_name: customer.last_name || '',
      phone: customer.phone || null,
      created_at: customer.created_at || '',
      orders_count: customer.orders_count || 0,
      total_spent: customer.total_spent || '0.00',
      tax_exempt: customer.tax_exempt || false
    },
    line_items: line_items.map((lineItem: any) => ({
      id: lineItem.id || 0,
      title: lineItem.title || '',
      quantity: lineItem.quantity || 0,
      price: lineItem.price || '0.00',
      sku: lineItem.sku || null,
      variant_title: lineItem.variant_title || null,
      vendor: lineItem.vendor || null,
      product_id: lineItem.product_id || null,
      requires_shipping: lineItem.requires_shipping || false,
      taxable: lineItem.taxable || false,
      gift_card: lineItem.gift_card || false
    })),
    shipping_lines: shipping_lines.map((shipping: any) => ({
      id: shipping.id || 0,
      title: shipping.title || '',
      price: shipping.price || '0.00',
      code: shipping.code || null,
      source: shipping.source || ''
    })),
    payment_details: {
      credit_card_bin: payment_details.credit_card_bin || null,
      avs_result_code: payment_details.avs_result_code || null,
      cvv_result_code: payment_details.cvv_result_code || null,
      credit_card_number: payment_details.credit_card_number || null,
      credit_card_company: payment_details.credit_card_company || null
    },
    note: orderData.note || null,
    tags: orderData.tags || '',
    source_name: orderData.source_name || ''
  };

  console.log('Processed Order:', JSON.stringify(processedOrder, null, 2));
  
  return processedOrder;
}

export interface PaginatedResponse {
  orders: Order[];
  lastEvaluatedKey?: DynamoDB.DocumentClient.Key;
  totalCount: number;
}

export const getOrders = async (
  lastEvaluatedKey?: DynamoDB.DocumentClient.Key,
  allOrders: Order[] = []
): Promise<PaginatedResponse> => {
  try {
    console.log('Fetching orders with lastEvaluatedKey:', lastEvaluatedKey);
    
    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME || '',
      Limit: 100,
      ExclusiveStartKey: lastEvaluatedKey
    };

    console.log('DynamoDB Scan Params:', JSON.stringify(params, null, 2));

    const result = await dynamoDB.scan(params).promise();
    console.log('DynamoDB Raw Response:', JSON.stringify(result, null, 2));
    
    const processedOrders = (result.Items || []).map(item => processDynamoDBItem(item));
    const newOrders = [...allOrders, ...processedOrders];

    console.log(`Processed ${processedOrders.length} orders in this batch`);
    console.log(`Total orders processed so far: ${newOrders.length}`);

    if (result.LastEvaluatedKey) {
      console.log('More orders available, continuing with next batch...');
      return getOrders(result.LastEvaluatedKey, newOrders);
    }

    console.log('All orders fetched successfully');
    return {
      orders: newOrders,
      totalCount: newOrders.length
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Function to get orders with client-side pagination
export const getOrdersBatch = async (
  lastEvaluatedKey?: DynamoDB.DocumentClient.Key
): Promise<PaginatedResponse> => {
  try {
    console.log('Fetching orders batch with lastEvaluatedKey:', lastEvaluatedKey);
    
    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME || '',
      Limit: 100,
      ExclusiveStartKey: lastEvaluatedKey
    };

    console.log('DynamoDB Batch Scan Params:', JSON.stringify(params, null, 2));

    const result = await dynamoDB.scan(params).promise();
    console.log('DynamoDB Raw Batch Response:', JSON.stringify(result, null, 2));
    
    const processedOrders = (result.Items || []).map(item => processDynamoDBItem(item));

    console.log(`Processed ${processedOrders.length} orders in this batch`);

    return {
      orders: processedOrders,
      lastEvaluatedKey: result.LastEvaluatedKey,
      totalCount: result.Count || 0
    };
  } catch (error) {
    console.error('Error fetching orders batch:', error);
    throw error;
  }
}; 