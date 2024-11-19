import clientPromise from '@/lib/mongodb'

interface Subscription {
  name: string;
  url: string;
}

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

    // 从 MongoDB 获取
    const client = await clientPromise
    const collection = client.db().collection('subscriptions')
    const results = await collection.find({}).toArray()
    
    console.log('[DB] Query results:', { count: results?.length })
    subs.push(...results.map(doc => ({
      name: doc.name,
      url: doc.url
    })))

    const final = [...new Map(subs.map(sub => [sub.url, sub])).values()]
    console.log('[DB] Final subscriptions count:', final.length)
    return final
  } catch (error) {
    console.error('[DB] Failed to get subscriptions:', error)
    throw error
  }
}