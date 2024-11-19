import { getSubscribeUrls } from '@/services/subscription-store';
import { parseSubscription } from '@/utils/clash';

export async function fetchSubscriptionNodes(specificUrls?: string[]) {
  const subscriptions = specificUrls 
    ? specificUrls.map(url => ({ name: '', url }))  // 如果传入URL数组，转换为subscription格式
    : await getSubscribeUrls();
    
  const results = await Promise.allSettled(
    subscriptions.map(async sub => {
      if (!isValidUrl(sub.url)) {
        throw new Error('Invalid URL format');
      }
      
      try {
        const data = await parseSubscription(sub.url);
        
        // 添加数据验证 - 100PB in bytes
        const maxReasonableValue = 1125899906842624 * 100;
        
        // 验证数据是否为有效数字
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

        // 如果total小于已用流量，将total设为已用流量的120%
        if (info.total < (info.upload + info.download)) {
          info.total = Math.ceil((info.upload + info.download) * 1.2);
        }

        const filteredNodes = data.nodes.filter(node => {
          const invalidKeywords = ['剩余', '过期', '到期', '流量', 'expire', 'traffic', '官网', '（看这里）', '.ink', '套餐', '网址', '链接', '订阅', '更新', 't.me', '.com', '邀请', '返利', '新用户'];
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