const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const useD1 = process.env.USE_CLOUD_D1 === 'true';
const useWorker = process.env.USE_CLOUD_D1_WORKER === 'true';
let d1;
if (useD1 && !useWorker) {
  d1 = require('../config/d1Client');
}

// Get all comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    if (useD1) {
      try {
        const sql = `SELECT c.id, c.postId, c.text, c.userId, c.createdAt, u.id as user_id, u.email as user_email, u.displayName as user_displayName, u.profileImage as user_profileImage
                     FROM Comments c
                     LEFT JOIN Users u ON c.userId = u.id
                     WHERE c.postId = ?
                     ORDER BY c.createdAt DESC`;
        
        let rows;
        if (useWorker) {
          const response = await fetch(`${process.env.CF_WORKER_URL}/query`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-worker-secret': process.env.WORKER_SECRET
            },
            body: JSON.stringify({ sql, params: [req.params.postId] })
          });
          const result = await response.json();
          if (!result.success) throw new Error(result.error);
          rows = result.results;
        } else {
          rows = await d1.query(sql, [req.params.postId]);
        }
        
        const comments = (rows || []).map(r => ({
          id: r.id,
          postId: r.postId,
          text: r.text,
          userId: r.userId,
          createdAt: r.createdAt,
          user: r.user_id ? { id: r.user_id, email: r.user_email, displayName: r.user_displayName, profileImage: r.user_profileImage } : null,
        }));
        return res.json(comments);
      } catch (d1Error) {
        console.error('D1 Error, returning empty array:', d1Error.message);
        return res.json([]);
      }
    }

    const comments = await Comment.findAll({
      where: { postId: req.params.postId },
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'displayName', 'profileImage'] }],
      order: [['createdAt', 'DESC']],
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
});

// Create a comment (requires authentication)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { postId, text } = req.body;

    if (!postId || !text) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (useD1) {
      try {
        const insertSql = 'INSERT INTO Comments (postId, userId, text, createdAt, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)';
        
        if (useWorker) {
          console.log('Using worker URL:', process.env.CF_WORKER_URL);
          const response = await fetch(`${process.env.CF_WORKER_URL}/query`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-worker-secret': process.env.WORKER_SECRET
            },
            body: JSON.stringify({ sql: insertSql, params: [postId, req.user.id, text] })
          });
          
          if (!response.ok) {
            console.error('Worker response not ok:', response.status, response.statusText);
            throw new Error(`Worker error: ${response.status}`);
          }
          
          const result = await response.json();
          console.log('Worker result:', result);
          if (!result.success) throw new Error(result.error);
        } else {
          await d1.query(insertSql, [postId, req.user.id, text]);
        }
        
        return res.status(201).json({ id: Date.now(), postId, text, userId: req.user.id, createdAt: new Date().toISOString() });
      } catch (d1Error) {
        console.error('D1/Worker Error:', d1Error.message);
        console.error('Full error:', d1Error);
        return res.status(500).json({ message: 'Error creating comment', error: d1Error.message });
      }
    }

    const comment = await Comment.create({
      postId,
      userId: req.user.id,
      text,
    });

    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'displayName', 'profileImage'] }],
    });

    res.status(201).json(commentWithUser);
  } catch (error) {
    res.status(500).json({ message: 'Error creating comment', error: error.message });
  }
});

// Delete a comment (own comments or admin)
router.delete('/:commentId', verifyToken, async (req, res) => {
  try {
    if (useD1) {
      // Fetch owner
      const rows = await d1.query('SELECT userId FROM Comments WHERE id = ?', [req.params.commentId]);
      const owner = rows && rows[0] && rows[0].userId;
      if (!owner) return res.status(404).json({ message: 'Comment not found' });
      if (Number(owner) !== Number(req.user.id) && req.user.email !== process.env.ADMIN_EMAIL) return res.status(403).json({ message: 'Unauthorized to delete this comment' });

      await d1.query('DELETE FROM Comments WHERE id = ?', [req.params.commentId]);
      return res.json({ message: 'Comment deleted successfully' });
    }

    const comment = await Comment.findByPk(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Allow deletion if user is owner or admin
    if (comment.userId !== req.user.id && req.user.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ message: 'Unauthorized to delete this comment' });
    }

    await comment.destroy();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
});

// Update a comment (own comments only)
router.put('/:commentId', verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to update this comment' });
    }

    const { text } = req.body;
    if (text) {
      comment.text = text;
      await comment.save();
    }

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating comment', error: error.message });
  }
});

module.exports = router;
