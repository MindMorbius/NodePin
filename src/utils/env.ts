export function getSubscribeUrls(): string[] {
  const urls: string[] = [];
  let index = 1;
  
  while (true) {
    const url = process.env[`SUB_URL_${index}`];
    if (!url) break;
    urls.push(url);
    index++;
  }
  
  return urls;
}

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; 