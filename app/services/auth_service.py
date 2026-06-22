from sqlalchemy.orm import Session
from app.repositories import usuario_repository
from app.models.usuario_model import Usuario
from app import security
from fastapi import HTTPException

def registrar_usuario(db: Session, username: str, password: str):
    user_existente = usuario_repository.obter_por_username(db, username)
    if user_existente:
        raise HTTPException(status_code=400, detail="Usuário já registrado")
    
    hashed_password = security.get_password_hash(password)
    novo_usuario = Usuario(username=username, password_hash=hashed_password)
    return usuario_repository.criar_usuario(db, novo_usuario)

def autenticar_usuario(db: Session, username: str, password: str):
    user = usuario_repository.obter_por_username(db, username)
    if not user:
        return False
    if not security.verify_password(password, user.password_hash):
        return False
    return user
