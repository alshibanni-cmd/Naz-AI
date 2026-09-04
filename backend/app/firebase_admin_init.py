import firebase_admin
from firebase_admin import credentials, auth
import os

# تحديد مسار ملف المفتاح
cred_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "firebase-adminsdk.json")

# التحقق من وجود الملف
if not os.path.exists(cred_path):
    raise FileNotFoundError(f"ملف مفتاح Firebase غير موجود في المسار: {cred_path}")

# تهيئة Firebase Admin SDK
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

def verify_firebase_token(id_token: str):
    """
    التحقق من صحة رمز Firebase ID Token وإرجاع البيانات المفككة
    """
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print(f"خطأ في التحقق من رمز Firebase: {str(e)}")
        return None