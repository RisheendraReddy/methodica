from flask import Blueprint, request, jsonify, Response
from routes.auth import require_auth
from models import Conversation, Message
import json
import csv
import io

export_bp = Blueprint('export', __name__)

@export_bp.route('/conversation/<int:conversation_id>', methods=['GET'])
@require_auth
def export_conversation(user, conversation_id):
    """Export a conversation in various formats"""
    format_type = request.args.get('format', 'json')  # json, csv, markdown
    
    conversation = Conversation.query.filter_by(
        id=conversation_id,
        user_id=user.id
    ).first_or_404()
    
    if format_type == 'json':
        return jsonify(conversation.to_dict(include_messages=True))
    
    elif format_type == 'csv':
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['Role', 'Content', 'Tokens', 'Created At'])
        
        for message in conversation.messages:
            writer.writerow([
                message.role,
                message.content,
                message.tokens or '',
                message.created_at.isoformat()
            ])
        
        return Response(
            output.getvalue(),
            mimetype='text/csv',
            headers={'Content-Disposition': f'attachment; filename=conversation_{conversation_id}.csv'}
        )
    
    elif format_type == 'markdown':
        md = f"# {conversation.title or 'Untitled Conversation'}\n\n"
        md += f"**Platform:** {conversation.platform}  \n"
        md += f"**Model:** {conversation.model}  \n"
        md += f"**Created:** {conversation.created_at.isoformat()}  \n\n"
        md += "---\n\n"
        
        for message in conversation.messages:
            role_emoji = "👤" if message.role == "user" else "🤖"
            md += f"## {role_emoji} {message.role.capitalize()}\n\n"
            md += f"{message.content}\n\n"
            md += "---\n\n"
        
        return Response(
            md,
            mimetype='text/markdown',
            headers={'Content-Disposition': f'attachment; filename=conversation_{conversation_id}.md'}
        )
    
    else:
        return jsonify({'error': 'Invalid format'}), 400

@export_bp.route('/bulk', methods=['POST'])
@require_auth
def export_bulk(user):
    """Export multiple conversations"""
    data = request.json
    conversation_ids = data.get('conversation_ids', [])
    format_type = data.get('format', 'json')
    
    conversations = Conversation.query.filter(
        Conversation.id.in_(conversation_ids),
        Conversation.user_id == user.id
    ).all()
    
    if format_type == 'json':
        return jsonify({
            'conversations': [conv.to_dict(include_messages=True) for conv in conversations]
        })
    
    elif format_type == 'markdown':
        md = "# Exported Conversations\n\n"
        for conv in conversations:
            md += f"## {conv.title or f'Conversation {conv.id}'}\n\n"
            md += f"**Platform:** {conv.platform} | **Model:** {conv.model}  \n\n"
            for msg in conv.messages:
                role_emoji = "👤" if msg.role == "user" else "🤖"
                md += f"### {role_emoji} {msg.role.capitalize()}\n\n{msg.content}\n\n"
            md += "---\n\n"
        
        return Response(
            md,
            mimetype='text/markdown',
            headers={'Content-Disposition': 'attachment; filename=conversations_export.md'}
        )
    
    else:
        return jsonify({'error': 'Invalid format'}), 400


