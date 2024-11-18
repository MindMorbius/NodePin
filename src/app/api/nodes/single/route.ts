import { NextResponse } from 'next/server';
import { fetchSubscriptionNodes } from '@/services/subscription';

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