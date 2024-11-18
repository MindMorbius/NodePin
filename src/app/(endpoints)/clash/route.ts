import { NextResponse } from 'next/server';
import yaml from 'js-yaml';
import { fetchSubscriptionNodes } from '@/services/subscription';

export async function GET() {
  try {
    const results = await fetchSubscriptionNodes();
    const allNodes: any[] = [];
    const subscriptionInfos = results.map(r => r.info);
    
    results.forEach(result => {
      allNodes.push(...result.nodes.map(node => node.settings));
    });

    const subscriptionGroups = results.map((_, index) => {
      const subNodes = allNodes.filter((_, nodeIndex) => 
        Math.floor(nodeIndex / (allNodes.length / results.length)) === index
      );
      
      const subInfo = subscriptionInfos[index];
      const usedTraffic = subInfo.upload + subInfo.download;
      const trafficInfo = `📊${formatBytes(usedTraffic)}/${formatBytes(subInfo.total)}`;
      const expireInfo = `⌛${formatExpireDate(subInfo.expire)}`;
      
      return {
        name: `🔰 订阅 ${index + 1} | ${trafficInfo} | ${expireInfo}`,
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
    
    // 找出最早的过期时间
    const earliestExpire = Math.min(...subscriptionInfos.map(info => info.expire));

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
        'Content-Disposition': 'attachment; filename=clash.yaml',
        'Profile-Web-Page-URL': 'https://node.rkpin.site',
      }
    });
  } catch (error) {
    console.error('Failed to generate clash config:', error);
    return new NextResponse('Error generating config', { status: 500 });
  }
}

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(1)}GB`;
}

function formatExpireDate(timestamp: number): string {
  if (!timestamp) return '未知';
  return new Date(timestamp * 1000).toLocaleDateString('zh-CN');
}
