from flask import Blueprint, request, jsonify, send_file
from app.models import Attendance, Member, Seminar
from app.schemas import AttendanceSchema, SignInSchema
from app.db import db
from app.middleware import require_admin
from app.utils.csv_import import export_attendance_to_excel
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError

bp = Blueprint('attendance', __name__)
attendance_schema = AttendanceSchema()
attendances_schema = AttendanceSchema(many=True)
signin_schema = SignInSchema()

@bp.route('/api/attendance', methods=['GET'])
def get_attendance():
    seminar_id = request.args.get('seminarId')
    day = request.args.get('day')

    query = Attendance.query

    if seminar_id:
        query = query.filter_by(seminar_id=seminar_id)

    if day:
        query = query.filter_by(day=day)

    attendance_records = query.all()
    return jsonify(attendances_schema.dump(attendance_records)), 200

@bp.route('/api/attendance/sign-in', methods=['POST'])
def sign_in():
    try:
        data = signin_schema.load(request.json)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    pf_number = data.get('pf_number')
    day = data.get('day_id')
    seminar_id = data.get('seminar_id')

    member = Member.query.filter_by(pf_number=pf_number).first()
    if not member:
        return jsonify({'error': 'Member not found'}), 404

    seminar = Seminar.query.get_or_404(seminar_id)

    existing = Attendance.query.filter_by(
        member_id=member.id,
        seminar_id=seminar_id,
        day=day
    ).first()

    if existing:
        return jsonify({'error': 'Already signed in for this day'}), 409

    ip_address = request.headers.get('X-Forwarded-For', request.remote_addr)
    location = request.headers.get('X-Location', '')

    attendance = Attendance(
        member_id=member.id,
        seminar_id=seminar_id,
        day=day,
        ip_address=ip_address,
        location=location
    )

    try:
        db.session.add(attendance)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Already signed in for this day'}), 409

    return jsonify(attendance_schema.dump(attendance)), 201

@bp.route('/api/attendance/export', methods=['GET'])
@require_admin
def export_attendance():
    seminar_id = request.args.get('seminarId')

    if not seminar_id:
        return jsonify({'error': 'seminarId is required'}), 400

    seminar = Seminar.query.get_or_404(seminar_id)

    # Get all registered members for this seminar
    member_ids = db.session.query(Attendance.member_id).filter(
        Attendance.seminar_id == seminar_id
    ).distinct().all()
    member_ids = [m[0] for m in member_ids if m[0]]

    if not member_ids:
        return jsonify({'error': 'No registered members found'}), 404

    registered_members = Member.query.filter(Member.id.in_(member_ids)).all()

    # Get all attendance records for this seminar
    attendance_records = Attendance.query.filter_by(seminar_id=seminar_id).all()

    excel_file = export_attendance_to_excel(seminar, registered_members, attendance_records)

    return send_file(
        excel_file,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name=f'{seminar.title}_attendance.xlsx'
    )
