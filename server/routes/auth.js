const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

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

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      isAdmin: user.isAdmin,
      profileImage: user.profileImage,
    },
    process.env.JWT_SECRET || 'your_jwt_secret_key',
    { expiresIn: '7d' }
  );
};

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, displayName, password, confirmPassword, requestToContribute } = req.body;

    if (!email || !displayName || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (useD1) {
      try {
        // Check if user exists in D1
        const existing = await queryD1('SELECT id FROM Users WHERE email = ?', [email]);
        if (existing.length > 0) {
          return res.status(409).json({ message: 'User with this email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user in D1
        await queryD1('INSERT INTO Users (email, displayName, password, isAdmin, requestedContributor, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', 
          [email, displayName, hashedPassword, email === process.env.ADMIN_EMAIL ? 1 : 0, requestToContribute ? 1 : 0]);
        
        const user = { id: Date.now(), email, displayName, isAdmin: email === process.env.ADMIN_EMAIL };
        const token = generateToken(user);
        
        return res.status(201).json({
          message: 'User registered successfully',
          token,
          user: { id: user.id, email: user.email, displayName: user.displayName, isAdmin: user.isAdmin }
        });
      } catch (d1Error) {
        console.error('D1 registration error:', d1Error.message);
        return res.status(500).json({ message: 'Database error during registration', error: d1Error.message });
      }
    }

    // Fallback to SQLite
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      email,
      displayName,
      password,
      isAdmin: email === process.env.ADMIN_EMAIL,
      requestedContributor: !!requestToContribute,
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (useD1) {
      try {
        const users = await queryD1('SELECT id, email, displayName, password, isAdmin FROM Users WHERE email = ?', [email]);
        if (users.length === 0) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        await queryD1('UPDATE Users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
        
        const token = generateToken(user);
        return res.json({
          message: 'Logged in successfully',
          token,
          user: { id: user.id, email: user.email, displayName: user.displayName, isAdmin: !!user.isAdmin }
        });
      } catch (d1Error) {
        console.error('D1 login error:', d1Error.message);
        return res.status(500).json({ message: 'Database error during login', error: d1Error.message });
      }
    }

    // Fallback to SQLite
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await user.verifyPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      profileImage: user.profileImage,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Logout (client-side action, but we can use this for cleanup)
router.post('/logout', verifyToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
