import { getDb } from '../db';
import { Post } from '../models/post';

export const PostService = {
  // Fetch posts by user ID
  async getPostsByUserId(userId: number): Promise<Post[]> {
    const db = getDb();
    return db.collection<Post>('posts').find({ userId }).toArray();
  },

  // Create multiple posts
  async createPosts(posts: Post[]): Promise<void> {
    const db = getDb();
    await db.collection<Post>('posts').insertMany(posts);
  },

  // Delete all posts
  async deleteAllPosts(): Promise<void> {
    const db = getDb();
    await db.collection<Post>('posts').deleteMany({});
  },
};