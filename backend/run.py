#!/usr/bin/env python
"""Run the Flask application"""
import os
from app import create_app

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))  # Default to 5001 to avoid AirPlay conflict
    app.run(debug=True, host='0.0.0.0', port=port)

