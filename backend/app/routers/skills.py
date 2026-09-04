from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from ..database import get_db
from ..models import User, Skill
from ..engine.naz_engine import NazEngine
from ..dependencies import get_current_user

router = APIRouter(tags=["skills"])
class SkillCreate(BaseModel):
    name: str
    description: Optional[str] = None
    prompt: str
    plan: Optional[List[dict]] = None
    tools: Optional[List[str]] = None


class SkillResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: Optional[str]
    prompt: str
    plan: Optional[List[dict]]
    tools: Optional[List[str]]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class SkillExecuteResponse(BaseModel):
    success: bool
    reply: str
    skill_id: int
    skill_name: str


@router.post("/create", response_model=SkillResponse)
async def create_skill(
    skill: SkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_skill = Skill(
        user_id=current_user.id,
        name=skill.name,
        description=skill.description,
        prompt=skill.prompt,
        plan=skill.plan,
        tools=skill.tools
    )
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill


@router.get("/list", response_model=List[SkillResponse])
async def list_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skills = db.query(Skill).filter(
        Skill.user_id == current_user.id
    ).order_by(Skill.created_at.desc()).all()
    return skills


@router.post("/execute/{skill_id}", response_model=SkillExecuteResponse)
async def execute_skill(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skill = db.query(Skill).filter(
        Skill.id == skill_id,
        Skill.user_id == current_user.id
    ).first()

    if not skill:
        raise HTTPException(status_code=404, detail="المهارة غير موجودة")

    try:
        engine = NazEngine(db, current_user.id)
        result = await engine.execute_skill(
            prompt=skill.prompt,
            plan=skill.plan,
            tools=skill.tools
        )

        return {
            "success": result.get("success", False),
            "reply": result.get("reply", "⚠️ لم يتم الحصول على رد"),
            "skill_id": skill.id,
            "skill_name": skill.name
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في تنفيذ المهارة: {str(e)}")


@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_skill(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skill = db.query(Skill).filter(
        Skill.id == skill_id,
        Skill.user_id == current_user.id
    ).first()

    if not skill:
        raise HTTPException(status_code=404, detail="المهارة غير موجودة")

    db.delete(skill)
    db.commit()
    return {"message": "تم حذف المهارة بنجاح"}