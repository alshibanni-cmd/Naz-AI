# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# مسار قاعدة البيانات (استخدام مسار مطلق)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'naz_settings.db')}"

print(f"📁 مسار قاعدة البيانات: {DATABASE_URL}")

# إنشاء المحرك
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# جلسة قاعدة البيانات
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# قاعدة النماذج
Base = declarative_base()

# ✅ دالة للحصول على جلسة قاعدة البيانات (يجب أن تكون دالة عادية تعيد مولد)
def get_db():
    db = SessionLocal()
    try:
        print("✅ فتح جلسة قاعدة البيانات")
        yield db
    except Exception as e:
        print(f"❌ خطأ في جلسة قاعدة البيانات: {e}")
        raise
    finally:
        print("🔒 إغلاق جلسة قاعدة البيانات")
        db.close()
