from sqlalchemy.orm import Session
from app.models.usuario_model import Usuario

def obter_por_username(db: Session, username: str):
    return db.query(Usuario).filter(Usuario.username == username).first()

def criar_usuario(db: Session, usuario_db: Usuario):
    db.add(usuario_db)
    db.commit()
    db.refresh(usuario_db)
    return usuario_db
