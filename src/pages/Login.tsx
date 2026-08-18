import { useState } from 'react';
import { useStore } from '../store';
import Logo from '../components/Logo';

export default function Login() {
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const ok = login(email, password);
    if (!ok) setError('E-mail ou senha incorretos.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#FBF7F2' }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col items-center justify-center w-1/2 p-12 relative overflow-hidden"
        style={{ backgroundColor: '#6B1A2C' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: '#C4A35A' }} />
        <div className="absolute -bottom-32 -right-16 w-96 h-96 rounded-full opacity-10" style={{ backgroundColor: '#C4A35A' }} />

        <div className="relative z-10 text-center">
          <div className="flex justify-center mb-8">
            <Logo size="lg" onDark />
          </div>
          <p className="text-white/70 text-sm tracking-widest uppercase mt-4">Sistema de Gestão</p>
          <div className="mt-10 w-16 h-0.5 mx-auto" style={{ backgroundColor: '#C4A35A' }} />
          <p className="mt-8 text-white/50 text-sm leading-relaxed max-w-xs">
            Gerencie a frequência dos membros, eventos e geração de certificados da UniAPe.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Logo size="md" />
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-stone-100">
            <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif', color: '#6B1A2C' }}>
              Bem-vindo
            </h1>
            <p className="text-stone-500 text-sm mb-7">Faça login para acessar o sistema.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none transition-all"
                  style={{ '--tw-ring-color': '#6B1A2C' } as React.CSSProperties}
                  onFocus={e => (e.target.style.borderColor = '#6B1A2C')}
                  onBlur={e => (e.target.style.borderColor = '#e7e5e4')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none transition-all"
                  onFocus={e => (e.target.style.borderColor = '#6B1A2C')}
                  onBlur={e => (e.target.style.borderColor = '#e7e5e4')}
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 mt-2 cursor-pointer"
                style={{ backgroundColor: loading ? '#9a5068' : '#6B1A2C' }}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
