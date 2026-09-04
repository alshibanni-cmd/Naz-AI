from typing import Optional, Dict, Any
from datetime import datetime
import uuid

# مخزن مؤقت للطلبات (سيتم استبداله بقاعدة بيانات)
pending_approvals: Dict[str, Dict[str, Any]] = {}

def request_approval(action: str, agent: str, project_id: Optional[str], details: Dict[str, Any]) -> str:
    request_id = str(uuid.uuid4())
    pending_approvals[request_id] = {
        "id": request_id,
        "action": action,
        "agent": agent,
        "project_id": project_id,
        "details": details,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }
    return request_id

def approve_request(request_id: str) -> bool:
    if request_id in pending_approvals and pending_approvals[request_id]["status"] == "pending":
        pending_approvals[request_id]["status"] = "approved"
        return True
    return False

def deny_request(request_id: str) -> bool:
    if request_id in pending_approvals and pending_approvals[request_id]["status"] == "pending":
        pending_approvals[request_id]["status"] = "denied"
        return True
    return False

def get_pending_requests(user_id: Optional[str] = None) -> list:
    return [req for req in pending_approvals.values() if req["status"] == "pending"]