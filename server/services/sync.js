const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../database');
const axios = require('axios');

const syncPlatform = async (platformName, apiKey) => {
  switch (platformName.toLowerCase()) {
    case 'openai':
      return await syncOpenAI(apiKey);
    case 'anthropic':
    case 'claude':
      return await syncAnthropic(apiKey);
    case 'google':
    case 'gemini':
      return await syncGoogle(apiKey);
    default:
      throw new Error(`Unsupported platform: ${platformName}`);
  }
};

const syncOpenAI = async (apiKey) => {
  const openai = new OpenAI({ apiKey });
  const database = db.getDb();
  
  let conversationsAdded = 0;
  let messagesAdded = 0;
  
  try {
    // Note: OpenAI API doesn't provide a direct way to list all conversations
    // This is a placeholder - in a real implementation, you'd need to:
    // 1. Use OpenAI's Assistants API if available
    // 2. Or maintain a separate sync mechanism
    // 3. Or use web scraping (not recommended)
    
    // For now, we'll create a manual sync endpoint that accepts conversation data
    return {
      conversationsAdded: 0,
      messagesAdded: 0,
      message: 'OpenAI sync requires manual conversation import. Use the API to add conversations.'
    };
  } catch (error) {
    throw new Error(`OpenAI sync failed: ${error.message}`);
  }
};

const syncAnthropic = async (apiKey) => {
  const anthropic = new Anthropic({ apiKey });
  
  // Note: Anthropic API doesn't provide a way to list past conversations
  // Similar to OpenAI, this would require manual import or a different approach
  return {
    conversationsAdded: 0,
    messagesAdded: 0,
    message: 'Anthropic sync requires manual conversation import. Use the API to add conversations.'
  };
};

const syncGoogle = async (apiKey) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Note: Google Gemini API doesn't provide conversation history retrieval
  // This would require manual import
  return {
    conversationsAdded: 0,
    messagesAdded: 0,
    message: 'Google Gemini sync requires manual conversation import. Use the API to add conversations.'
  };
};

const testConnection = async (platformName, apiKey) => {
  try {
    switch (platformName.toLowerCase()) {
      case 'openai':
        const openai = new OpenAI({ apiKey });
        // Test with a simple API call
        await openai.models.list();
        return true;
        
      case 'anthropic':
      case 'claude':
        const anthropic = new Anthropic({ apiKey });
        // Test with a simple message
        await anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }]
        });
        return true;
        
      case 'google':
      case 'gemini':
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        await model.generateContent('test');
        return true;
        
      default:
        return false;
    }
  } catch (error) {
    console.error(`Connection test failed for ${platformName}:`, error.message);
    return false;
  }
};

// Helper function to save conversation to database
const saveConversation = (platform, model, title, messages) => {
  return new Promise((resolve, reject) => {
    const database = db.getDb();
    
    database.run(
      'INSERT INTO conversations (platform, model, title) VALUES (?, ?, ?)',
      [platform, model, title || null],
      function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        const conversationId = this.lastID;
        
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
            if (err) reject(err);
            else resolve(conversationId);
          });
        } else {
          resolve(conversationId);
        }
      }
    );
  });
};

module.exports = {
  syncPlatform,
  testConnection,
  saveConversation
};


