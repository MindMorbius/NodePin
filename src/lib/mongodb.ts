import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}

class MongoConnection {
  private static instance: Promise<MongoClient>;
  
  static getInstance(): Promise<MongoClient> {
    if (!this.instance) {
      const client = new MongoClient(uri, options);
      this.instance = client.connect()
        .catch(err => {
          this.instance = null!;
          console.error('MongoDB connection failed:', err);
          throw err;
        });
    }
    return this.instance;
  }
}

const clientPromise = MongoConnection.getInstance();

export default clientPromise;

export async function connectDB() {
  try {
    const client = await clientPromise;
    const db = client.db();
    await db.command({ ping: 1 });
    return db;
  } catch (err) {
    console.error('Database connection failed:', err);
    throw new Error('Database connection failed');
  }
} 