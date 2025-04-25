import { DynamoDB } from 'aws-sdk';

const dynamoDB = new DynamoDB.DocumentClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ''
  }
});

export interface Order {
  id: string;
  order_id: string;
  customerEmail: string;
  totalPrice: number;
  status: 'paid' | 'pending' | 'failed';
  createdAt: string;
  billing_address?: {
    first_name: string;
    last_name: string;
    phone: string;
    country: string;
    city: string;
  };
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
    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME || '',
      Limit: 100, // Adjust this value based on your needs
      ExclusiveStartKey: lastEvaluatedKey
    };

    const result = await dynamoDB.scan(params).promise();
    const newOrders = [...allOrders, ...(result.Items as Order[])];

    // If there's more data to fetch
    if (result.LastEvaluatedKey) {
      // Recursive call to get next batch
      return getOrders(result.LastEvaluatedKey, newOrders);
    }

    // Return all orders when complete
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
    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME || '',
      Limit: 100, // Number of items per batch
      ExclusiveStartKey: lastEvaluatedKey
    };

    const result = await dynamoDB.scan(params).promise();

    return {
      orders: result.Items as Order[],
      lastEvaluatedKey: result.LastEvaluatedKey,
      totalCount: result.Count || 0
    };
  } catch (error) {
    console.error('Error fetching orders batch:', error);
    throw error;
  }
}; 