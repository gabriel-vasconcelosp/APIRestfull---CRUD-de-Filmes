from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.filme_model import Filme

def criar_filme(db: Session, filme):
    novo_filme = Filme(**filme.dict())
    db.add(novo_filme)
    db.commit()
    db.refresh(novo_filme)
    return novo_filme

def listar_filmes(db: Session, usuario: str = None):
    if usuario:
        return db.query(Filme).filter(Filme.usuario == usuario).order_by(desc(Filme.id)).all()
    return db.query(Filme).order_by(desc(Filme.id)).all()

def obter_filme (db:Session, filme_id: int):
    return db.query(Filme).get(filme_id)

def deletar_filme(db: Session, filme_id: int):
    filme = db.query(Filme).filter(Filme.id == filme_id).first()
    if filme:
        db.delete(filme)
        db.commit()
    return filme

def atualizar_filme(db: Session, filme_id: int, dados):
    filme = db.query(Filme).filter(Filme.id == filme_id).first()
    
    if filme:
        filme.titulo = dados.titulo
        filme.genero = dados.genero
        filme.ano = dados.ano
        filme.nota = dados.nota

        db.commit()
        db.refresh(filme)

    return filme