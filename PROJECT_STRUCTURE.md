# Project Structure

## Overview

This is a full-stack AI Chat History Manager built with:
- **Backend**: Flask + PostgreSQL + SQLAlchemy
- **Frontend**: React + Tailwind CSS
- **Authentication**: Firebase Auth (JWT)
- **Vector Search**: Pinecone/Qdrant (optional)

## Directory Structure

```
.
├── backend/                 # Flask backend
│   ├── app.py              # Main Flask application
│   ├── config.py           # Configuration
│   ├── models.py           # Database models
│   ├── requirements.txt    # Python dependencies
│   ├── routes/             # API routes
│   │   ├── auth.py         # Authentication
│   │   ├── chat.py         # Chat interface
│   │   ├── conversations.py # Conversation management
│   │   ├── folders.py      # Folder management
│   │   ├── tags.py         # Tag management
│   │   ├── export.py       # Export functionality
│   │   ├── search.py       # Search (text + semantic)
│   │   ├── stats.py        # Statistics
│   │   └── api_keys.py     # API key management
│   └── services/           # Business logic
│       ├── ai_service.py   # AI platform integrations
│       └── vector_search.py # Vector search service
│
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/       # Authentication components
│   │   │   ├── Chat/       # Chat interface
│   │   │   ├── Conversations/ # Conversation views
│   │   │   ├── Dashboard/  # Dashboard
│   │   │   ├── Folders/    # Folder management
│   │   │   ├── Layout/     # Layout components (Sidebar, Header)
│   │   │   ├── Settings/   # Settings page
│   │   │   ├── Stats/      # Statistics page
│   │   │   └── Tags/       # Tag management
│   │   ├── config/         # Configuration files
│   │   │   ├── api.js      # API configuration
│   │   │   └── firebase.js # Firebase config
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   ├── tailwind.config.js  # Tailwind configuration
│   └── package.json        # Node dependencies
│
├── README_NEW.md           # Main documentation
├── SETUP.md                # Setup instructions
└── PROJECT_STRUCTURE.md    # This file
```

## Key Features

### Backend Features

1. **Authentication** (`routes/auth.py`)
   - Firebase JWT token verification
   - User management

2. **Chat Interface** (`routes/chat.py`)
   - Send messages to AI platforms
   - Support for OpenAI, Anthropic, Google
   - Automatic conversation saving

3. **Conversations** (`routes/conversations.py`)
   - CRUD operations
   - Filtering and search
   - Cross-AI comparison

4. **Folders** (`routes/folders.py`)
   - Organize conversations
   - Nested folder support

5. **Tags** (`routes/tags.py`)
   - Tag conversations
   - Color coding

6. **Export** (`routes/export.py`)
   - JSON, CSV, Markdown formats
   - Bulk export

7. **Search** (`routes/search.py`)
   - Full-text search
   - Semantic/vector search

8. **Statistics** (`routes/stats.py`)
   - Usage statistics
   - Cost tracking

9. **API Keys** (`routes/api_keys.py`)
   - Secure API key storage
   - Per-user, per-platform

### Frontend Features

1. **Dashboard** - Overview of conversations and stats
2. **Chat Interface** - Real-time chat with AI models
3. **Conversations List** - Browse and filter conversations
4. **Conversation View** - View full conversation history
5. **Folders** - Organize conversations
6. **Tags** - Categorize conversations
7. **Settings** - Manage API keys
8. **Statistics** - View usage analytics

## Database Schema

- **users** - User accounts (Firebase UID)
- **api_keys** - User API keys for AI platforms
- **conversations** - Chat conversations
- **messages** - Individual messages
- **folders** - Organization folders
- **tags** - Conversation tags
- **conversation_tags** - Many-to-many relationship
- **search_index** - Vector search index mapping

## API Endpoints

All endpoints are prefixed with `/api`

- `/auth/*` - Authentication
- `/chat/*` - Chat interface
- `/conversations/*` - Conversation management
- `/folders/*` - Folder management
- `/tags/*` - Tag management
- `/export/*` - Export functionality
- `/search/*` - Search
- `/stats` - Statistics
- `/api-keys/*` - API key management

## Technology Stack

### Backend
- Flask 3.0
- SQLAlchemy (ORM)
- PostgreSQL
- Flask-Migrate (database migrations)
- Flask-CORS
- JWT for authentication

### Frontend
- React 19
- React Router
- Tailwind CSS
- Axios (via fetch API)

### AI Integrations
- OpenAI SDK
- Anthropic SDK
- Google Generative AI SDK

### Vector Search (Optional)
- Pinecone
- Qdrant
- Sentence Transformers

## Development

See `SETUP.md` for detailed setup instructions.

## Production

- Use environment variables for all secrets
- Enable HTTPS
- Use managed PostgreSQL
- Set up proper CORS origins
- Enable API key encryption
- Set up monitoring and logging


