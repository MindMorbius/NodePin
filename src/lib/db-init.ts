import clientPromise from './mongodb';
import { subscriptionSchema } from '@/types/subscription';

export async function initDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // 获取所有集合
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);

    // 如果 subscriptions 集合不存在,创建它
    if (!collectionNames.includes('subscriptions')) {
      await db.createCollection('subscriptions', subscriptionSchema);
      
      // 创建唯一索引
      await db.collection('subscriptions').createIndex(
        { url: 1 }, 
        { unique: true }
      );
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
} 