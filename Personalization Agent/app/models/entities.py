import uuid
from datetime import date, datetime
from decimal import Decimal

from pgvector.sqlalchemy import Vector
from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _uuid() -> uuid.UUID:
    return uuid.uuid4()


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    customer_code: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(128))
    email: Mapped[str] = mapped_column(String(256))
    card_limit: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("200000"))
    card_type: Mapped[str] = mapped_column(String(64), default="Platinum Rewards")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    transactions: Mapped[list["Transaction"]] = relationship(back_populates="customer")
    payments: Mapped[list["Payment"]] = relationship(back_populates="customer")
    emis: Mapped[list["EMI"]] = relationship(back_populates="customer")
    reward_redemptions: Mapped[list["RewardRedemption"]] = relationship(back_populates="customer")
    insights: Mapped[list["CustomerInsight"]] = relationship(back_populates="customer")


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    customer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("customers.id"), index=True)
    txn_date: Mapped[date] = mapped_column(Date, index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    category: Mapped[str] = mapped_column(String(64), index=True)
    merchant: Mapped[str] = mapped_column(String(128))
    txn_type: Mapped[str] = mapped_column(String(32))  # purchase, cash_withdrawal, international
    reward_points_earned: Mapped[int] = mapped_column(Integer, default=0)
    is_emi_eligible: Mapped[bool] = mapped_column(default=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    customer: Mapped["Customer"] = relationship(back_populates="transactions")


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    customer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("customers.id"), index=True)
    payment_date: Mapped[date] = mapped_column(Date, index=True)
    amount_paid: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    minimum_due: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    total_due: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    payment_type: Mapped[str] = mapped_column(String(32))  # full, minimum, partial
    late_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0"))
    days_past_due: Mapped[int] = mapped_column(Integer, default=0)

    customer: Mapped["Customer"] = relationship(back_populates="payments")


class EMI(Base):
    __tablename__ = "emis"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    customer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("customers.id"), index=True)
    start_date: Mapped[date] = mapped_column(Date)
    principal: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    tenure_months: Mapped[int] = mapped_column(Integer)
    interest_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2))
    monthly_emi: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    remaining_months: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(32), default="active")

    customer: Mapped["Customer"] = relationship(back_populates="emis")


class RewardRedemption(Base):
    __tablename__ = "reward_redemptions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    customer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("customers.id"), index=True)
    redemption_date: Mapped[date] = mapped_column(Date)
    points_used: Mapped[int] = mapped_column(Integer)
    redemption_type: Mapped[str] = mapped_column(String(64))
    value_inr: Mapped[Decimal] = mapped_column(Numeric(10, 2))

    customer: Mapped["Customer"] = relationship(back_populates="reward_redemptions")


class CustomerInsight(Base):
    """Stored behavioral insights and agent outputs for RAG retrieval."""

    __tablename__ = "customer_insights"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    customer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("customers.id"), index=True)
    insight_type: Mapped[str] = mapped_column(String(64), index=True)
    summary: Mapped[str] = mapped_column(Text)
    metrics: Mapped[dict] = mapped_column(JSONB, default=dict)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(768), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    customer: Mapped["Customer"] = relationship(back_populates="insights")


class EducationContent(Base):
    """Financial education knowledge base with vector embeddings for RAG."""

    __tablename__ = "education_content"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    topic: Mapped[str] = mapped_column(String(64), index=True)
    title: Mapped[str] = mapped_column(String(256))
    content: Mapped[str] = mapped_column(Text)
    tags: Mapped[list] = mapped_column(JSONB, default=list)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(768), nullable=True)
