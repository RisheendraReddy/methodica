const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all conversations
router.get('/conversations', (req, res) => {
  const { platform, model, limit = 50, offset = 0 } = req.query;
  const database = db.getDb();
  
  let query = `
    SELECT c.*, 
           COUNT(m.id) as message_count,
           MAX(m.timestamp) as last_message_time
    FROM conversations c
    LEFT JOIN messages m ON c.id = m.conversation_id
  `;
  
  const conditions = [];
  const params = [];
  
  if (platform) {
    conditions.push('c.platform = ?');
    params.push(platform);
  }
  
  if (model) {
    conditions.push('c.model = ?');
    params.push(model);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' GROUP BY c.id ORDER BY c.updated_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  database.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching conversations:', err);
      return res.status(500).json({ error: 'Failed to fetch conversations' });
    }
    res.json(rows);
  });
});

// Get a specific conversation with messages
router.get('/conversations/:id', (req, res) => {
  const { id } = req.params;
  const database = db.getDb();
  
  // Get conversation details
  database.get('SELECT * FROM conversations WHERE id = ?', [id], (err, conversation) => {
    if (err) {
      console.error('Error fetching conversation:', err);
      return res.status(500).json({ error: 'Failed to fetch conversation' });
    }
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Get messages
    database.all(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC',
      [id],
      (err, messages) => {
        if (err) {
          console.error('Error fetching messages:', err);
          return res.status(500).json({ error: 'Failed to fetch messages' });
        }
        
        res.json({
          ...conversation,
          messages
        });
      }
    );
  });
});

// Create a new conversation
router.post('/conversations', (req, res) => {
  const { platform, model, title, messages } = req.body;
  const database = db.getDb();
  
  if (!platform || !model) {
    return res.status(400).json({ error: 'Platform and model are required' });
  }
  
  database.run(
    'INSERT INTO conversations (platform, model, title) VALUES (?, ?, ?)',
    [platform, model, title || null],
    function(err) {
      if (err) {
        console.error('Error creating conversation:', err);
        return res.status(500).json({ error: 'Failed to create conversation' });
      }
      
      const conversationId = this.lastID;
      
      // Insert messages if provided
      if (messages && messages.length > 0) {
        const stmt = database.prepare(
          'INSERT INTO messages (conversation_id, role, content, metadata) VALUES (?, ?, ?, ?)'
        );
        
        messages.forEach(msg => {
          stmt.run([
            conversationId,
            msg.role,
            msg.content,
            msg.metadata ? JSON.stringify(msg.metadata) : null
          ]);
        });
        
        stmt.finalize((err) => {
          if (err) {
            console.error('Error inserting messages:', err);
            return res.status(500).json({ error: 'Failed to insert messages' });
          }
          
          res.status(201).json({ id: conversationId, message: 'Conversation created' });
        });
      } else {
        res.status(201).json({ id: conversationId, message: 'Conversation created' });
      }
    }
  );
});

// Add message to conversation
router.post('/conversations/:id/messages', (req, res) => {
  const { id } = req.params;
  const { role, content, metadata } = req.body;
  const database = db.getDb();
  
  if (!role || !content) {
    return res.status(400).json({ error: 'Role and content are required' });
  }
  
  database.run(
    'INSERT INTO messages (conversation_id, role, content, metadata) VALUES (?, ?, ?, ?)',
    [id, role, content, metadata ? JSON.stringify(metadata) : null],
    function(err) {
      if (err) {
        console.error('Error adding message:', err);
        return res.status(500).json({ error: 'Failed to add message' });
      }
      
      // Update conversation updated_at
      database.run('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
      
      res.status(201).json({ id: this.lastID, message: 'Message added' });
    }
  );
});

// Delete conversation
router.delete('/conversations/:id', (req, res) => {
  const { id } = req.params;
  const database = db.getDb();
  
  database.run('DELETE FROM conversations WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting conversation:', err);
      return res.status(500).json({ error: 'Failed to delete conversation' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json({ message: 'Conversation deleted' });
  });
});

// Get statistics
router.get('/stats', (req, res) => {
  const database = db.getDb();
  
  const stats = {};
  
  // Total conversations
  database.get('SELECT COUNT(*) as count FROM conversations', (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch stats' });
    }
    stats.totalConversations = row.count;
    
    // Total messages
    database.get('SELECT COUNT(*) as count FROM messages', (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch stats' });
      }
      stats.totalMessages = row.count;
      
      // Conversations by platform
      database.all(
        'SELECT platform, COUNT(*) as count FROM conversations GROUP BY platform',
        (err, rows) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch stats' });
          }
          stats.byPlatform = rows;
          
          // Conversations by model
          database.all(
            'SELECT model, COUNT(*) as count FROM conversations GROUP BY model',
            (err, rows) => {
              if (err) {
                return res.status(500).json({ error: 'Failed to fetch stats' });
              }
              stats.byModel = rows;
              
              res.json(stats);
            }
          );
        }
      );
    });
  });
});

module.exports = router;


