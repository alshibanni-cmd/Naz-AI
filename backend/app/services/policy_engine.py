from dataclasses import dataclass
from enum import Enum
from .settings_resolver import resolve_effective
from typing import Optional

class Risk(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class PolicyDecision:
    allowed: bool
    requires_approval: bool
    reason: str

DEFAULT_ACTIONS = {
    "read_file": (True, False),
    "search_web": (True, False),
    "analyze": (True, False),
    "create_artifact": (True, False),
    "run_python": (True, False),
    "delete_file": (True, True),
    "modify_source_data": (True, True),
    "database_write": (True, True),
    "external_share": (True, True),
    "publish": (True, True),
    "send_external_message": (True, True),
}

PERMISSION_KEY = {
    "delete_file": "delete_files",
    "modify_source_data": "modify_source_data",
    "database_write": "database_write",
    "external_share": "external_share",
}

def check_action(action: str, workspace_id: str, project_id: Optional[str], task_controls: Optional[dict] = None):
    if action not in DEFAULT_ACTIONS:
        return PolicyDecision(False, False, "Unknown action is denied by default.")

    config = resolve_effective(workspace_id, project_id, task_controls)
    default_allowed, default_approval = DEFAULT_ACTIONS[action]
    if not default_allowed:
        return PolicyDecision(False, False, "Denied by default policy.")

    permission_key = PERMISSION_KEY.get(action)
    if permission_key:
        setting = config.get(permission_key, "required")
        if setting == "denied":
            return PolicyDecision(False, False, f"{action} is disabled by policy.")
        if setting == "required":
            return PolicyDecision(True, True, f"{action} requires approval.")
        return PolicyDecision(True, False, f"{action} is allowed by policy.")

    return PolicyDecision(True, default_approval, "Allowed by action policy.")
