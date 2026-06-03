"""pgvector-backed RAG for financial education content."""

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import EducationContent
from app.services.llm import get_embeddings


async def search_education(
    db: AsyncSession,
    query: str,
    topic: str | None = None,
    limit: int = 3,
) -> list[EducationContent]:
    embeddings = get_embeddings()
    query_vec = await embeddings.aembed_query(query)
    vec_str = "[" + ",".join(str(x) for x in query_vec) + "]"

    sql = """
        SELECT id, topic, title, content, tags
        FROM education_content
        WHERE embedding IS NOT NULL
    """
    params: dict = {"vec": vec_str, "limit": limit}
    if topic:
        sql += " AND topic = :topic"
        params["topic"] = topic
    sql += " ORDER BY embedding <=> :vec::vector LIMIT :limit"

    result = await db.execute(text(sql), params)
    rows = result.fetchall()
    items = []
    for row in rows:
        items.append(
            EducationContent(
                id=row[0],
                topic=row[1],
                title=row[2],
                content=row[3],
                tags=row[4] or [],
            )
        )
    return items


async def embed_and_store_content(db: AsyncSession, content: EducationContent) -> None:
    embeddings = get_embeddings()
    text_to_embed = f"{content.title}\n{content.content}"
    vec = await embeddings.aembed_query(text_to_embed)
    content.embedding = vec
    db.add(content)
    await db.flush()


async def get_all_education(db: AsyncSession) -> list[EducationContent]:
    result = await db.execute(select(EducationContent))
    return list(result.scalars().all())
