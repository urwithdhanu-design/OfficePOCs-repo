"""Shared state for the LangGraph multi-agent workflow."""

from typing import Annotated, Any, TypedDict

from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    customer_code: str
    behavior_context: str
    behavior_profile: dict[str, Any]
    rag_context: str
    focus_areas: list[str]
    next_agent: str
    education_items: list[dict[str, Any]]
    agents_used: list[str]
    final_response: str
