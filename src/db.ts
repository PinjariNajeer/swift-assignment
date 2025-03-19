import { MongoClient, Db } from 'mongodb';

const MONGO_URI = "mongodb+srv://najeerb167:<najeerb167>@cluster0.ujsue.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const DB_NAME = 'social_media';

let db:Db;


export const connectToDatabase = async (): Promise<void> => {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log('Connected to MongoDB');
};

export const getDb = (): Db => {
  if (!db) throw new Error('Database not initialized');
  return db;
};