from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from ..database import get_db
from ..models import User, Skill, Message
from ..dependencies import get_current_user

router = APIRouter( tags=["dashboard"])


@router.get("/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # عدد المهارات
    skills_count = db.query(Skill).filter(Skill.user_id == current_user.id).count()

    # عدد الرسائل (كمؤشر للنشاط)
    messages_count = 0  # TODO: relation needed

    # نشاط الأيام السبعة الماضية
    seven_days_ago = datetime.now() - timedelta(days=7)
    daily_activity = db.query(
        func.date(Message.created_at).label("date"),
        func.count(Message.id).label("count")
    ).filter(
        True,  # TODO: fix relation
        Message.created_at >= seven_days_ago
    ).group_by(func.date(Message.created_at)).all()

    activity_data = [
        {"date": str(day.date), "count": day.count}
        for day in daily_activity
    ]

    popular_settings = [
        {"name": "اللغة", "value": "العربية", "usage": 85},
        {"name": "الشخصية", "value": "مهني", "usage": 70},
        {"name": "نوع الرد", "value": "متوازن", "usage": 60},
    ]

    return {
        "conversations": messages_count,
        "skills": skills_count,
        "files": 0,
        "activity": activity_data,
        "popular_settings": popular_settings,
        "recent_activity": [
            {"action": "محادثة جديدة", "time": "منذ 5 دقائق"},
            {"action": "تحليل ملف", "time": "منذ ساعة"},
            {"action": "حفظ مهارة", "time": "منذ 3 ساعات"},
        ]
    }
