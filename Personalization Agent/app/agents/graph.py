"""
LangGraph multi-agent workflow.

Architecture (supervisor pattern):
  prepare → supervisor → run_specialists (sequential) → synthesizer

Why multi-agent over single agent:
- Each specialist has focused prompts → more accurate, actionable education
- Supervisor routes only relevant agents → lower latency & cost
- Easy to add new domains without retraining one monolith
"""

from typing import Any

from langchain_core.messages import HumanMessage
from langgraph.graph import END, StateGraph

from app.agents.nodes.prepare import prepare_context_node
from app.agents.nodes.specialists import specialist_node, synthesizer_node
from app.agents.nodes.supervisor import supervisor_node
from app.agents.state import AgentState

SPECIALIST_AGENTS = ["rewards", "credit_health", "emi", "spending", "fees"]


async def run_specialists_node(state: AgentState) -> dict:
    """Run each selected specialist sequentially and aggregate education items."""
    next_agents = state.get("next_agent", "spending").split(",")
    agents = [a.strip() for a in next_agents if a.strip() in SPECIALIST_AGENTS] or ["spending"]

    all_items: list[dict] = []
    all_used: list[str] = []
    current = dict(state)

    for agent_name in agents:
        result = await specialist_node(current, agent_name)
        all_items.extend(result.get("education_items", []))
        all_used.extend(result.get("agents_used", []))
        current = {**current, "education_items": all_items, "agents_used": all_used}

    return {"education_items": all_items, "agents_used": list(dict.fromkeys(all_used))}


def _build_graph() -> StateGraph:
    graph = StateGraph(AgentState)

    graph.add_node("prepare", prepare_context_node)
    graph.add_node("supervisor", supervisor_node)
    graph.add_node("run_specialists", run_specialists_node)
    graph.add_node("synthesizer", synthesizer_node)

    graph.set_entry_point("prepare")
    graph.add_edge("prepare", "supervisor")
    graph.add_edge("supervisor", "run_specialists")
    graph.add_edge("run_specialists", "synthesizer")
    graph.add_edge("synthesizer", END)
    return graph


_compiled_graph = None


def get_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = _build_graph().compile()
    return _compiled_graph


async def run_agent_graph(
    customer_code: str,
    message: str,
    behavior_context: str,
    behavior_profile: dict[str, Any],
    rag_context: str = "",
    focus_areas: list[str] | None = None,
) -> dict[str, Any]:
    graph = get_graph()
    initial: AgentState = {
        "messages": [HumanMessage(content=message)],
        "customer_code": customer_code,
        "behavior_context": behavior_context,
        "behavior_profile": behavior_profile,
        "rag_context": rag_context,
        "focus_areas": focus_areas or [],
        "next_agent": "",
        "education_items": [],
        "agents_used": [],
        "final_response": "",
    }
    result = await graph.ainvoke(initial)
    return {
        "response": result.get("final_response", ""),
        "education_items": result.get("education_items", []),
        "agents_used": result.get("agents_used", []),
    }
