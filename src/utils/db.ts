import { openDB, IDBPDatabase } from 'idb';

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
  updated_at: string;
  created_at: string;
  sync_status?: 'pending' | 'synced' | 'failed';
  nodes: Array<{
    name: string;
    type: string;
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
      updated_at: new Date().toISOString(),
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
    await db.delete('subscriptions', id);
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
}

export const db = new DBManager(); 