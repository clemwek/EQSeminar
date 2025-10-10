#!/usr/bin/env python
import os
from flask import Flask
from flask_migrate import upgrade
from app.db import db, migrate

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
migrate.init_app(app, db)

with app.app_context():
    upgrade()
    print("Migrations applied successfully!")
