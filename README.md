# Methodica

A comprehensive application to store and manage AI chat history from all platforms and models you use. This application provides a centralized location to view, search, and manage all your AI conversations across different platforms like OpenAI, Anthropic (Claude), Google Gemini, and more.

## Features

- 📚 **Centralized Storage**: Store all your AI chat history in one place
- 🔌 **Multi-Platform Support**: Connect to multiple AI platforms (OpenAI, Anthropic, Google, etc.)
- 🔍 **Search & Filter**: Easily find conversations by platform, model, or content
- 📊 **Statistics**: View insights about your chat usage across platforms
- 🎨 **Modern UI**: Beautiful, responsive interface for managing your conversations
- 🔐 **Secure**: API keys stored securely in local database

## Tech Stack

- **Backend**: Node.js, Express.js, SQLite
- **Frontend**: React.js
- **Database**: SQLite (lightweight, file-based)

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. **Clone or navigate to the project directory**

2. **Install dependencies**:
   ```bash
   npm run install-all
   ```
   This will install dependencies for both the backend and frontend.

3. **Set up environment variables** (optional):
   ```bash
   cp .env.example .env
   ```
   Edit `.env` if you want to change the default port (default is 5000).

4. **Start the development servers**:
   ```bash
   npm run dev
   ```
   This will start both the backend server (port 5000) and frontend development server (port 3000).

   Or start them separately:
   ```bash
   # Terminal 1 - Backend
   npm run server

   # Terminal 2 - Frontend
   npm run client
   ```

5. **Open your browser**:
   Navigate to `http://localhost:3000` to see the application.

## Usage

### Adding Platforms

1. Go to the **Platforms** tab
2. Click **"+ Add Platform"**
3. Enter the platform name (e.g., "OpenAI", "Anthropic", "Google")
4. Enter your API key
5. Click **Save Platform**

### Testing Platform Connection

1. In the Platforms tab, click **Test** next to a platform
2. The app will verify your API key is valid

### Adding Conversations

Since most AI platforms don't provide direct access to historical conversations through their APIs, you can add conversations manually:

#### Option 1: Using the API

```bash
curl -X POST http://localhost:5000/api/chat/conversations \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "OpenAI",
    "model": "gpt-4",
    "title": "My Conversation",
    "messages": [
      {
        "role": "user",
        "content": "Hello, how are you?"
      },
      {
        "role": "assistant",
        "content": "I'\''m doing well, thank you! How can I help you today?"
      }
    ]
  }'
```

#### Option 2: Using the Import Script

A helper script is provided to import conversations from JSON files:

```bash
node scripts/import-conversation.js path/to/conversation.json
```

Example JSON format:
```json
{
  "platform": "OpenAI",
  "model": "gpt-4",
  "title": "My Conversation",
  "messages": [
    {
      "role": "user",
      "content": "Hello!"
    },
    {
      "role": "assistant",
      "content": "Hi there!"
    }
  ]
}
```

### Viewing Conversations

1. Go to the **Conversations** tab
2. Click on any conversation to view its full history
3. Use the filter boxes to search by platform or model

### Statistics

Visit the **Statistics** tab to see:
- Total number of conversations
- Total number of messages
- Breakdown by platform
- Breakdown by model

## API Endpoints

### Conversations

- `GET /api/chat/conversations` - Get all conversations (supports `?platform=`, `?model=`, `?limit=`, `?offset=`)
- `GET /api/chat/conversations/:id` - Get a specific conversation with messages
- `POST /api/chat/conversations` - Create a new conversation
- `POST /api/chat/conversations/:id/messages` - Add a message to a conversation
- `DELETE /api/chat/conversations/:id` - Delete a conversation
- `GET /api/chat/stats` - Get statistics

### Platforms

- `GET /api/platforms` - Get all platforms
- `GET /api/platforms/:id` - Get a specific platform
- `POST /api/platforms` - Add or update a platform
- `DELETE /api/platforms/:id` - Delete a platform
- `POST /api/platforms/:id/test` - Test platform connection

### Sync

- `POST /api/sync/:platform` - Sync conversations from a specific platform
- `POST /api/sync` - Sync conversations from all enabled platforms

## Database

The application uses SQLite for data storage. The database file (`chat_history.db`) is created automatically in the `server` directory when you first run the application.

### Database Schema

- **platforms**: Stores platform configurations and API keys
- **conversations**: Stores conversation metadata
- **messages**: Stores individual messages within conversations

## Limitations

Most AI platforms (OpenAI, Anthropic, Google) don't provide APIs to retrieve historical conversations. This means:

1. **Manual Import Required**: You'll need to manually import conversations or use browser extensions/scripts to export them
2. **Future Conversations**: For new conversations, you can integrate this app with your applications to automatically save conversations as they happen
3. **Browser Extensions**: Consider creating browser extensions to automatically capture conversations from web interfaces

## Future Enhancements

- Browser extension for automatic conversation capture
- Export conversations to various formats (JSON, CSV, Markdown)
- Full-text search across all conversations
- Conversation tagging and categorization
- Backup and restore functionality
- User authentication for multi-user support

## Security Notes

- API keys are stored in the local SQLite database
- Never commit the database file or `.env` file to version control
- Consider encrypting API keys for production use
- The application is designed for local use - add authentication if deploying publicly

## Troubleshooting

### Port Already in Use

If port 5000 or 3000 is already in use, you can:
- Change the backend port in `.env`: `PORT=5001`
- Change the frontend port by setting `PORT=3001` before running `npm start` in the client directory

### Database Errors

If you encounter database errors:
- Delete `server/chat_history.db` and restart the server (this will recreate the database)
- Make sure you have write permissions in the server directory

## License

MIT

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

