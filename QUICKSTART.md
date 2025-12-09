# Quick Start Guide

## Installation & Setup

1. **Install all dependencies**:
   ```bash
   npm run install-all
   ```

2. **Start the application**:
   ```bash
   npm run dev
   ```
   This starts both the backend (port 5000) and frontend (port 3000).

3. **Open your browser**:
   Navigate to `http://localhost:3000`

## First Steps

### 1. Add a Platform

1. Click on the **Platforms** tab
2. Click **"+ Add Platform"**
3. Fill in:
   - **Platform Name**: e.g., "OpenAI", "Anthropic", "Google"
   - **API Key**: Your API key for that platform
   - **Enabled**: Check to enable the platform
4. Click **Save Platform**

### 2. Test Your Platform Connection

1. In the Platforms tab, click **Test** next to your platform
2. You should see a success message if your API key is valid

### 3. Add Your First Conversation

#### Option A: Using the Web Interface

1. Go to the **Conversations** tab
2. Click **"+ Add New Conversation"**
3. Fill in:
   - Platform (e.g., "OpenAI")
   - Model (e.g., "gpt-4")
   - Title (optional)
   - Add messages (click "+ Add Message" for multiple messages)
4. Click **Add Conversation**

#### Option B: Using the Import Script

1. Create a JSON file with your conversation (see `examples/conversation-example.json`)
2. Run:
   ```bash
   node scripts/import-conversation.js path/to/your/conversation.json
   ```

#### Option C: Using the API

```bash
curl -X POST http://localhost:5000/api/chat/conversations \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "OpenAI",
    "model": "gpt-4",
    "title": "My First Conversation",
    "messages": [
      {
        "role": "user",
        "content": "Hello!"
      },
      {
        "role": "assistant",
        "content": "Hi there! How can I help you?"
      }
    ]
  }'
```

### 4. View Your Conversations

1. Go to the **Conversations** tab
2. Click on any conversation to view its full history
3. Use the filter boxes to search by platform or model

### 5. Check Statistics

1. Go to the **Statistics** tab
2. View your usage statistics across all platforms

## Tips

- **Filtering**: Use the filter boxes in the Conversations tab to quickly find specific conversations
- **Deleting**: Click the Delete button on any conversation to remove it
- **Platform Sync**: The sync feature is available, but note that most AI platforms don't provide APIs to retrieve historical conversations, so manual import is typically required
- **Database**: Your data is stored in `server/chat_history.db` - back this up regularly!

## Troubleshooting

**Port already in use?**
- Change the backend port in `.env`: `PORT=5001`
- For frontend, set `PORT=3001` before running `npm start` in the client directory

**Can't connect to API?**
- Make sure the backend server is running on port 5000
- Check that the proxy is configured in `client/package.json`

**Database errors?**
- Delete `server/chat_history.db` and restart the server
- Make sure you have write permissions in the server directory

## Next Steps

- Explore the API endpoints in the README
- Create browser extensions to automatically capture conversations
- Export your conversations for backup
- Set up automated backups of your database


