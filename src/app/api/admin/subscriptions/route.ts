import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Subscription } from '@/types/subscription';

export const runtime = 'nodejs';

// 获取所有订阅
export async function GET() {
  try {
    const client = await clientPromise;
    const collection = client.db().collection<Subscription>('subscriptions');
    const subs = await collection.find({}).toArray();
    return NextResponse.json(subs);
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// 添加订阅
export async function POST(request: Request) {
  try {
    const { name, url } = await request.json();
    
    if (!name || !url) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name and URL are required'
      }, { status: 400 });
    }

    const client = await clientPromise;
    const collection = client.db().collection<Subscription>('subscriptions');
    
    const subscription: Omit<Subscription, '_id'> = {
      name,
      url,
      created_at: new Date()
    };

    await collection.insertOne(subscription);
    return NextResponse.json({ success: true });
  } catch (error) {
    // 处理唯一索引冲突
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

// 更新订阅
export async function PUT(request: Request) {
  try {
    const { oldUrl, name, url } = await request.json();
    
    const client = await clientPromise;
    const collection = client.db().collection<Subscription>('subscriptions');

    // 检查新 URL 是否与其他订阅冲突
    if (oldUrl !== url) {
      const existing = await collection.findOne({ 
        url,
        _id: { $ne: new ObjectId(oldUrl) }
      });
      if (existing) {
        return NextResponse.json({ 
          success: false, 
          error: 'New URL already exists'
        }, { status: 400 });
      }
    }
    
    const result = await collection.updateOne(
      { url: oldUrl },
      { $set: { name, url, updated_at: new Date() } }
    );

    if (result.matchedCount === 0) {
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

// 删除订阅
export async function DELETE(request: Request) {
  try {
    const { url } = await request.json();
    
    const client = await clientPromise;
    const collection = client.db().collection<Subscription>('subscriptions');
    
    const result = await collection.deleteOne({ url });

    if (result.deletedCount === 0) {
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