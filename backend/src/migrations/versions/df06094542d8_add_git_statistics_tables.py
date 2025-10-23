"""Add git statistics tables

Revision ID: df06094542d8
Revises: 6d5fe9b0b3f1
Create Date: 2025-10-23 23:29:46.934012

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'df06094542d8'
down_revision: Union[str, Sequence[str], None] = '6d5fe9b0b3f1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Сначала создаем независимые таблицы
    op.create_table('projects',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('key', sa.String(), nullable=False),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_table('authors',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('email_normalized', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Затем таблицы первого уровня зависимостей
    op.create_table('repositories',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('project_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('slug', sa.String(), nullable=False),
        sa.Column('default_branch', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Таблицы второго уровня зависимостей
    op.create_table('branches',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('repo_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('is_default', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['repo_id'], ['repositories.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_table('commits',
        sa.Column('sha', sa.String(), nullable=False),
        sa.Column('repo_id', sa.UUID(), nullable=False),
        sa.Column('author_id', sa.UUID(), nullable=True),
        sa.Column('committed_at', sa.DateTime(), nullable=False),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('added_lines', sa.Integer(), nullable=True),
        sa.Column('deleted_lines', sa.Integer(), nullable=True),
        sa.Column('is_merge_guess', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['author_id'], ['authors.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['repo_id'], ['repositories.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('sha')
    )
    
    # Таблицы третьего уровня зависимостей
    op.create_table('commit_files',
        sa.Column('change_id', sa.UUID(), nullable=False),
        sa.Column('commit_sha', sa.String(), nullable=False),
        sa.Column('file_path', sa.Text(), nullable=False),
        sa.Column('added_lines', sa.Integer(), nullable=True),
        sa.Column('deleted_lines', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['commit_sha'], ['commits.sha'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('change_id')
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Удаляем в обратном порядке создания
    op.drop_table('commit_files')
    op.drop_table('commits')
    op.drop_table('branches')
    op.drop_table('repositories')
    op.drop_table('authors')
    op.drop_table('projects')