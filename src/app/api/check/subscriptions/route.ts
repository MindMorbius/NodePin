import { NextResponse } from 'next/server';
import { getSubscribeUrls, fetchSubscriptionNodes } from '@/services/subscription-store';

// 获取所有节点
export async function GET() {
  try {
    const subscriptions = await getSubscribeUrls();
    const urls = subscriptions.map(sub => sub.url);
    const results = await fetchSubscriptionNodes(urls);
    
    const resultsWithNames = results.map(result => {
      const subscription = subscriptions.find(sub => sub.url === result.url);
      return {
        ...result,
        name: subscription?.name || ''
      };
    });
    
    return NextResponse.json({
      success: true,
      data: resultsWithNames
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch nodes',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 获取单个订阅节点
export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    const results = await fetchSubscriptionNodes([url]);
    
    if (!results?.length || !results[0]) {
      return NextResponse.json({ 
        error: '无法获取订阅数据',
        info: {},
        nodes: [] 
      });
    }

    if (!results[0].nodes?.length) {
      return NextResponse.json({ 
        error: '未找到可用节点',
        info: {},
        nodes: [] 
      });
    }
    
    return NextResponse.json({
      info: results[0].info || {},
      nodes: results[0].nodes
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '获取数据失败',
      info: {},
      nodes: [] 
    }, { status: 500 });
  }
}