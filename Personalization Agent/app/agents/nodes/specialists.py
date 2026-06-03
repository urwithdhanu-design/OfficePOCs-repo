"""Specialist agent nodes for personalized financial education."""

import json

from langchain_core.messages import HumanMessage, SystemMessage

from app.agents.state import AgentState
from app.services.llm import get_chat_model

AGENT_PROMPTS = {
    "rewards": """You are a Rewards Optimization specialist for credit cards.
Analyze dining/shopping spend and reward point usage. Give specific numbers from the profile.
Example: "You spend ~₹15,000/month on dining. Using dining partner offers earns 3x points — ~₹4,500/year in value."
Return JSON: {"topic":"rewards","title":"...","insight":"...","recommendation":"...","potential_savings_inr":number|null,"priority":"high|medium|low"}""",
    "credit_health": """You are a Credit Health educator.
Focus on utilization %, payment patterns (minimum vs full), and credit score impact.
Recommend keeping utilization below 30%. Use exact figures from the profile.
Return JSON: {"topic":"credit_health","title":"...","insight":"...","recommendation":"...","potential_savings_inr":null,"priority":"high|medium|low"}""",
    "emi": """You are an EMI Guidance specialist.
Identify large purchases, active EMIs, and whether converting new large spends to EMI helps cash flow.
Return JSON: {"topic":"emi","title":"...","insight":"...","recommendation":"...","potential_savings_inr":null,"priority":"high|medium|low"}""",
    "spending": """You are a Spending Behavior coach.
Analyze category breakdown and monthly averages. Suggest smarter spending habits.
Return JSON: {"topic":"spending","title":"...","insight":"...","recommendation":"...","potential_savings_inr":null,"priority":"high|medium|low"}""",
    "fees": """You are a Fees & Charges educator.
Cover late fees, minimum due interest, cash withdrawals. Quantify past fees from profile.
Return JSON: {"topic":"fees","title":"...","insight":"...","recommendation":"...","potential_savings_inr":number|null,"priority":"high|medium|low"}""",
}


async def specialist_node(state: AgentState, agent_name: str) -> dict:
    llm = get_chat_model(temperature=0.4)
    system = AGENT_PROMPTS.get(agent_name, AGENT_PROMPTS["spending"])

    prompt = f"""Customer behavior profile:
{state.get("behavior_context", "")}

Relevant education knowledge:
{state.get("rag_context", "N/A")}

User question: {state["messages"][-1].content if state["messages"] else "Provide personalized education"}

Generate ONE personalized education item based on THIS customer's actual data."""

    response = await llm.ainvoke(
        [SystemMessage(content=system), HumanMessage(content=prompt)]
    )
    text = response.content.strip()
    if "```" in text:
        text = text.split("```")[1].replace("json", "").strip()

    try:
        item = json.loads(text)
    except json.JSONDecodeError:
        item = {
            "topic": agent_name,
            "title": f"{agent_name.replace('_', ' ').title()} Insight",
            "insight": response.content[:500],
            "recommendation": "Review your card dashboard for details.",
            "potential_savings_inr": None,
            "priority": "medium",
        }

    existing_items = list(state.get("education_items", []))
    existing_items.append(item)
    existing_used = list(state.get("agents_used", []))
    if agent_name not in existing_used:
        existing_used.append(agent_name)
    return {"education_items": existing_items, "agents_used": existing_used}


async def synthesizer_node(state: AgentState) -> dict:
    """Combine specialist outputs into a cohesive coach response."""
    llm = get_chat_model(temperature=0.5)
    items_text = json.dumps(state.get("education_items", []), indent=2)
    user_msg = state["messages"][-1].content if state["messages"] else ""

    prompt = f"""You are a friendly AI financial coach for credit card customers.
Write a clear, encouraging response (2-4 paragraphs) that:
1. Addresses the user's message: "{user_msg}"
2. Weaves in the personalized insights below naturally
3. Uses ₹ amounts and specifics from their data
4. Ends with 1-2 actionable next steps

Personalized insights:
{items_text}

Customer context:
{state.get("behavior_context", "")}"""

    response = await llm.ainvoke([HumanMessage(content=prompt)])
    return {"final_response": response.content}
