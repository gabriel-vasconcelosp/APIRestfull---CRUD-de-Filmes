from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.database.connection import get_db
from app.schemas import usuario_schema
from app.services import auth_service
from app.security import create_access_token

router = APIRouter()

@router.post("/auth/register", response_model=usuario_schema.UsuarioResponse)
def register(user: usuario_schema.UsuarioCreate, db: Session = Depends(get_db)):
    return auth_service.registrar_usuario(db, user.username, user.password)

@router.post("/auth/login", response_model=usuario_schema.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth_service.autenticar_usuario(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}
