from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from .database import get_db
from .dependencies import get_current_user
from .models import User, KnowledgeChunk
from .rag import search_memory

router = APIRouter(prefix="/memory", tags=["memory"])

class MemorySearchRequest(BaseModel):
    query: str
    limit: int = 5

@router.post("/search")
async def search_in_memory(
    request: MemorySearchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = await search_memory(db, current_user.id, request.query, request.limit)
    return result

@router.get("/chunks")
async def list_memory_chunks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50,
    offset: int = 0
):
    chunks = db.query(KnowledgeChunk).filter(
        KnowledgeChunk.user_id == current_user.id
    ).order_by(
        KnowledgeChunk.created_at.desc()
    ).offset(offset).limit(limit).all()
    
    return [{
        "id": c.id,
        "content": c.content[:200] + ("..." if len(c.content) > 200 else ""),
        "full_content": c.content,
        "source_type": c.source_type,
        "source_id": c.source_id,
        "created_at": c.created_at.isoformat() if c.created_at else None,
        "extra": c.extra
    } for c in chunks]

@router.delete("/chunks/{chunk_id}")
async def delete_memory_chunk(
    chunk_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chunk = db.query(KnowledgeChunk).filter(
        KnowledgeChunk.id == chunk_id,
        KnowledgeChunk.user_id == current_user.id
    ).first()
    
    if not chunk:
        raise HTTPException(status_code=404, detail="الجزء غير موجود")
    
    db.delete(chunk)
    db.commit()
    return {"message": "تم الحذف بنجاح"}

@router.delete("/clear")
async def clear_all_memory(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(KnowledgeChunk).filter(KnowledgeChunk.user_id == current_user.id).delete()
    db.commit()
    return {"message": "تم مسح الذاكرة بنجاح"}
