from sqlalchemy import Column, Integer, String, Float
from app.database.connection import Base

class Filme(Base):
    __tablename__ = "filmes"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String)
    genero = Column(String)
    ano = Column(Integer)
    nota = Column(Float)
    poster = Column(String, nullable=True)
    usuario = Column(String, default="admin")
    data_cadastro = Column(String, nullable=True)