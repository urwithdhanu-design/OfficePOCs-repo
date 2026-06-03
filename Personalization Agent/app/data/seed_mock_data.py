"""
Seed 6 months of mock banking data for demo customers.

Personas:
- CUST001: Heavy diner, high utilization, minimum payments
- CUST002: Smart spender, good rewards usage, full payments
- CUST003: Frequent large purchases, multiple EMIs
"""

import asyncio
import random
from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import select

from app.database import AsyncSessionLocal, init_db
from app.models import Customer, EMI, EducationContent, Payment, RewardRedemption, Transaction
from app.services.vector_store import embed_and_store_content

random.seed(42)

CATEGORIES = {
    "Dining": ["Swiggy", "Zomato", "Barbeque Nation", "Starbucks", "Dominos"],
    "Shopping": ["Amazon", "Flipkart", "Myntra", "Croma", "Reliance Digital"],
    "Groceries": ["BigBasket", "Blinkit", "DMart", "Nature's Basket"],
    "Travel": ["MakeMyTrip", "IRCTC", "Uber", "Ola", "Indigo"],
    "Fuel": ["Indian Oil", "HP Petrol", "Shell"],
    "Entertainment": ["Netflix", "BookMyShow", "Spotify", "PVR"],
    "Utilities": ["Airtel", "Jio", "BESCOM", "BWSSB"],
    "Healthcare": ["Apollo Pharmacy", "Practo", "Fortis"],
}

EDUCATION_ARTICLES = [
    {
        "topic": "rewards",
        "title": "Maximize Dining Rewards",
        "content": "Credit cards often offer 3x-5x reward points on dining with partner restaurants. "
        "If you spend heavily on dining, link your card to dining partner programs. "
        "A monthly dining spend of ₹15,000 can earn 45,000+ bonus points yearly.",
        "tags": ["dining", "rewards", "cashback"],
    },
    {
        "topic": "credit_health",
        "title": "Credit Utilization and Your Score",
        "content": "Credit utilization above 30% can negatively impact your credit score. "
        "Banks recommend keeping outstanding balance below 30% of your credit limit. "
        "Pay down balances before statement date to report lower utilization.",
        "tags": ["credit_score", "utilization"],
    },
    {
        "topic": "emi",
        "title": "When to Convert to EMI",
        "content": "Converting purchases above ₹10,000 into low-interest EMIs can ease monthly cash flow. "
        "Compare EMI interest rate vs. your savings account return. "
        "Avoid EMIs on small purchases due to processing fees.",
        "tags": ["emi", "cash_flow"],
    },
    {
        "topic": "fees",
        "title": "Avoid Late Fees and Interest",
        "content": "Paying only minimum due leads to 36-42% annual interest on remaining balance. "
        "Set up auto-pay for full statement amount. Late fees are typically ₹500-1300 per occurrence.",
        "tags": ["late_fee", "minimum_due", "interest"],
    },
    {
        "topic": "cash_advance",
        "title": "Cash Withdrawal Costs",
        "content": "Cash withdrawals on credit cards carry 2.5-3.5% fee plus interest from day one. "
        "Use debit cards or UPI for cash needs. Each withdrawal also forfeits reward points.",
        "tags": ["cash_withdrawal", "fees"],
    },
    {
        "topic": "international",
        "title": "International Transaction Tips",
        "content": "International spends may include 3-5% forex markup. "
        "Use cards with zero forex markup for travel. Notify bank before international travel.",
        "tags": ["forex", "travel"],
    },
    {
        "topic": "rewards",
        "title": "Reward Redemption Strategy",
        "content": "Redeem points for travel or vouchers rather than statement credit for best value. "
        "Points often expire in 2-3 years. Check quarterly bonus redemption offers.",
        "tags": ["redemption", "points"],
    },
]


def _dates_last_6_months() -> list[date]:
    today = date.today()
    start = today - timedelta(days=180)
    dates = []
    d = start
    while d <= today:
        dates.append(d)
        d += timedelta(days=1)
    return dates


def _gen_transactions(
    customer_id,
    persona: str,
    all_dates: list[date],
) -> list[Transaction]:
    txns: list[Transaction] = []
    for d in all_dates:
        if random.random() > 0.45:
            continue

        if persona == "diner":
            weights = {"Dining": 0.35, "Shopping": 0.15, "Groceries": 0.15, "Travel": 0.1, "Fuel": 0.1, "Entertainment": 0.15}
        elif persona == "smart":
            weights = {"Shopping": 0.2, "Groceries": 0.2, "Dining": 0.15, "Travel": 0.2, "Fuel": 0.1, "Utilities": 0.15}
        else:
            weights = {"Shopping": 0.3, "Travel": 0.2, "Dining": 0.15, "Groceries": 0.15, "Entertainment": 0.2}

        cat = random.choices(list(weights.keys()), weights=list(weights.values()))[0]
        merchant = random.choice(CATEGORIES[cat])
        base = random.randint(500, 8000)
        if persona == "large_purchase" and random.random() < 0.08:
            base = random.randint(12000, 85000)
        amount = Decimal(str(base))

        txn_type = "purchase"
        if persona == "diner" and random.random() < 0.03:
            txn_type = "cash_withdrawal"
            amount = Decimal(str(random.randint(2000, 10000)))
        if random.random() < 0.02:
            txn_type = "international"
            amount = Decimal(str(random.randint(3000, 25000)))

        multiplier = 3 if cat == "Dining" and persona == "diner" else 1
        points = int(amount) * multiplier // 100

        txns.append(
            Transaction(
                customer_id=customer_id,
                txn_date=d,
                amount=amount,
                category=cat,
                merchant=merchant,
                txn_type=txn_type,
                reward_points_earned=points,
                is_emi_eligible=amount >= Decimal("10000"),
            )
        )
    return txns


