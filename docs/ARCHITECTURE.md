# Naz AI - Architecture Overview

## Backend Structure (Python/FastAPI)

backend/app/
- main.py: نقطة دخول FastAPI
- database.py: اتصال SQLAlchemy
- dependencies.py: JWT + Auth
- models.py: 11 نماذج قاعدة
- embedding.py: Embeddings (RAG)
- rag.py: RAG System
- memory_routes.py: Memory API
- firebase_admin_init.py: Firebaseengine/
- naz_engine.py: المحرك الرئيسي
- tool_registry.py: سجل الأدوات
- providers/gemini_provider.py: Gemini API

routers/
- auth.py, chat.py, dashboard.py
- projects.py, proposals.py, settings.py, skills.py

schemas/
- settings.py: Pydantic models

services/
- approval_engine.py, audit_service.py
- data_cleaner.py, data_profiler.py
- policy_engine.py, prompt_compiler.py
- report_generator.py, search_service.py
- settings_resolver.py, settings_service.py

## Frontend Structure (Next.js)

app/
- layout.tsx, page.tsx (1334 سطر)
- login/, register/, onboarding/, settings/
- api/settings/route.ts

components/
- NazLogo, ProjectWizard, ProjectProposalCard
- settings/SettingsModal

context/, hooks/, lib/, reducers/, services/, types/, utils/

## Authentication Flow

Browser -> Middleware -> /api/auth/login
-> FastAPI -> JWT -> HttpOnly Cookie
-> Proxy (Bearer) -> Protected Routes

## Data Flow

Frontend -> Next.js API -> FastAPI -> Services
-> Database / AI Provider -> Response
