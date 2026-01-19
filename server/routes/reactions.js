const express = require('express');
const router = express.Router();
const Reaction = require('../models/Reaction');
const { verifyToken } = require('../middleware/auth');
const { Op } = require('sequelize');
const useD1 = process.env.USE_CLOUD_D1 === 'true';
const useWorker = process.env.USE_CLOUD_D1_WORKER === 'true';

const queryD1 = async (sql, params = []) => {
  if (useWorker) {
    const response = await fetch(`${process.env.CF_WORKER_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-worker-secret': process.env.WORKER_SECRET
      },
      body: JSON.stringify({ sql, params })
    });
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Worker error ${response.status}: ${text}`);
    }
    
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.results;
  }
  return [];
};

// Get all reactions for a post
router.get('/post/:postId', async (req, res) => {
  try {
    if (useD1) {
      try {
        const rows = await queryD1('SELECT id, postId, reactionType, userId, createdAt FROM Reactions WHERE postId = ? ORDER BY createdAt DESC', [req.params.postId]);
        return res.json(rows || []);
      } catch (d1Error) {
        console.error('D1 Error, returning empty array:', d1Error.message);
        return res.json([]);
      }
    }

    const reactions = await Reaction.findAll({
      where: { postId: req.params.postId },
    });
    res.json(reactions);
  } catch (error) {
    console.error('Error fetching reactions:', error);
    res.status(500).json({ message: 'Error fetching reactions', error: error.message });
  }
});

// Get user's reaction on a post
router.get('/user/:postId', verifyToken, async (req, res) => {
  try {
    if (useD1) {
      try {
        const rows = await d1.query('SELECT id, postId, reactionType, userId, createdAt FROM Reactions WHERE postId = ? AND userId = ? LIMIT 1', [req.params.postId, req.user.id]);
        return res.json((rows && rows[0]) || null);
      } catch (d1Error) {
        console.error('D1 Error, falling back to SQLite:', d1Error.message);
        // Fall through to SQLite
      }
    }

    const reaction = await Reaction.findOne({
      where: {
        postId: req.params.postId,
        userId: req.user.id,
      },
    });

    res.json(reaction || null);
  } catch (error) {
    console.error('Error fetching user reaction:', error);
    res.status(500).json({ message: 'Error fetching reaction', error: error.message });
  }
});

// Add or update a reaction (one per user per post)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { postId, reactionType } = req.body;

    if (!postId || !reactionType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!['like', 'love', 'haha', 'wow', 'sad', 'angry'].includes(reactionType)) {
      return res.status(400).json({ message: 'Invalid reaction type' });
    }

    let reaction;

    if (useD1) {
      try {
        const existing = await queryD1('SELECT id FROM Reactions WHERE postId = ? AND userId = ? LIMIT 1', [postId, req.user.id]);
        if (existing && existing[0]) {
          await queryD1('UPDATE Reactions SET reactionType = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [reactionType, existing[0].id]);
          reaction = { id: existing[0].id, postId, reactionType, userId: req.user.id };
        } else {
          await queryD1('INSERT INTO Reactions (postId, userId, reactionType, createdAt, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [postId, req.user.id, reactionType]);
          reaction = { id: Date.now(), postId, reactionType, userId: req.user.id };
        }
      } catch (d1Error) {
        console.error('D1 Error:', d1Error.message);
        return res.status(500).json({ message: 'Error creating reaction', error: d1Error.message });
      }
    } else {
      // Check if user already has a reaction on this post
      reaction = await Reaction.findOne({
        where: {
          postId,
          userId: req.user.id,
        },
      });

      if (reaction) {
        // Update existing reaction
        reaction.reactionType = reactionType;
        await reaction.save();
      } else {
        // Create new reaction
        reaction = await Reaction.create({
          postId,
          userId: req.user.id,
          reactionType,
        });
      }
    }

    // Notify WebSocket clients
    const wsServer = req.app.get('wsServer');
    if (wsServer) {
      wsServer.notifyReactionUpdate(postId, reaction);
    }

    res.status(reaction.id ? 200 : 201).json(reaction);
  } catch (error) {
    console.error('Reaction error:', error);
    res.status(500).json({ message: 'Error creating reaction', error: error.message });
  }
});

// Remove a reaction
router.delete('/:postId', verifyToken, async (req, res) => {
  try {
    if (useD1) {
      try {
        const rows = await d1.query('SELECT id FROM Reactions WHERE postId = ? AND userId = ? LIMIT 1', [req.params.postId, req.user.id]);
        const r = rows && rows[0];
        if (!r) return res.status(404).json({ message: 'Reaction not found' });
        await d1.query('DELETE FROM Reactions WHERE id = ?', [r.id]);
        
        // Notify WebSocket clients
        const wsServer = req.app.get('wsServer');
        if (wsServer) {
          wsServer.notifyReactionUpdate(req.params.postId, null);
        }
        
        return res.json({ message: 'Reaction removed successfully' });
      } catch (d1Error) {
        console.error('D1 Error, falling back to SQLite:', d1Error.message);
        // Fall through to SQLite
      }
    }

    const reaction = await Reaction.findOne({
      where: {
        postId: req.params.postId,
        userId: req.user.id,
      },
    });

    if (!reaction) {
      return res.status(404).json({ message: 'Reaction not found' });
    }

    await reaction.destroy();
    
    // Notify WebSocket clients
    const wsServer = req.app.get('wsServer');
    if (wsServer) {
      wsServer.notifyReactionUpdate(req.params.postId, null);
    }
    
    res.json({ message: 'Reaction removed successfully' });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({ message: 'Error removing reaction', error: error.message });
  }
});

module.exports = router;
