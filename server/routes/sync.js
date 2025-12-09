const express = require('express');
const router = express.Router();
const db = require('../database');
const syncService = require('../services/sync');

// Sync chat history from a platform
router.post('/:platform', async (req, res) => {
  const { platform } = req.params;
  const database = db.getDb();
  
  // Get platform API key
  database.get('SELECT * FROM platforms WHERE name = ? AND enabled = 1', [platform], async (err, platformData) => {
    if (err) {
      console.error('Error fetching platform:', err);
      return res.status(500).json({ error: 'Failed to fetch platform' });
    }
    
    if (!platformData || !platformData.api_key) {
      return res.status(400).json({ error: 'Platform not configured or disabled' });
    }
    
    try {
      const result = await syncService.syncPlatform(platform, platformData.api_key);
      res.json({
        success: true,
        message: `Synced ${result.conversationsAdded} conversations from ${platform}`,
        ...result
      });
    } catch (error) {
      console.error(`Error syncing ${platform}:`, error);
      res.status(500).json({ error: error.message });
    }
  });
});

// Sync all enabled platforms
router.post('/', async (req, res) => {
  const database = db.getDb();
  
  database.all('SELECT * FROM platforms WHERE enabled = 1', async (err, platforms) => {
    if (err) {
      console.error('Error fetching platforms:', err);
      return res.status(500).json({ error: 'Failed to fetch platforms' });
    }
    
    const results = [];
    
    for (const platform of platforms) {
      if (!platform.api_key) continue;
      
      try {
        const result = await syncService.syncPlatform(platform.name, platform.api_key);
        results.push({
          platform: platform.name,
          success: true,
          ...result
        });
      } catch (error) {
        results.push({
          platform: platform.name,
          success: false,
          error: error.message
        });
      }
    }
    
    res.json({ results });
  });
});

module.exports = router;


