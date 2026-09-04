from sqlalchemy.orm import Session
from sqlalchemy import func
from .models import KnowledgeChunk
from .embedding import generate_embedding, serialize_embedding, deserialize_embedding
import math
import json

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list:
    if not text or len(text) <= chunk_size:
        return [text] if text else []
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        if end < len(text):
            last_period = text.rfind('.', start, end)
            last_question = text.rfind('؟', start, end)
            last_newline = text.rfind('\n', start, end)
            last_cut = max(last_period, last_question, last_newline)
            if last_cut > start + chunk_size // 2:
                end = last_cut + 1
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = end - overlap if end < len(text) else end
    return chunks

async def store_knowledge_chunk(db: Session, user_id: int, content: str, source_type: str, source_id: str = "", extra: dict = None):
    embedding = await generate_embedding(content)
    embedding_str = serialize_embedding(embedding)
    chunk = KnowledgeChunk(
        user_id=user_id,
        content=content,
        embedding=embedding_str,
        source_type=source_type,
        source_id=source_id,
        extra=extra or {}
    )
    db.add(chunk)
    db.commit()
    return chunk

async def store_conversation_memory(db: Session, user_id: int, conversation_id: int, messages: list):
    texts = []
    for msg in messages:
        if msg.get("role") in ["user", "assistant"]:
            content = msg.get("content", "")
            if content:
                texts.append(content)
    if not texts:
        return 0
    full_text = "\n".join(texts)
    chunks = chunk_text(full_text, chunk_size=500)
    for i, chunk in enumerate(chunks):
        await store_knowledge_chunk(
            db=db,
            user_id=user_id,
            content=chunk,
            source_type="conversation",
            source_id=str(conversation_id),
            extra={"chunk_index": i, "total_chunks": len(chunks)}
        )
    return len(chunks)

async def store_document_memory(db: Session, user_id: int, filename: str, content: str, file_id: str = ""):
    if not content or len(content.strip()) < 10:
        return 0
    chunks = chunk_text(content, chunk_size=500)
    for i, chunk in enumerate(chunks):
        await store_knowledge_chunk(
            db=db,
            user_id=user_id,
            content=chunk,
            source_type="file",
            source_id=file_id or filename,
            extra={"filename": filename, "chunk_index": i, "total_chunks": len(chunks)}
        )
    return len(chunks)

def cosine_similarity(a: list, b: list) -> float:
    if len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)

async def retrieve_similar_chunks(db: Session, user_id: int, query: str, limit: int = 5) -> list:
    query_embedding = await generate_embedding(query)
    chunks = db.query(KnowledgeChunk).filter(KnowledgeChunk.user_id == user_id).all()
    results = []
    for chunk in chunks:
        chunk_embedding = deserialize_embedding(chunk.embedding)
        similarity = cosine_similarity(query_embedding, chunk_embedding)
        results.append({
            "content": chunk.content,
            "similarity": similarity,
            "extra": chunk.extra,
            "source_type": chunk.source_type,
            "source_id": chunk.source_id
        })
    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results[:limit]

async def search_memory(db: Session, user_id: int, query: str, limit: int = 5) -> dict:
    similar = await retrieve_similar_chunks(db, user_id, query, limit)
    if not similar:
        return {"context": "", "sources": []}
    context_parts = []
    for item in similar:
        source_label = {
            "conversation": "من محادثة سابقة",
            "file": "من ملف مرفوع",
            "research": "من بحث سابق"
        }.get(item["source_type"], "من المصادر")
        context_parts.append(f"[{source_label}] {item['content']}")
    context = "\n\n".join(context_parts)
    return {
        "context": context,
        "sources": similar
    }

async def search_documents(db: Session, user_id: int, query: str, limit: int = 5) -> list:
    query_embedding = await generate_embedding(query)
    chunks = db.query(KnowledgeChunk).filter(
        KnowledgeChunk.user_id == user_id,
        KnowledgeChunk.source_type == "file"
    ).all()
    results = []
    for chunk in chunks:
        chunk_embedding = deserialize_embedding(chunk.embedding)
        similarity = cosine_similarity(query_embedding, chunk_embedding)
        results.append({
            "content": chunk.content,
            "similarity": similarity,
            "extra": chunk.extra,
            "filename": chunk.extra.get("filename", "ملف غير معروف") if chunk.extra else "ملف غير معروف"
        })
    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results[:limit]