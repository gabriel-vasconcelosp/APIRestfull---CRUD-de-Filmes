from fastapi import APIRouter, HTTPException, Query
from app.services.tmdb_service import search_movies

router = APIRouter(prefix="/tmdb", tags=["TMDB"])

@router.get("/search")
async def search_tmdb_movies(query: str = Query(..., min_length=2, description="Termo de busca")):
    try:
        results = await search_movies(query)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
