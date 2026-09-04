# app/schemas/settings.py
from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import datetime

class SettingApplyRequest(BaseModel):
    key: str
    value: Any

class SettingApplyAllRequest(BaseModel):
    settings: Dict[str, Any]

class SettingsResolverRequest(BaseModel):
    user_id: Optional[str] = None
    workspace_id: Optional[str] = None
    project_id: Optional[str] = None
    task_id: Optional[str] = None
