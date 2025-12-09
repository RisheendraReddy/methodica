from flask import Blueprint, request, jsonify
from routes.auth import require_auth
from models import db, Message, Conversation
from services.vector_search import VectorSearchService

search_bp = Blueprint('search', __name__)

@search_bp.route('/semantic', methods=['POST'])
@require_auth
def semantic_search(user):
    """Semantic search across all conversations"""
    data = request.json
    query = data.get('query')
    limit = data.get('limit', 10)
    
    if not query:
        return jsonify({'error': 'Query is required'}), 400
    
    vector_service = VectorSearchService()
    
    try:
        results = vector_service.search(user.id, query, limit)
        
        # Get full conversation context for each result
        message_ids = [r['message_id'] for r in results]
        messages = Message.query.filter(Message.id.in_(message_ids)).all()
        
        # Group by conversation
        conversation_ids = set(msg.conversation_id for msg in messages)
        conversations = Conversation.query.filter(
            Conversation.id.in_(conversation_ids),
            Conversation.user_id == user.id
        ).all()
        
        conv_dict = {conv.id: conv for conv in conversations}
        
        search_results = []
        for result in results:
            msg = next((m for m in messages if m.id == result['message_id']), None)
            if msg and msg.conversation_id in conv_dict:
                search_results.append({
                    'message_id': msg.id,
                    'conversation_id': msg.conversation_id,
                    'conversation_title': conv_dict[msg.conversation_id].title,
                    'content': msg.content[:200] + '...' if len(msg.content) > 200 else msg.content,
                    'role': msg.role,
                    'score': result.get('score', 0),
                    'created_at': msg.created_at.isoformat()
                })
        
        return jsonify({'results': search_results})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@search_bp.route('/text', methods=['GET'])
@require_auth
def text_search(user):
    """Full-text search across conversations"""
    query = request.args.get('q')
    limit = request.args.get('limit', 20, type=int)
    
    if not query:
        return jsonify({'error': 'Query parameter q is required'}), 400
    
    # Simple text search
    messages = Message.query.join(Conversation).filter(
        Conversation.user_id == user.id,
        Message.content.ilike(f'%{query}%')
    ).limit(limit).all()
    
    results = []
    for msg in messages:
        results.append({
            'message_id': msg.id,
            'conversation_id': msg.conversation_id,
            'conversation_title': msg.conversation.title,
            'content': msg.content[:200] + '...' if len(msg.content) > 200 else msg.content,
            'role': msg.role,
            'created_at': msg.created_at.isoformat()
        })
    
    return jsonify({'results': results})


