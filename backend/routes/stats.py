from flask import Blueprint, request, jsonify
from routes.auth import require_auth
from models import db, Conversation, Message
from sqlalchemy import func, extract

stats_bp = Blueprint('stats', __name__)

@stats_bp.route('', methods=['GET'])
@require_auth
def get_stats(user):
    """Get user statistics"""
    
    # Total conversations
    total_conversations = Conversation.query.filter_by(user_id=user.id).count()
    
    # Total messages
    total_messages = Message.query.join(Conversation).filter(
        Conversation.user_id == user.id
    ).count()
    
    # Total tokens
    total_tokens = db.session.query(func.sum(Conversation.total_tokens)).filter_by(
        user_id=user.id
    ).scalar() or 0
    
    # Total cost
    total_cost = db.session.query(func.sum(Conversation.total_cost)).filter_by(
        user_id=user.id
    ).scalar() or 0
    
    # By platform
    by_platform = db.session.query(
        Conversation.platform,
        func.count(Conversation.id).label('count'),
        func.sum(Conversation.total_tokens).label('tokens'),
        func.sum(Conversation.total_cost).label('cost')
    ).filter_by(user_id=user.id).group_by(Conversation.platform).all()
    
    # By model
    by_model = db.session.query(
        Conversation.model,
        func.count(Conversation.id).label('count'),
        func.sum(Conversation.total_tokens).label('tokens'),
        func.sum(Conversation.total_cost).label('cost')
    ).filter_by(user_id=user.id).group_by(Conversation.model).all()
    
    # Monthly usage
    monthly_usage = db.session.query(
        extract('year', Conversation.created_at).label('year'),
        extract('month', Conversation.created_at).label('month'),
        func.count(Conversation.id).label('conversations'),
        func.sum(Conversation.total_tokens).label('tokens'),
        func.sum(Conversation.total_cost).label('cost')
    ).filter_by(user_id=user.id).group_by(
        extract('year', Conversation.created_at),
        extract('month', Conversation.created_at)
    ).order_by('year', 'month').all()
    
    return jsonify({
        'total_conversations': total_conversations,
        'total_messages': total_messages,
        'total_tokens': int(total_tokens),
        'total_cost': float(total_cost) if total_cost else 0,
        'by_platform': [
            {
                'platform': p[0],
                'count': p[1],
                'tokens': int(p[2] or 0),
                'cost': float(p[3] or 0)
            }
            for p in by_platform
        ],
        'by_model': [
            {
                'model': m[0],
                'count': m[1],
                'tokens': int(m[2] or 0),
                'cost': float(m[3] or 0)
            }
            for m in by_model
        ],
        'monthly_usage': [
            {
                'year': int(m[0]),
                'month': int(m[1]),
                'conversations': m[2],
                'tokens': int(m[3] or 0),
                'cost': float(m[4] or 0)
            }
            for m in monthly_usage
        ]
    })


