# backend/app/routers/chat.py

import os
import shutil
import json
from typing import Optional
from fastapi import APIRouter, File, Form, UploadFile, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Conversation, Message
from app.dependencies import get_current_user
from app.engine.naz_engine import NazEngine
from app.services.search_service import SearchService
from app.services.data_profiler import DataProfiler
from app.services.data_cleaner import DataCleaner
from app.services.report_generator import ReportGenerator

router = APIRouter()

# ============================================================
# 1. وظائف مساعدة
# ============================================================

def is_cleaning_request(command: str) -> bool:
    """تحديد ما إذا كان الطلب يتعلق بتنظيف البيانات"""
    keywords = [
        'نظف', 'تنظيف', 'clean', 'cleaning',
        'مرتب', 'ترتيب', 'إزالة المكررات', 'حذف المكررات',
        'توحيد', 'standardize', 'missing', 'فارغ',
        'تقرير', 'report', 'تحليل', 'analyze'
    ]
    command_lower = command.lower()
    return any(kw in command_lower for kw in keywords)

def save_upload_file(file: UploadFile, user_id: int) -> str:
    """حفظ الملف المرفوع في مجلد مؤقت"""
    upload_dir = f"uploads/user_{user_id}"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return file_path

def cleanup_temp_files(file_path: str):
    """حذف الملفات المؤقتة بعد الانتهاء"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"⚠️ خطأ في حذف الملف المؤقت: {e}")

# ============================================================
# 2. نقطة API الرئيسية للمحادثة
# ============================================================

@router.post("/")
async def chat(
    message: str = Form(...),
    user_id: int = Form(...),
    file: Optional[UploadFile] = File(None),
    history: Optional[str] = Form(None),
    settings: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    نقطة الدردشة الرئيسية
    تدعم الآن تنظيف البيانات المرفقة
    """
    
    # تحميل الإعدادات
    settings_dict = json.loads(settings) if settings else {}
    
    # تحميل تاريخ المحادثة
    history_messages = json.loads(history) if history else []
    
    # ============================================================
    # الحالة 1: تنظيف البيانات (ملف مرفق + طلب تنظيف)
    # ============================================================
    if file and is_cleaning_request(message):
        try:
            # حفظ الملف المرفوع
            file_path = save_upload_file(file, user_id)
            
            # 1. تحليل الملف
            profiler = DataProfiler(file_path)
            profile_summary = profiler.run()
            
            if 'error' in profile_summary:
                return {
                    "reply": f"⚠️ {profile_summary['error']}",
                    "run": None,
                    "search_results": None
                }
            
            # 2. تنظيف البيانات
            df_original = profiler.df  # DataFrame الأصلي
            cleaner = DataCleaner(df_original, message)
            df_cleaned, summary = cleaner.run()
            
            # 3. حفظ الملف النظيف
            file_ext = os.path.splitext(file.filename)[1].lower()
            clean_file_name = f"cleaned_{file.filename}"
            clean_file_path = os.path.join(os.path.dirname(file_path), clean_file_name)
            
            if file_ext in ['.xlsx', '.xls']:
                df_cleaned.to_excel(clean_file_path, index=False)
            else:
                df_cleaned.to_csv(clean_file_path, index=False, encoding='utf-8-sig')
            
            # 4. إنشاء التقرير (إذا كان المستخدم قد طلب ذلك)
            report_path = None
            report_text = cleaner.get_report_text()
            
            if 'تقرير' in message.lower() or 'report' in message.lower():
                report_gen = ReportGenerator(
                    original_df=df_original,
                    cleaned_df=df_cleaned,
                    summary=summary,
                    file_name=f"report_{file.filename.replace(file_ext, '.pdf')}"
                )
                report_path = report_gen.generate()
            
            # 5. بناء الرد
            reply = f"""
📊 **تم تنظيف الملف بنجاح!**

{report_text}

📁 **الملف النظيف:** `{clean_file_name}`

✅ تم الاحتفاظ بالملف الأصلي دون تعديل.
"""
            
            if report_path:
                reply += f"\n📄 **التقرير:** تم إنشاء تقرير PDF مفصل."
            
            # 6. إرجاع النتيجة
            return {
                "reply": reply,
                "clean_file": clean_file_name,
                "clean_file_path": clean_file_path,
                "report_file": os.path.basename(report_path) if report_path else None,
                "report_file_path": report_path,
                "summary": summary,
                "profile": profile_summary,
                "run": {
                    "status": "completed",
                    "plan": [
                        {"step": "تحليل الملف", "status": "done"},
                        {"step": "تنظيف البيانات", "status": "done"},
                        {"step": "إنشاء التقرير", "status": "done" if report_path else "skipped"}
                    ],
                    "tools": ["Pandas", "OpenPyXL", "ReportLab"],
                    "time": "00:05",
                    "cost": "$0.00",
                    "artifacts": [
                        {"name": clean_file_name, "type": "file", "size": f"{os.path.getsize(clean_file_path) / 1024:.1f} KB"}
                    ],
                    "progress": 100
                },
                "search_results": None
            }
            
        except Exception as e:
            print(f"❌ خطأ في تنظيف البيانات: {e}")
            return {
                "reply": f"⚠️ حدث خطأ أثناء تنظيف البيانات: {str(e)}",
                "run": None,
                "search_results": None
            }
    
    # ============================================================
    # الحالة 2: محادثة عادية (بدون تنظيف)
    # ============================================================
    else:
        try:
            # تشغيل المحرك الرئيسي
            engine = NazEngine(db, user_id)
            
            # حفظ رسالة المستخدم في المحادثة
            # أولاً نبحث عن محادثة موجودة أو ننشئ جديدة
            conversation = db.query(Conversation).filter(
                Conversation.user_id == user_id
            ).order_by(Conversation.created_at.desc()).first()
            
            if not conversation:
                conversation = Conversation(
                    user_id=user_id,
                    title=message[:50] if message else "محادثة جديدة"
                )
                db.add(conversation)
                db.commit()
                db.refresh(conversation)
            
            # حفظ رسالة المستخدم
            user_message = Message(
                conversation_id=conversation.id,
                role="user",
                content=message
            )
            db.add(user_message)
            db.commit()
            
            # معالجة الملف المرفوع (إن وجد)
            file_content = None
            file_name = None
            if file:
                file_path = save_upload_file(file, user_id)
                with open(file_path, 'rb') as f:
                    file_content = f.read()
                file_name = file.filename
                cleanup_temp_files(file_path)
            
            # الحصول على رد من المحرك
            response = await engine.chat(message=message, history=history_messages)
            
            # حفظ رد المساعد
            assistant_message = Message(
                conversation_id=conversation.id,
                role="assistant",
                content=response.get("reply", "⚠️ لم يتم الحصول على رد")
            )
            db.add(assistant_message)
            db.commit()
            
            return {
                "reply": response.get("reply", "⚠️ لم يتم الحصول على رد"),
                "run": response.get("run"),
                "search_results": response.get("search_results")
            }
            
        except Exception as e:
            print(f"❌ خطأ في المحادثة: {e}")
            return {
                "reply": f"⚠️ حدث خطأ: {str(e)}",
                "run": None,
                "search_results": None
            }

# ============================================================
# 3. نقطة API لتحميل الملف النظيف
# ============================================================

@router.get("/download/{user_id}/{file_name}")
async def download_file(
    user_id: int,
    file_name: str,
    current_user: User = Depends(get_current_user)
):
    """تحميل ملف نظيف أو تقرير"""
    file_path = os.path.join(f"uploads/user_{user_id}", file_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="الملف غير موجود")
    
    return FileResponse(
        path=file_path,
        filename=file_name,
        media_type="application/octet-stream"
    )