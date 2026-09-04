import os
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from .providers.groq_provider import GroqProvider
from .model_router import ModelRouter

load_dotenv()


class NazEngine:
    PROJECT_SYSTEM_PROMPT = "You are Naz AI assistant. Respond in Arabic."

    def __init__(self, db: Session, user_id=None, user_settings=None, mode="default"):
        self.db = db
        self.user_id = user_id
        self.user_settings = user_settings or {}
        self.mode = mode
        self.router = ModelRouter()
        self.provider = GroqProvider()
        self.history = []

    def _build_prompt(self, message, history, file_content=None, file_name=None):
        if self.mode == "project":
            return f"PROJECT MODE: {message}"
        system_parts = ["You are Naz AI assistant. Respond in Arabic."]
        history_text = "\n".join([f"{h['"'"'role'"'"']}: {h['"'"'content'"'"']}" for h in (history or [])[-10:]])
        file_section = f"\nFile: {file_name}\nContent: {file_content[:30000] if file_content else '"'"''"'"'}" if file_content and file_name else ""
        return "\n".join(system_parts) + "\n\nHistory: " + history_text + "\n\n" + file_section + "\n\nUser: " + message + "\n\nAssistant:"

    async def chat(self, message, history=None, files=None, file_content=None, file_name=None, search_results=None, mode=None):
        if mode:
            self.mode = mode
        try:
            prompt = self._build_prompt(message=message, history=history or [], file_content=file_content, file_name=file_name)
            if search_results and search_results.get("success") and self.mode != "project":
                from ..services.search_service import SearchService
                search_service = SearchService()
                search_context = search_service.format_search_context(search_results)
                prompt = prompt + "\n\n" + search_context
            response = await self.provider.chat(message=prompt, system_instruction="You are Naz AI. Respond in Arabic.", history=history or [])
            if response.get("success"):
                reply = response["reply"]
            else:
                reply = "Error: " + response.get("reply", "Unknown error")
            return {"success": response.get("success", False), "reply": reply, "applied_settings": self.user_settings, "private_session": not self.user_settings.get("memory", True), "error": response.get("error")}
        except Exception as e:
            return {"success": False, "reply": "Error: " + str(e), "applied_settings": self.user_settings, "private_session": False, "error": str(e)}

    async def execute_skill(self, prompt, plan=None, tools=None):
        try:
            context = ""
            if plan and len(plan) > 0:
                context = context + "\nPlan:\n"
                for step in plan:
                    context = context + "- " + step.get('"'"'step'"'"', '"'"'step'"'"') + "\n"
            if tools and len(tools) > 0:
                context = context + "\nTools: " + ", ".join(tools) + "\n"
            full_prompt = prompt + "\n\n" + context if context else prompt
            response = await self.provider.chat(message=full_prompt, system_instruction="You are Naz AI.", history=[])
            reply = response.get("reply", "No response") if response.get("success") else "Error"
            return {"success": response.get("success", False), "reply": reply, "applied_settings": self.user_settings, "error": response.get("error")}
        except Exception as e:
            return {"success": False, "reply": "Error: " + str(e), "applied_settings": self.user_settings, "error": str(e)}