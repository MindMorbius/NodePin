import { NextResponse } from 'next/server';
import { MongoDBClient } from '@/lib/mongodb-client';
import { Subscription } from '@/types/subscription';

const subscriptionDB = new MongoDBClient<Subscription>('subscriptions');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const result = await subscriptionDB.findWithCount({}, {
      page,
      pageSize,
      sort: { created_at: -1 }
    });

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Database error' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, url } = await request.json();
    
    if (!name || !url) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name and URL are required'
      }, { status: 400 });
    }

    const subscription = await subscriptionDB.insertOne({
      name,
      url,
      created_at: new Date()
    });

    return NextResponse.json({ success: true, data: subscription });
  } catch (error) {
    if ((error as any).code === 11000) {
      return NextResponse.json({ 
        success: false, 
        error: 'Subscription URL already exists'
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { oldUrl, name, url } = await request.json();
    
    // 检查新 URL 是否与其他订阅冲突
    if (oldUrl !== url) {
      const existing = await subscriptionDB.findWithCount({ 
        url,
        _id: { $ne: oldUrl }
      });
      if (existing.total > 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'New URL already exists'
        }, { status: 400 });
      }
    }
    
    const success = await subscriptionDB.updateOne(
      { url: oldUrl },
      { name, url, updated_at: new Date() }
    );

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Subscription not found'
      }, { status: 404 });
    }
      
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { url } = await request.json();
    const success = await subscriptionDB.deleteOne({ url });

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Subscription not found'
      }, { status: 404 });
    }
      
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}