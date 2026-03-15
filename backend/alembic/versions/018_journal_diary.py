"""Journal / diary-first: journal_entries, prompt_responses, extracted_signals, suggested_domain_updates

Revision ID: 018
Revises: 017
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision: str = "018"
down_revision: Union[str, None] = "017"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "journal_entries",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("title", sa.String(500), nullable=True),
        sa.Column("raw_text", sa.Text(), nullable=True),
        sa.Column("mood", sa.String(50), nullable=True),
        sa.Column("energy", sa.String(50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_journal_entries_user_id", "journal_entries", ["user_id"], unique=False)
    op.create_index("ix_journal_entries_date", "journal_entries", ["date"], unique=False)
    op.create_index("ix_journal_entries_user_date", "journal_entries", ["user_id", "date"], unique=True)

    op.create_table(
        "journal_prompt_responses",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("journal_entry_id", UUID(as_uuid=True), nullable=False),
        sa.Column("prompt_key", sa.String(80), nullable=False),
        sa.Column("response_value", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["journal_entry_id"], ["journal_entries.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_journal_prompt_responses_entry", "journal_prompt_responses", ["journal_entry_id"], unique=False)
    op.create_index("ix_journal_prompt_responses_key", "journal_prompt_responses", ["prompt_key"], unique=False)

    op.create_table(
        "extracted_signals",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("journal_entry_id", UUID(as_uuid=True), nullable=False),
        sa.Column("domain", sa.String(50), nullable=False),
        sa.Column("signal_type", sa.String(80), nullable=False),
        sa.Column("value_json", JSONB(), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("source_text", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["journal_entry_id"], ["journal_entries.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_extracted_signals_entry", "extracted_signals", ["journal_entry_id"], unique=False)
    op.create_index("ix_extracted_signals_domain", "extracted_signals", ["domain"], unique=False)

    op.create_table(
        "suggested_domain_updates",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("journal_entry_id", UUID(as_uuid=True), nullable=False),
        sa.Column("domain", sa.String(50), nullable=False),
        sa.Column("update_type", sa.String(80), nullable=False),
        sa.Column("payload_json", JSONB(), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False),
        sa.ForeignKeyConstraint(["journal_entry_id"], ["journal_entries.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_suggested_domain_updates_entry", "suggested_domain_updates", ["journal_entry_id"], unique=False)
    op.create_index("ix_suggested_domain_updates_status", "suggested_domain_updates", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_suggested_domain_updates_status", table_name="suggested_domain_updates")
    op.drop_index("ix_suggested_domain_updates_entry", table_name="suggested_domain_updates")
    op.drop_table("suggested_domain_updates")
    op.drop_index("ix_extracted_signals_domain", table_name="extracted_signals")
    op.drop_index("ix_extracted_signals_entry", table_name="extracted_signals")
    op.drop_table("extracted_signals")
    op.drop_index("ix_journal_prompt_responses_key", table_name="journal_prompt_responses")
    op.drop_index("ix_journal_prompt_responses_entry", table_name="journal_prompt_responses")
    op.drop_table("journal_prompt_responses")
    op.drop_index("ix_journal_entries_user_date", table_name="journal_entries")
    op.drop_index("ix_journal_entries_date", table_name="journal_entries")
    op.drop_index("ix_journal_entries_user_id", table_name="journal_entries")
    op.drop_table("journal_entries")
