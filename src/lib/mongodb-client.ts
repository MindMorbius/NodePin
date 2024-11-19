import { Collection, Document, Filter, FindOptions } from 'mongodb';
import clientPromise from './mongodb';

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
  
  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  private async getCollection(): Promise<Collection<T>> {
    const client = await clientPromise;
    return client.db().collection<T>(this.collectionName);
  }

  async findWithCount(
    filter: Filter<T> = {},
    options: QueryOptions = {}
  ): Promise<PaginatedResponse<T>> {
    const collection = await this.getCollection();
    
    // 首先获取总数
    const countPromise = collection.countDocuments(filter);
    
    // 处理分页
    const { page = 1, pageSize = 10, ...findOptions } = options;
    const skip = (page - 1) * pageSize;
    
    // 获取分页数据
    const dataPromise = collection
      .find(filter, findOptions)
      .skip(skip)
      .limit(pageSize)
      .toArray();

    // 并行执行查询
    const [total, data] = await Promise.all([countPromise, dataPromise]);

    return {
      total,
      page,
      pageSize,
      data
    };
  }

  // 快速计数
  async count(filter: Filter<T> = {}): Promise<number> {
    const collection = await this.getCollection();
    return collection.countDocuments(filter);
  }

  // 插入单条数据
  async insertOne(doc: Partial<T>): Promise<T> {
    const collection = await this.getCollection();
    const result = await collection.insertOne(doc as any);
    return { ...doc, _id: result.insertedId } as T;
  }

  // 插入多条数据
  async insertMany(docs: Partial<T>[]): Promise<T[]> {
    const collection = await this.getCollection();
    const result = await collection.insertMany(docs as any[]);
    return docs.map((doc, index) => ({
      ...doc,
      _id: result.insertedIds[index]
    })) as T[];
  }

  // 更新数据
  async updateOne(
    filter: Filter<T>,
    update: Partial<T>
  ): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.updateOne(filter, { $set: update });
    return result.modifiedCount > 0;
  }

  // 删除数据
  async deleteOne(filter: Filter<T>): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne(filter);
    return result.deletedCount > 0;
  }

  // 聚合查询
  async aggregate(pipeline: Document[]): Promise<T[]> {
    const collection = await this.getCollection();
    return collection.aggregate<T>(pipeline).toArray();
  }
} 