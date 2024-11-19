import { Collection, Document, Filter, FindOptions } from 'mongodb';
import clientPromise, { connectDB } from './mongodb';

interface PaginatedResponse<T> {
  total: number;
  page: number;
  pageSize: number;
  data: T[];
}

interface QueryOptions extends FindOptions {
  page?: number;
  pageSize?: number;
}

export class MongoDBClient<T extends Document> {
  private collectionName: string;
  private connectionPromise: Promise<void>;
  
  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.connectionPromise = this.testConnection();
  }

  private async testConnection(): Promise<void> {
    try {
      await connectDB();
    } catch (error) {
      console.error('Database connection test failed:', error);
      throw new Error('Database connection failed');
    }
  }

  private async getCollection(): Promise<Collection<T>> {
    await this.connectionPromise;
    const client = await clientPromise;
    return client.db().collection<T>(this.collectionName);
  }

  private async withErrorHandling<R>(operation: () => Promise<R>): Promise<R> {
    try {
      return await operation();
    } catch (error) {
      console.error(`Database operation failed:`, error);
      throw new Error('Database error');
    }
  }

  async findWithCount(
    filter: Filter<T> = {},
    options: QueryOptions = {}
  ): Promise<PaginatedResponse<T>> {
    return this.withErrorHandling(async () => {
      const collection = await this.getCollection();
      
      const countPromise = collection.countDocuments(filter);
      const { page = 1, pageSize = 10, ...findOptions } = options;
      const skip = (page - 1) * pageSize;
      
      const dataPromise = collection
        .find(filter, findOptions)
        .skip(skip)
        .limit(pageSize)
        .toArray();

      const [total, data] = await Promise.all([countPromise, dataPromise]);

      return {
        total,
        page,
        pageSize,
        data
      };
    });
  }

  async count(filter: Filter<T> = {}): Promise<number> {
    return this.withErrorHandling(async () => {
      const collection = await this.getCollection();
      return collection.countDocuments(filter);
    });
  }

  async insertOne(doc: Partial<T>): Promise<T> {
    return this.withErrorHandling(async () => {
      const collection = await this.getCollection();
      const result = await collection.insertOne(doc as any);
      return { ...doc, _id: result.insertedId } as T;
    });
  }

  async insertMany(docs: Partial<T>[]): Promise<T[]> {
    return this.withErrorHandling(async () => {
      const collection = await this.getCollection();
      const result = await collection.insertMany(docs as any[]);
      return docs.map((doc, index) => ({
        ...doc,
        _id: result.insertedIds[index]
      })) as T[];
    });
  }

  async updateOne(
    filter: Filter<T>,
    update: Partial<T>
  ): Promise<boolean> {
    return this.withErrorHandling(async () => {
      const collection = await this.getCollection();
      const result = await collection.updateOne(filter, { $set: update });
      return result.modifiedCount > 0;
    });
  }

  async deleteOne(filter: Filter<T>): Promise<boolean> {
    return this.withErrorHandling(async () => {
      const collection = await this.getCollection();
      const result = await collection.deleteOne(filter);
      return result.deletedCount > 0;
    });
  }

  async aggregate(pipeline: Document[]): Promise<T[]> {
    return this.withErrorHandling(async () => {
      const collection = await this.getCollection();
      return collection.aggregate<T>(pipeline).toArray();
    });
  }
} 