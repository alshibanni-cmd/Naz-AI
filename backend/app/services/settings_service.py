# app/services/settings_service.py
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime
import json

from ..models import Setting, SettingHistory

# ============================================================
# القيم الافتراضية الكاملة
# ============================================================
DEFAULT_SETTINGS = {
    "general": {
        "theme": "system",
        "accentColor": "blue",
        "interfaceDensity": "comfortable",
        "sidebar": "auto",
        "animations": True,
        "runPanel": "auto",
        "interfaceLanguage": "ar",
        "responseLanguage": "auto",
        "direction": "rtl",
        "timeZone": "UTC",
        "dateFormat": "DD/MM/YYYY",
        "numberFormat": "ar-EG",
        "currency": "USD",
        "taskNotifications": True,
        "approvalNotifications": True,
        "errorNotifications": True,
        "reportReady": True,
        "dashboardUpdated": True,
        "textSize": "normal",
        "contrast": "normal",
        "reducedMotion": False,
        "keyboardNavigation": True,
    },
    "personalization": {
        "personality": "professional",
        "responseLength": "balanced",
        "responseStyle": "professional",
        "headings": True,
        "tables": True,
        "lists": True,
        "steps": True,
        "summary": False,
        "recommendations": True,
        "profession": "",
        "role": "",
        "expertise": "",
        "goals": "",
        "customInstructions": "",
    },
    "aiBehavior": {
        "thinkingLevel": "balanced",
        "defaultModel": "auto",
        "autoRouting": True,
        "independence": "guided",
        "planning": "complex",
        "clarification": "necessary",
        "executionStyle": "balanced",
    },
    "memoryKnowledge": {
        "useMemory": True,
        "pastConversations": True,
        "projectContext": True,
        "projectFiles": True,
        "memoryScope": "project",
        "savedMemories": [],
        "knowledgeSources": {
            "projectFiles": True,
            "reports": True,
            "datasets": True,
            "previousWork": True,
            "connectedSources": True,
        },
        "temporarySession": False,
    },
    "toolsIntegrations": {
        "webSearch": True,
        "fileAnalysis": True,
        "python": True,
        "browser": True,
        "dataAnalysis": True,
        "documents": True,
        "dashboard": True,
        "helpers": {
            "research": True,
            "dataAnalysis": True,
            "reports": True,
            "documents": True,
            "qualityCheck": True,
        },
        "skills": {"mySkills": [], "builtInSkills": [], "teamSkills": []},
        "integrations": {},
    },
    "dataFiles": {
        "keepOriginalFiles": True,
        "keepVersions": True,
        "fileRetention": "30",
        "missingDataStrategy": "ai_decides",
        "duplicates": "detect_and_notify",
        "invalidValues": "detect_and_notify",
        "outliers": "detect_and_notify",
        "confidenceLevel": 95,
        "decimalPrecision": 2,
        "statisticalChecks": True,
        "tableFormat": "n_plus_percent",
        "autoChartSelection": True,
        "visualizationStyle": "standard",
        "showValues": True,
        "dashboardTheme": "light",
        "kpiVisibility": True,
        "filters": True,
        "numberFormat": "standard",
        "tableStyle": "bordered",
        "reportLanguage": "ar",
        "reportType": "executive",
        "reportStructure": "standard",
        "reportMethods": True,
        "reportRecommendations": True,
        "reportTemplates": [],
        "exports": {
            "excel": True,
            "csv": True,
            "word": True,
            "pdf": True,
            "powerpoint": True,
            "html": True,
        },
    },
    "automation": {
        "automaticUpdates": True,
        "scheduledTasks": False,
        "scheduledTaskList": [],
        "automaticActions": {
            "analyzeUpdatedData": True,
            "updateDashboard": True,
            "createSummary": True,
            "notifyMe": True,
        },
        "errorAlerts": True,
        "automationLevel": "standard",
    },
    "privacySecurity": {
        "saveConversations": True,
        "useMemory": True,
        "useConnectedData": True,
        "fileRetention": "30",
        "privateSession": False,
        "readFiles": "allowed",
        "editFiles": "requires_approval",
        "deleteFiles": "requires_approval",
        "runCode": "allowed",
        "shareFiles": "requires_approval",
        "publish": "requires_approval",
        "askBefore": {
            "delete": True,
            "changeOriginalData": True,
            "databaseChanges": True,
            "externalSharing": True,
            "publishing": True,
        },
        "mfa": False,
        "fileScanning": True,
        "sensitiveDataProtection": True,
        "activeSessions": [],
    },
    "workspaceTeam": {
        "workspaceName": "مساحة العمل الخاصة بي",
        "defaultLanguage": "ar",
        "defaultPolicies": {},
        "members": [],
        "roles": {},
        "invitations": [],
        "sharedWork": {
            "projects": True,
            "knowledge": True,
            "skills": True,
            "agents": True,
            "reports": True,
        },
        "teamRules": {
            "dataAccess": "restricted",
            "toolAccess": "restricted",
            "approvalRules": "strict",
            "sharingRules": "restricted",
        },
    },
    "usageBilling": {
        "usage": {"ai": 0, "agentRuns": 0, "research": 0, "compute": 0, "storage": 0},
        "costs": {"today": 0, "thisMonth": 0, "byTask": {}, "byAgent": {}},
        "limits": {"ai": 1000, "storage": 5, "automation": 10},
        "currentPlan": "free",
        "billingCycle": "monthly",
        "invoices": [],
        "paymentMethod": None,
    },
    "advanced": {
        "advancedModelControls": False,
        "advancedContext": False,
        "advancedAgentSettings": False,
        "experimentalFeatures": False,
        "advancedModelSelection": "auto",
        "contextSize": "auto",
        "fallbackModel": "auto",
        "advancedRouting": True,
        "knowledgeRetrieval": "auto",
        "contextStrategy": "auto",
        "sourcePriority": "auto",
        "agentBehavior": "auto",
        "toolBehavior": "auto",
        "skillBehavior": "auto",
    },
    "developer": {
        "developerMode": False,
        "apiKeys": [],
        "webhooks": [],
        "customTools": [],
        "customAgents": [],
        "mcpServers": [],
        "diagnostics": {"logs": [], "errors": [], "technicalInfo": {}},
        "featureFlags": {},
        "environment": "development",
    },
}

