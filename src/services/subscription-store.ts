import { Subscription } from '@/types/subscription';
import { parseSubscription } from '@/utils/clash';

// 获取订阅URL列表
export async function getSubscribeUrls(): Promise<Subscription[]> {
  try {
    console.log('[ENV] Starting to fetch subscriptions')
    const subs: Subscription[] = []
    
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

// 获取并处理订阅节点数据
export async function fetchSubscriptionNodes(specificUrls?: string[]) {
  const subscriptions = specificUrls 
    ? specificUrls.map(url => ({ name: '', url }))
    : await getSubscribeUrls();
    
  const results = await Promise.allSettled(
    subscriptions.map(async sub => {
      if (!isValidUrl(sub.url)) {
        throw new Error('Invalid URL format');
      }
      
      try {
        const data = await parseSubscription(sub.url);

        // console.log('Data:', data);
        const maxReasonableValue = 1125899906842624 * 100;
        
        const validateNumber = (num: any) => {
          if (typeof num !== 'number' || isNaN(num) || !isFinite(num)) return 0;
          return Math.min(Math.max(0, num), maxReasonableValue);
        };

        const info = {
          upload: validateNumber(data.info.upload),
          download: validateNumber(data.info.download),
          total: validateNumber(data.info.total),
          expire: validateNumber(data.info.expire)
        };

        // if (info.total < (info.upload + info.download)) {
        //   info.total = Math.ceil((info.upload + info.download) * 1.2);
        // }

        const filteredNodes = data.nodes.filter(node => {
          // const invalidKeywords = ['剩余', '过期', '到期', '流量', 'expire', 'traffic', '官网', '（看这里）', '.ink', '套餐', '网址', '链接', '订阅', '更新', 't.me', '.com', '邀请', '返利', '新用户'];
          const invalidKeywords: string[] = [];
          const nameHasInvalidKeyword = invalidKeywords.some(keyword => 
            node.name.toLowerCase().includes(keyword.toLowerCase())
          );
          
          const hasRequiredProps = node.type && node.server && node.port;
          return hasRequiredProps && !nameHasInvalidKeyword;
        });

        return {
          url: sub.url,
          name: sub.name,
          info: info,
          nodes: filteredNodes,
          error: null
        };
      } catch (error) {
        throw error;
      }
    })
  );

  return results
    .filter((result): result is PromiseFulfilledResult<any> => 
      result.status === 'fulfilled' && result.value.nodes.length > 0
    )
    .map(result => result.value);
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}