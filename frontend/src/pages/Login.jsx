import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from "@iconify/react";
import '../styles.css';

export const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isRegistering) {
      if (password !== confirmPassword) {
        setErrorMsg("As senhas não coincidem!");
        return;
      }
      const res = await register(username, password);
      if (res.success) navigate('/');
      else setErrorMsg(res.message);
    } else {
      const res = await login(username, password);
      if (res.success) navigate('/');
      else setErrorMsg(res.message);
    }
  };

  return (
    <div className="page-shell" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', minHeight: '100vh' }}>
      <main className="content" style={{ width: '100%', maxWidth: '400px' }}>
        <section className="panel form-panel">
          <div className="section-heading" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Icon icon="mdi:movie-open-star-outline" style={{ fontSize: '64px', color: 'var(--accent)', marginBottom: '1rem' }} />
            <h2>{isRegistering ? 'Criar sua Conta' : 'Seu Catálogo de Filmes'}</h2>
            <p className="section-kicker" style={{ marginTop: '0.5rem' }}>
              {isRegistering ? 'Junte-se a nós' : 'Acesse seu acervo'}
            </p>
          </div>

          <form className="film-form" onSubmit={handleSubmit}>
            <label>
              Usuário
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Seu usuário"
              />
            </label>

            <label>
              Senha
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
              />
            </label>

            {isRegistering && (
              <label>
                Confirmar Senha
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                />
              </label>
            )}

            {errorMsg && <p style={{ color: 'var(--danger)', fontSize: '0.9rem', marginTop: '4px' }}>{errorMsg}</p>}

            <div className="form-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {isRegistering ? 'Cadastrar' : 'Acessar Catálogo'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ width: '100%', borderColor: 'transparent' }}
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setErrorMsg('');
                }}
              >
                {isRegistering ? 'Já tenho uma conta' : 'Criar uma conta'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};
