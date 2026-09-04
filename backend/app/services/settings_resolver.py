from typing import Any, Dict, Optional
from copy import deepcopy

SYSTEM_DEFAULTS = {
    "language": "ar",
    "model": "auto",
    "reasoning": "balanced",
    "autonomy": "guided",
    "memory": True,
    "project_context": True,
    "project_only": False,
    "web": False,
    "python": True,
    "delete_files": "required",
    "modify_source_data": "required",
    "database_write": "required",
    "external_share": "required",
    "approval_required": True,
    "alpha": 0.05,
    "confidence": 0.95,
    "report_language": "ar"
}

def resolve_effective(workspace_id: str, project_id: Optional[str], task_controls: Optional[Dict[str, Any]] = None):
    result = deepcopy(SYSTEM_DEFAULTS)
    # هنا يمكن إضافة دمج للإعدادات من قاعدة البيانات
    if task_controls:
        result.update(task_controls)
    return enforce_policies(result)

def enforce_policies(config: Dict[str, Any]):
    # تطبيق السياسة الأكثر تقييداً
    order = {"denied": 2, "required": 1, "optional": 0}
    for key in ["delete_files", "modify_source_data", "database_write", "external_share"]:
        value = config.get(key, "required")
        if value not in order:
            config[key] = "required"

    config["approval_required"] = any(
        config[k] == "required"
        for k in ["delete_files", "modify_source_data", "database_write", "external_share"]
    )
    return config