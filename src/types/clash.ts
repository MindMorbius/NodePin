export interface SubscriptionInfo {
  upload: number;
  download: number;
  total: number;
  expire: number;
  nodeCount: number;
}

export interface Node {
  name: string;
  type: string; // vmess, ss, trojan etc.
  server: string;
  port: number;
  protocol?: string;
  settings: Record<string, any>;
} 