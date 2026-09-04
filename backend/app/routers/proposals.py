from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import json

from ..database import get_db
from ..models import User, ProjectProposal
from ..engine.naz_engine import NazEngine
from ..dependencies import get_current_user

router = APIRouter( tags=["proposals"])


class ProposalCreate(BaseModel):
    name: str
    description: Optional[str] = None
    sector: Optional[str] = None
    target_group: Optional[str] = None
    target_count: Optional[int] = None
    components: Optional[List[str]] = None
    language: Optional[str] = "ar"
    tone: Optional[str] = "professional"
    mode: Optional[str] = "project_intelligence"


class ProposalUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    sector: Optional[str] = None
    target_group: Optional[str] = None
    target_count: Optional[int] = None
    components: Optional[List[str]] = None
    environment_analysis: Optional[str] = None
    similar_projects: Optional[List[dict]] = None
    management_methodology: Optional[str] = None
    risk_register: Optional[List[dict]] = None
    budget_estimate: Optional[dict] = None
    language: Optional[str] = None
    tone: Optional[str] = None
    mode: Optional[str] = None


class ProposalResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: Optional[str]
    sector: Optional[str]
    target_group: Optional[str]
    target_count: Optional[int]
    components: Optional[List[str]]
    environment_analysis: Optional[str]
    similar_projects: Optional[List[dict]]
    management_methodology: Optional[str]
    risk_register: Optional[List[dict]]
    budget_estimate: Optional[dict]
    language: Optional[str]
    tone: Optional[str]
    mode: Optional[str]
    generated_proposal: Optional[str]
    status: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class AnalyzeRequest(BaseModel):
    message: str
    language: Optional[str] = "ar"
    tone: Optional[str] = "professional"


@router.post("/create", response_model=ProposalResponse)
async def create_proposal(
    proposal: ProposalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_proposal = ProjectProposal(
        user_id=current_user.id,
        name=proposal.name,
        description=proposal.description,
        sector=proposal.sector,
        target_group=proposal.target_group,
        target_count=proposal.target_count,
        components=proposal.components,
        language=proposal.language or "ar",
        tone=proposal.tone or "professional",
        mode=proposal.mode or "project_intelligence",
        status="draft"
    )
    db.add(db_proposal)
    db.commit()
    db.refresh(db_proposal)
    return db_proposal


@router.get("/list", response_model=List[ProposalResponse])
async def list_proposals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    proposals = db.query(ProjectProposal).filter(
        ProjectProposal.user_id == current_user.id
    ).order_by(ProjectProposal.created_at.desc()).all()
    return proposals


@router.get("/{proposal_id}", response_model=ProposalResponse)
async def get_proposal(
    proposal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    proposal = db.query(ProjectProposal).filter(
        ProjectProposal.id == proposal_id,
        ProjectProposal.user_id == current_user.id
    ).first()

    if not proposal:
        raise HTTPException(status_code=404, detail="المقترح غير موجود")

    return proposal


@router.put("/{proposal_id}", response_model=ProposalResponse)
async def update_proposal(
    proposal_id: int,
    proposal_update: ProposalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    proposal = db.query(ProjectProposal).filter(
        ProjectProposal.id == proposal_id,
        ProjectProposal.user_id == current_user.id
    ).first()

    if not proposal:
        raise HTTPException(status_code=404, detail="المقترح غير موجود")

    update_data = proposal_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(proposal, key, value)

    proposal.updated_at = datetime.now()
    db.commit()
    db.refresh(proposal)

    return proposal


@router.post("/analyze")
async def analyze_idea(
    request: AnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        engine = NazEngine(db, current_user.id, mode="project")
        result = await engine.chat(
            message=request.message,
            mode="project"
        )

        return {
            "success": result.get("success", False),
            "analysis": result.get("reply", "⚠️ لم يتم الحصول على تحليل"),
            "error": result.get("error")
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في تحليل الفكرة: {str(e)}")


@router.post("/{proposal_id}/generate", response_model=ProposalResponse)
async def generate_proposal(
    proposal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    proposal = db.query(ProjectProposal).filter(
        ProjectProposal.id == proposal_id,
        ProjectProposal.user_id == current_user.id
    ).first()

    if not proposal:
        raise HTTPException(status_code=404, detail="المقترح غير موجود")

    try:
        project_data = f"""
        اسم المشروع: {proposal.name}
        الوصف: {proposal.description or 'غير محدد'}
        القطاع: {proposal.sector or 'غير محدد'}
        الفئة المستهدفة: {proposal.target_group or 'غير محدد'}
        عدد المستهدفين: {proposal.target_count or 'غير محدد'}
        المكونات: {json.dumps(proposal.components) if proposal.components else 'غير محددة'}
        تحليل البيئة: {proposal.environment_analysis or 'غير محدد'}
        المشاريع المشابهة: {json.dumps(proposal.similar_projects) if proposal.similar_projects else 'غير محددة'}
        منهجية الإدارة: {proposal.management_methodology or 'غير محددة'}
        سجل المخاطر: {json.dumps(proposal.risk_register) if proposal.risk_register else 'غير محدد'}
        الميزانية: {json.dumps(proposal.budget_estimate) if proposal.budget_estimate else 'غير محددة'}
        اللغة: {proposal.language or 'ar'}
        النبرة: {proposal.tone or 'professional'}
        """

        prompt = f"""
        بناءً على البيانات التالية، قم بكتابة مقترح مشروع احترافي كامل (من 10 إلى 30 صفحة) منظم بالأقسام التالية:
        1. ملخص تنفيذي
        2. مقدمة وخلفية
        3. تحليل المشكلة والاحتياج
        4. الهدف العام والأهداف الخاصة
        5. الفئة المستهدفة والنطاق الجغرافي
        6. تحليل البيئة (PESTLE / SWOT)
        7. المكونات والأنشطة التفصيلية
        8. المخرجات والنتائج المتوقعة
        9. المؤشرات (كمية ونوعية)
        10. الميزانية التفصيلية
        11. الجدول الزمني
        12. خطة إدارة المخاطر (سجل المخاطر مع التخفيف)
        13. خطة الاستدامة
        14. خطة التنفيذ
        15. التوصيات والمراجعة النقدية

        البيانات:
        {project_data}

        اكتب المقترح باللغة {proposal.language or 'العربية'}، بأسلوب {proposal.tone or 'مهني'} وواقعي.
        """

        engine = NazEngine(db, current_user.id, mode="project")
        result = await engine.chat(
            message=prompt,
            mode="project"
        )

        if result.get("success"):
            proposal.generated_proposal = result.get("reply")
            proposal.status = "completed"
            proposal.updated_at = datetime.now()
            db.commit()
            db.refresh(proposal)

        return proposal

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في توليد المقترح: {str(e)}")


@router.delete("/{proposal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_proposal(
    proposal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    proposal = db.query(ProjectProposal).filter(
        ProjectProposal.id == proposal_id,
        ProjectProposal.user_id == current_user.id
    ).first()

    if not proposal:
        raise HTTPException(status_code=404, detail="المقترح غير موجود")

    db.delete(proposal)
    db.commit()

    return {"message": "تم حذف المقترح بنجاح"}