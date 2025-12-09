import os
import sys
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import Config
from models import db
from routes.auth import auth_bp
from routes.chat import chat_bp
from routes.conversations import conversations_bp
from routes.folders import folders_bp
from routes.tags import tags_bp
from routes.export import export_bp
from routes.search import search_bp
from routes.stats import stats_bp
from routes.api_keys import api_keys_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    CORS(app, origins=app.config['CORS_ORIGINS'])
    migrate = Migrate(app, db)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(conversations_bp, url_prefix='/api/conversations')
    app.register_blueprint(folders_bp, url_prefix='/api/folders')
    app.register_blueprint(tags_bp, url_prefix='/api/tags')
    app.register_blueprint(export_bp, url_prefix='/api/export')
    app.register_blueprint(search_bp, url_prefix='/api/search')
    app.register_blueprint(stats_bp, url_prefix='/api/stats')
    app.register_blueprint(api_keys_bp, url_prefix='/api/api-keys')
    
    # Health check
    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'message': 'AI Chat History Manager API'}
    
    # Create tables (only if database is available)
    with app.app_context():
        try:
            db.create_all()
        except Exception as e:
            print(f"Warning: Could not create database tables: {e}")
            print("Make sure PostgreSQL is running and DATABASE_URL is correct in .env")
    
    return app

# App instance for Flask CLI
app = create_app()

if __name__ == '__main__':
    import os
    port = int(os.getenv('PORT', 5001))  # Default to 5001 to avoid AirPlay conflict
    app.run(debug=True, host='0.0.0.0', port=port)

