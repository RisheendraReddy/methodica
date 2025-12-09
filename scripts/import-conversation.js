const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_URL || 'http://localhost:5000/api';

async function importConversation(filePath) {
  try {
    // Read the JSON file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const conversation = JSON.parse(fileContent);

    // Validate required fields
    if (!conversation.platform || !conversation.model) {
      throw new Error('Platform and model are required in the JSON file');
    }

    // Send to API
    const response = await axios.post(
      `${API_BASE}/chat/conversations`,
      conversation
    );

    console.log('✅ Conversation imported successfully!');
    console.log(`   ID: ${response.data.id}`);
    console.log(`   Platform: ${conversation.platform}`);
    console.log(`   Model: ${conversation.model}`);
    console.log(`   Messages: ${conversation.messages?.length || 0}`);

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.data.error || error.response.data.message);
    } else if (error.code === 'ENOENT') {
      console.error('❌ File not found:', filePath);
    } else if (error instanceof SyntaxError) {
      console.error('❌ Invalid JSON:', error.message);
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

// Get file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: node import-conversation.js <path-to-json-file>');
  console.error('\nExample:');
  console.error('  node import-conversation.js ./conversations/my-chat.json');
  process.exit(1);
}

// Resolve absolute path
const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

importConversation(absolutePath);


