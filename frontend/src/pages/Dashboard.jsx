import { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Icon } from "@iconify/react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import "../styles.css";

const API_URL = "/filmes";
const TMDB_SEARCH_URL = "/tmdb/search"; // Usando proxy do vite

// ==========================================
// COMPONENTES DE ESTRELA
// ==========================================

function StarIcon({ fillPercentage = 100, size = 24 }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
      <Icon icon="mdi:star" style={{ position: 'absolute', top: 0, left: 0, fontSize: size, color: 'var(--border)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: `${fillPercentage}%`, overflow: 'hidden', height: size }}>
        <Icon icon="mdi:star" style={{ fontSize: size, color: 'var(--gold)' }} />
      </div>
    </div>
  );
}

function StarRating({ value, onChange }) {
  const [hoverValue, setHoverValue] = useState(null);

  const handleMouseMove = (e, starIndex) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - left) / width;
    const points = starIndex * 2; 
    const newValue = percent < 0.5 ? points - 1 : points;
    setHoverValue(newValue);
  };

  const handleMouseLeave = () => setHoverValue(null);
  const handleClick = () => { if (hoverValue !== null) onChange(hoverValue); };

  const displayValue = hoverValue !== null ? hoverValue : value;

  return (
    <div className="star-rating" onMouseLeave={handleMouseLeave} style={{ alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const points = star * 2;
        let fill = 0;
        if (displayValue >= points) fill = 100;
        else if (displayValue === points - 1) fill = 50;

        return (
          <div 
            key={star} 
            className="star-interactive"
            onMouseMove={(e) => handleMouseMove(e, star)}
            onClick={handleClick}
          >
            <StarIcon fillPercentage={fill} size={28} />
          </div>
        );
      })}
      <span style={{ marginLeft: '12px', fontSize: '0.95rem', fontWeight: 500, color: 'var(--muted)' }}>
        {displayValue > 0 ? `${(displayValue / 2).toFixed(1)}` : '0.0'}
      </span>
    </div>
  );
}

function StarDisplay({ value }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const points = star * 2;
        let fill = 0;
        if (value >= points) fill = 100;
        else if (value === points - 1) fill = 50;

        return <StarIcon key={star} fillPercentage={fill} size={18} />;
      })}
    </div>
  );
}

// ==========================================
// COMPONENTES PRINCIPAIS
// ==========================================

