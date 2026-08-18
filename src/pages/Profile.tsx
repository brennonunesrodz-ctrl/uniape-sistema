import { useState, useRef } from 'react';
import { useStore } from '../store';

export default function Profile() {
  const { currentUser, updateUser } = useStore();
  const [name, setName] = useState(currentUser?.name ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const sigRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const isPresident = currentUser.role === 'presidente';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password && password !== confirmPw) {
      setError('As senhas não coincidem.');
      return;
    }
    const patch: Record<string, string> = { name, email };
    if (password) patch.password = password;
    updateUser(currentUser.id, patch);
    setPassword('');
    setConfirmPw('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target?.result as string;
      updateUser(currentUser.id, { signatureUrl: url });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSignature = () => {
    updateUser(currentUser.id, { signatureUrl: undefined });
    if (sigRef.current) sigRef.current.value = '';
  };

  return (
    <div className="max-w-xl">
      <div className="mb-7">
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#6B1A2C' }}>Meu Perfil</h1>
        <p className="text-stone-500 mt-0.5 text-sm">Gerencie suas informações e preferências</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
          style={{ backgroundColor: '#6B1A2C' }}
        >
          {currentUser.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-stone-800">{currentUser.name}</p>
          <p className="text-sm text-stone-500">{currentUser.email}</p>
          <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: '#6B1A2C' }}>
            {currentUser.role === 'presidente' ? 'Presidente' : `Secretaria ${currentUser.secretariaType}`}
          </span>
        </div>
      </div>

      {/* Info form */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-5">
        <h2 className="text-base font-semibold mb-5 pb-3 border-b border-stone-100" style={{ fontFamily: 'Playfair Display, serif', color: '#6B1A2C' }}>
          Informações Pessoais
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <Field label="Nome completo">
            <input value={name} onChange={e => setName(e.target.value)} required className={iCls} onFocus={fo} onBlur={bl} />
          </Field>
          <Field label="E-mail">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={iCls} onFocus={fo} onBlur={bl} />
          </Field>
          <div className="border-t border-stone-100 pt-4">
            <p className="text-sm font-medium text-stone-600 mb-3">Alterar senha (opcional)</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nova senha">
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" className={iCls} onFocus={fo} onBlur={bl} />
              </Field>
              <Field label="Confirmar senha">
                <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••" className={iCls} onFocus={fo} onBlur={bl} />
              </Field>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          {saved && <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">✓ Perfil atualizado com sucesso!</p>}

          <div className="flex justify-end pt-1">
            <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer" style={{ backgroundColor: '#6B1A2C' }}>
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>

      {/* Signature — president only */}
      {isPresident && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <h2 className="text-base font-semibold mb-1 pb-3 border-b border-stone-100" style={{ fontFamily: 'Playfair Display, serif', color: '#6B1A2C' }}>
            Assinatura
          </h2>
          <p className="text-xs text-stone-500 mt-3 mb-4">A assinatura será exibida automaticamente em todos os certificados gerados.</p>

          {currentUser.signatureUrl ? (
            <div className="mb-4">
              <div className="border border-stone-100 rounded-xl p-4 flex items-center justify-center bg-stone-50 mb-3" style={{ minHeight: 80 }}>
                <img src={currentUser.signatureUrl} alt="Assinatura atual" className="max-h-20 object-contain" />
              </div>
              <div className="flex gap-2">
                <label className="flex-1 text-center px-3 py-2 rounded-lg text-xs font-medium border border-stone-200 text-stone-600 cursor-pointer hover:bg-stone-50 transition-colors">
                  Alterar assinatura
                  <input ref={sigRef} type="file" accept="image/*" className="hidden" onChange={handleSignature} />
                </label>
                <button
                  onClick={handleRemoveSignature}
                  className="px-3 py-2 rounded-lg text-xs font-medium border border-red-200 text-red-600 cursor-pointer hover:bg-red-50 transition-colors"
                >
                  Remover
                </button>
              </div>
            </div>
          ) : (
            <label className="block w-full border-2 border-dashed border-stone-200 rounded-xl p-8 text-center cursor-pointer hover:border-stone-300 transition-colors">
              <p className="text-3xl mb-2">✍️</p>
              <p className="text-sm font-medium text-stone-600">Clique para fazer upload da assinatura</p>
              <p className="text-xs text-stone-400 mt-1">PNG ou JPG com fundo transparente ou branco</p>
              <input ref={sigRef} type="file" accept="image/*" className="hidden" onChange={handleSignature} />
            </label>
          )}
        </div>
      )}
    </div>
  );
}

const iCls = 'w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none bg-white';
const fo = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = '#6B1A2C');
const bl = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = '#e7e5e4');

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
