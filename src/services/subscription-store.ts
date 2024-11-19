import { MongoDBClient } from '@/lib/mongodb-client';
import { Subscription } from '@/types/subscription';

const subscriptionDB = new MongoDBClient<Subscription>('subscriptions');

export async function getSubscribeUrls(): Promise<Subscription[]> {
  try {
    console.log('[DB] Starting to fetch subscriptions')
    const subs: Subscription[] = []
    
    // 从环境变量获取
    let index = 1
    while (true) {
      const url = process.env[`SUB_URL_${index}`]
      if (!url) break
      console.log(`[ENV] Found SUB_URL_${index}:`, url)
      subs.push({
        name: `订阅 ${index}`,
        url
      })
      index++
    }

    // 从 MongoDB 获取所有数据，不使用分页
    const collection = await subscriptionDB.getCollection();
    const dbSubs = await collection.find({}).toArray();
    console.log('[DB] Query results:', { count: dbSubs.length });
    
    subs.push(...dbSubs);

    // 去重处理
    const final = [...new Map(subs.map(sub => [sub.url, sub])).values()];
    console.log('[DB] Final subscriptions count:', final.length);
    return final;
  } catch (error) {
    console.error('[DB] Failed to get subscriptions:', error);
    throw error;
  }
}