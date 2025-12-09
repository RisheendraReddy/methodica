# Setup Guide - AI Chat History Manager

Complete setup instructions for the Flask + PostgreSQL + React + Tailwind application.

## Prerequisites

- Python 3.9+
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

## Step 1: Backend Setup

### 1.1 Create Virtual Environment

```bash
cd backend
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

### 1.2 Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 1.3 Set Up PostgreSQL Database

```bash
# Create database
createdb ai_chat_history

# Or using psql:
psql -U postgres
CREATE DATABASE ai_chat_history;
\q
```

### 1.4 Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` file:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_chat_history
JWT_SECRET_KEY=your-secret-key-change-in-production
CORS_ORIGINS=http://localhost:3000
```

### 1.5 Initialize Database

```bash
# Initialize Flask-Migrate
flask db init

# Create initial migration
flask db migrate -m "Initial migration"

# Apply migration
flask db upgrade
```

### 1.6 Run Backend Server

```bash
python app.py
```

The backend will run on `http://localhost:5000`

## Step 2: Frontend Setup

### 2.1 Install Dependencies

```bash
cd client
npm install
```

### 2.2 Configure Environment (Optional)

Create `.env` file in `client` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=your-firebase-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
```

### 2.3 Run Frontend Development Server

```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Step 3: Optional - Vector Search Setup

### Option A: Qdrant (Recommended for Local Development)

```bash
# Using Docker
docker run -p 6333:6333 qdrant/qdrant

# Update .env in backend:
VECTOR_SEARCH_PROVIDER=qdrant
QDRANT_URL=http://localhost:6333
```

### Option B: Pinecone (Cloud)

1. Sign up at [pinecone.io](https://www.pinecone.io)
2. Create an index
3. Update `.env` in backend:

```env
VECTOR_SEARCH_PROVIDER=pinecone
PINECONE_API_KEY=your-api-key
PINECONE_ENVIRONMENT=your-environment
PINECONE_INDEX_NAME=ai-chat-history
```

## Step 4: First Use

1. **Start Backend**: `cd backend && python app.py`
2. **Start Frontend**: `cd client && npm start`
3. **Open Browser**: Navigate to `http://localhost:3000`
4. **Login**: Use demo login (email/password optional for now)
5. **Add API Keys**: Go to Settings → API Keys
   - Add your OpenAI API key
   - Add your Anthropic API key (optional)
   - Add your Google API key (optional)
6. **Start Chatting**: Go to "New Chat" and start a conversation!

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Test connection
psql -U postgres -d ai_chat_history
```

### Port Already in Use

**Backend (port 5000):**
```bash
# Change port in backend/.env
PORT=5001
```

**Frontend (port 3000):**
```bash
# Set environment variable
PORT=3001 npm start
```

### CORS Errors

Make sure `CORS_ORIGINS` in backend `.env` includes your frontend URL:
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Module Not Found Errors

**Backend:**
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

**Frontend:**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

### Database Migration Issues

```bash
# Reset database (WARNING: Deletes all data)
flask db downgrade base
flask db upgrade
```

## Development Workflow

1. **Backend changes**: Restart Flask server (`python app.py`)
2. **Frontend changes**: React hot-reloads automatically
3. **Database changes**: Create new migration:
   ```bash
   flask db migrate -m "Description of changes"
   flask db upgrade
   ```

## Production Deployment

### Backend

- Deploy to Heroku, AWS, or DigitalOcean
- Set environment variables in production
- Use production database (managed PostgreSQL)
- Enable HTTPS

### Frontend

- Build: `npm run build`
- Deploy to Vercel, Netlify, or AWS S3
- Update API URL in production environment

## Next Steps

- Integrate Firebase Auth for production authentication
- Set up proper API key encryption
- Configure vector search for semantic search
- Set up monitoring and logging
- Add unit tests

## Support

For issues or questions, check:
- Backend logs: Check terminal running `python app.py`
- Frontend logs: Check browser console
- Database logs: Check PostgreSQL logs


