interface Subscription {
  name: string;
  url: string;
}

export async function getSubscribeUrls(env?: any): Promise<Subscription[]> {
  const subs: Subscription[] = [];
  
  // 从环境变量获取
  let index = 1;
  while (true) {
    const url = process.env[`SUB_URL_${index}`];
    if (!url) break;
    subs.push({
      name: `订阅 ${index}`,
      url
    });
    index++;
  }

  // 从数据库获取
  if (env?.DB) {
    const { results } = await env.DB
      .prepare('SELECT name, url FROM subscriptions ORDER BY created_at DESC')
      .all();
    subs.push(...results);
  }

  return [...new Map(subs.map(sub => [sub.url, sub])).values()]; // 去重
}

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; 