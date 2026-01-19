const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Comment = require('../models/Comment');
const Reaction = require('../models/Reaction');
const { verifyToken, isAdmin } = require('../middleware/auth');
const useD1 = process.env.USE_CLOUD_D1 === 'true';
let d1;
if (useD1) d1 = require('../config/d1Client');

// Get dashboard stats (admin only)
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    if (useD1) {
      const u = await d1.query('SELECT COUNT(*) as cnt FROM Users');
      const c = await d1.query('SELECT COUNT(*) as cnt FROM Comments');
      const r = await d1.query('SELECT COUNT(*) as cnt FROM Reactions');
      const a = await d1.query("SELECT COUNT(*) as cnt FROM Users WHERE isAdmin = 1");
      return res.json({ totalUsers: (u && u[0] && u[0].cnt) || 0, totalComments: (c && c[0] && c[0].cnt) || 0, totalReactions: (r && r[0] && r[0].cnt) || 0, adminUsers: (a && a[0] && a[0].cnt) || 0 });
    }

    const totalUsers = await User.count();
    const totalComments = await Comment.count();
    const totalReactions = await Reaction.count();
    const adminUsers = await User.count({ where: { isAdmin: true } });

    res.json({
      totalUsers,
      totalComments,
      totalReactions,
      adminUsers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// Get all users (admin only)
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    if (useD1) {
      const rows = await d1.query('SELECT id, email, displayName, profileImage, isAdmin, requestedContributor, createdAt FROM Users ORDER BY createdAt DESC');
      return res.json(rows || []);
    }

    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get all comments (admin only)
router.get('/comments', verifyToken, isAdmin, async (req, res) => {
  try {
    const comments = await Comment.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'displayName', 'profileImage'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
});

// Get all reactions (admin only)
router.get('/reactions', verifyToken, isAdmin, async (req, res) => {
  try {
    const reactions = await Reaction.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json(reactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reactions', error: error.message });
  }
});

// Delete user (admin only)
router.delete('/users/:userId', verifyToken, isAdmin, async (req, res) => {
  try {
    if (useD1) {
      const rows = await d1.query('SELECT id FROM Users WHERE id = ? LIMIT 1', [req.params.userId]);
      if (!rows || !rows[0]) return res.status(404).json({ message: 'User not found' });
      await d1.query('DELETE FROM Comments WHERE userId = ?', [req.params.userId]);
      await d1.query('DELETE FROM Reactions WHERE userId = ?', [req.params.userId]);
      await d1.query('DELETE FROM Users WHERE id = ?', [req.params.userId]);
      return res.json({ message: 'User and related data deleted successfully' });
    }

    const user = await User.findByPk(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete related comments and reactions
    await Comment.destroy({ where: { userId: req.params.userId } });
    await Reaction.destroy({ where: { userId: req.params.userId } });
    await user.destroy();

    res.json({ message: 'User and related data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// Delete comment (admin only)
router.delete('/comments/:commentId', verifyToken, isAdmin, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    await comment.destroy();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
});

// Delete reaction (admin only)
router.delete('/reactions/:reactionId', verifyToken, isAdmin, async (req, res) => {
  try {
    const reaction = await Reaction.findByPk(req.params.reactionId);

    if (!reaction) {
      return res.status(404).json({ message: 'Reaction not found' });
    }

    await reaction.destroy();
    res.json({ message: 'Reaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting reaction', error: error.message });
  }
});

// Approve a user as contributor/admin (admin only)
router.put('/users/:userId/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isAdmin = true;
    user.requestedContributor = false;
    await user.save();

    res.json({ message: 'User approved as contributor/admin', user: { id: user.id, email: user.email, isAdmin: user.isAdmin } });
  } catch (error) {
    res.status(500).json({ message: 'Error approving user', error: error.message });
  }
});

module.exports = router;
