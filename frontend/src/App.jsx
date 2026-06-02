import { useEffect, useState } from "react";

const API_URL = "/filmes";

const initialForm = {
  titulo: "",
  genero: "",
  ano: "",
  nota: "",
};

function getNotaClass(nota) {
  if (nota > 8) return "note-green";
  if (nota >= 6) return "note-yellow";
  return "note-red";
}

function MovieCard({ filme, onEdit, onDelete }) {
  return (
    <article className="movie-card">
      <div className="movie-card__header">
        <div>
          <h3>{filme.titulo}</h3>
          <p className="movie-card__meta">{filme.genero}</p>
        </div>
        <span className={`movie-card__note ${getNotaClass(filme.nota)}`}>{filme.nota}/10</span>
      </div>

      <p className="movie-card__meta">Ano de lancamento: {filme.ano}</p>

      <div className="movie-card__actions">
        <button type="button" className="btn btn-secondary" onClick={() => onEdit(filme)}>
          Editar
        </button>
        <button type="button" className="btn btn-danger" onClick={() => onDelete(filme)}>
          Excluir
        </button>
      </div>
    </article>
  );
}

export default function App() {
  const [filmes, setFilmes] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  async function carregarFilmes() {
    setLoading(true);

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Nao foi possivel buscar os filmes.");
      }

      const data = await response.json();
      setFilmes(data);
    } catch (error) {
      setFeedback({ message: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarFilmes();
  }, []);

  function resetForm(message = "", type = "") {
    setFormData(initialForm);
    setEditingId(null);
    setFeedback({ message, type });
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleEdit(filme) {
    setEditingId(filme.id);
    setFormData({
      titulo: filme.titulo,
      genero: filme.genero,
      ano: String(filme.ano),
      nota: String(filme.nota),
    });
    setFeedback({ message: "", type: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      titulo: formData.titulo.trim(),
      genero: formData.genero.trim(),
      ano: Number(formData.ano),
      nota: Number(formData.nota),
    };

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Nao foi possivel salvar o filme.");
      }

      await carregarFilmes();
      resetForm(
        editingId ? "Filme atualizado com sucesso." : "Filme cadastrado com sucesso.",
        "success",
      );
    } catch (error) {
      setFeedback({ message: error.message, type: "error" });
    }
  }

  async function handleDelete(filme) {
    const confirmed = window.confirm(`Deseja excluir o filme "${filme.titulo}"?`);
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${filme.id}`, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Nao foi possivel excluir o filme.");
      }

      if (editingId === filme.id) {
        resetForm();
      }

      setFeedback({ message: "Filme removido com sucesso.", type: "success" });
      await carregarFilmes();
    } catch (error) {
      setFeedback({ message: error.message, type: "error" });
    }
  }

  const empty = !loading && filmes.length === 0;
  const formTitle = editingId ? `Editando: ${formData.titulo || "filme"}` : "Novo filme";

  return (
    <div className="page-shell">
      <header className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Projeto da faculdade</p>
          <h1>Painel de filmes com cadastro, edicao e exclusao</h1>
          <p className="hero__text">
            Uma interface React com Vite para consumir a API RESTful e demonstrar o CRUD completo.
          </p>
        </div>

        <div className="hero__card">
          <div className="floating-icons" aria-hidden="true">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg" alt="" className="icon-float fastapi" />
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" alt="" className="icon-float react" />
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg" alt="" className="icon-float vite" />
          </div>
          <span className="hero__badge">FastAPI + React + Vite</span>
          <p>Rode o backend na porta 8000 e o frontend na 5173 para desenvolver com recarregamento rapido.</p>
        </div>
      </header>

      <main className="content">
        <section className="panel form-panel">
          <div className="section-heading">
            <p className="section-kicker">Cadastro</p>
            <h2>{formTitle}</h2>
          </div>

          <form className="film-form" onSubmit={handleSubmit}>
            <label>
              Titulo
              <input
                name="titulo"
                type="text"
                maxLength="100"
                required
                value={formData.titulo}
                onChange={handleChange}
              />
            </label>

            <label>
              Genero
              <input
                name="genero"
                type="text"
                maxLength="50"
                required
                value={formData.genero}
                onChange={handleChange}
              />
            </label>

            <div className="form-grid">
              <label>
                Ano
                <input
                  name="ano"
                  type="number"
                  min="1888"
                  max="2100"
                  required
                  value={formData.ano}
                  onChange={handleChange}
                />
              </label>

              <label>
                Nota
                <input
                  name="nota"
                  type="number"
                  min="0"
                  max="10"
                  required
                  value={formData.nota}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Salvar filme
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => resetForm("Edicao cancelada.")}
                >
                  Cancelar edicao
                </button>
              )}
            </div>
          </form>

          <p className={`feedback ${feedback.type || ""}`.trim()} role="status" aria-live="polite">
            {feedback.message}
          </p>
        </section>

        <section className="panel list-panel">
          <div className="section-heading list-heading">
            <div>
              <p className="section-kicker">Lista</p>
              <h2>Filmes cadastrados</h2>
            </div>
            <button type="button" className="btn btn-secondary" onClick={carregarFilmes}>
              Atualizar
            </button>
          </div>

          {loading && <div className="state-message">Carregando filmes...</div>}
          {empty && (
            <div className="state-message">
              Nenhum filme cadastrado ainda. Use o formulario ao lado para criar o primeiro.
            </div>
          )}

          <div className="movies-grid">
            {filmes.map((filme) => (
              <MovieCard key={filme.id} filme={filme} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
