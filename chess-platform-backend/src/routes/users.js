const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/users - получить всех пользователей
router.get('/', async (req, res) => {
  try {
    console.log('📋 Getting all users...');
    
    const result = await pool.query(`
      SELECT id, username, email, password_hash, rating, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    console.log(`✅ Found ${result.rows.length} users`);
    
    res.json({
      success: true,
      count: result.rows.length,
      users: result.rows
    });
    
  } catch (err) {
    console.error('❌ Error getting users:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// GET /api/users/:id - получить пользователя по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Getting user with ID: ${id}`);
    
    const result = await pool.query(`
      SELECT id, username, email, rating, games_played, games_won, created_at 
      FROM users 
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    console.log('✅ User found:', result.rows[0].username);
    
    res.json({
      success: true,
      user: result.rows[0]
    });
    
  } catch (err) {
    console.error('❌ Error getting user:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;