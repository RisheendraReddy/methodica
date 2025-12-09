from flask import Blueprint, request, jsonify
from functools import wraps
import jwt
from models import db, User
from config import Config

auth_bp = Blueprint('auth', __name__)

def get_user_from_token():
    """Extract user from Firebase JWT token or mock token"""
    token = request.headers.get('Authorization')
    if not token:
        return None
    
    try:
        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]
        
        # Handle mock tokens for development
        if token.startswith('mock_token_'):
            # Extract user ID from mock token (format: mock_token_1234567890)
            # For simplicity, use a consistent user ID for mock tokens
            user_id = 'demo_user_123'
            
            # Get or create demo user
            user = User.query.get(user_id)
            if not user:
                user = User(
                    id=user_id,
                    email='demo@example.com',
                    name='Demo User'
                )
                db.session.add(user)
                db.session.commit()
            
            return user
        
        # Try to decode as JWT (for real Firebase tokens)
        try:
            decoded = jwt.decode(token, options={"verify_signature": False})
            user_id = decoded.get('user_id') or decoded.get('sub')
            
            if not user_id:
                return None
            
            # Get or create user
            user = User.query.get(user_id)
            if not user:
                user = User(
                    id=user_id,
                    email=decoded.get('email', ''),
                    name=decoded.get('name', '')
                )
                db.session.add(user)
                db.session.commit()
            
            return user
        except jwt.DecodeError:
            # Not a valid JWT, might be a different token format
            return None
        
    except Exception as e:
        print(f"Auth error: {e}")
        return None

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_user_from_token()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        return f(user, *args, **kwargs)
    return decorated_function

@auth_bp.route('/me', methods=['GET'])
@require_auth
def get_current_user(user):
    """Get current authenticated user"""
    return jsonify({
        'id': user.id,
        'email': user.email,
        'name': user.name,
        'created_at': user.created_at.isoformat()
    })

@auth_bp.route('/verify', methods=['POST'])
def verify_token():
    """Verify Firebase token and return user info"""
    user = get_user_from_token()
    if not user:
        return jsonify({'error': 'Invalid token'}), 401
    
    return jsonify({
        'id': user.id,
        'email': user.email,
        'name': user.name
    })

