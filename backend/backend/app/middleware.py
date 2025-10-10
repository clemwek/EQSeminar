from functools import wraps
from flask import request, jsonify
import os

def require_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        admin_token = request.headers.get('x-admin-token')
        expected_token = os.getenv('ADMIN_TOKEN')

        if not admin_token or admin_token != expected_token:
            return jsonify({'error': 'Unauthorized'}), 401

        return f(*args, **kwargs)
    return decorated_function
