"""Analyze customer credit card behavior from transaction and payment data."""

from collections import defaultdict
from datetime import date, timedelta
from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Customer, EMI, Payment, RewardRedemption, Transaction
from app.schemas.api import BehaviorProfile

MONTHS_LOOKBACK = 6


async def get_customer_by_code(db: AsyncSession, customer_code: str) -> Customer | None:
    result = await db.execute(select(Customer).where(Customer.customer_code == customer_code))
    return result.scalar_one_or_none()


async def build_behavior_profile(db: AsyncSession, customer: Customer) -> BehaviorProfile:
    cutoff = date.today() - timedelta(days=MONTHS_LOOKBACK * 30)
    cid = customer.id

    txns = (
        await db.execute(
            select(Transaction).where(
                Transaction.customer_id == cid,
                Transaction.txn_date >= cutoff,
            )
        )
    ).scalars().all()

    payments = (
        await db.execute(
            select(Payment).where(
                Payment.customer_id == cid,
                Payment.payment_date >= cutoff,
            )
        )
    ).scalars().all()

    emis = (
        await db.execute(select(EMI).where(EMI.customer_id == cid, EMI.status == "active"))
    ).scalars().all()

    redemptions = (
        await db.execute(
            select(RewardRedemption).where(
                RewardRedemption.customer_id == cid,
                RewardRedemption.redemption_date >= cutoff,
            )
        )
    ).scalars().all()

    category_spend: dict[str, Decimal] = defaultdict(lambda: Decimal("0"))
    monthly_category: dict[str, dict[str, Decimal]] = defaultdict(lambda: defaultdict(lambda: Decimal("0")))
    total_spend = Decimal("0")
    reward_earned = 0
    cash_count = 0
    cash_total = Decimal("0")
    intl_total = Decimal("0")
    intl_count = 0
    large_purchases = 0

    for t in txns:
        total_spend += t.amount
        category_spend[t.category] += t.amount
        month_key = t.txn_date.strftime("%Y-%m")
        monthly_category[month_key][t.category] += t.amount
        reward_earned += t.reward_points_earned
        if t.txn_type == "cash_withdrawal":
            cash_count += 1
            cash_total += t.amount
        if t.txn_type == "international":
            intl_count += 1
            intl_total += t.amount
        if t.amount >= Decimal("10000") and t.txn_type == "purchase":
            large_purchases += 1

    months_with_data = max(len(monthly_category), 1)
    avg_monthly = total_spend / months_with_data

    dining_monthly: list[Decimal] = []
    shopping_monthly: list[Decimal] = []
    for month_cats in monthly_category.values():
        dining_monthly.append(month_cats.get("Dining", Decimal("0")))
        shopping_monthly.append(month_cats.get("Shopping", Decimal("0")))

    dining_avg = sum(dining_monthly) / len(dining_monthly) if dining_monthly else None
    shopping_avg = sum(shopping_monthly) / len(shopping_monthly) if shopping_monthly else None

    # Credit utilization: outstanding ≈ last month spend minus payments (simplified)
    recent_spend = sum(t.amount for t in txns if t.txn_date >= date.today() - timedelta(days=30))
    recent_paid = sum(p.amount_paid for p in payments if p.payment_date >= date.today() - timedelta(days=30))
    outstanding = max(recent_spend - recent_paid, Decimal("0"))
    utilization = float((outstanding / customer.card_limit) * 100) if customer.card_limit else 0.0
    utilization = min(utilization, 100.0)

    points_redeemed = sum(r.points_used for r in redemptions)
    redemption_rate = (points_redeemed / reward_earned * 100) if reward_earned else 0.0

    top_cats = sorted(category_spend.keys(), key=lambda c: category_spend[c], reverse=True)[:5]

    return BehaviorProfile(
        customer_code=customer.customer_code,
        period_months=MONTHS_LOOKBACK,
        total_spend=total_spend,
        avg_monthly_spend=avg_monthly,
        category_breakdown={k: v for k, v in category_spend.items()},
        top_categories=top_cats,
        credit_utilization_pct=round(utilization, 1),
        total_reward_points_earned=reward_earned,
        total_reward_points_redeemed=points_redeemed,
        reward_redemption_rate_pct=round(redemption_rate, 1),
        emi_count=len(emis),
        active_emi_monthly_burden=sum(e.monthly_emi for e in emis),
        late_fee_total=sum(p.late_fee for p in payments),
        minimum_due_payment_count=sum(1 for p in payments if p.payment_type == "minimum"),
        full_payment_count=sum(1 for p in payments if p.payment_type == "full"),
        cash_withdrawal_count=cash_count,
        cash_withdrawal_total=cash_total,
        international_spend_total=intl_total,
        international_txn_count=intl_count,
        large_purchases_above_10k=large_purchases,
        dining_monthly_avg=dining_avg,
        shopping_monthly_avg=shopping_avg,
    )


def behavior_to_context(profile: BehaviorProfile) -> str:
    """Format behavior profile as text for LLM context."""
    lines = [
        f"Customer: {profile.customer_code}",
        f"Analysis period: last {profile.period_months} months",
        f"Total spend: ₹{profile.total_spend:,.0f}",
        f"Average monthly spend: ₹{profile.avg_monthly_spend:,.0f}",
        f"Top spending categories: {', '.join(profile.top_categories)}",
        f"Category breakdown: {', '.join(f'{k}: ₹{v:,.0f}' for k, v in profile.category_breakdown.items())}",
        f"Credit utilization: {profile.credit_utilization_pct}%",
        f"Reward points earned: {profile.total_reward_points_earned:,}",
        f"Reward points redeemed: {profile.total_reward_points_redeemed:,} ({profile.reward_redemption_rate_pct}% redemption rate)",
        f"Active EMIs: {profile.emi_count} (monthly burden ₹{profile.active_emi_monthly_burden:,.0f})",
        f"Late fees paid: ₹{profile.late_fee_total:,.0f}",
        f"Minimum due payments: {profile.minimum_due_payment_count}, Full payments: {profile.full_payment_count}",
        f"Cash withdrawals: {profile.cash_withdrawal_count} (₹{profile.cash_withdrawal_total:,.0f})",
        f"International spends: {profile.international_txn_count} (₹{profile.international_spend_total:,.0f})",
        f"Large purchases (>₹10,000): {profile.large_purchases_above_10k}",
    ]
    if profile.dining_monthly_avg and profile.dining_monthly_avg > 0:
        lines.append(f"Average monthly dining spend: ₹{profile.dining_monthly_avg:,.0f}")
    if profile.shopping_monthly_avg and profile.shopping_monthly_avg > 0:
        lines.append(f"Average monthly shopping spend: ₹{profile.shopping_monthly_avg:,.0f}")
    return "\n".join(lines)
