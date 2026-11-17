import { useState, type FormEvent } from "react";
import { Mail, Lock, User } from "lucide-react";

type Props = {
  initialMode?: "login" | "register";
  onLogin: (data: { email: string; password: string }) => unknown;
  onRegister: (data: { nome: string; email: string; password: string }) => unknown;
  onResetPassword: (email: string) => unknown;
  loading?: boolean;
};

export function AuthSlideCard({
  initialMode = "login",
  onLogin,
  onRegister,
  onResetPassword,
  loading = false,
}: Props) {
  const [isActive, setIsActive] = useState(initialMode === "register");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [regNome, setRegNome] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const submitLogin = (e: FormEvent) => {
    e.preventDefault();
    onLogin({ email: loginEmail, password: loginPassword });
  };

  const submitRegister = (e: FormEvent) => {
    e.preventDefault();
    onRegister({ nome: regNome, email: regEmail, password: regPassword });
  };

  const handleReset = () => onResetPassword(loginEmail);

  return (
    <>
      <div className={`auth-slide-container${isActive ? " active" : ""}`}>
        {/* Login Form */}
        <div className="auth-form-box auth-login">
          <form onSubmit={submitLogin}>
            <h1>Entrar</h1>
            <div className="auth-input-box">
              <input
                type="email"
                placeholder="Email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                autoComplete="email"
              />
              <Mail className="auth-input-icon" size={20} />
            </div>
            <div className="auth-input-box">
              <input
                type="password"
                placeholder="Senha"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Lock className="auth-input-icon" size={20} />
            </div>
            <div className="auth-forgot">
              <button type="button" onClick={handleReset} className="auth-link">
                Esqueci minha senha
              </button>
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>

        {/* Register Form */}
        <div className="auth-form-box auth-register">
          <form onSubmit={submitRegister}>
            <h1>Criar conta</h1>
            <div className="auth-input-box">
              <input
                type="text"
                placeholder="Nome completo"
                required
                value={regNome}
                onChange={(e) => setRegNome(e.target.value)}
                autoComplete="name"
              />
              <User className="auth-input-icon" size={20} />
            </div>
            <div className="auth-input-box">
              <input
                type="email"
                placeholder="Email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                autoComplete="email"
              />
              <Mail className="auth-input-icon" size={20} />
            </div>
            <div className="auth-input-box">
              <input
                type="password"
                placeholder="Senha"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Lock className="auth-input-icon" size={20} />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Criando…" : "Criar conta"}
            </button>
          </form>
        </div>

        {/* Toggle Box */}
        <div className="auth-toggle-box">
          <div className="auth-toggle-panel auth-toggle-left">
            <h1>Olá, bem-vindo!</h1>
            <p>Ainda não tem uma conta?</p>
            <button
              type="button"
              className="auth-btn auth-btn-ghost"
              onClick={() => setIsActive(true)}
            >
              Criar conta
            </button>
          </div>
          <div className="auth-toggle-panel auth-toggle-right">
            <h1>Bem-vindo de volta!</h1>
            <p>Já tem uma conta?</p>
            <button
              type="button"
              className="auth-btn auth-btn-ghost"
              onClick={() => setIsActive(false)}
            >
              Entrar
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .auth-slide-container {
          position: relative;
          width: 850px;
          max-width: 100%;
          height: 550px;
          background: var(--card);
          color: var(--foreground);
          border-radius: 30px;
          box-shadow: 0 20px 60px -15px color-mix(in oklab, var(--foreground) 30%, transparent);
          overflow: hidden;
        }
        .auth-slide-container h1 {
          font-size: 36px;
          margin: -10px 0 0;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .auth-slide-container p {
          font-size: 14.5px;
          margin: 15px 0;
        }

        .auth-form-box {
          position: absolute;
          right: 0;
          width: 50%;
          height: 100%;
          background: var(--card);
          display: flex;
          align-items: center;
          text-align: center;
          padding: 40px;
          z-index: 1;
          transition: right .6s ease-in-out 1.2s, visibility 0s 1s;
        }
        .auth-form-box form { width: 100%; }
        .auth-slide-container.active .auth-form-box { right: 50%; }
        .auth-form-box.auth-register { visibility: hidden; }
        .auth-slide-container.active .auth-form-box.auth-register { visibility: visible; }
        .auth-slide-container.active .auth-form-box.auth-login { visibility: hidden; }

        .auth-input-box {
          position: relative;
          margin: 30px 0;
        }
        .auth-input-box input {
          width: 100%;
          padding: 13px 50px 13px 20px;
          background: var(--muted);
          border-radius: 8px;
          border: 1px solid transparent;
          outline: none;
          font-size: 16px;
          color: var(--foreground);
          font-weight: 500;
          font-family: inherit;
          transition: border-color .2s, box-shadow .2s;
        }
        .auth-input-box input::placeholder {
          color: var(--muted-foreground);
          font-weight: 400;
        }
        .auth-input-box input:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent-primary) 18%, transparent);
        }
        .auth-input-icon {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted-foreground);
          pointer-events: none;
        }

        .auth-forgot {
          margin: -15px 0 15px;
          text-align: right;
        }
        .auth-link {
          font-size: 14px;
          color: var(--accent-primary);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
        }
        .auth-link:hover { text-decoration: underline; }

        .auth-btn {
          width: 100%;
          height: 48px;
          background: var(--accent-primary);
          border-radius: 8px;
          box-shadow: 0 6px 20px -8px color-mix(in oklab, var(--accent-primary) 60%, transparent);
          border: none;
          cursor: pointer;
          font-size: 16px;
          color: var(--text-on-dark);
          font-weight: 600;
          font-family: inherit;
          transition: background .2s, transform .1s;
        }
        .auth-btn:hover:not(:disabled) { background: var(--accent-primary-hover); }
        .auth-btn:active:not(:disabled) { transform: scale(0.98); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .auth-toggle-box {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        .auth-toggle-box::before {
          content: '';
          position: absolute;
          left: -250%;
          width: 300%;
          height: 100%;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover));
          border-radius: 150px;
          z-index: 2;
          transition: 1.8s ease-in-out;
        }
        .auth-slide-container.active .auth-toggle-box::before { left: 50%; }

        .auth-toggle-panel {
          position: absolute;
          width: 50%;
          height: 100%;
          color: var(--text-on-dark);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 0 30px;
          text-align: center;
          z-index: 2;
          transition: .6s ease-in-out;
        }
        .auth-toggle-panel.auth-toggle-left { left: 0; transition-delay: 1.2s; }
        .auth-slide-container.active .auth-toggle-panel.auth-toggle-left { left: -50%; transition-delay: .6s; }
        .auth-toggle-panel.auth-toggle-right { right: -50%; transition-delay: .6s; }
        .auth-slide-container.active .auth-toggle-panel.auth-toggle-right { right: 0; transition-delay: 1.2s; }
        .auth-toggle-panel p { margin-bottom: 20px; opacity: 0.9; }

        .auth-btn-ghost {
          width: 160px;
          height: 46px;
          background: transparent;
          border: 2px solid var(--text-on-dark);
          box-shadow: none;
          color: var(--text-on-dark);
        }
        .auth-btn-ghost:hover:not(:disabled) {
          background: color-mix(in oklab, var(--text-on-dark) 12%, transparent);
        }

        @media screen and (max-width: 650px) {
          .auth-slide-container {
            height: calc(100vh - 40px);
            border-radius: 24px;
          }
          .auth-form-box {
            bottom: 0;
            width: 100%;
            height: 70%;
            right: 0;
            transition: bottom .6s ease-in-out 1.2s, visibility 0s 1s;
          }
          .auth-slide-container.active .auth-form-box { right: 0; bottom: 30%; }
          .auth-toggle-box::before {
            left: 0;
            top: -270%;
            width: 100%;
            height: 300%;
            border-radius: 20vw;
          }
          .auth-slide-container.active .auth-toggle-box::before { left: 0; top: 70%; }
          .auth-toggle-panel {
            width: 100%;
            height: 30%;
          }
          .auth-toggle-panel.auth-toggle-left { top: 0; left: 0; }
          .auth-slide-container.active .auth-toggle-panel.auth-toggle-left { left: 0; top: -30%; }
          .auth-toggle-panel.auth-toggle-right { right: 0; bottom: -30%; }
          .auth-slide-container.active .auth-toggle-panel.auth-toggle-right { bottom: 0; right: 0; }
        }

        @media screen and (max-width: 400px) {
          .auth-form-box { padding: 20px; }
          .auth-slide-container h1 { font-size: 28px; }
        }
      `}</style>
    </>
  );
}