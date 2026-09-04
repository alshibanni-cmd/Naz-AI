import os
import httpx
from typing import Dict, Any, List, Optional

class GroqProvider:
    """Groq Provider - Fast & Free AI Models"""
    
    # الموديلات المتاحة في حسابك
    MODELS = {
        "gpt-oss-120b": "openai/gpt-oss-120b",          # الأقوى
        "gpt-oss-20b": "openai/gpt-oss-20b",            # الأسرع
        "qwen-32b": "qwen/qwen3.6-27b",                # Qwen3
        "qwen-alt": "qwen/qwen3.8-27b",                 # Qwen3 بديل
        "allam": "allam-2-7b",                          # عربي
        "compound": "groq/compound",                    # Groq الافتراضي
    }
    
    def __init__(self, model: str = "openai/gpt-oss-120b"):
        self.api_key = os.getenv("GROQ_API_KEY", "")
        self.base_url = "https://api.groq.com/openai/v1"
        self.model = model
    
    async def chat(
        self,
        message: str,
        system_instruction: str = "",
        history: List[Dict[str, str]] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024
    ) -> Dict[str, Any]:
        if not self.api_key:
            return {
                "success": False,
                "error": "GROQ_API_KEY not set",
                "reply": "Please set GROQ_API_KEY in .env file"
            }
        
        url = f"{self.base_url}/chat/completions"
        
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        if history:
            for msg in history:
                role = "user" if msg.get("role") == "user" else "assistant"
                messages.append({"role": role, "content": msg.get("content", "")})
        messages.append({"role": "user", "content": message})
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                result = response.json()
                
                if response.status_code == 200:
                    reply = result["choices"][0]["message"]["content"]
                    return {
                        "success": True,
                        "reply": reply,
                        "model": self.model,
                        "raw": result
                    }
                else:
                    error_msg = result.get("error", {}).get("message", "Unknown error")
                    return {
                        "success": False,
                        "error": error_msg,
                        "reply": f"Groq Error: {error_msg}"
                    }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "reply": f"Error: {str(e)}"
            }
    
    async def chat_with_fallback(
        self,
        message: str,
        system_instruction: str = "",
        history: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Try multiple models in order"""
        for model_name in ["openai/gpt-oss-120b", "qwen/qwen3.6-27b", "openai/gpt-oss-20b"]:
            self.model = model_name
            result = await self.chat(message, system_instruction, history)
            if result.get("success"):
                return result
        return {"success": False, "error": "All models failed", "reply": "All Groq models failed"}
