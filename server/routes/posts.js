const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');

// Get all published posts
router.get('/', async (req, res) => {
  try {
    const { category, topic, part, date } = req.query;

    const where = { published: true };

    if (category) where.category = category;
    if (topic) where.topic = topic;
    if (part) where.part = part;

    // If date is provided, filter posts created on that date
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      where.createdAt = { [Op.gte]: start, [Op.lt]: end };
    }

    const posts = await Post.findAll({
      where,
      include: [{ model: User, as: 'author', attributes: ['id', 'email', 'displayName', 'profileImage'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

// Get post by ID
router.get('/:postId', async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.postId, {
      include: [{ model: User, as: 'author', attributes: ['id', 'email', 'displayName', 'profileImage'] }],
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
});

// Create a new post (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, excerpt, body, climax, image, category, topic, part } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }

    const validCategories = ['sermon', 'devotional'];
    const postCategory = category && validCategories.includes(category) ? category : 'devotional';

    const post = await Post.create({
      title,
      excerpt: excerpt || null,
      body,
      climax: climax || null,
      image: image || `https://picsum.photos/800/450?random=${Math.floor(Math.random() * 1000)}`,
      category: postCategory,
      topic: topic || null,
      part: part || null,
      userId: req.user.id,
      published: true,
    });

    const postWithAuthor = await Post.findByPk(post.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'email', 'displayName', 'profileImage'] }],
    });

    res.status(201).json(postWithAuthor);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

// Update a post (admin only)
router.put('/:postId', verifyToken, isAdmin, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const { title, excerpt, body, climax, image, category, published, topic, part } = req.body;

    if (title) post.title = title;
    if (excerpt !== undefined) post.excerpt = excerpt;
    if (body) post.body = body;
    if (climax !== undefined) post.climax = climax;
    if (image) post.image = image;
    if (category && ['sermon', 'devotional'].includes(category)) post.category = category;
    if (topic !== undefined) post.topic = topic;
    if (part !== undefined) post.part = part;
    if (published !== undefined) post.published = published;

    await post.save();

    const updatedPost = await Post.findByPk(post.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'email', 'displayName', 'profileImage'] }],
    });

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
});

// Delete a post (admin only)
router.delete('/:postId', verifyToken, isAdmin, async (req, res) => {
  try {
    const useD1 = process.env.USE_CLOUD_D1 === 'true';
    if (useD1) {
      const d1 = require('../config/d1Client');
      // Check exists
      const rows = await d1.query('SELECT id FROM Posts WHERE id = ? LIMIT 1', [req.params.postId]);
      if (!rows || !rows[0]) return res.status(404).json({ message: 'Post not found' });

      await d1.query('DELETE FROM Comments WHERE postId = ?', [req.params.postId]);
      await d1.query('DELETE FROM Reactions WHERE postId = ?', [req.params.postId]);
      await d1.query('DELETE FROM Posts WHERE id = ?', [req.params.postId]);

      return res.json({ message: 'Post and related data deleted successfully' });
    }

    const post = await Post.findByPk(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Manually delete related comments and reactions because Cloudflare D1
    // does not support foreign keys / ON DELETE cascade. Application-level
    // cleanup ensures related rows are removed.
    const Comment = require('../models/Comment');
    const Reaction = require('../models/Reaction');

    await Comment.destroy({ where: { postId: req.params.postId } });
    await Reaction.destroy({ where: { postId: req.params.postId } });
    await post.destroy();

    res.json({ message: 'Post and related data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});

module.exports = router;
