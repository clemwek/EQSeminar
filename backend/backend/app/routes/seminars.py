from flask import Blueprint, request, jsonify
from app.models import Seminar, Member
from app.schemas import SeminarSchema
from app.db import db
from app.middleware import require_admin
from marshmallow import ValidationError

bp = Blueprint('seminars', __name__)
seminar_schema = SeminarSchema()
seminars_schema = SeminarSchema(many=True)

@bp.route('/api/seminars', methods=['GET'])
def get_seminars():
    seminars = Seminar.query.all()
    return jsonify(seminars_schema.dump(seminars)), 200

@bp.route('/api/seminars/<int:id>', methods=['GET'])
def get_seminar(id):
    seminar = Seminar.query.get_or_404(id)
    return jsonify(seminar_schema.dump(seminar)), 200

@bp.route('/api/seminars', methods=['POST'])
@require_admin
def create_seminar():
    print(f"Received data: {request.json}")
    try:
        data = seminar_schema.load(request.json)
        print(f"Validated data: {data}")
    except ValidationError as err:
        print(f"Validation error: {err.messages}")
        return jsonify({'errors': err.messages}), 400

    seminar = Seminar(**data)
    db.session.add(seminar)
    db.session.commit()

    return jsonify(seminar_schema.dump(seminar)), 201

@bp.route('/api/seminars/<int:id>', methods=['PATCH'])
@require_admin
def update_seminar(id):
    seminar = Seminar.query.get_or_404(id)

    try:
        data = seminar_schema.load(request.json, partial=True)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    for key, value in data.items():
        setattr(seminar, key, value)

    db.session.commit()
    return jsonify(seminar_schema.dump(seminar)), 200

@bp.route('/api/seminars/<int:id>/register', methods=['GET'])
def get_registered_members(id):
    from app.schemas import MemberSchema
    from app.models import Attendance

    Seminar.query.get_or_404(id)
    member_schema = MemberSchema(many=True)

    member_ids = db.session.query(Attendance.member_id).filter(Attendance.seminar_id == id).distinct().all()
    members = Member.query.filter(Member.id.in_([m[0] for m in member_ids if m[0]])).all()

    return jsonify(member_schema.dump(members)), 200

@bp.route('/api/seminars/<int:id>/register', methods=['POST'])
@require_admin
def register_member(id):
    from app.models import Attendance

    seminar = Seminar.query.get_or_404(id)

    data = request.json
    member_id = data.get('memberId')

    if not member_id:
        return jsonify({'error': 'memberId is required'}), 400

    member = Member.query.get_or_404(member_id)

    # Create attendance records for each day of the seminar
    for day in range(1, seminar.number_of_days + 1):
        # Check if attendance already exists
        existing = Attendance.query.filter_by(
            member_id=member_id,
            seminar_id=id,
            day=day
        ).first()

        if not existing:
            attendance = Attendance(
                member_id=member_id,
                seminar_id=id,
                day=day
            )
            db.session.add(attendance)

    db.session.commit()

    return jsonify({'message': 'Member registered successfully'}), 200
