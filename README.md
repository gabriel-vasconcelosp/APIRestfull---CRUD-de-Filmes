# Catálogo de Filmes (Full-Stack)

## Visão Geral

Esta é uma aplicação **Full-Stack** segura e moderna para o gerenciamento de catálogos de filmes. O sistema oferece:
- **Autenticação Segura (JWT):** Sistema de Login e Registro com senhas criptografadas via `bcrypt` e proteção de rotas via Bearer Tokens.
- **Painel Analítico:** Gráficos interativos (`Recharts`) baseados no histórico do usuário.
- **Busca Integrada:** Integração transparente com a API oficial do TMDB para busca de filmes, pôsteres e sinopses.
- **Armazenamento Permanente:** Operações de CRUD integradas ao banco de dados SQLite.

O Backend foi construído em Python com **FastAPI**, enquanto o Frontend utiliza **React.js** via Vite, entregando um design premium inspirado em plataformas de streaming (Dark Theme e UI Dinâmica).

## Estrutura da Arquitetura

O backend segue conceitos de **Clean Architecture**:

- `app/controllers` → Endpoints da API (Filmes, TMDB e Auth).
- `app/services` → Regras de negócio, busca externa e geração de Tokens JWT.
- `app/repositories` → Acesso ao banco de dados SQLite (SQLAlchemy).
- `app/models` → Tabelas do Banco de Dados (`usuarios` e `filmes`).
- `app/schemas` → Validação de entrada e saída (Pydantic).
- `app/security.py` → Motor de Criptografia e middlewares de segurança.

## Tecnologias Utilizadas

- **Backend**: Python 3.11, FastAPI, SQLAlchemy, SQLite, Uvicorn, PyJWT, Passlib (Bcrypt).
- **Frontend**: React 18, Vite, Recharts, React Router Dom, Iconify.
- **Infraestrutura**: Docker Compose.

## Configuração Obrigatória (.env)

O sistema exige uma chave da API do **The Movie Database (TMDB)** para buscar os dados dos filmes.
Crie um arquivo chamado `.env` na raiz do projeto contendo:
```env
TMDB_API_KEY=sua_chave_de_acesso_aqui
```

---

## Como Executar

### Opção 1: Via Docker Compose (Recomendado)

Esta opção constrói as imagens isoladas e resolve toda a configuração automaticamente:
```bash
docker compose up --build -d
```
- Acesse a Aplicação React: `http://localhost:5173`
- Acesse a Documentação do FastAPI (Swagger): `http://localhost:8000/docs`

### Opção 2: Execução Local (Terminal Padrão)

**1. Subindo o Backend (FastAPI)**
```bash
# Crie e ative seu ambiente virtual
python -m venv .venv
# (No Windows)
.venv\Scripts\activate

# Instale todas as dependências
pip install -r requirements.txt

# Inicie o servidor Python
python run.py
```

**2. Subindo o Frontend (React)**
Abra um novo terminal e navegue para a pasta `frontend/`:
```bash
cd frontend
npm install
npm run dev
```

*(O Vite encaminha automaticamente as rotas `/auth`, `/filmes` e `/tmdb` para o backend na porta 8000).*

---

## Estrutura do Banco de Dados (SQLite)

O banco local (`filmes.db`) possui duas tabelas principais:

1. **`usuarios`**: 
   - `id` (PK), `username` (Único), `password_hash` (Senhas criptografadas).
2. **`filmes`**:
   - `id` (PK), `titulo`, `genero`, `ano`, `nota` (0.0 a 10.0), `poster`, `usuario` (Dono do registro), `data_cadastro`.

---

## Endpoints e Rotas da API

Todas as requisições privadas devem conter o cabeçalho HTTP: `Authorization: Bearer <seu_token_jwt>`.

### Autenticação (`/auth`)
- **`POST /auth/register`**: Cria um novo usuário.
- **`POST /auth/login`**: Valida as credenciais e devolve um `access_token` JWT.

### Gerenciamento de Filmes (`/filmes`)
- **`POST /filmes`**: Salva um novo filme. O proprietário é vinculado via Token JWT.
- **`GET /filmes`**: Retorna a lista de filmes do usuário atual, ordenada do mais recente para o mais antigo.
- **`PUT /filmes/{id}`**: Atualiza os dados de um filme específico.
- **`DELETE /filmes/{id}`**: Remove o registro do filme.

### Buscador TMDB (`/tmdb`)
- **`GET /tmdb/search?query=...`**: Faz uma requisição segura para o TMDB, mapeia os metadados (como tradução de gêneros) e devolve a lista pronta para o React.

---

## Autores
Projeto desenvolvido por:
- Bruno Ferreira da Costa - 1240114845
- Bruno Lourenço Queiroz da Silva - 1240120417
- Carlos Augusto da Silva Souza - 1240101684
- Eduardo Rodrigues Gomes - 1240208119
- Gabriel Ribeiro - 1240113883
- Gabriel Vasconcelos - 1210102929
- Guilherme Ribeiro Alves - 1240200753
- Jamilly Dias Deodato - 1240205458
- João Vitor Hermes Fonseca Coelho - 1240112457
- João Victor Pereira dos Reis - 1240111812
- Lucas Rodrigues Correia - 1240105219
- Matheus de Souza - 1240100507
- Mauricio Gonçalves Simões Júnior - 1230103599
- Rafael Matias Alonso Carvalhal - 1240107511
- Victor Gusmão Moreira Vieira - 1260114525
