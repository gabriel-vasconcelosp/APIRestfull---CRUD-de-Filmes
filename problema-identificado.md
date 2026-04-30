### Resolução de Problemas (Troubleshooting)

**Problema que ocorreu:**
Durante a inicialização da aplicação via Docker Compose, a API falhava ao subir e retornava o erro `sqlalchemy.exc.OperationalError: (sqlite3.OperationalError) unable to open database file`. O problema foi causado por dois fatores na configuração do Docker:
1. **Mapeamento de volume incorreto:** O `docker-compose.yml` tentava mapear o arquivo do banco diretamente (`./filmes.db:/app/filmes.db`). Como o arquivo ainda não existia no host, o Docker criava automaticamente uma pasta vazia com o nome `filmes.db`. O SQLAlchemy, por sua vez, tentava abrir essa pasta como se fosse um arquivo de banco de dados, resultando na falha.
2. **Serviço SQLite redundante:** O arquivo de orquestração possuía um contêiner separado rodando uma imagem do SQLite. Como o SQLite é um banco de dados serverless (baseado em arquivo), a aplicação deve ler e escrever no arquivo diretamente, tornando esse serviço extra desnecessário.

**Solução aplicada:**
Para resolver o problema e garantir a persistência correta dos dados:
1. A falsa pasta `filmes.db` foi deletada manualmente do sistema host.
2. O serviço extra do SQLite foi removido do `docker-compose.yml`.
3. O mapeamento de volumes foi ajustado para espelhar um diretório inteiro em vez de um arquivo direto:
   ```yaml
   volumes:
     - ./data:/app/data
    ```
4. A variável de ambiente que define a string de conexão (DATABASE_URL) foi atualizada para usar o caminho absoluto dentro do contêiner, apontando para a nova pasta mapeada:
    ```yaml
    environment:
      - DATABASE_URL: sqlite:////app/data/filmes.db
    ```
5. O comando de inicialização no Docker Compose foi limpo (`command: uvicorn app.main:app --host 0.0.0.0 --port 8000`), delegando a criação do arquivo .db exclusivamente ao SQLAlchemy.
6. O ambiente foi recriado limpo executando `docker compose down` seguido de `docker compose up --build`.