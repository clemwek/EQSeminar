from flask import Blueprint, request, jsonify
from app.models import Talk, Comment
from app.schemas import TalkSchema, CommentSchema
from app.db import db
from app.middleware import require_admin
from app.utils.file_upload import upload_file
from marshmallow import ValidationError

bp = Blueprint('talks', __name__)
talk_schema = TalkSchema()
comment_schema = CommentSchema()
comments_schema = CommentSchema(many=True)

@bp.route('/api/talks', methods=['POST'])
@require_admin
def create_talk():
    try:
        data = talk_schema.load(request.form.to_dict())
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    presentation_url = None
    if 'file' in request.files:
        file = request.files['file']
        if file.filename != '':
            try:
                presentation_url = upload_file(file)
            except ValueError as e:
                return jsonify({'error': str(e)}), 400

    talk = Talk(**data, presentation_url=presentation_url)
    db.session.add(talk)
    db.session.commit()

    return jsonify(talk_schema.dump(talk)), 201

@bp.route('/api/talks/<int:id>', methods=['GET'])
def get_talk(id):
    talk = Talk.query.get_or_404(id)
    return jsonify(talk_schema.dump(talk)), 200

@bp.route('/api/talks/<int:id>', methods=['PATCH'])
@require_admin
def update_talk(id):
    talk = Talk.query.get_or_404(id)

    try:
        data = talk_schema.load(request.form.to_dict(), partial=True)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    if 'file' in request.files:
        file = request.files['file']
        if file.filename != '':
            try:
                presentation_url = upload_file(file)
                data['presentation_url'] = presentation_url
            except ValueError as e:
                return jsonify({'error': str(e)}), 400

    for key, value in data.items():
        setattr(talk, key, value)

    db.session.commit()
    return jsonify(talk_schema.dump(talk)), 200

@bp.route('/api/talks/<int:id>/comments', methods=['POST'])
def create_comment(id):
    talk = Talk.query.get_or_404(id)

    try:
        data = request.json
        data['talkId'] = id
        validated_data = comment_schema.load(data)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    comment = Comment(**validated_data)
    db.session.add(comment)
    db.session.commit()

    return jsonify(comment_schema.dump(comment)), 201

@bp.route('/api/talks/<int:id>/comments', methods=['GET'])
def get_comments(id):
    talk = Talk.query.get_or_404(id)
    comments = Comment.query.filter_by(talk_id=id).order_by(Comment.created_at.asc()).all()
    return jsonify(comments_schema.dump(comments)), 200
