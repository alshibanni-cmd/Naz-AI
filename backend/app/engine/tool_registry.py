# app/engine/tool_registry.py
from typing import Dict, Any, List, Optional
import json
import httpx

class ToolRegistry:
    """تسجيل وإدارة الأدوات المتاحة لـ Naz AI"""
    
    def __init__(self, settings: Dict[str, Any]):
        self.settings = settings
        self.tools = []
        self._register_tools()
    
    def _register_tools(self):
        """تسجيل الأدوات بناءً على الإعدادات"""
        # 1. البحث على الويب
        if self.settings.get("toolsIntegrations", {}).get("webSearch", True):
            self.tools.append({
                "name": "web_search",
                "description": "البحث على الإنترنت للحصول على معلومات حديثة",
                "enabled": True
            })
        
        # 2. تحليل الملفات
        if self.settings.get("toolsIntegrations", {}).get("fileAnalysis", True):
            self.tools.append({
                "name": "file_analysis",
                "description": "قراءة وتحليل الملفات المرفوعة",
                "enabled": True
            })
        
        # 3. تنفيذ Python
        if self.settings.get("toolsIntegrations", {}).get("python", True):
            self.tools.append({
                "name": "python_execution",
                "description": "تنفيذ أكواد Python",
                "enabled": True,
                "sensitive": True
            })
        
        # 4. تحليل البيانات
        if self.settings.get("toolsIntegrations", {}).get("dataAnalysis", True):
            self.tools.append({
                "name": "data_analysis",
                "description": "تحليل البيانات وإنتاج إحصائيات",
                "enabled": True
            })
        
        # 5. المستندات
        if self.settings.get("toolsIntegrations", {}).get("documents", True):
            self.tools.append({
                "name": "documents",
                "description": "معالجة المستندات",
                "enabled": True
            })
        
        # 6. لوحة المعلومات
        if self.settings.get("toolsIntegrations", {}).get("dashboard", True):
            self.tools.append({
                "name": "dashboard",
                "description": "إنشاء لوحات المعلومات",
                "enabled": True
            })
    
    def get_tools(self) -> List[Dict[str, Any]]:
        """الحصول على قائمة الأدوات المتاحة"""
        return [t for t in self.tools if t.get("enabled", True)]
    
    def is_tool_enabled(self, tool_name: str) -> bool:
        """التحقق مما إذا كانت أداة معينة مفعلة"""
        for tool in self.tools:
            if tool["name"] == tool_name:
                return tool.get("enabled", False)
        return False
    
    def get_tool(self, tool_name: str) -> Optional[Dict[str, Any]]:
        """الحصول على أداة معينة"""
        for tool in self.tools:
            if tool["name"] == tool_name:
                return tool
        return None
    
    def get_tool_names(self) -> List[str]:
        """الحصول على أسماء الأدوات المتاحة"""
        return [t["name"] for t in self.tools if t.get("enabled", True)]
