# AI Chat History Manager - Flask + PostgreSQL + React + Tailwind

A comprehensive, production-ready application to store and manage AI chat history from all platforms. Built with Flask, PostgreSQL, React, and Tailwind CSS.

## 🎯 Core Features

- ✅ **Store all AI chat history** from multiple platforms
- ✅ **Multi-platform support** (OpenAI, Anthropic, Google Gemini)
- ✅ **Chat through the app** - Users chat directly through your interface
- ✅ **Folders & Organization** - Organize conversations in folders
- ✅ **Tags** - Tag conversations for easy categorization
- ✅ **Search** - Full-text and semantic search across all conversations
- ✅ **Export** - Export conversations in JSON, CSV, or Markdown
- ✅ **Cross-AI Comparison** - Compare responses from different models
- ✅ **Statistics** - Track usage, tokens, and costs
- ✅ **Vector Search** - Semantic search using Pinecone or Qdrant
- ✅ **Authentication** - Firebase Auth integration

## 🏗️ Architecture

### Tech Stack

- **Backend**: Flask + SQLAlchemy
- **Database**: PostgreSQL
- **Frontend**: React + Tailwind CSS
- **Authentication**: Firebase Auth (JWT)
- **Vector Search**: Pinecone or Qdrant
- **AI APIs**: OpenAI, Anthropic, Google Gemini

### Data Flow

```
User → Your App → Select AI Model → Send Prompt → API → Response
                    ↓
              Saved to PostgreSQL
                    ↓
         Indexed in Vector Database (optional)
```

## 📦 Installation

### Prerequisites

- Python 3.9+
- Node.js 16+
- PostgreSQL 12+
- (Optional) Qdrant or Pinecone for vector search

### Backend Setup

1. **Create virtual environment**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up PostgreSQL database**:
   ```bash
   createdb ai_chat_history
   # Or use psql:
   # psql -U postgres
   # CREATE DATABASE ai_chat_history;
   ```

4. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and API keys
   ```

5. **Initialize database**:
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

6. **Run the backend**:
   ```bash
   python app.py
   # Or: flask run
   ```

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd client
   npm install
   ```

2. **Configure Firebase** (optional, for authentication):
   - Create a Firebase project
   - Add your Firebase config to `src/config/firebase.js`

3. **Run the frontend**:
   ```bash
   npm start
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_chat_history

# JWT
JWT_SECRET_KEY=your-secret-key-change-in-production

# CORS
CORS_ORIGINS=http://localhost:3000

# Vector Search (optional)
VECTOR_SEARCH_PROVIDER=qdrant
QDRANT_URL=http://localhost:6333

# Or use Pinecone
# PINECONE_API_KEY=your-key
# PINECONE_ENVIRONMENT=your-env
```

### Qdrant Setup (Optional, for Vector Search)

```bash
docker run -p 6333:6333 qdrant/qdrant
```

## 🚀 Usage

### 1. Authentication

The app uses Firebase Auth. Users need to:
1. Sign in with Firebase
2. Get a JWT token
3. Include token in API requests: `Authorization: Bearer <token>`

### 2. Configure API Keys

Users add their API keys through the UI:
- Go to Settings → API Keys
- Add keys for OpenAI, Anthropic, or Google

### 3. Start Chatting

1. Select a platform and model
2. Type your message
3. Send and get response
4. All conversations are automatically saved

### 4. Organize Conversations

- Create folders to organize conversations
- Add tags to categorize
- Use search to find specific conversations

### 5. Export Data

- Export individual conversations
- Export multiple conversations in bulk
- Formats: JSON, CSV, Markdown

## 📡 API Endpoints

### Authentication
- `POST /api/auth/verify` - Verify Firebase token
- `GET /api/auth/me` - Get current user

### Chat
- `POST /api/chat/send` - Send message to AI
- `GET /api/chat/models` - Get available models

### Conversations
- `GET /api/conversations` - List conversations (with filters)
- `GET /api/conversations/:id` - Get conversation details
- `PUT /api/conversations/:id` - Update conversation
- `DELETE /api/conversations/:id` - Delete conversation
- `POST /api/conversations/compare` - Compare conversations

### Folders
- `GET /api/folders` - List folders
- `POST /api/folders` - Create folder
- `PUT /api/folders/:id` - Update folder
- `DELETE /api/folders/:id` - Delete folder

### Tags
- `GET /api/tags` - List tags
- `POST /api/tags` - Create tag
- `PUT /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag

### Search
- `POST /api/search/semantic` - Semantic search
- `GET /api/search/text?q=query` - Text search

### Export
- `GET /api/export/conversation/:id?format=json|csv|markdown`
- `POST /api/export/bulk` - Export multiple conversations

### Statistics
- `GET /api/stats` - Get user statistics

### API Keys
- `GET /api/api-keys` - List API keys
- `POST /api/api-keys` - Add/update API key
- `DELETE /api/api-keys/:id` - Delete API key

## 🗄️ Database Schema

- **users** - User accounts (Firebase UID)
- **api_keys** - User API keys for AI platforms
- **conversations** - Chat conversations
- **messages** - Individual messages in conversations
- **folders** - Organization folders
- **tags** - Conversation tags
- **conversation_tags** - Many-to-many relationship
- **search_index** - Vector search index mapping

## 🔐 Security

- API keys are stored encrypted (implement encryption in production)
- JWT tokens for authentication
- User data isolation (all queries filtered by user_id)
- CORS configured for allowed origins

## 🚢 Deployment

### Backend (Flask)

Deploy to:
- Heroku
- AWS Elastic Beanstalk
- Google Cloud Run
- DigitalOcean App Platform

### Frontend (React)

Deploy to:
- Vercel
- Netlify
- AWS S3 + CloudFront

### Database

- PostgreSQL on AWS RDS, Heroku Postgres, or DigitalOcean

## 📝 Notes

- **API-Based Approach**: Users chat through your app, not native apps. This is the recommended, legal, and scalable approach.
- **Vector Search**: Optional but recommended for semantic search. Falls back to text search if not configured.
- **Cost Tracking**: Approximate cost calculations based on current pricing. Update in `services/ai_service.py` for accuracy.

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

## 📄 License

MIT


