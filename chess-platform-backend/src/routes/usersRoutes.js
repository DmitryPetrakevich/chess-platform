const express = require('express')
const router = express.Router()
const { pool } = require('../config/db')

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query
    
    if (!q || q.length < 2) {
      return res.json({ users: [] })
    }

    const query = `
      SELECT id, username
      FROM users
      WHERE username ILIKE $1
      LIMIT 10
    `
    
    const result = await pool.query(query, [`%${q}%`])
    
    res.json({ users: result.rows })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

module.exports = router