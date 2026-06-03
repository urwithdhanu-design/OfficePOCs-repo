"""Mock banking APIs — simulate core banking / card processor endpoints."""

from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Customer, EMI, Payment, RewardRedemption, Transaction
from app.schemas.api import (
    BehaviorProfile,
    CustomerSummary,
    EMIOut,
    PaymentOut,
    TransactionOut,
)
from app.services.behavior_analysis import build_behavior_profile, get_customer_by_code

router = APIRouter(prefix="/api/v1/banking", tags=["Mock Banking"])


@router.get("/customers", response_model=list[CustomerSummary])
async def list_customers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Customer))
    customers = result.scalars().all()
    return [
        CustomerSummary(
            id=c.id,
            customer_code=c.customer_code,
            name=c.name,
            email=c.email,
            card_limit=c.card_limit,
            card_type=c.card_type,
        )
        for c in customers
    ]


@router.get("/customers/{customer_code}", response_model=CustomerSummary)
async def get_customer(customer_code: str, db: AsyncSession = Depends(get_db)):
    customer = await get_customer_by_code(db, customer_code)
    if not customer:
        raise HTTPException(404, f"Customer {customer_code} not found")
    return CustomerSummary(
        id=customer.id,
        customer_code=customer.customer_code,
        name=customer.name,
        email=customer.email,
        card_limit=customer.card_limit,
        card_type=customer.card_type,
    )


@router.get("/customers/{customer_code}/transactions", response_model=list[TransactionOut])
async def get_transactions(
    customer_code: str,
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
    category: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    customer = await get_customer_by_code(db, customer_code)
    if not customer:
        raise HTTPException(404, f"Customer {customer_code} not found")

    q = select(Transaction).where(Transaction.customer_id == customer.id)
    if from_date:
        q = q.where(Transaction.txn_date >= from_date)
    if to_date:
        q = q.where(Transaction.txn_date <= to_date)
    if category:
        q = q.where(Transaction.category == category)
    q = q.order_by(Transaction.txn_date.desc())

    rows = (await db.execute(q)).scalars().all()
    return [
        TransactionOut(
            id=t.id,
            txn_date=t.txn_date,
            amount=t.amount,
            category=t.category,
            merchant=t.merchant,
            txn_type=t.txn_type,
            reward_points_earned=t.reward_points_earned,
            is_emi_eligible=t.is_emi_eligible,
        )
        for t in rows
    ]


@router.get("/customers/{customer_code}/payments", response_model=list[PaymentOut])
async def get_payments(
    customer_code: str,
    db: AsyncSession = Depends(get_db),
):
    customer = await get_customer_by_code(db, customer_code)
    if not customer:
        raise HTTPException(404, f"Customer {customer_code} not found")

    rows = (
        await db.execute(
            select(Payment)
            .where(Payment.customer_id == customer.id)
            .order_by(Payment.payment_date.desc())
        )
    ).scalars().all()
    return [PaymentOut.model_validate(p) for p in rows]


@router.get("/customers/{customer_code}/emis", response_model=list[EMIOut])
async def get_emis(customer_code: str, db: AsyncSession = Depends(get_db)):
    customer = await get_customer_by_code(db, customer_code)
    if not customer:
        raise HTTPException(404, f"Customer {customer_code} not found")

    rows = (await db.execute(select(EMI).where(EMI.customer_id == customer.id))).scalars().all()
    return [EMIOut.model_validate(e) for e in rows]


@router.get("/customers/{customer_code}/rewards")
async def get_rewards(customer_code: str, db: AsyncSession = Depends(get_db)):
    customer = await get_customer_by_code(db, customer_code)
    if not customer:
        raise HTTPException(404, f"Customer {customer_code} not found")

    redemptions = (
        await db.execute(
            select(RewardRedemption).where(RewardRedemption.customer_id == customer.id)
        )
    ).scalars().all()

    profile = await build_behavior_profile(db, customer)
    return {
        "customer_code": customer_code,
        "points_earned_6m": profile.total_reward_points_earned,
        "points_redeemed_6m": profile.total_reward_points_redeemed,
        "redemption_rate_pct": profile.reward_redemption_rate_pct,
        "redemptions": [
            {
                "date": str(r.redemption_date),
                "points_used": r.points_used,
                "type": r.redemption_type,
                "value_inr": float(r.value_inr),
            }
            for r in redemptions
        ],
    }


@router.get("/customers/{customer_code}/spending/summary")
async def spending_summary(customer_code: str, db: AsyncSession = Depends(get_db)):
    customer = await get_customer_by_code(db, customer_code)
    if not customer:
        raise HTTPException(404, f"Customer {customer_code} not found")
    profile = await build_behavior_profile(db, customer)
    return {
        "customer_code": customer_code,
        "period_months": profile.period_months,
        "total_spend": float(profile.total_spend),
        "avg_monthly_spend": float(profile.avg_monthly_spend),
        "category_breakdown": {k: float(v) for k, v in profile.category_breakdown.items()},
        "top_categories": profile.top_categories,
    }


@router.get("/customers/{customer_code}/behavior", response_model=BehaviorProfile)
async def get_behavior_profile(customer_code: str, db: AsyncSession = Depends(get_db)):
    customer = await get_customer_by_code(db, customer_code)
    if not customer:
        raise HTTPException(404, f"Customer {customer_code} not found")
    return await build_behavior_profile(db, customer)


@router.get("/customers/{customer_code}/card/utilization")
async def card_utilization(customer_code: str, db: AsyncSession = Depends(get_db)):
    customer = await get_customer_by_code(db, customer_code)
    if not customer:
        raise HTTPException(404, f"Customer {customer_code} not found")
    profile = await build_behavior_profile(db, customer)
    return {
        "customer_code": customer_code,
        "credit_limit": float(customer.card_limit),
        "utilization_pct": profile.credit_utilization_pct,
        "recommendation": "Keep below 30%" if profile.credit_utilization_pct > 30 else "Healthy utilization",
    }