class SettingsService:
    @staticmethod
    def get_settings(
        db: Session,
        user_id: Optional[str] = None,
        workspace_id: Optional[str] = None,
        project_id: Optional[str] = None,
        task_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """جلب الإعدادات حسب النطاق مع حل التعارضات"""
        scopes = [
            ("task", task_id),
            ("project", project_id),
            ("workspace", workspace_id),
            ("user", user_id),
            ("system", None)
        ]

        all_settings: Dict[str, Any] = {}
        sources: Dict[str, str] = {}

        for scope, scope_id in scopes:
            if scope == "system" and scope_id is None:
                settings = DEFAULT_SETTINGS.copy()
                for key, value in settings.items():
                    if key not in all_settings:
                        all_settings[key] = value
                        sources[key] = "system"
            else:
                query = db.query(Setting).filter(
                    Setting.scope == scope,
                    Setting.scope_id == scope_id if scope_id else Setting.scope_id.is_(None)
                )
                db_settings = query.all()
                for s in db_settings:
                    if s.key not in all_settings:
                        all_settings[s.key] = s.value
                        sources[s.key] = f"{scope}:{scope_id or 'default'}"

        return {
            "settings": all_settings,
            "sources": sources
        }

    @staticmethod
    def update_setting(
        db: Session,
        key: str,
        value: Any,
        scope: str = "user",
        scope_id: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> Setting:
        query = db.query(Setting).filter(
            Setting.key == key,
            Setting.scope == scope,
            Setting.scope_id == scope_id if scope_id else Setting.scope_id.is_(None)
        )
        setting = query.first()

        if setting:
            old_value = setting.value
            setting.value = value
            setting.updated_at = datetime.utcnow()
        else:
            setting = Setting(
                key=key,
                value=value,
                scope=scope,
                scope_id=scope_id,
                user_id=user_id
            )
            db.add(setting)
            old_value = None

        history = SettingHistory(
            setting_key=key,
            old_value=old_value,
            new_value=value,
            scope=scope,
            scope_id=scope_id,
            user_id=user_id,
            action="update"
        )
        db.add(history)
        db.commit()
        db.refresh(setting)
        return setting

    @staticmethod
    def reset_settings(
        db: Session,
        scope: str = "user",
        scope_id: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> bool:
        query = db.query(Setting).filter(
            Setting.scope == scope,
            Setting.scope_id == scope_id if scope_id else Setting.scope_id.is_(None)
        )
        query.delete()

        history = SettingHistory(
            setting_key="*",
            old_value=None,
            new_value={"reset": True},
            scope=scope,
            scope_id=scope_id,
            user_id=user_id,
            action="reset"
        )
        db.add(history)
        db.commit()
        return True

    @staticmethod
    def apply_setting(
        db: Session,
        key: str,
        value: Any,
        user_id: Optional[str] = None,
        workspace_id: Optional[str] = None
    ) -> Tuple[bool, str]:
        SettingsService.update_setting(
            db=db,
            key=key,
            value=value,
            scope="user",
            scope_id=user_id,
            user_id=user_id
        )

        history = SettingHistory(
            setting_key=key,
            old_value=None,
            new_value=value,
            scope="user",
            scope_id=user_id,
            user_id=user_id,
            action="apply"
        )
        db.add(history)
        db.commit()
        return True, f"تم تطبيق {key} بنجاح"

    @staticmethod
    def apply_all_settings(
        db: Session,
        settings: Dict[str, Any],
        user_id: Optional[str] = None,
        workspace_id: Optional[str] = None
    ) -> Tuple[bool, str]:
        for key, value in settings.items():
            SettingsService.update_setting(
                db=db,
                key=key,
                value=value,
                scope="user",
                scope_id=user_id,
                user_id=user_id
            )

        history = SettingHistory(
            setting_key="*",
            old_value=None,
            new_value={"applied": True},
            scope="user",
            scope_id=user_id,
            user_id=user_id,
            action="apply_all"
        )
        db.add(history)
        db.commit()
        return True, "تم تطبيق جميع الإعدادات"

    @staticmethod
    def get_history(
        db: Session,
        user_id: Optional[str] = None,
        limit: int = 50
    ) -> List[SettingHistory]:
        query = db.query(SettingHistory)
        if user_id:
            query = query.filter(SettingHistory.user_id == user_id)
        return query.order_by(SettingHistory.created_at.desc()).limit(limit).all()
