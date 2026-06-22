from app.repositories import filme_repository

def criar(db, filme):
    return filme_repository.criar_filme(db, filme)

def listar(db, usuario=None):
    return filme_repository.listar_filmes(db, usuario)

def obter(db, filme_id):
    return filme_repository.obter_filme(db, filme_id)

def deletar(db, filme_id):
    return filme_repository.deletar_filme(db, filme_id)

def atualizar(db, filme_id, dados):
    return filme_repository.atualizar_filme(db, filme_id, dados)