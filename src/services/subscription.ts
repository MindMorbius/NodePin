import { getSubscribeUrls } from '@/utils/env';
import { parseSubscription } from '@/utils/clash';

export async function fetchSubscriptionNodes() {
  const urls = getSubscribeUrls();
  return Promise.all(
    urls.map(async url => {
      try {
        const data = await parseSubscription(url);
        const filteredNodes = data.nodes.filter(node => {
          const invalidKeywords = ['剩余', '过期', '到期', '流量', 'expire', 'traffic', '官网', '（看这里）', '.ink', '套餐', '网址', '链接', '订阅', '更新'];
          const nameHasInvalidKeyword = invalidKeywords.some(keyword => 
            node.name.toLowerCase().includes(keyword.toLowerCase())
          );
          
          const hasRequiredProps = node.type && node.server && node.port;
          
          return hasRequiredProps && !nameHasInvalidKeyword;
        });

        return {
          url,
          info: data.info,
          nodes: filteredNodes
        };
      } catch (error) {
        console.error(`Error parsing subscription ${url}:`, error);
        return {
          url,
          info: {
            upload: 0,
            download: 0,
            total: 0,
            expire: 0,
            nodeCount: 0
          },
          nodes: []
        };
      }
    })
  );
} 