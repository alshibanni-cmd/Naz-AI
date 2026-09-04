# app/routers/settings.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, Any
from datetime import datetime
import json

from ..database import get_db
from ..services.settings_service import SettingsService
from ..schemas.settings import SettingApplyRequest, SettingApplyAllRequest
from ..models import Setting

router = APIRouter(
    prefix="/settings",
    tags=["settings"]
)

# ============================================================
# GET /settings/
# ============================================================
@router.get("/")
async def get_settings(
    user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """جلب جميع الإعدادات"""
    try:
        result = SettingsService.get_settings(db=db, user_id=user_id)
        return {
            "success": True,
            "settings": result["settings"],
            "sources": result.get("sources", {}),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"فشل جلب الإعدادات: {str(e)}")

# ============================================================
# PUT /settings/  ← ✅ هذه هي النقطة المطلوبة
# ============================================================
@router.put("/")
async def update_setting(
    key: str = Query(..., description="مفتاح الإعداد"),
    value: str = Query(..., description="القيمة الجديدة (JSON string)"),
    scope: str = Query("user", description="النطاق"),
    scope_id: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """تحديث إعداد واحد"""
    try:
        # تحويل القيمة من JSON string
        try:
            parsed_value = json.loads(value)
        except:
            parsed_value = value  # إذا لم تكن JSON، استخدم القيمة كحرف نصي
        
        setting = SettingsService.update_setting(
            db=db,
            key=key,
            value=parsed_value,
            scope=scope,
            scope_id=scope_id,
            user_id=user_id
        )
        return {
            "success": True,
            "message": f"تم تحديث {key} بنجاح",
            "setting": {
                "key": setting.key,
                "value": setting.value,
                "scope": setting.scope,
                "scope_id": setting.scope_id,
                "updated_at": setting.updated_at
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"فشل تحديث الإعداد: {str(e)}")

# ============================================================
# DELETE /settings/
# ============================================================
@router.delete("/")
async def reset_settings(
    scope: str = Query("user"),
    scope_id: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """إعادة ضبط الإعدادات"""
    try:
        SettingsService.reset_settings(
            db=db,
            scope=scope,
            scope_id=scope_id,
            user_id=user_id
        )
        return {
            "success": True,
            "message": "تم إعادة ضبط الإعدادات",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"فشل إعادة ضبط الإعدادات: {str(e)}")

# ============================================================
# POST /settings/apply
# ============================================================
@router.post("/apply")
async def apply_setting(
    request: SettingApplyRequest,
    user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """تطبيق إعداد على Runtime"""
    try:
        success, message = SettingsService.apply_setting(
            db=db,
            key=request.key,
            value=request.value,
            user_id=user_id
        )
        if not success:
            raise HTTPException(status_code=400, detail=message)
        return {
            "success": True,
            "message": message,
            "applied": {"key": request.key, "value": request.value},
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"فشل تطبيق الإعداد: {str(e)}")

# ============================================================
# POST /settings/apply-all
# ============================================================
@router.post("/apply-all")
async def apply_all_settings(
    request: SettingApplyAllRequest,
    user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """تطبيق جميع الإعدادات على Runtime"""
    try:
        success, message = SettingsService.apply_all_settings(
            db=db,
            settings=request.settings,
            user_id=user_id
        )
        if not success:
            raise HTTPException(status_code=400, detail=message)
        return {
            "success": True,
            "message": message,
            "applied": request.settings,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"فشل تطبيق جميع الإعدادات: {str(e)}")

# ============================================================
# GET /settings/history
# ============================================================
@router.get("/history")
async def get_settings_history(
    user_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """جلب سجل تغييرات الإعدادات"""
    try:
        history = SettingsService.get_history(db=db, user_id=user_id, limit=limit)
        return {
            "success": True,
            "history": [
                {
                    "id": h.id,
                    "setting_key": h.setting_key,
                    "old_value": h.old_value,
                    "new_value": h.new_value,
                    "scope": h.scope,
                    "scope_id": h.scope_id,
                    "user_id": h.user_id,
                    "action": h.action,
                    "created_at": h.created_at
                }
                for h in history
            ],
            "count": len(history),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"فشل جلب سجل التغييرات: {str(e)}")

# ============================================================
# GET /settings/test-db
# ============================================================
@router.get("/test-db")
async def test_db_connection(
    db: Session = Depends(get_db)
):
    """اختبار الاتصال بقاعدة البيانات"""
    try:
        count = db.query(Setting).count()
        return {
            "success": True,
            "message": "الاتصال بقاعدة البيانات ناجح",
            "settings_count": count,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
