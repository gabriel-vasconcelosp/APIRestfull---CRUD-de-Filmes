from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal, get_db
from app.schemas.filme_schema import FilmeCreate
from app.services import filme_service
from fastapi import APIRouter, Depends, HTTPException
from app.models.usuario_model import Usuario
from app.security import get_current_user

router = APIRouter()



@router.post("/filmes")
def criar_filme(filme: FilmeCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    filme.usuario = current_user.username
    return filme_service.criar(db, filme)

@router.get("/filmes")
def listar_filmes(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    return filme_service.listar(db, current_user.username)

@router.get("/filmes/{filme_id}")
def obter_filme(filme_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    filme = filme_service.obter(db, filme_id)
    
    if not filme:
        raise HTTPException(status_code=404, detail="Filme não encontrado")
    
    return filme

@router.delete("/filmes/{filme_id}")
def deletar_filme(filme_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    filme = filme_service.deletar(db, filme_id)
    
    if not filme:
        raise HTTPException(status_code=404, detail="Filme não encontrado")
    
    return filme

@router.put("/filmes/{filme_id}")
def atualizar_filme(filme_id: int, filme: FilmeCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    filme.usuario = current_user.username
    filme = filme_service.atualizar(db, filme_id, filme)
    
    if not filme: 
        raise HTTPException(status_code=404, detail="Filme não encontrado")
    
    return filme