from flask import Blueprint, request, jsonify
from routes.auth import require_auth
from models import db, Tag

tags_bp = Blueprint('tags', __name__)

@tags_bp.route('', methods=['GET'])
@require_auth
def get_tags(user):
    """Get all tags for the user"""
    tags = Tag.query.filter_by(user_id=user.id).all()
    return jsonify([tag.to_dict() for tag in tags])

@tags_bp.route('', methods=['POST'])
@require_auth
def create_tag(user):
    """Create a new tag"""
    data = request.json
    
    # Check if tag already exists
    existing = Tag.query.filter_by(
        user_id=user.id,
        name=data.get('name')
    ).first()
    
    if existing:
        return jsonify(existing.to_dict())
    
    tag = Tag(
        user_id=user.id,
        name=data.get('name'),
        color=data.get('color', '#6c757d')
    )
    
    db.session.add(tag)
    db.session.commit()
    
    return jsonify(tag.to_dict()), 201

@tags_bp.route('/<int:tag_id>', methods=['PUT'])
@require_auth
def update_tag(user, tag_id):
    """Update a tag"""
    tag = Tag.query.filter_by(
        id=tag_id,
        user_id=user.id
    ).first_or_404()
    
    data = request.json
    
    if 'name' in data:
        tag.name = data['name']
    if 'color' in data:
        tag.color = data['color']
    
    db.session.commit()
    
    return jsonify(tag.to_dict())

@tags_bp.route('/<int:tag_id>', methods=['DELETE'])
@require_auth
def delete_tag(user, tag_id):
    """Delete a tag"""
    tag = Tag.query.filter_by(
        id=tag_id,
        user_id=user.id
    ).first_or_404()
    
    db.session.delete(tag)
    db.session.commit()
    
    return jsonify({'message': 'Tag deleted'})

def tag_to_dict(self):
    """Convert tag to dictionary"""
    return {
        'id': self.id,
        'name': self.name,
        'color': self.color,
        'created_at': self.created_at.isoformat()
    }

Tag.to_dict = tag_to_dict


