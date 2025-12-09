from flask import Blueprint, request, jsonify, current_app
from routes.auth import require_auth, get_user_from_token
from models import db, Conversation, Message, APIKey
from services.ai_service import AIService
from datetime import datetime
import json

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/send', methods=['POST'])
@require_auth
def send_message(user):
    """Send a message to an AI model and get response"""
    data = request.json
    
    conversation_id = data.get('conversation_id')
    platform = data.get('platform')  # openai, anthropic, google
    model = data.get('model')
    message = data.get('message')
    folder_id = data.get('folder_id')
    
    if not all([platform, model, message]):
        return jsonify({'error': 'platform, model, and message are required'}), 400
    
    # Get user's API key for the platform
    api_key_record = APIKey.query.filter_by(
        user_id=user.id,
        platform=platform,
        is_active=True
    ).first()
    
    if not api_key_record:
        return jsonify({'error': f'API key not configured for {platform}'}), 400
    
    # Get or create conversation
    if conversation_id:
        conversation = Conversation.query.filter_by(
            id=conversation_id,
            user_id=user.id
        ).first()
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
    else:
        conversation = Conversation(
            user_id=user.id,
            platform=platform,
            model=model,
            folder_id=folder_id,
            title=message[:100] if message else 'New Conversation'
        )
        db.session.add(conversation)
        db.session.flush()
    
    # Save user message
    user_message = Message(
        conversation_id=conversation.id,
        role='user',
        content=message
    )
    db.session.add(user_message)
    db.session.flush()
    
    # Get conversation history for context
    previous_messages = Message.query.filter_by(
        conversation_id=conversation.id
    ).order_by(Message.created_at.asc()).all()
    
    # Prepare messages for AI API
    messages_for_ai = [
        {'role': msg.role, 'content': msg.content}
        for msg in previous_messages
    ]
    
    # Call AI service
    ai_service = AIService()
    try:
        response_data = ai_service.send_message(
            platform=platform,
            model=model,
            api_key=api_key_record.api_key,
            messages=messages_for_ai
        )
        
        # Save assistant response
        assistant_message = Message(
            conversation_id=conversation.id,
            role='assistant',
            content=response_data['content'],
            tokens=response_data.get('tokens'),
            cost=response_data.get('cost'),
            message_metadata=json.dumps(response_data.get('metadata', {}))
        )
        db.session.add(assistant_message)
        
        # Update conversation stats
        conversation.total_tokens = (conversation.total_tokens or 0) + (response_data.get('tokens', 0) or 0)
        conversation.total_cost = (conversation.total_cost or 0) + (response_data.get('cost', 0) or 0)
        conversation.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'conversation_id': conversation.id,
            'message': {
                'id': assistant_message.id,
                'role': assistant_message.role,
                'content': assistant_message.content,
                'tokens': assistant_message.tokens,
                'created_at': assistant_message.created_at.isoformat()
            }
        })
        
    except Exception as e:
        db.session.rollback()
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in send_message: {str(e)}")
        print(error_trace)
        return jsonify({'error': str(e), 'details': error_trace if current_app.debug else None}), 500

@chat_bp.route('/models', methods=['GET'])
@require_auth
def get_available_models(user):
    """Get available models for each platform"""
    from services.ai_service import AIService
    
    # Get Google models dynamically if API key is available
    # Start with gemini-pro as it's the most widely supported
    google_models = [
        {'id': 'gemini-pro', 'name': 'Gemini Pro (Recommended)'},
        {'id': 'gemini-1.5-pro', 'name': 'Gemini 1.5 Pro'},
        {'id': 'gemini-1.5-flash', 'name': 'Gemini 1.5 Flash'},
        {'id': 'gemini-1.5-pro-latest', 'name': 'Gemini 1.5 Pro (Latest)'},
        {'id': 'gemini-1.5-flash-latest', 'name': 'Gemini 1.5 Flash (Latest)'},
        {'id': 'gemini-2.0-flash-exp', 'name': 'Gemini 2.0 Flash (Experimental)'}
    ]
    
    # Try to get actual available models from Google API
    api_key_record = APIKey.query.filter_by(
        user_id=user.id,
        platform='google',
        is_active=True
    ).first()
    
    if api_key_record:
        try:
            ai_service = AIService()
            available_models = ai_service._list_google_models(api_key_record.api_key)
            if available_models:
                # Replace with actual available models
                google_models = [{'id': m, 'name': m.replace('gemini-', 'Gemini ').title()} for m in available_models]
        except Exception as e:
            print(f"Could not fetch Google models: {e}")
    
    return jsonify({
        'openai': [
            {'id': 'gpt-4-turbo-preview', 'name': 'GPT-4 Turbo'},
            {'id': 'gpt-4', 'name': 'GPT-4'},
            {'id': 'gpt-3.5-turbo', 'name': 'GPT-3.5 Turbo'}
        ],
        'anthropic': [
            {'id': 'claude-3-opus-20240229', 'name': 'Claude 3 Opus'},
            {'id': 'claude-3-sonnet-20240229', 'name': 'Claude 3 Sonnet'},
            {'id': 'claude-3-haiku-20240307', 'name': 'Claude 3 Haiku'}
        ],
        'google': google_models
    })

