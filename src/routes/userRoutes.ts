import express from 'express';
import { UserService, PostService, CommentService } from '../services';
import fetch from 'node-fetch';

const router = express.Router();

// GET /load
router.get('/load', async (req, res) => {
  try {
    // Fetch users from JSON Placeholder API
    const usersResponse = await fetch('https://jsonplaceholder.typicode.com/users');
    const users = await usersResponse.json();

    // Insert users into MongoDB
    await UserService.createUsers(users);

    // Fetch posts and comments for each user
    for (const user of users) {
      const postsResponse = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${user.id}`);
      const posts = await postsResponse.json();
      await PostService.createPosts(posts);

      for (const post of posts) {
        const commentsResponse = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${post.id}`);
        const comments = await commentsResponse.json();
        await CommentService.createComments(comments);
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
    await UserService.deleteAllUsers();
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete users' });
  }
});

// DELETE /users/:userId
router.delete('/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const deleted = await UserService.deleteUser(userId);

    if (!deleted) {
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
    const userId = parseInt(req.params.userId);

    const user = await UserService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const posts = await PostService.getPostsByUserId(userId);
    const postIds = posts.map(post => post.id);
    const comments = await CommentService.getCommentsByPostIds(postIds);

    res.status(200).json({ user, posts, comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// PUT /users
router.put('/', async (req, res) => {
  try {
    const user = req.body;

    const existingUser = await UserService.getUserById(user.id);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    await UserService.createUser(user);
    res.status(201).setHeader('Location', `/users/${user.id}`).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

export default router;


