from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy import JSON  # Works with both SQLite and PostgreSQL

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(128), primary_key=True)  # Firebase UID
    email = db.Column(db.String(255), unique=True, nullable=False)
    name = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    conversations = db.relationship('Conversation', backref='user', lazy=True, cascade='all, delete-orphan')
    folders = db.relationship('Folder', backref='user', lazy=True, cascade='all, delete-orphan')
    api_keys = db.relationship('APIKey', backref='user', lazy=True, cascade='all, delete-orphan')

class APIKey(db.Model):
    __tablename__ = 'api_keys'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(128), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    platform = db.Column(db.String(50), nullable=False)  # openai, anthropic, google
    api_key = db.Column(db.Text, nullable=False)  # Encrypted in production
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'platform', name='unique_user_platform'),)

class Folder(db.Model):
    __tablename__ = 'folders'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(128), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('folders.id', ondelete='CASCADE'), nullable=True)
    color = db.Column(db.String(7))  # Hex color code
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    conversations = db.relationship('Conversation', backref='folder', lazy=True)
    children = db.relationship('Folder', backref=db.backref('parent', remote_side=[id]), lazy=True)

class Tag(db.Model):
    __tablename__ = 'tags'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(128), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    color = db.Column(db.String(7))  # Hex color code
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'name', name='unique_user_tag'),)

class Conversation(db.Model):
    __tablename__ = 'conversations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(128), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    folder_id = db.Column(db.Integer, db.ForeignKey('folders.id', ondelete='SET NULL'), nullable=True)
    title = db.Column(db.String(500))
    platform = db.Column(db.String(50), nullable=False)  # openai, anthropic, google
    model = db.Column(db.String(100), nullable=False)  # gpt-4, claude-3-opus, gemini-pro
    total_tokens = db.Column(db.Integer, default=0)
    total_cost = db.Column(db.Numeric(10, 6), default=0)  # Cost in USD
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    messages = db.relationship('Message', backref='conversation', lazy=True, cascade='all, delete-orphan', order_by='Message.created_at')
    tags = db.relationship('Tag', secondary='conversation_tags', lazy='subquery', backref=db.backref('conversations', lazy=True))

# Association table for many-to-many relationship
conversation_tags = db.Table('conversation_tags',
    db.Column('conversation_id', db.Integer, db.ForeignKey('conversations.id', ondelete='CASCADE'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True)
)

class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversations.id', ondelete='CASCADE'), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # user, assistant, system
    content = db.Column(db.Text, nullable=False)
    tokens = db.Column(db.Integer)
    cost = db.Column(db.Numeric(10, 6))  # Cost in USD
    message_metadata = db.Column(JSON)  # Additional metadata (model version, etc.) - renamed from 'metadata' (reserved)
    # Embedding: Use JSON for both SQLite and PostgreSQL (compatible with both)
    embedding = db.Column(JSON)  # Vector embedding for search (stored as JSON array)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class SearchIndex(db.Model):
    __tablename__ = 'search_index'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(128), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    message_id = db.Column(db.Integer, db.ForeignKey('messages.id', ondelete='CASCADE'), nullable=False)
    vector_id = db.Column(db.String(255))  # ID in vector database (Pinecone/Qdrant)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