def _gen_payments(customer_id, persona: str) -> list[Payment]:
    payments = []
    today = date.today()
    for m in range(6):
        pay_date = today.replace(day=min(5 + m, 28)) - timedelta(days=30 * (5 - m))
        total_due = Decimal(str(random.randint(25000, 95000)))
        min_due = (total_due * Decimal("0.05")).quantize(Decimal("1"))

        if persona == "diner":
            ptype = "minimum" if random.random() < 0.6 else "partial"
            late = Decimal("750") if random.random() < 0.25 else Decimal("0")
            days_past = random.randint(1, 5) if late else 0
            paid = min_due if ptype == "minimum" else total_due * Decimal("0.4")
        elif persona == "smart":
            ptype = "full"
            late = Decimal("0")
            days_past = 0
            paid = total_due
        else:
            ptype = random.choice(["full", "full", "partial"])
            late = Decimal("0")
            days_past = 0
            paid = total_due if ptype == "full" else total_due * Decimal("0.7")

        payments.append(
            Payment(
                customer_id=customer_id,
                payment_date=pay_date,
                amount_paid=paid.quantize(Decimal("1")),
                minimum_due=min_due,
                total_due=total_due,
                payment_type=ptype,
                late_fee=late,
                days_past_due=days_past,
            )
        )
    return payments


def _gen_emis(customer_id, persona: str) -> list[EMI]:
    if persona != "large_purchase":
        return []
    return [
        EMI(
            customer_id=customer_id,
            start_date=date.today() - timedelta(days=90),
            principal=Decimal("45000"),
            tenure_months=12,
            interest_rate=Decimal("14.99"),
            monthly_emi=Decimal("4050"),
            remaining_months=9,
            status="active",
        ),
        EMI(
            customer_id=customer_id,
            start_date=date.today() - timedelta(days=45),
            principal=Decimal("28000"),
            tenure_months=6,
            interest_rate=Decimal("15.99"),
            monthly_emi=Decimal("4950"),
            remaining_months=5,
            status="active",
        ),
    ]


def _gen_redemptions(customer_id, persona: str) -> list[RewardRedemption]:
    redemptions = []
    today = date.today()
    count = 1 if persona == "diner" else 4 if persona == "smart" else 2
    for i in range(count):
        redemptions.append(
            RewardRedemption(
                customer_id=customer_id,
                redemption_date=today - timedelta(days=30 * (i + 1)),
                points_used=random.randint(2000, 15000),
                redemption_type=random.choice(["voucher", "travel", "statement_credit"]),
                value_inr=Decimal(str(random.randint(500, 5000))),
            )
        )
    return redemptions


async def seed() -> None:
    await init_db()
    async with AsyncSessionLocal() as db:
        existing = await db.execute(select(Customer).limit(1))
        if existing.scalar_one_or_none():
            print("Database already seeded. Skipping.")
            return

        personas = [
            ("CUST001", "Priya Sharma", "priya@email.com", "diner", Decimal("150000")),
            ("CUST002", "Rahul Mehta", "rahul@email.com", "smart", Decimal("300000")),
            ("CUST003", "Anita Desai", "anita@email.com", "large_purchase", Decimal("250000")),
        ]
        all_dates = _dates_last_6_months()

        for code, name, email, persona, limit in personas:
            customer = Customer(
                customer_code=code,
                name=name,
                email=email,
                card_limit=limit,
                card_type="Platinum Rewards" if persona != "smart" else "Signature Rewards",
            )
            db.add(customer)
            await db.flush()

            for t in _gen_transactions(customer.id, persona, all_dates):
                db.add(t)
            for p in _gen_payments(customer.id, persona):
                db.add(p)
            for e in _gen_emis(customer.id, persona):
                db.add(e)
            for r in _gen_redemptions(customer.id, persona):
                db.add(r)

        for article in EDUCATION_ARTICLES:
            content = EducationContent(**article)
            await embed_and_store_content(db, content)

        await db.commit()
        print("Seeded 3 customers with 6 months of transactions, payments, EMIs, rewards, and education content.")


if __name__ == "__main__":
    asyncio.run(seed())
