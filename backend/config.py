import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Database
    # Default to SQLite for easy development, can override with DATABASE_URL
    DATABASE_URL = os.getenv('DATABASE_URL')
    if DATABASE_URL:
        SQLALCHEMY_DATABASE_URI = DATABASE_URL
    else:
        # Use SQLite as default for development
        SQLALCHEMY_DATABASE_URI = os.getenv(
            'SQLALCHEMY_DATABASE_URI',
            'sqlite:///ai_chat_history.db'
        )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = False  # Set to timedelta for production
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5001').split(',')
    
    # AI API Keys (user-specific, stored in database)
    # These are defaults for testing
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
    ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', '')
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY', '')
    
    # Vector Search
    PINECONE_API_KEY = os.getenv('PINECONE_API_KEY', '')
    PINECONE_ENVIRONMENT = os.getenv('PINECONE_ENVIRONMENT', '')
    PINECONE_INDEX_NAME = os.getenv('PINECONE_INDEX_NAME', 'ai-chat-history')
    
    QDRANT_URL = os.getenv('QDRANT_URL', 'http://localhost:6333')
    QDRANT_API_KEY = os.getenv('QDRANT_API_KEY', '')
    
    # Vector Search Provider (pinecone or qdrant)
    VECTOR_SEARCH_PROVIDER = os.getenv('VECTOR_SEARCH_PROVIDER', 'qdrant')
    
    # Embedding Model
    EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL', 'sentence-transformers/all-MiniLM-L6-v2')

