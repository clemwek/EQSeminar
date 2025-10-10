"""Initial migration

Revision ID: 001
Revises:
Create Date: 2025-10-05 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('seminars',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('number_of_days', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('members',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('first_name', sa.String(length=100), nullable=False),
        sa.Column('last_name', sa.String(length=100), nullable=False),
        sa.Column('pf_number', sa.String(length=12), nullable=False),
        sa.Column('department', sa.String(length=100), nullable=True),
        sa.Column('phone_number', sa.String(length=15), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('pf_number')
    )

    op.create_table('talks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('day', sa.Integer(), nullable=False),
        sa.Column('speaker', sa.String(length=255), nullable=False),
        sa.Column('presentation_url', sa.String(length=512), nullable=True),
        sa.Column('time_slot', sa.String(length=50), nullable=True),
        sa.Column('seminar_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['seminar_id'], ['seminars.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('attendances',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('seminar_id', sa.Integer(), nullable=False),
        sa.Column('day', sa.Integer(), nullable=False),
        sa.Column('member_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(['member_id'], ['members.id'], ),
        sa.ForeignKeyConstraint(['seminar_id'], ['seminars.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('member_id', 'seminar_id', 'day', name='unique_member_day_attendance')
    )

    op.create_table('comments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('talk_id', sa.Integer(), nullable=False),
        sa.Column('member_id', sa.Integer(), nullable=True),
        sa.Column('comment_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['comment_id'], ['comments.id'], ),
        sa.ForeignKeyConstraint(['member_id'], ['members.id'], ),
        sa.ForeignKeyConstraint(['talk_id'], ['talks.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('comments')
    op.drop_table('attendances')
    op.drop_table('talks')
    op.drop_table('members')
    op.drop_table('seminars')
