const axios = require('axios');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const API_BASE = process.env.API_URL || 'http://localhost:5001/api';

// Get token from localStorage or prompt user
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function importConversation(filePath, token) {
  try {
    // Read the JSON file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const conversation = JSON.parse(fileContent);

    // Validate required fields
    if (!conversation.platform || !conversation.model) {
      throw new Error('Platform and model are required in the JSON file');
    }

    // Ensure platform is lowercase (openai, anthropic, google)
    conversation.platform = conversation.platform.toLowerCase();

    // Send to API
    const response = await axios.post(
      `${API_BASE}/conversations`,
      conversation,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ Conversation imported successfully!');
    console.log(`   ID: ${response.data.id || 'N/A'}`);
    console.log(`   Platform: ${conversation.platform}`);
    console.log(`   Model: ${conversation.model}`);
    console.log(`   Messages: ${conversation.messages?.length || 0}`);

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data.error || error.response.data.message);
      if (error.response.status === 401) {
        console.error('   Authentication failed. Make sure you are logged in and have a valid token.');
      }
    } else if (error.code === 'ENOENT') {
      console.error('❌ File not found:', filePath);
    } else if (error instanceof SyntaxError) {
      console.error('❌ Invalid JSON:', error.message);
    } else {
      console.error('❌ Error:', error.message);
    }
    throw error;
  }
}

async function main() {
  const filePath = process.argv[2];
  const token = process.argv[3];

  if (!filePath) {
    console.error('Usage: node import-conversation-flask.js <path-to-json-file> [token]');
    console.error('\nExample:');
    console.error('  node import-conversation-flask.js ./my-chat.json');
    console.error('  node import-conversation-flask.js ./my-chat.json mock_token_1234567890');
    process.exit(1);
  }

  let authToken = token;

  if (!authToken) {
    console.log('No token provided. You need to be logged in to import conversations.');
    console.log('Get your token from browser localStorage (firebase_token) or log in through the web app.');
    authToken = await question('Enter your auth token (or press Enter to skip): ');
    
    if (!authToken) {
      console.error('❌ Token required. Please log in through the web app first.');
      process.exit(1);
    }
  }

  // Resolve absolute path
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

  try {
    await importConversation(absolutePath, authToken);
    console.log('\n✅ Import complete!');
  } catch (error) {
    console.error('\n❌ Import failed');
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();


