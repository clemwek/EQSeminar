from flask import Blueprint, request, jsonify
from app.models import Member
from app.schemas import MemberSchema
from app.db import db
from app.middleware import require_admin
from app.utils.csv_import import parse_members_file
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError

bp = Blueprint('members', __name__)
member_schema = MemberSchema()
members_schema = MemberSchema(many=True)

@bp.route('/api/members', methods=['GET'])
def get_members():
    members = Member.query.all()
    return jsonify(members_schema.dump(members)), 200

@bp.route('/api/members', methods=['POST'])
@require_admin
def create_member():
    try:
        data = member_schema.load(request.json)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    member = Member(**data)

    try:
        db.session.add(member)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Member with this PF number already exists'}), 409

    return jsonify(member_schema.dump(member)), 201

@bp.route('/api/members/import', methods=['POST'])
@require_admin
def import_members():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        members_data = parse_members_file(file)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    created_count = 0
    skipped_count = 0
    errors = []

    for member_data in members_data:
        try:
            validated_data = member_schema.load(member_data)
            member = Member(**validated_data)
            db.session.add(member)
            db.session.commit()
            created_count += 1
        except ValidationError as err:
            errors.append({
                'pf_number': member_data.get('pf_number'),
                'errors': err.messages
            })
            skipped_count += 1
        except IntegrityError:
            db.session.rollback()
            skipped_count += 1

    return jsonify({
        'message': f'Import completed. Created: {created_count}, Skipped: {skipped_count}',
        'created': created_count,
        'skipped': skipped_count,
        'errors': errors
    }), 200
