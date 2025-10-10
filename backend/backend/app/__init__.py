from flask import Flask, jsonify
from flask_cors import CORS
from app.db import init_db
from app.routes import seminars, members, talks, attendance
import os

def create_app():
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

    CORS(app)

    init_db(app)

    @app.route('/health', methods=['GET'])
    def health():
        return jsonify({'ok': True}), 200

    app.register_blueprint(seminars.bp)
    app.register_blueprint(members.bp)
    app.register_blueprint(talks.bp)
    app.register_blueprint(attendance.bp)

    return app
