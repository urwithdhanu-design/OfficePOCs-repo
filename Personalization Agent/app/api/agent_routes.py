"""Agent API — serves personalized financial education from the LangGraph multi-agent system."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.graph import run_agent_graph
from app.database import get_db
from app.schemas.api import (
    AgentChatRequest,
    AgentChatResponse,
    AgentEducationItem,
    AgentInsightRequest,
    PersonalizedEducation,
)
from app.services.behavior_analysis import (
    behavior_to_context,
    build_behavior_profile,
    get_customer_by_code,
)
from app.services.vector_store import search_education

router = APIRouter(prefix="/api/v1/agent", tags=["Personalization Agent"])


def _profile_to_dict(profile) -> dict:
    return profile.model_dump(mode="json")


def _items_from_raw(raw: list[dict]) -> list[AgentEducationItem]:
    items = []
    for r in raw:
        items.append(
            AgentEducationItem(
                topic=r.get("topic", "general"),
                title=r.get("title", "Insight"),
                insight=r.get("insight", ""),
                recommendation=r.get("recommendation", ""),
                potential_savings_inr=r.get("potential_savings_inr"),
                priority=r.get("priority", "medium"),
            )
        )
    return items


@router.post("/chat", response_model=AgentChatResponse)
async def agent_chat(body: AgentChatRequest, db: AsyncSession = Depends(get_db)):
    """
    Chat with the financial coach agent.

    Examples:
    - "analyze" → full personalized education based on spending behavior
    - "How can I earn more rewards on dining?"
    - "Is my credit utilization affecting my score?"
    """
    customer = await get_customer_by_code(db, body.customer_code)
    if not customer:
        raise HTTPException(404, f"Customer {body.customer_code} not found")

    profile = await build_behavior_profile(db, customer)
    context = behavior_to_context(profile)
    rag_docs = await search_education(db, body.message or "credit card rewards utilization emi")
    rag_context = "\n\n".join(f"[{d.topic}] {d.title}: {d.content}" for d in rag_docs)

    result = await run_agent_graph(
        customer_code=body.customer_code,
        message=body.message,
        behavior_context=context,
        behavior_profile=_profile_to_dict(profile),
        rag_context=rag_context,
    )

    return AgentChatResponse(
        customer_code=body.customer_code,
        response=result["response"],
        education_items=_items_from_raw(result["education_items"]),
        agents_used=result["agents_used"],
        behavior_summary=_profile_to_dict(profile),
    )


@router.post("/insights", response_model=PersonalizedEducation)
async def generate_insights(body: AgentInsightRequest, db: AsyncSession = Depends(get_db)):
    """
    Generate full personalized education report (no free-form chat).

    Optional focus_areas: rewards, credit_health, emi, spending, fees
    """
    customer = await get_customer_by_code(db, body.customer_code)
    if not customer:
        raise HTTPException(404, f"Customer {body.customer_code} not found")

    profile = await build_behavior_profile(db, customer)
    context = behavior_to_context(profile)
    rag_docs = await search_education(db, "personalized credit card education " + " ".join(body.focus_areas or []))
    rag_context = "\n\n".join(f"[{d.topic}] {d.title}: {d.content}" for d in rag_docs)

    result = await run_agent_graph(
        customer_code=body.customer_code,
        message="analyze",
        behavior_context=context,
        behavior_profile=_profile_to_dict(profile),
        rag_context=rag_context,
        focus_areas=body.focus_areas,
    )

    return PersonalizedEducation(
        customer_code=body.customer_code,
        generated_at=datetime.utcnow().isoformat() + "Z",
        behavior_profile=_profile_to_dict(profile),
        education_items=_items_from_raw(result["education_items"]),
        overall_score=None,
    )


@router.get("/customers/{customer_code}/quick-tips")
async def quick_tips(customer_code: str, db: AsyncSession = Depends(get_db)):
    """Rule-based quick tips without LLM (useful when API key unavailable)."""
    customer = await get_customer_by_code(db, customer_code)
    if not customer:
        raise HTTPException(404, f"Customer {customer_code} not found")

    profile = await build_behavior_profile(db, customer)
    tips = []

    if profile.dining_monthly_avg and profile.dining_monthly_avg > 10000:
        yearly = float(profile.dining_monthly_avg) * 12 * 0.03
        tips.append({
            "topic": "rewards",
            "tip": f"You spend ~₹{profile.dining_monthly_avg:,.0f}/month on dining. "
            f"Dining partner offers (3x points) could save ~₹{yearly:,.0f}/year.",
        })

    if profile.credit_utilization_pct > 70:
        tips.append({
            "topic": "credit_health",
            "tip": f"Utilization is {profile.credit_utilization_pct}% (>70%). "
            "Keeping it below 30% may improve your credit score.",
        })
    elif profile.credit_utilization_pct > 30:
        tips.append({
            "topic": "credit_health",
            "tip": f"Utilization is {profile.credit_utilization_pct}%. Aim for below 30% before statement date.",
        })

    if profile.large_purchases_above_10k >= 2:
        tips.append({
            "topic": "emi",
            "tip": f"You had {profile.large_purchases_above_10k} purchases over ₹10,000. "
            "Converting to low-interest EMI may reduce monthly pressure.",
        })

    if profile.late_fee_total > 0:
        tips.append({
            "topic": "fees",
            "tip": f"You paid ₹{profile.late_fee_total:,.0f} in late fees. Enable auto-pay for full statement amount.",
        })

    if profile.minimum_due_payment_count > 2:
        tips.append({
            "topic": "fees",
            "tip": "Frequent minimum-due payments accrue 36%+ interest. Pay full balance when possible.",
        })

    if profile.cash_withdrawal_count > 0:
        tips.append({
            "topic": "fees",
            "tip": f"{profile.cash_withdrawal_count} cash withdrawals (₹{profile.cash_withdrawal_total:,.0f}) — "
            "high fees + immediate interest. Use debit/UPI instead.",
        })

    if profile.reward_redemption_rate_pct < 20 and profile.total_reward_points_earned > 5000:
        tips.append({
            "topic": "rewards",
            "tip": f"You've redeemed only {profile.reward_redemption_rate_pct:.0f}% of "
            f"{profile.total_reward_points_earned:,} points earned. Redeem before expiry.",
        })

    return {"customer_code": customer_code, "tips": tips, "behavior": _profile_to_dict(profile)}
