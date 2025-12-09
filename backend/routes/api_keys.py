from flask import Blueprint, request, jsonify
from routes.auth import require_auth
from models import db, APIKey
from datetime import datetime

api_keys_bp = Blueprint('api_keys', __name__)

@api_keys_bp.route('', methods=['GET'])
@require_auth
def get_api_keys(user):
    """Get all API keys for the user (without exposing the actual keys)"""
    keys = APIKey.query.filter_by(user_id=user.id).all()
    return jsonify([{
        'id': key.id,
        'platform': key.platform,
        'is_active': key.is_active,
        'created_at': key.created_at.isoformat()
    } for key in keys])

@api_keys_bp.route('', methods=['POST'])
@require_auth
def create_api_key(user):
    """Create or update an API key"""
    data = request.json
    platform = data.get('platform')
    api_key = data.get('api_key')
    
    if not platform or not api_key:
        return jsonify({'error': 'platform and api_key are required'}), 400
    
    # Check if key exists
    existing = APIKey.query.filter_by(
        user_id=user.id,
        platform=platform
    ).first()
    
    if existing:
        existing.api_key = api_key
        existing.is_active = True
        existing.updated_at = datetime.utcnow()
    else:
        existing = APIKey(
            user_id=user.id,
            platform=platform,
            api_key=api_key
        )
        db.session.add(existing)
    
    db.session.commit()
    
    return jsonify({
        'id': existing.id,
        'platform': existing.platform,
        'is_active': existing.is_active
    }), 201

@api_keys_bp.route('/<int:key_id>', methods=['DELETE'])
@require_auth
def delete_api_key(user, key_id):
    """Delete an API key"""
    key = APIKey.query.filter_by(
        id=key_id,
        user_id=user.id
    ).first_or_404()
    
    db.session.delete(key)
    db.session.commit()
    
    return jsonify({'message': 'API key deleted'})

@api_keys_bp.route('/<int:key_id>/toggle', methods=['PUT'])
@require_auth
def toggle_api_key(user, key_id):
    """Toggle API key active status"""
    key = APIKey.query.filter_by(
        id=key_id,
        user_id=user.id
    ).first_or_404()
    
    key.is_active = not key.is_active
    key.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'id': key.id,
        'platform': key.platform,
        'is_active': key.is_active
    })