function MovieCard({ filme, onEdit, onDelete }) {
  return (
    <article className="movie-card" style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
      {filme.poster ? (
        <img src={filme.poster} alt={filme.titulo} style={{ width: '80px', height: '120px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }} />
      ) : (
        <div style={{ width: '80px', height: '120px', background: '#27272a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon icon="mdi:movie-open-outline" style={{ fontSize: '32px', color: 'var(--muted)' }} />
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div className="movie-card__header">
          <div>
            <h3>{filme.titulo}</h3>
            <p className="movie-card__meta">{filme.genero} • {filme.ano}</p>
            {filme.data_cadastro && <small style={{ color: 'var(--muted)', display: 'block', marginTop: '4px', fontSize: '0.8rem' }}>Adicionado em: {filme.data_cadastro}</small>}
          </div>
        </div>
      
      <div style={{ margin: '8px 0' }}>
        <StarDisplay value={filme.nota} />
      </div>

        <div className="movie-card__actions">
          <button type="button" className="btn-icon" onClick={() => onEdit(filme)} title="Editar">
            <Icon icon="mdi:pencil-outline" width="20" />
          </button>
          <button type="button" className="btn-icon" onClick={() => onDelete(filme)} title="Excluir" style={{ color: 'var(--danger)' }}>
            <Icon icon="mdi:trash-can-outline" width="20" />
          </button>
        </div>
      </div>
    </article>
  );
}

export const Dashboard = () => {
  const [filmes, setFilmes] = useState([]);
  
  // Estados Busca TMDB
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  const initialForm = { titulo: "", genero: "", ano: "", nota: 0, poster: "" };
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ message: "", type: "" })
  const { user, logout } = useAuth();

  useEffect(() => {
    carregarFilmes();
  }, []);

  // Busca TMDB
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`${TMDB_SEARCH_URL}?query=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Erro na busca", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery]);

  async function carregarFilmes() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_URL, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) {
        if (response.status === 401) logout();
        throw new Error("Falha ao buscar filmes.");
      }
      const data = await response.json();
      setFilmes(data);
    } catch (error) {
      setFeedback({ message: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  function resetForm(message = "", type = "") {
    setFormData(initialForm);
    setEditingId(null);
    setSearchQuery("");
    setSearchResults([]);
    setFeedback({ message, type });
  }

  function handleSelectTmdbMovie(tmdbMovie) {
    setFormData({
      titulo: tmdbMovie.titulo,
      genero: tmdbMovie.genero,
      ano: String(tmdbMovie.ano),
      nota: 0,
      poster: tmdbMovie.poster || ""
    });
    setSearchQuery(""); 
    setSearchResults([]); 
  }

  function handleEdit(filme) {
    setEditingId(filme.id);
    setFormData({
      titulo: filme.titulo,
      genero: filme.genero,
      ano: String(filme.ano),
      nota: filme.nota,
      poster: filme.poster || ""
    });
    setFeedback({ message: "", type: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!formData.titulo) {
      setFeedback({ message: "Selecione ou preencha um filme.", type: "error" });
      return;
    }

    const payload = {
      titulo: formData.titulo.trim(),
      genero: formData.genero.trim(),
      ano: Number(formData.ano) || 0,
      nota: formData.nota,
      poster: formData.poster,
      usuario: user,
      data_cadastro: new Date().toLocaleDateString('pt-BR')
    };

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Erro ao salvar.");
      
      await carregarFilmes();
      resetForm(editingId ? "Atualizado." : "Cadastrado.", "success");
    } catch (error) {
      setFeedback({ message: error.message, type: "error" });
    }
  }

  async function handleDelete(filme) {
    if (!window.confirm(`Excluir "${filme.titulo}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/${filme.id}`, { 
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Erro ao excluir.");
      if (editingId === filme.id) resetForm();
      setFeedback({ message: "Removido.", type: "success" });
      await carregarFilmes();
    } catch (error) {
      setFeedback({ message: error.message, type: "error" });
    }
  }

  // Analytics computations
  const totalFilmes = filmes.length;
  const horasAssistidas = Math.round(totalFilmes * 1.8); // Estimativa de 1.8h por filme
  const mediaNotas = totalFilmes > 0 
    ? (filmes.reduce((acc, f) => acc + (f.nota || 0), 0) / totalFilmes).toFixed(1)
    : "0.0";
  
  const generoCounts = {};
  filmes.forEach(f => {
    if (f.genero) {
      const gen = f.genero.split(',')[0].trim();
      generoCounts[gen] = (generoCounts[gen] || 0) + 1;
    }
  });
  
  // Mapa de cores semânticas para os gêneros
  const GENRE_COLORS = {
    'Ação': '#f97316', 'Action': '#f97316',
    'Comédia': '#eab308', 'Comedy': '#eab308',
    'Terror': '#ef4444', 'Horror': '#ef4444',
    'Romance': '#ec4899',
    'Ficção científica': '#06b6d4', 'Science Fiction': '#06b6d4',
    'Drama': '#8b5cf6',
    'Aventura': '#22c55e', 'Adventure': '#22c55e',
    'Fantasia': '#6366f1', 'Fantasy': '#6366f1',
    'Animação': '#14b8a6', 'Animation': '#14b8a6',
    'Suspense': '#52525b', 'Thriller': '#52525b',
    'Crime': '#991b1b',
    'Família': '#4ade80', 'Family': '#4ade80',
    'Mistério': '#8b5cf6', 'Mystery': '#8b5cf6'
  };
  const DEFAULT_COLOR = '#8884d8';

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
    const RADIAN = Math.PI / 180;
    // Posição no centro da fatia
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12px" fontWeight="bold">
        {value}
      </text>
    );
  };
  
  const pieData = Object.entries(generoCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ 
      name, 
      value, 
      color: GENRE_COLORS[name] || DEFAULT_COLOR 
    }));

  return (
    <div className="page-shell">
      <header className="header">
        <div>
          <h1><Icon icon="mdi:movie-open-play-outline" /> Catálogo</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--muted)', fontSize: '0.95rem' }}>Olá, {user}!</p>
        </div>
        <button onClick={logout} className="btn btn-secondary">
          <Icon icon="mdi:logout" /> Sair
        </button>
      </header>

      <section className="panel" style={{ position: 'relative', zIndex: 10 }}>
        <h2>{editingId ? 'Editar Filme' : 'Adicionar Filme'}</h2>

        {!editingId && (
          <div style={{ position: 'relative', marginBottom: '24px', zIndex: 100 }}>
            <div style={{ position: 'relative' }}>
              <Icon icon="mdi:magnify" style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--muted)', fontSize: '20px' }} />
              <input
                type="text"
                placeholder="Pesquisar filme (TMDB)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
              {isSearching && (
                <Icon icon="mdi:loading" className="spin" style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--muted)', fontSize: '20px' }} />
              )}
            </div>
            
            {searchResults.length > 0 && (
              <div className="tmdb-dropdown">
                {searchResults.map(result => (
                  <div key={result.tmdb_id} className="tmdb-item" onClick={() => handleSelectTmdbMovie(result)}>
                    {result.poster ? (
                      <img src={result.poster} alt={result.titulo} className="tmdb-poster" />
                    ) : (
                      <div className="tmdb-poster" />
                    )}
                    <div>
                      <strong style={{ display: 'block', marginBottom: '4px' }}>{result.titulo}</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{result.ano} • {result.genero}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(formData.titulo || editingId) && (
          <form onSubmit={handleSubmit}>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
              {formData.poster ? (
                <img src={formData.poster} alt={formData.titulo} style={{ width: '60px', height: '90px', objectFit: 'cover', borderRadius: '6px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }} />
              ) : (
                <div style={{ width: '60px', height: '90px', background: '#27272a', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon icon="mdi:movie-open-outline" style={{ fontSize: '24px', color: 'var(--muted)' }} />
                </div>
              )}
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', color: '#fff' }}>{formData.titulo} <span style={{ color: 'var(--muted)', fontWeight: 'normal' }}>({formData.ano})</span></h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--accent-light)' }}>{formData.genero}</p>
              </div>
            </div>

            <div className="form-group">
              <label>Sua Avaliação</label>
              <StarRating value={formData.nota} onChange={(val) => setFormData(c => ({...c, nota: val}))} />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
              <button type="submit" className="btn btn-primary">
                <Icon icon="mdi:check" /> {editingId ? 'Salvar' : 'Adicionar'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => resetForm("Cancelado.")}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {feedback.message && (
          <p className={`feedback ${feedback.type}`}>{feedback.message}</p>
        )}
      </section>

      {filmes.length > 0 && (
        <section className="panel" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '24px', padding: '16px 24px' }}>
          
          {/* Blocos de Estatísticas Numéricas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: '1 1 180px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '12px', borderRadius: '8px', display: 'flex' }}>
                <Icon icon="mdi:movie-roll" style={{ fontSize: '28px', color: 'var(--accent)' }} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', color: 'var(--muted)', fontSize: '0.85rem' }}>Total Assistido</p>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>{totalFilmes} <span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 'normal' }}>filmes</span></h3>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ background: 'rgba(234, 179, 8, 0.2)', padding: '12px', borderRadius: '8px', display: 'flex' }}>
                <Icon icon="mdi:clock-time-four-outline" style={{ fontSize: '28px', color: '#eab308' }} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', color: 'var(--muted)', fontSize: '0.85rem' }}>Horas Assistidas <span style={{ fontSize: '0.7rem' }}>(aprox.)</span></p>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>{horasAssistidas} <span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 'normal' }}>horas</span></h3>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ background: 'rgba(56, 189, 248, 0.2)', padding: '12px', borderRadius: '8px', display: 'flex' }}>
                <Icon icon="mdi:star-outline" style={{ fontSize: '28px', color: '#38bdf8' }} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', color: 'var(--muted)', fontSize: '0.85rem' }}>Média de Notas</p>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>{mediaNotas} <span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 'normal' }}>/ 10</span></h3>
              </div>
            </div>
          </div>

          {/* Gráfico de Pizza */}
          <div style={{ flex: '2 1 300px', minHeight: '220px', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: 'var(--text)' }}>Seus Gêneros Favoritos</h3>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={pieData} 
                    cx="50%" cy="50%" 
                    innerRadius={60} 
                    outerRadius={90} 
                    paddingAngle={4} 
                    dataKey="value"
                    stroke="none"
                    label={renderCustomizedLabel}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#18181b', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }} 
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '0.85rem' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>Meus Filmes</h2>
          <button type="button" className="btn btn-secondary" onClick={carregarFilmes}>
            <Icon icon="mdi:refresh" /> Atualizar
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Carregando...</p>
        ) : filmes.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: 'var(--panel)', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
            <Icon icon="mdi:movie-open-outline" style={{ fontSize: '48px', color: 'var(--muted)', marginBottom: '12px' }} />
            <p style={{ margin: 0, color: 'var(--muted)' }}>Seu catálogo está vazio.</p>
          </div>
        ) : (
          <div className="movies-grid">
            {filmes.map((filme) => (
              <MovieCard key={filme.id} filme={filme} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
