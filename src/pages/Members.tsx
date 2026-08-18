import { useState } from 'react';
import { useStore } from '../store';

export default function Members() {
  const { members, addMember, updateMember } = useStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('active');

  const filtered = members
    .filter(m => filterActive === 'all' ? true : filterActive === 'active' ? m.active : !m.active)
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addMember(newName.trim());
    setNewName('');
    setShowForm(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editName.trim()) return;
    updateMember(editId, { name: editName.trim() });
    setEditId(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#6B1A2C' }}>Membros</h1>
          <p className="text-stone-500 mt-0.5 text-sm">{members.filter(m => m.active).length} membros ativos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer transition-all"
          style={{ backgroundColor: '#6B1A2C' }}
        >
          <span>+</span> Novo Membro
        </button>
      </div>

      {/* Add member modal */}
      {showForm && (
        <Modal title="Adicionar Membro" onClose={() => setShowForm(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Nome completo</label>
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Nome do membro"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none"
                onFocus={e => (e.target.style.borderColor = '#6B1A2C')}
                onBlur={e => (e.target.style.borderColor = '#e7e5e4')}
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-stone-600 border border-stone-200 cursor-pointer">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer" style={{ backgroundColor: '#6B1A2C' }}>
                Adicionar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit member modal */}
      {editId && (
        <Modal title="Editar Membro" onClose={() => setEditId(null)}>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Nome completo</label>
              <input
                autoFocus
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none"
                onFocus={e => (e.target.style.borderColor = '#6B1A2C')}
                onBlur={e => (e.target.style.borderColor = '#e7e5e4')}
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setEditId(null)} className="px-4 py-2 rounded-lg text-sm text-stone-600 border border-stone-200 cursor-pointer">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer" style={{ backgroundColor: '#6B1A2C' }}>
                Salvar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar membro..."
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none"
          onFocus={e => (e.target.style.borderColor = '#6B1A2C')}
          onBlur={e => (e.target.style.borderColor = '#e7e5e4')}
        />
        <div className="flex rounded-xl border border-stone-200 bg-white overflow-hidden text-sm">
          {(['active', 'inactive', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterActive(f)}
              className="px-4 py-2.5 cursor-pointer transition-colors"
              style={{
                backgroundColor: filterActive === f ? '#6B1A2C' : 'transparent',
                color: filterActive === f ? '#fff' : '#6b7280',
              }}
            >
              {f === 'active' ? 'Ativos' : f === 'inactive' ? 'Inativos' : 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-stone-400">
            <p className="text-4xl mb-3">👥</p>
            <p>Nenhum membro encontrado.</p>
          </div>
        )}
        {filtered.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">Nome</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: m.active ? '#6B1A2C' : '#94a3b8' }}
                      >
                        {m.name.charAt(0)}
                      </div>
                      <span className="font-medium text-stone-800">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${m.active ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${m.active ? 'bg-green-500' : 'bg-stone-400'}`} />
                      {m.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => { setEditId(m.id); setEditName(m.name); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => updateMember(m.id, { active: !m.active })}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors"
                        style={m.active ? { borderColor: '#fca5a5', color: '#dc2626', background: '#fef2f2' } : { borderColor: '#bbf7d0', color: '#16a34a', background: '#f0fdf4' }}
                      >
                        {m.active ? 'Desativar' : 'Reativar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#6B1A2C' }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}
