from marshmallow import Schema, fields, validates, ValidationError
import re

class SeminarSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True)
    description = fields.Str(allow_none=True)
    number_of_days = fields.Int(required=True, data_key='numberOfDays', attribute='number_of_days')
    start_date = fields.Date(allow_none=True, data_key='startDate', attribute='start_date')
    status = fields.Str()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    talks = fields.List(fields.Nested('TalkSchema', exclude=('seminar',)), dump_only=True)

class TalkSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True)
    description = fields.Str(allow_none=True)
    day = fields.Int(required=True)
    speaker = fields.Str(required=True)
    presentation_url = fields.Str(dump_only=True, data_key='presentationUrl', attribute='presentation_url')
    time_slot = fields.Str(allow_none=True, data_key='timeSlot', attribute='time_slot')
    seminar_id = fields.Int(required=True, data_key='seminarId', attribute='seminar_id')
    created_at = fields.DateTime(dump_only=True, data_key='createdAt', attribute='created_at')
    seminar = fields.Nested('SeminarSchema', exclude=('talks',), dump_only=True)

    @validates('day')
    def validate_day(self, value):
        if value < 1:
            raise ValidationError('Day must be greater than 0')

class MemberSchema(Schema):
    id = fields.Int(dump_only=True)
    first_name = fields.Str(required=True, data_key='firstName', attribute='first_name')
    last_name = fields.Str(required=True, data_key='lastName', attribute='last_name')
    pf_number = fields.Str(required=True, data_key='pfNumber', attribute='pf_number')
    department = fields.Str(allow_none=True)
    phone_number = fields.Str(allow_none=True, data_key='phoneNumber', attribute='phone_number')
    created_at = fields.DateTime(dump_only=True)

    @validates('pf_number')
    def validate_pf_number(self, value):
        if not re.match(r'^\d{4,12}$', value):
            raise ValidationError('PF number must be 4-12 digits')

    @validates('phone_number')
    def validate_phone_number(self, value):
        if value and not re.match(r'^\d{7,15}$', value):
            raise ValidationError('Phone number must be 7-15 digits')

class CommentSchema(Schema):
    id = fields.Int(dump_only=True)
    content = fields.Str(required=True)
    created_at = fields.DateTime(dump_only=True)
    talk_id = fields.Int(required=True, data_key='talkId', attribute='talk_id')
    member_id = fields.Int(allow_none=True, data_key='memberId', attribute='member_id')
    comment_id = fields.Int(allow_none=True, data_key='commentId', attribute='comment_id')
    member = fields.Nested(MemberSchema, exclude=('phone_number', 'department'), dump_only=True)

class AttendanceSchema(Schema):
    id = fields.Int(dump_only=True)
    seminar_id = fields.Int(required=True, data_key='seminarId', attribute='seminar_id')
    day = fields.Int(required=True)
    member_id = fields.Int(required=True, data_key='memberId', attribute='member_id')
    created_at = fields.DateTime(dump_only=True)
    ip_address = fields.Str(dump_only=True)
    location = fields.Str(dump_only=True)
    member = fields.Nested(MemberSchema, dump_only=True)

class SignInSchema(Schema):
    pf_number = fields.Str(required=True, data_key='pfNumber')
    day_id = fields.Int(required=True, data_key='dayId')
    seminar_id = fields.Int(required=True, data_key='seminarId')
