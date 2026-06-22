from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.database.connection import engine, Base
from app.controllers import filme_controller, tmdb_controller, auth_controller

app = FastAPI()
frontend_dir = Path(__file__).resolve().parent.parent / "frontend"
frontend_dist_dir = frontend_dir / "dist"

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(filme_controller.router)
app.include_router(tmdb_controller.router)
app.include_router(auth_controller.router)

if frontend_dist_dir.exists():
    assets_dir = frontend_dist_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="frontend-assets")

@app.get("/")
def home():
    if frontend_dist_dir.exists():
        return FileResponse(frontend_dist_dir / "index.html")

    return {
        "mensagem": "API funcionando! Rode o frontend Vite com npm run dev dentro da pasta frontend.",
        "docs": "http://127.0.0.1:8000/docs",
    }
