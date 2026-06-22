from pydantic import BaseModel, Field
from typing import Optional

class FilmeCreate(BaseModel):
    titulo: str
    genero: str
    ano: int
    nota: float = Field(ge=0, le=10)
    poster: Optional[str] = None
    usuario: Optional[str] = None
    data_cadastro: Optional[str] = None

class Filme(FilmeCreate):
    id: int

    class Config:
        from_attributes = True