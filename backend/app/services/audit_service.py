from typing import Any, Optional
from datetime import datetime
import json

# مخزن مؤقت للسجلات (سيتم استبداله بقاعدة بيانات)
audit_logs: list = []

def record_event(event: dict) -> dict:
    payload = {
        **event,
        "recordedAt": datetime.utcnow().isoformat()
    }
    audit_logs.append(payload)
    return payload

def get_audit_logs(limit: int = 100) -> list:
    return audit_logs[-limit:]