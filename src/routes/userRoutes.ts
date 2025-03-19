import express from 'express';
import { getDb } from '../db';
import { User } from '../models/user';
import fetch from 'node-fetch';

const router = express.Router();

// GET /load
router.get('/load', async (req, res) => {
  try {
    const db = getDb();
    const usersCollection = db.collection<User>('users');
    const postsCollection = db.collection('posts');
    const commentsCollection = db.collection('comments');

    // Fetch users from JSON Placeholder API
    const usersResponse = await fetch('https://jsonplaceholder.typicode.com/users');
    const users = await usersResponse.json();

    // Insert users into MongoDB
    await usersCollection.insertMany(users);

    // Fetch posts and comments for each user
    for (const user of users) {
      const postsResponse = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${user.id}`);
      const posts = await postsResponse.json();
      await postsCollection.insertMany(posts);

      for (const post of posts) {
        const commentsResponse = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${post.id}`);
        const comments = await commentsResponse.json();
        await commentsCollection.insertMany(comments);
      }
    }

    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

// DELETE /users
router.delete('/', async (req, res) => {
  try {
    const db = getDb();
    await db.collection('users').deleteMany({});
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete users' });
  }
});

// DELETE /users/:userId
router.delete('/:userId', async (req, res) => {
  try {
    const db = getDb();
    const userId = parseInt(req.params.userId);
    const result = await db.collection('users').deleteOne({ id: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// GET /users/:userId
router.get('/:userId', async (req, res) => {
  try {
    const db = getDb();
    const userId = parseInt(req.params.userId);

    const user = await db.collection('users').findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const posts = await db.collection('posts').find({ userId }).toArray();
    const comments = await db.collection('comments').find({ postId: { $in: posts.map(post => post.id) } }).toArray();

    res.status(200).json({ user, posts, comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// PUT /users
router.put('/', async (req, res) => {
  try {
    const db = getDb();
    const user = req.body;


    const existingUser = await db.collection('users').findOne({ id: user.id });
    if (!user.id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    await db.collection('users').insertOne(user);
    res.status(201).setHeader('Location', `/users/${user.id}`).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

export default router;
