from datetime import date
from decimal import Decimal
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# --- Agent API schemas ---


class AgentChatRequest(BaseModel):
    customer_code: str
    message: str = Field(..., description="User question or 'analyze' for full personalized education")
    session_id: str | None = None


class AgentEducationItem(BaseModel):
    topic: str
    title: str
    insight: str
    recommendation: str
    potential_savings_inr: float | None = None
    priority: str = "medium"  # low, medium, high


class AgentChatResponse(BaseModel):
    customer_code: str
    response: str
    education_items: list[AgentEducationItem] = []
    agents_used: list[str] = []
    behavior_summary: dict[str, Any] = {}


class AgentInsightRequest(BaseModel):
    customer_code: str
    focus_areas: list[str] | None = Field(
        default=None,
        description="Optional: rewards, credit_health, emi, spending, fees",
    )


class PersonalizedEducation(BaseModel):
    customer_code: str
    generated_at: str
    behavior_profile: dict[str, Any]
    education_items: list[AgentEducationItem]
    overall_score: float | None = None


# --- Mock banking API schemas ---


class CustomerSummary(BaseModel):
    id: UUID
    customer_code: str
    name: str
    email: str
    card_limit: Decimal
    card_type: str


class TransactionOut(BaseModel):
    id: UUID
    txn_date: date
    amount: Decimal
    category: str
    merchant: str
    txn_type: str
    reward_points_earned: int
    is_emi_eligible: bool


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    payment_date: date
    amount_paid: Decimal
    minimum_due: Decimal
    total_due: Decimal
    payment_type: str
    late_fee: Decimal
    days_past_due: int


class EMIOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    start_date: date
    principal: Decimal
    tenure_months: int
    interest_rate: Decimal
    monthly_emi: Decimal
    remaining_months: int
    status: str


class BehaviorProfile(BaseModel):
    customer_code: str
    period_months: int = 6
    total_spend: Decimal
    avg_monthly_spend: Decimal
    category_breakdown: dict[str, Decimal]
    top_categories: list[str]
    credit_utilization_pct: float
    total_reward_points_earned: int
    total_reward_points_redeemed: int
    reward_redemption_rate_pct: float
    emi_count: int
    active_emi_monthly_burden: Decimal
    late_fee_total: Decimal
    minimum_due_payment_count: int
    full_payment_count: int
    cash_withdrawal_count: int
    cash_withdrawal_total: Decimal
    international_spend_total: Decimal
    international_txn_count: int
    large_purchases_above_10k: int
    dining_monthly_avg: Decimal | None = None
    shopping_monthly_avg: Decimal | None = None
