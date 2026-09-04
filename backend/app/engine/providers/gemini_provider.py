# app/engine/providers/gemini_provider.py
import os
import httpx
import json
from typing import Dict, Any, List, Optional

class GeminiProvider:
    """موفر Gemini API للتفاعل مع نموذج Google Gemini"""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"
        self.model = "gemini-2.0-flash-exp"
    
    async def chat(
        self,
        message: str,
        system_instruction: str = "",
        history: List[Dict[str, str]] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> Dict[str, Any]:
        """إرسال طلب محادثة إلى Gemini"""
        
        if not self.api_key:
            return {
                "success": False,
                "error": "GEMINI_API_KEY غير مضبوط. أضفه في ملف .env",
                "reply": "⚠️ عذراً، مفتاح Gemini غير مضبوط. يرجى إضافة GEMINI_API_KEY في إعدادات الخادم."
            }
        
        url = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"
        
        # بناء المحتوى
        contents = []
        
        # التعليمات النظامية
        if system_instruction:
            contents.append({
                "role": "user",
                "parts": [{"text": f"System: {system_instruction}"}]
            })
            contents.append({
                "role": "model",
                "parts": [{"text": "فهمت التعليمات. سألتزم بها."}]
            })
        
        # إضافة السجل
        if history:
            for msg in history:
                role = "user" if msg.get("role") == "user" else "model"
                contents.append({
                    "role": role,
                    "parts": [{"text": msg.get("content", "")}]
                })
        
        # الرسالة الحالية
        contents.append({
            "role": "user",
            "parts": [{"text": message}]
        })
        
        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
                "topP": 0.95,
                "topK": 40
            },
            "safetySettings": [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        }
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, json=payload)
                result = response.json()
                
                if response.status_code == 200:
                    # استخراج النص من الرد
                    try:
                        reply = result["candidates"][0]["content"]["parts"][0]["text"]
                        return {
                            "success": True,
                            "reply": reply,
                            "raw": result
                        }
                    except (KeyError, IndexError) as e:
                        return {
                            "success": False,
                            "error": f"خطأ في تحليل رد Gemini: {str(e)}",
                            "reply": "⚠️ حدث خطأ في معالجة رد الذكاء الاصطناعي."
                        }
                else:
                    error_msg = result.get("error", {}).get("message", "خطأ غير معروف")
                    return {
                        "success": False,
                        "error": error_msg,
                        "reply": f"⚠️ خطأ في الاتصال بـ Gemini: {error_msg}"
                    }
        except httpx.TimeoutException:
            return {
                "success": False,
                "error": "انتهت مهلة الاتصال بـ Gemini",
                "reply": "⚠️ استغرق الطلب وقتاً طويلاً. حاول مرة أخرى."
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "reply": f"⚠️ حدث خطأ: {str(e)}"
            }
