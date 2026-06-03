"""Supervisor routes to specialized financial education agents."""

import json

from langchain_core.messages import HumanMessage, SystemMessage

from app.agents.state import AgentState
from app.services.llm import get_chat_model

SUPERVISOR_PROMPT = """You are a supervisor for a credit card financial education system.
Based on the customer behavior profile and user message, decide which specialist agents to invoke.

Available agents:
- rewards: Dining/shopping spend, reward points optimization, partner offers
- credit_health: Credit utilization, credit score, payment habits
- emi: Large purchases, EMI conversion, monthly burden
- spending: Category spending patterns, budgeting
- fees: Late fees, minimum due, cash withdrawal costs

Return JSON only: {"agents": ["agent1", "agent2"], "reason": "brief reason"}
Pick 1-3 most relevant agents. For general "analyze" requests, pick all that apply based on the profile.
"""


async def supervisor_node(state: AgentState) -> dict:
    llm = get_chat_model(temperature=0)
    user_msg = state["messages"][-1].content if state["messages"] else "analyze my card usage"

    focus = state.get("focus_areas") or []
    if focus:
        return {"next_agent": ",".join(focus), "agents_used": focus}

    prompt = f"""Customer behavior:
{state.get("behavior_context", "")}

User message: {user_msg}

Which agents should handle this?"""

    response = await llm.ainvoke(
        [SystemMessage(content=SUPERVISOR_PROMPT), HumanMessage(content=prompt)]
    )
    text = response.content.strip()
    if "```" in text:
        text = text.split("```")[1].replace("json", "").strip()

    try:
        data = json.loads(text)
        agents = data.get("agents", ["spending"])
    except json.JSONDecodeError:
        agents = _fallback_routing(state)

    return {"next_agent": ",".join(agents), "agents_used": agents}


def _fallback_routing(state: AgentState) -> list[str]:
    profile = state.get("behavior_profile", {})
    agents = ["spending"]
    if profile.get("dining_monthly_avg") and float(profile.get("dining_monthly_avg", 0)) > 8000:
        agents.append("rewards")
    if profile.get("credit_utilization_pct", 0) > 50:
        agents.append("credit_health")
    if profile.get("large_purchases_above_10k", 0) >= 2:
        agents.append("emi")
    if float(profile.get("late_fee_total", 0)) > 0 or profile.get("minimum_due_payment_count", 0) > 2:
        agents.append("fees")
    if profile.get("cash_withdrawal_count", 0) > 0:
        agents.append("fees")
    return list(dict.fromkeys(agents))
