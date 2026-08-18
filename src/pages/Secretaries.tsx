import { useState } from 'react';
import { useStore } from '../store';
import type { SecretariaType } from '../types';

const SEC_TYPES: SecretariaType[] = ['UNIAPE', 'UniUp', 'UniE', 'UniScience'];
const SEC_COLORS: Record<SecretariaType, { bg: string; text: string; border: string }> = {
  UNIAPE: { bg: '#FBF0EC', text: '#6B1A2C', border: '#f4d0c8' },
  UniUp: { bg: '#EBF0FB', text: '#1A3A6B', border: '#c8d8f4' },
  UniE: { bg: '#EBFBF0', text: '#1A6B3A', border: '#c8f4d8' },
  UniScience: { bg: '#FBF5EB', text: '#6B4A1A', border: '#f4e0c8' },
};

export default function Secretaries() {
  const { users, addUser, updateUser } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', secretariaType: 'UNIAPE' as SecretariaType });
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });

  const secretaries = users.filter(u => u.role === 'secretaria');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({ ...form, role: 'secretaria', active: true });
    setShowForm(false);
    setForm({ name: '', email: '', password: '', secretariaType: 'UNIAPE' });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    const patch: Record<string, string> = { name: editForm.name, email: editForm.email };
    if (editForm.password) patch.password = editForm.password;
    updateUser(editId, patch);
    setEditId(null);
  };

  const openEdit = (u: typeof users[0]) => {
    setEditId(u.id);
    setEditForm({ name: u.name, email: u.email, password: '' });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#6B1A2C' }}>Secretarias</h1>
          <p className="text-stone-500 mt-0.5 text-sm">{secretaries.filter(u => u.active).length} secretaria(s) ativa(s)</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer" style={{ backgroundColor: '#6B1A2C' }}>
          + Nova Secretaria
        </button>
      </div>

      {showForm && (
        <Modal title="Cadastrar Secretaria" onClose={() => setShowForm(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            <Field label="Nome da secretaria"><input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Maria da Silva" className={iCls} onFocus={fo} onBlur={bl} /></Field>
            <Field label="Tipo">
              <select value={form.secretariaType} onChange={e => setForm(f => ({ ...f, secretariaType: e.target.value as SecretariaType }))} className={iCls}>
                {SEC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="E-mail"><input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={iCls} onFocus={fo} onBlur={bl} /></Field>
            <Field label="Senha inicial"><input required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={iCls} onFocus={fo} onBlur={bl} /></Field>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-stone-600 border border-stone-200 cursor-pointer">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer" style={{ backgroundColor: '#6B1A2C' }}>Cadastrar</button>
            </div>
          </form>
        </Modal>
      )}

      {editId && (
        <Modal title="Editar Secretaria" onClose={() => setEditId(null)}>
          <form onSubmit={handleEdit} className="space-y-4">
            <Field label="Nome"><input required value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className={iCls} onFocus={fo} onBlur={bl} /></Field>
            <Field label="E-mail"><input required type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className={iCls} onFocus={fo} onBlur={bl} /></Field>
            <Field label="Nova senha (opcional)"><input type="password" value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))} placeholder="Deixe em branco para manter" className={iCls} onFocus={fo} onBlur={bl} /></Field>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setEditId(null)} className="px-4 py-2 rounded-lg text-sm text-stone-600 border border-stone-200 cursor-pointer">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer" style={{ backgroundColor: '#6B1A2C' }}>Salvar</button>
            </div>
          </form>
        </Modal>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {secretaries.map(sec => {
          const colors = SEC_COLORS[sec.secretariaType ?? 'UNIAPE'];
          return (
            <div key={sec.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-2" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                    {sec.secretariaType}
                  </span>
                  <p className="font-semibold text-stone-800">{sec.name}</p>
                  <p className="text-sm text-stone-500">{sec.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sec.active ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                  {sec.active ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <div className="flex gap-2 border-t border-stone-100 pt-3">
                <button onClick={() => openEdit(sec)} className="flex-1 py-2 rounded-lg text-xs font-medium border border-stone-200 text-stone-600 cursor-pointer hover:bg-stone-50 transition-colors">Editar</button>
                <button onClick={() => updateUser(sec.id, { active: !sec.active })} className="flex-1 py-2 rounded-lg text-xs font-medium border cursor-pointer transition-colors"
                  style={sec.active ? { borderColor: '#fca5a5', color: '#dc2626', background: '#fef2f2' } : { borderColor: '#bbf7d0', color: '#16a34a', background: '#f0fdf4' }}>
                  {sec.active ? 'Desativar' : 'Reativar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const iCls = 'w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none bg-white';
const fo = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.target.style.borderColor = '#6B1A2C');
const bl = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.target.style.borderColor = '#e7e5e4');

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>{children}</div>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Playfair Display, serif', color: '#6B1A2C' }}>{title}</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 cursor-pointer text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
