"""Payment provider tables: Stripe customer, funding sources, webhook events, transactions

Revision ID: 029
Revises: 028
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision: str = "029"
down_revision: Union[str, None] = "028"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "payment_provider_customers",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("provider", sa.String(50), nullable=False),
        sa.Column("provider_customer_id", sa.String(200), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_payment_provider_customers_user", "payment_provider_customers", ["user_id"], unique=True)
    op.create_index("ix_payment_provider_customers_provider", "payment_provider_customers", ["provider_customer_id"], unique=True)

    op.create_table(
        "payment_provider_funding_sources",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("provider_customer_id", sa.String(200), nullable=False),
        sa.Column("provider_payment_method_id", sa.String(200), nullable=False),
        sa.Column("provider", sa.String(50), nullable=False),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("brand", sa.String(50), nullable=True),
        sa.Column("last4", sa.String(4), nullable=True),
        sa.Column("label", sa.String(200), nullable=False),
        sa.Column("active", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_payment_provider_funding_sources_user", "payment_provider_funding_sources", ["user_id"], unique=False)
    op.create_index("ix_payment_provider_funding_sources_pm", "payment_provider_funding_sources", ["provider_payment_method_id"], unique=True)

    op.create_table(
        "payment_provider_webhook_events",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("provider", sa.String(50), nullable=False),
        sa.Column("provider_event_id", sa.String(200), nullable=False),
        sa.Column("event_type", sa.String(100), nullable=False),
        sa.Column("processed", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_payment_provider_webhook_events_id", "payment_provider_webhook_events", ["provider_event_id"], unique=True)

    op.create_table(
        "payment_provider_transactions",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("provider", sa.String(50), nullable=False),
        sa.Column("object_type", sa.String(50), nullable=False),
        sa.Column("provider_intent_id", sa.String(200), nullable=False),
        sa.Column("amount", sa.Float(), nullable=True),
        sa.Column("currency", sa.String(10), nullable=True),
        sa.Column("status", sa.String(50), nullable=False),
        sa.Column("metadata_json", JSONB, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_payment_provider_transactions_intent", "payment_provider_transactions", ["provider_intent_id"], unique=True)


def downgrade() -> None:
    op.drop_table("payment_provider_transactions")
    op.drop_table("payment_provider_webhook_events")
    op.drop_table("payment_provider_funding_sources")
    op.drop_table("payment_provider_customers")
