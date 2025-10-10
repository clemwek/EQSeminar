from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db import db

class Seminar(db.Model):
    __tablename__ = 'seminars'

    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    number_of_days = Column(Integer, nullable=False)
    start_date = Column(DateTime)
    status = Column(String(50), default='draft')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    talks = relationship('Talk', back_populates='seminar', cascade='all, delete-orphan')
    attendances = relationship('Attendance', back_populates='seminar', cascade='all, delete-orphan')

class Talk(db.Model):
    __tablename__ = 'talks'

    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    day = Column(Integer, nullable=False)
    speaker = Column(String(255), nullable=False)
    presentation_url = Column(String(512))
    time_slot = Column(String(50))
    seminar_id = Column(Integer, ForeignKey('seminars.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    seminar = relationship('Seminar', back_populates='talks')
    comments = relationship('Comment', back_populates='talk', cascade='all, delete-orphan')

class Member(db.Model):
    __tablename__ = 'members'

    id = Column(Integer, primary_key=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    pf_number = Column(String(12), unique=True, nullable=False)
    department = Column(String(100))
    phone_number = Column(String(15))
    created_at = Column(DateTime, default=datetime.utcnow)

    comments = relationship('Comment', back_populates='member')
    attendances = relationship('Attendance', back_populates='member')

class Comment(db.Model):
    __tablename__ = 'comments'

    id = Column(Integer, primary_key=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    talk_id = Column(Integer, ForeignKey('talks.id'), nullable=False)
    member_id = Column(Integer, ForeignKey('members.id'))
    comment_id = Column(Integer, ForeignKey('comments.id'))

    talk = relationship('Talk', back_populates='comments')
    member = relationship('Member', back_populates='comments')
    replies = relationship('Comment', backref='parent', remote_side=[id])

class Attendance(db.Model):
    __tablename__ = 'attendances'

    id = Column(Integer, primary_key=True)
    seminar_id = Column(Integer, ForeignKey('seminars.id'), nullable=False)
    day = Column(Integer, nullable=False)
    member_id = Column(Integer, ForeignKey('members.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String(45))
    location = Column(String(255))

    __table_args__ = (
        UniqueConstraint('member_id', 'seminar_id', 'day', name='unique_member_day_attendance'),
    )

    seminar = relationship('Seminar', back_populates='attendances')
    member = relationship('Member', back_populates='attendances')
