import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { dynamoDb, TABLE_NAME } from '@/lib/dynamodb';
import { ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

// GET /api/products - Get all products
export async function GET(request: NextRequest) {
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });

    const response = await dynamoDb.send(command);
    const products = response.Items || [];
    
    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const product = await request.json();

    const params = {
      TableName: "shopify_inkhub_get_products",
      Item: product
    };

    await dynamoDb.send(new PutCommand(params));

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
} 