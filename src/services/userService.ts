import { getDb } from '../db';
import { User } from '../models/user';

export const UserService = {
  // Fetch all users
  async getUsers(): Promise<User[]> {
    const db = getDb();
    return db.collection<User>('users').find().toArray();
  },

  // Fetch a user by ID
  async getUserById(userId: number): Promise<User | null> {
    const db = getDb();
    return db.collection<User>('users').findOne({ id: userId });
  },

  // Create a new user
  async createUser(user: User): Promise<void> {
    const db = getDb();
    await db.collection<User>('users').insertOne(user);
  },

  // Delete a user by ID
  async deleteUser(userId: number): Promise<boolean> {
    const db = getDb();
    const result = await db.collection<User>('users').deleteOne({ id: userId });
    return result.deletedCount > 0;
  },

  // Delete all users
  async deleteAllUsers(): Promise<void> {
    const db = getDb();
    await db.collection<User>('users').deleteMany({});
  },
};