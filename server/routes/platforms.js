const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all platforms
router.get('/', (req, res) => {
  const database = db.getDb();
  
  database.all('SELECT id, name, enabled, created_at, updated_at FROM platforms', (err, rows) => {
    if (err) {
      console.error('Error fetching platforms:', err);
      return res.status(500).json({ error: 'Failed to fetch platforms' });
    }
    
    // Don't send API keys in response
    res.json(rows);
  });
});

// Get a specific platform (without API key)
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const database = db.getDb();
  
  database.get(
    'SELECT id, name, enabled, created_at, updated_at FROM platforms WHERE id = ?',
    [id],
    (err, row) => {
      if (err) {
        console.error('Error fetching platform:', err);
        return res.status(500).json({ error: 'Failed to fetch platform' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Platform not found' });
      }
      
      res.json(row);
    }
  );
});

// Add or update platform API key
router.post('/', (req, res) => {
  const { name, api_key, enabled = true } = req.body;
  const database = db.getDb();
  
  if (!name) {
    return res.status(400).json({ error: 'Platform name is required' });
  }
  
  // Check if platform exists
  database.get('SELECT id FROM platforms WHERE name = ?', [name], (err, row) => {
    if (err) {
      console.error('Error checking platform:', err);
      return res.status(500).json({ error: 'Failed to check platform' });
    }
    
    if (row) {
      // Update existing platform
      const updateQuery = api_key
        ? 'UPDATE platforms SET api_key = ?, enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE name = ?'
        : 'UPDATE platforms SET enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE name = ?';
      
      const params = api_key ? [api_key, enabled ? 1 : 0, name] : [enabled ? 1 : 0, name];
      
      database.run(updateQuery, params, function(err) {
        if (err) {
          console.error('Error updating platform:', err);
          return res.status(500).json({ error: 'Failed to update platform' });
        }
        res.json({ id: row.id, message: 'Platform updated' });
      });
    } else {
      // Create new platform
      if (!api_key) {
        return res.status(400).json({ error: 'API key is required for new platforms' });
      }
      
      database.run(
        'INSERT INTO platforms (name, api_key, enabled) VALUES (?, ?, ?)',
        [name, api_key, enabled ? 1 : 0],
        function(err) {
          if (err) {
            console.error('Error creating platform:', err);
            return res.status(500).json({ error: 'Failed to create platform' });
          }
          res.status(201).json({ id: this.lastID, message: 'Platform created' });
        }
      );
    }
  });
});

// Delete platform
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const database = db.getDb();
  
  database.run('DELETE FROM platforms WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting platform:', err);
      return res.status(500).json({ error: 'Failed to delete platform' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Platform not found' });
    }
    
    res.json({ message: 'Platform deleted' });
  });
});

// Test platform connection
router.post('/:id/test', async (req, res) => {
  const { id } = req.params;
  const database = db.getDb();
  
  database.get('SELECT * FROM platforms WHERE id = ?', [id], async (err, platform) => {
    if (err || !platform) {
      return res.status(404).json({ error: 'Platform not found' });
    }
    
    if (!platform.api_key) {
      return res.status(400).json({ error: 'API key not configured' });
    }
    
    try {
      const syncService = require('../services/sync');
      const isValid = await syncService.testConnection(platform.name, platform.api_key);
      
      if (isValid) {
        res.json({ valid: true, message: 'Connection successful' });
      } else {
        res.status(400).json({ valid: false, message: 'Connection failed' });
      }
    } catch (error) {
      res.status(500).json({ valid: false, message: error.message });
    }
  });
});

module.exports = router;


