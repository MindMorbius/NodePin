import { openDB, IDBPDatabase } from 'idb';
import { generateShortToken } from './crypto';

export interface Subscription {
  id: string;
  user_subscriptions_id?: string;
  name: string;
  url: string;
  encrypted_url?: string;
  data_update_time?: string;
  fetch_status?: 'success' | 'failed';
  upload_traffic?: number;
  download_traffic?: number;
  total_traffic?: number;
  node_count?: number;
  expire_time?: number;
  status: 'active' | 'hide' | 'delete' | 'expired';
  type?: 'local' | 'cloud';
  updated_at: string;
  created_at: string;
  sync_status?: 'pending' | 'synced' | 'failed';
  nodes: Array<{
    name: string;
    type: string;
  }>;
  tokens: Array<{
    token: string;
    expire_time: number;
    user_limit: number;
    duration_limit: number;
    trust_level_limit: number;
    created_at: string;
    updated_at: string;
    status: 'active' | 'hide' | 'delete' | 'expired';
    type?: 'local' | 'cloud';
    user_count: number;
    last_used_at: string | null;
  }>;
}

class DBManager {
  private dbName = 'nodepin_data';
  private version = 1;
  private db: IDBPDatabase | null = null;

  async init() {
    if (this.db) return this.db;

    this.db = await openDB(this.dbName, this.version, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('subscriptions')) {
          db.createObjectStore('subscriptions', { keyPath: 'id' });
        }
      },
    });

    return this.db;
  }

  async addSubscription(subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>): Promise<Subscription> {
    const db = await this.init();
    const now = new Date().toISOString();
    
    const newSub: Subscription = {
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
      fetch_status: 'success',
      sync_status: 'pending',
      ...subscription,
    };
    
    await db.add('subscriptions', newSub);
    return newSub;
  }

  async updateSubscription(id: string, data: Partial<Subscription>): Promise<void> {
    const db = await this.init();
    const existing = await db.get('subscriptions', id);
    if (!existing) throw new Error('Subscription not found');

    const updatedSub = {
      ...existing,
      ...data,
      sync_status: data.sync_status || 'pending',
      nodes: data.nodes || existing.nodes || []
    };

    await db.put('subscriptions', updatedSub);
  }

  async getSubscriptions(): Promise<Subscription[]> {
    const db = await this.init();
    return db.getAll('subscriptions');
  }

  async getSubscription(id: string): Promise<Subscription | undefined> {
    const db = await this.init();
    return db.get('subscriptions', id);
  }

  async getSubscriptionByUrl(url: string): Promise<Subscription | undefined> {
    const db = await this.init();
    const all = await db.getAll('subscriptions');
    return all.find(sub => sub.url === url);
  }

  async deleteSubscription(id: string): Promise<void> {
    const db = await this.init();
    const subscription = await this.getSubscription(id);
    
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.type === 'local') {
      await db.delete('subscriptions', id);
    } else {
      throw new Error('Cloud subscriptions cannot be deleted directly');
    }
  }

  async getPendingSyncs(): Promise<Subscription[]> {
    const db = await this.init();
    const all = await db.getAll('subscriptions');
    return all.filter(sub => sub.sync_status === 'pending');
  }

  async checkDifferences(remoteSubs: Subscription[]): Promise<Subscription[]> {
    const localSubs = await this.getSubscriptions();
    return localSubs.filter(localSub => {
      const remoteSub = remoteSubs.find(remote => remote.user_subscriptions_id === localSub.user_subscriptions_id);
      return !remoteSub || localSub.updated_at !== remoteSub.updated_at;
    });
  }

  async createSubscriptionToken(subscriptionId: string, data: {
    expire_time?: number;
    user_limit?: number;
    trust_level_limit: number;
    duration_limit?: number;
  }): Promise<string> {
    const db = await this.init();
    const subscription = await this.getSubscription(subscriptionId);
    
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const now = new Date().toISOString();
    const token = {
      token: `np-${generateShortToken()}`, // 生成唯一token
      expire_time: data.expire_time || 0,
      user_limit: data.user_limit || 0,
      duration_limit: data.duration_limit || 0,
      trust_level_limit: data.trust_level_limit,
      created_at: now,
      updated_at: now,
      status: 'active' as const,
      type: 'local' as const,
      user_count: 0,
      last_used_at: null
    };

    const tokens = subscription.tokens || [];
    tokens.push(token);

    await this.updateSubscription(subscriptionId, {
      tokens,
      sync_status: 'pending'
    });

    return token.token;
  }

  async getSubscriptionTokens(subscriptionId: string) {
    const db = await this.init();
    const subscription = await this.getSubscription(subscriptionId);
    
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    return subscription.tokens || [];
  }

  async updateSubscriptionToken(subscriptionId: string, tokenId: string, data: {
    status?: 'active' | 'hide' | 'delete' | 'expired';
    type?: 'local' | 'cloud';
    user_count?: number;
    last_used_at?: string;
  }) {
    const db = await this.init();
    const subscription = await this.getSubscription(subscriptionId);
    
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const tokens = subscription.tokens || [];
    const tokenIndex = tokens.findIndex(t => t.token === tokenId);
    
    if (tokenIndex === -1) {
      throw new Error('Token not found');
    }

    tokens[tokenIndex] = {
      ...tokens[tokenIndex],
      ...data,
      updated_at: new Date().toISOString()
    };

    await this.updateSubscription(subscriptionId, {
      tokens,
      sync_status: 'pending'
    });
  }

  async deleteSubscriptionToken(subscriptionId: string, tokenId: string) {
    return this.updateSubscriptionToken(subscriptionId, tokenId, {
      status: 'delete'
    });
  }
}

export const db = new DBManager(); 