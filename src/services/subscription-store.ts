import { Subscription } from '@/types/subscription';

export async function getSubscribeUrls(): Promise<Subscription[]> {
  try {
    console.log('[ENV] Starting to fetch subscriptions')
    const subs: Subscription[] = []
    
    // 只保留从环境变量获取的逻辑
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

    return subs;
  } catch (error) {
    console.error('[ENV] Failed to get subscriptions:', error);
    throw error;
  }
}