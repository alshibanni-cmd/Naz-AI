from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, chat, skills, dashboard, projects, proposals

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Naz AI API",
    description="الخادم الخلفي لمنصة Naz AI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["المصادقة"])
app.include_router(chat.router, prefix="/chat", tags=["المحادثة"])
app.include_router(skills.router, prefix="/skills", tags=["المهارات"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["لوحة التحكم"])
app.include_router(projects.router, prefix="/projects", tags=["المشاريع"])
app.include_router(proposals.router, prefix="/proposals", tags=["المقترحات"])

@app.get("/")
async def root():
    return {"message": "Naz AI API is running!", "status": "online", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "الخادم يعمل بشكل طبيعي"}