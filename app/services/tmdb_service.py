import os
import httpx
from dotenv import load_dotenv

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_BASE_URL = "https://api.themoviedb.org/3"

from pathlib import Path

async def search_movies(query: str):
    env_path = Path(__file__).resolve().parent.parent.parent / ".env"
    load_dotenv(dotenv_path=env_path, override=True)
    tmdb_key = os.getenv("TMDB_API_KEY")
    
    if not tmdb_key or tmdb_key == "YOUR_TMDB_API_KEY_HERE":
        raise Exception("Chave do TMDB não configurada. Por favor, adicione sua TMDB_API_KEY no arquivo .env")

    async with httpx.AsyncClient() as client:
        # Busca filmes
        response = await client.get(
            f"{TMDB_BASE_URL}/search/movie",
            params={
                "api_key": tmdb_key,
                "query": query,
                "language": "pt-BR",
                "page": 1,
                "include_adult": False
            }
        )
        response.raise_for_status()
        data = response.json()

        genre_map = {
            28: "Ação", 12: "Aventura", 16: "Animação", 35: "Comédia", 80: "Crime",
            99: "Documentário", 18: "Drama", 10751: "Família", 14: "Fantasia",
            36: "História", 27: "Terror", 10402: "Música", 9648: "Mistério",
            10749: "Romance", 878: "Ficção científica", 10770: "Cinema TV",
            53: "Thriller", 10752: "Guerra", 37: "Faroeste"
        }

        results = []
        for item in data.get("results", [])[:10]: # Limita a 10 resultados
            genres = [genre_map.get(g_id, "Desconhecido") for g_id in item.get("genre_ids", [])]
            genre_str = ", ".join(genres) if genres else "Desconhecido"
            
            # Extrai o ano
            release_date = item.get("release_date", "")
            year = release_date.split("-")[0] if release_date else ""

            results.append({
                "tmdb_id": item.get("id"),
                "titulo": item.get("title"),
                "genero": genre_str,
                "ano": int(year) if year.isdigit() else 0,
                "poster": f"https://image.tmdb.org/t/p/w200{item.get('poster_path')}" if item.get("poster_path") else None,
                "sinopse": item.get("overview")
            })
            
        return results
