"""Prepare context: behavior profile + RAG education snippets."""

from langchain_core.messages import HumanMessage

from app.agents.state import AgentState


async def prepare_context_node(state: AgentState) -> dict:
    """Behavior and RAG context are injected by graph runner before invoke."""
    return {}
