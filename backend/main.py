from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import chat, auth, skills, dashboard, projects, proposals

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Naz AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(skills.router)
app.include_router(dashboard.router)
app.include_router(projects.router)
app.include_router(proposals.router)  # ✅ حاضنة المشاريع


@app.get("/")
async def root():
    return {"message": "Naz AI Backend is running!"}