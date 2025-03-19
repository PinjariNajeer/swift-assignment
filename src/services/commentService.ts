import { getDb } from '../db';
import { Comment } from '../models/comment';

export const CommentService = {
  // Fetch comments by post IDs
  async getCommentsByPostIds(postIds: number[]): Promise<Comment[]> {
    const db = getDb();
    return db.collection<Comment>('comments').find({ postId: { $in: postIds } }).toArray();
  },

  // Create multiple comments
  async createComments(comments: Comment[]): Promise<void> {
    const db = getDb();
    await db.collection<Comment>('comments').insertMany(comments);
  },

  // Delete all comments
  async deleteAllComments(): Promise<void> {
    const db = getDb();
    await db.collection<Comment>('comments').deleteMany({});
  },
};