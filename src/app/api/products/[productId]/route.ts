import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { dynamoDb, TABLE_NAME } from '@/lib/dynamodb';
import { GetCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

// GET /api/products/[productId] - Get a single product
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;

    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id: productId }
    });

    const response = await dynamoDb.send(command);
    const product = response.Item;

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[productId] - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    const body = await request.json();

    // Validate required fields
    if (!body.name && !body.price) {
      return NextResponse.json(
        { error: 'At least one field (name or price) is required for update' },
        { status: 400 }
      );
    }

    const updateExpressions = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (body.name) {
      updateExpressions.push('#name = :name');
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':name'] = body.name;
    }

    if (body.price) {
      updateExpressions.push('#price = :price');
      expressionAttributeNames['#price'] = 'price';
      expressionAttributeValues[':price'] = body.price;
    }

    // Add updatedAt timestamp
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id: productId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    const response = await dynamoDb.send(command);
    const updatedProduct = response.Attributes;

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[productId] - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;

    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id: productId }
    });

    await dynamoDb.send(command);

    return NextResponse.json(
      { message: `Product ${productId} deleted successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
} 