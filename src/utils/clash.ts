import yaml from 'js-yaml';
import { http } from './fetch';
import { SubscriptionInfo, Node } from '../types/clash';

export async function parseSubscription(url: string): Promise<{
  info: SubscriptionInfo;
  nodes: Node[];
}> {
  const response = await http.get(url, {
    headers: {
      'User-Agent': 'clash.meta',
    }
  });
  
  const content = response.data;
  const userInfo = response.headers.get('subscription-userinfo');
  
  // 解析订阅信息从 header
  let uploadBytes = 0, downloadBytes = 0, totalBytes = 0, expire = 0;
  
  if (userInfo) {
    const parts = userInfo.split(';');
    for (const part of parts) {
      const [key, value] = part.split('=');
      switch (key.trim()) {
        case 'upload':
          uploadBytes = Number(value);
          break;
        case 'download':
          downloadBytes = Number(value);
          break;
        case 'total':
          totalBytes = Number(value);
          break;
        case 'expire':
          expire = Number(value);
          break;
      }
    }
  }

  // 解析节点信息
  let nodes: Node[] = [];
  
  try {
    if (typeof content === 'string' && content.includes('proxies:')) {
      // Clash 格式
      const config = yaml.load(content) as any;
      nodes = Array.isArray(config.proxies) ? parseClashNodes(config.proxies) : [];
    } else if (typeof content === 'string') {
      // Base64 格式
      const decoded = Buffer.from(content, 'base64').toString();
      nodes = parseBase64Nodes(decoded);
    }

    console.log(`Parsed ${nodes.length} nodes from ${url}`);
  } catch (error) {
    console.error('Failed to parse nodes:', error);
    nodes = [];
  }

  return {
    info: {
      upload: uploadBytes,
      download: downloadBytes,
      total: totalBytes,
      expire,
      nodeCount: nodes.length
    },
    nodes
  };
}

function parseClashNodes(proxies: any[]): Node[] {
  return proxies.filter(proxy => proxy && proxy.name && proxy.type).map(proxy => ({
    name: proxy.name,
    type: proxy.type,
    server: proxy.server,
    port: Number(proxy.port),
    settings: proxy
  }));
}

function parseBase64Nodes(content: string): Node[] {
  return content.split('\n')
    .filter(line => line.trim())
    .map(line => {
      if (line.startsWith('vmess://')) {
        return parseVmessNode(line);
      } else if (line.startsWith('ss://')) {
        return parseShadowsocksNode(line);
      } else if (line.startsWith('trojan://')) {
        return parseTrojanNode(line);
      }
      return null;
    })
    .filter((node): node is Node => node !== null);
}

// 解析各种协议的节点
function parseVmessNode(uri: string): Node {
  const content = Buffer.from(uri.replace('vmess://', ''), 'base64').toString();
  const config = JSON.parse(content);
  return {
    name: config.ps || config.name,
    type: 'vmess',
    server: config.add,
    port: Number(config.port),
    settings: config
  };
}

function parseShadowsocksNode(uri: string): Node {
  // 实现 SS 解析
  // ...
  return {} as Node;
}

function parseTrojanNode(uri: string): Node {
  // 实现 Trojan 解析
  // ...
  return {} as Node;
}