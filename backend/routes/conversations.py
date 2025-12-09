from flask import Blueprint, request, jsonify
from routes.auth import require_auth
from models import db, Conversation, Message, Tag
from sqlalchemy import or_, func
from datetime import datetime

conversations_bp = Blueprint('conversations', __name__)

@conversations_bp.route('', methods=['GET'])
@require_auth
def get_conversations(user):
    """Get all conversations for the user"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    folder_id = request.args.get('folder_id', type=int)
    tag_id = request.args.get('tag_id', type=int)
    platform = request.args.get('platform')
    model = request.args.get('model')
    search = request.args.get('search')
    
    query = Conversation.query.filter_by(user_id=user.id)
    
    # Filters
    if folder_id:
        query = query.filter_by(folder_id=folder_id)
    
    if tag_id:
        query = query.join(Conversation.tags).filter(Tag.id == tag_id)
    
    if platform:
        query = query.filter_by(platform=platform)
    
    if model:
        query = query.filter_by(model=model)
    
    if search:
        query = query.join(Message).filter(
            or_(
                Conversation.title.ilike(f'%{search}%'),
                Message.content.ilike(f'%{search}%')
            )
        )
    
    # Get total count
    total = query.count()
    
    # Paginate
    conversations = query.order_by(Conversation.updated_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'conversations': [conv.to_dict() for conv in conversations.items],
        'total': total,
        'page': page,
        'per_page': per_page,
        'pages': conversations.pages
    })

@conversations_bp.route('/<int:conversation_id>', methods=['GET'])
@require_auth
def get_conversation(user, conversation_id):
    """Get a specific conversation with messages"""
    conversation = Conversation.query.filter_by(
        id=conversation_id,
        user_id=user.id
    ).first_or_404()
    
    return jsonify(conversation.to_dict(include_messages=True))

@conversations_bp.route('/<int:conversation_id>', methods=['PUT'])
@require_auth
def update_conversation(user, conversation_id):
    """Update conversation metadata"""
    conversation = Conversation.query.filter_by(
        id=conversation_id,
        user_id=user.id
    ).first_or_404()
    
    data = request.json
    
    if 'title' in data:
        conversation.title = data['title']
    if 'folder_id' in data:
        conversation.folder_id = data['folder_id']
    if 'tags' in data:
        tag_ids = data['tags']
        tags = Tag.query.filter(
            Tag.id.in_(tag_ids),
            Tag.user_id == user.id
        ).all()
        conversation.tags = tags
    
    conversation.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(conversation.to_dict())

@conversations_bp.route('/<int:conversation_id>', methods=['DELETE'])
@require_auth
def delete_conversation(user, conversation_id):
    """Delete a conversation"""
    conversation = Conversation.query.filter_by(
        id=conversation_id,
        user_id=user.id
    ).first_or_404()
    
    db.session.delete(conversation)
    db.session.commit()
    
    return jsonify({'message': 'Conversation deleted'})

@conversations_bp.route('/compare', methods=['POST'])
@require_auth
def compare_conversations(user):
    """Compare multiple conversations side by side"""
    conversation_ids = request.json.get('conversation_ids', [])
    
    conversations = Conversation.query.filter(
        Conversation.id.in_(conversation_ids),
        Conversation.user_id == user.id
    ).all()
    
    return jsonify({
        'conversations': [conv.to_dict(include_messages=True) for conv in conversations]
    })

# Add to_dict method to Conversation model
def conversation_to_dict(self, include_messages=False):
    """Convert conversation to dictionary"""
    data = {
        'id': self.id,
        'title': self.title,
        'platform': self.platform,
        'model': self.model,
        'folder_id': self.folder_id,
        'total_tokens': self.total_tokens,
        'total_cost': float(self.total_cost) if self.total_cost else 0,
        'tags': [{'id': tag.id, 'name': tag.name, 'color': tag.color} for tag in self.tags],
        'created_at': self.created_at.isoformat(),
        'updated_at': self.updated_at.isoformat()
    }
    
    if include_messages:
        data['messages'] = [
            {
                'id': msg.id,
                'role': msg.role,
                'content': msg.content,
                'tokens': msg.tokens,
                'cost': float(msg.cost) if msg.cost else 0,
                'created_at': msg.created_at.isoformat()
            }
            for msg in self.messages
        ]
    
    return data

# Attach method to Conversation model
Conversation.to_dict = conversation_to_dict


