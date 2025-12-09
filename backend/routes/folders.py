from flask import Blueprint, request, jsonify
from routes.auth import require_auth
from models import db, Folder
from datetime import datetime

folders_bp = Blueprint('folders', __name__)

@folders_bp.route('', methods=['GET'])
@require_auth
def get_folders(user):
    """Get all folders for the user"""
    folders = Folder.query.filter_by(user_id=user.id).all()
    return jsonify([folder.to_dict() for folder in folders])

@folders_bp.route('', methods=['POST'])
@require_auth
def create_folder(user):
    """Create a new folder"""
    data = request.json
    
    folder = Folder(
        user_id=user.id,
        name=data.get('name'),
        parent_id=data.get('parent_id'),
        color=data.get('color', '#667eea')
    )
    
    db.session.add(folder)
    db.session.commit()
    
    return jsonify(folder.to_dict()), 201

@folders_bp.route('/<int:folder_id>', methods=['PUT'])
@require_auth
def update_folder(user, folder_id):
    """Update a folder"""
    folder = Folder.query.filter_by(
        id=folder_id,
        user_id=user.id
    ).first_or_404()
    
    data = request.json
    
    if 'name' in data:
        folder.name = data['name']
    if 'parent_id' in data:
        folder.parent_id = data['parent_id']
    if 'color' in data:
        folder.color = data['color']
    
    folder.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(folder.to_dict())

@folders_bp.route('/<int:folder_id>', methods=['DELETE'])
@require_auth
def delete_folder(user, folder_id):
    """Delete a folder"""
    folder = Folder.query.filter_by(
        id=folder_id,
        user_id=user.id
    ).first_or_404()
    
    db.session.delete(folder)
    db.session.commit()
    
    return jsonify({'message': 'Folder deleted'})

def folder_to_dict(self):
    """Convert folder to dictionary"""
    return {
        'id': self.id,
        'name': self.name,
        'parent_id': self.parent_id,
        'color': self.color,
        'created_at': self.created_at.isoformat(),
        'updated_at': self.updated_at.isoformat()
    }

Folder.to_dict = folder_to_dict


