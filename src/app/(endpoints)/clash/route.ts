import { NextResponse } from 'next/server';
import yaml from 'js-yaml';
import { fetchSubscriptionNodes } from '@/services/subscription-store';
import { Node } from '@/types/clash';

export async function GET() {
  try {
    const results = await fetchSubscriptionNodes();
    
    // 优雅处理无订阅情况
    if (!results?.length) {
      return new NextResponse('No active subscriptions', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Profile-Title': 'NodePin',
          'Support-URL': 'https://node.rkpin.site'
        }
      });
    }
    
    const allNodes: any[] = [];
    const nameCount = new Map<string, number>();
    
    // 先统计所有节点名称出现次数
    results.forEach(result => {
      result.nodes.forEach((node: Node) => {
        const name = node.settings.name;
        nameCount.set(name, (nameCount.get(name) || 0) + 1);
      });
    });

    // 只给重名节点添加后缀
    results.forEach((result, subIndex) => {
      const nodesWithSubIndex = result.nodes.map((node: Node) => {
        const name = node.settings.name;
        const isDuplicate = nameCount.get(name)! > 1;
        return {
          ...node.settings,
          name: isDuplicate ? `${name} (订阅${subIndex + 1})` : name
        };
      });
      allNodes.push(...nodesWithSubIndex);
    });

    const subscriptionInfos = results.map(r => r.info);
    
    const subscriptionGroups = results.map((result, index) => {
      const subNodes = allNodes.filter((_, nodeIndex) => 
        Math.floor(nodeIndex / (allNodes.length / results.length)) === index
      );
      
      const subInfo = subscriptionInfos[index];
      const usedTraffic = subInfo.upload + subInfo.download;
      const trafficInfo = `📊${formatBytes(usedTraffic)}/${formatBytes(subInfo.total)}`;
      const expireInfo = `⌛${formatExpireDate(subInfo.expire)}`;
      
      // 使用订阅名称或默认名称
      const subName = result.name || `订阅 ${index + 1}`;
      
      return {
        name: `🔰 ${subName} | ${trafficInfo} | ${expireInfo}`,
        type: 'select',
        proxies: [...subNodes.map(node => node.name)]
      };
    });

    const config = {
      port: 7890,
      'socks-port': 7891,
      'allow-lan': true,
      mode: 'rule',
      'log-level': 'info',
      proxies: [...allNodes],
      'proxy-groups': [
        {
          name: '🚀 策略选择',
          type: 'select',
          proxies: ['♻️ 自动选择', '🤚 手动选择', 'DIRECT']
        },
        {
          name: '♻️ 自动选择',
          type: 'url-test',
          proxies: allNodes.map(node => node.name),
          url: 'http://www.gstatic.com/generate_204',
          interval: 300
        },
        {
          name: '🤚 手动选择',
          type: 'select',
          proxies: ['📃 订阅汇总', ...subscriptionGroups.map(g => g.name)]
        },
        {
          name: '📃 订阅汇总',
          type: 'select',
          proxies: [...allNodes.map(node => node.name)]
        },
        ...subscriptionGroups
      ],
      rules: [
        'MATCH,🚀 策略选择'
      ]
    };

    // 计算总流量信息
    const totalUsed = subscriptionInfos.reduce((sum, info) => sum + info.upload + info.download, 0);
    const totalQuota = subscriptionInfos.reduce((sum, info) => sum + info.total, 0);
    
    // 找出最早的有效过期时间
    const validExpireTimes = subscriptionInfos
      .map(info => info.expire)
      .filter(expire => expire > Date.now() / 1000); // 过滤掉无效和已过期的时间
    
    const earliestExpire = validExpireTimes.length > 0 
      ? Math.min(...validExpireTimes)
      : 0; // 如果没有有效时间，返回0

    const yamlContent = yaml.dump(config, {
      lineWidth: -1,
      skipInvalid: true,
      noRefs: true,
      forceQuotes: true
    });

    // 使用 TextEncoder 确保正确的 UTF-8 编码
    const encoder = new TextEncoder();
    const encodedYaml = encoder.encode(yamlContent);

    return new NextResponse(encodedYaml, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Subscription-UserInfo': `upload=${totalUsed}; download=${totalUsed}; total=${totalQuota}; expire=${earliestExpire}`,
        'Profile-Update-Interval': '24',
        'Support-URL': 'https://node.rkpin.site',
        'Profile-Title': 'NodePin',
        'Profile-Web-Page-URL': 'https://node.rkpin.site',
      }
    });
  } catch (error) {
    console.error('Failed to generate clash config:', error);
    return new NextResponse('Configuration generation failed', { 
      status: 200,  // 改为200避免客户端报错
      headers: {
        'Content-Type': 'text/plain',
        'Profile-Title': 'NodePin',
        'Support-URL': 'https://node.rkpin.site'
      }
    });
  }
}

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(1)}GB`;
}

function formatExpireDate(timestamp: number): string {
  if (!timestamp || timestamp < Date.now() / 1000) return '未知';
  return new Date(timestamp * 1000).toLocaleDateString('zh-CN');
}
