"""Update projects table for swagger compatibility

Revision ID: abc123def456
Revises: df06094542d8
Create Date: 2025-01-27 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'abc123def456'
down_revision: Union[str, Sequence[str], None] = 'df06094542d8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Сначала удаляем существующие таблицы, которые зависят от projects
    op.drop_table('commit_files')
    op.drop_table('commits')
    op.drop_table('branches')
    op.drop_table('repositories')
    
    # Удаляем старую таблицу projects
    op.drop_table('projects')
    
    # Создаем новую таблицу projects с обновленной схемой
    op.create_table('projects',
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('full_name', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_favorite', sa.Boolean(), nullable=False, default=False),
        sa.Column('is_public', sa.Boolean(), nullable=False, default=True),
        sa.Column('lfs_allow', sa.Boolean(), nullable=False, default=True),
        sa.Column('parent_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['parent_id'], ['projects.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Создаем таблицы заново с обновленными ссылками
    op.create_table('repositories',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('slug', sa.String(), nullable=False),
        sa.Column('default_branch', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
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
    op.drop_table('projects')
    
    # Восстанавливаем старую схему
    op.create_table('projects',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('key', sa.String(), nullable=False),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
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
