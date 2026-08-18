import { useState, useRef } from 'react';
import { useStore } from '../store';
import type { Folder, FileItem } from '../types';

const TYPE_ICONS: Record<string, string> = {
  image: '🖼',
  document: '📄',
  note: '📝',
  link: '🔗',
};

const SEC_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  u1: { bg: '#FBF0EC', text: '#6B1A2C', border: '#f4d0c8' },
  UNIAPE: { bg: '#FBF0EC', text: '#6B1A2C', border: '#f4d0c8' },
  UniUp: { bg: '#EBF0FB', text: '#1A3A6B', border: '#c8d8f4' },
  UniE: { bg: '#EBFBF0', text: '#1A6B3A', border: '#c8f4d8' },
  UniScience: { bg: '#FBF5EB', text: '#6B4A1A', border: '#f4e0c8' },
};

function getUserColor(userId: string, users: ReturnType<typeof useStore>['users']) {
  const u = users.find(x => x.id === userId);
  if (!u) return { bg: '#f5f5f4', text: '#6b7280', border: '#e7e5e4' };
  if (u.role === 'presidente') return { bg: '#FBF0EC', text: '#6B1A2C', border: '#f4d0c8' };
  return SEC_COLORS[u.secretariaType ?? ''] ?? { bg: '#f5f5f4', text: '#6b7280', border: '#e7e5e4' };
}

function getUserLabel(userId: string, users: ReturnType<typeof useStore>['users']) {
  const u = users.find(x => x.id === userId);
  if (!u) return 'Desconhecido';
  if (u.role === 'presidente') return 'Presidente';
  return u.secretariaType ?? 'Secretaria';
}

export default function FilesPage() {
  const { currentUser, users, folders, files, addFolder, updateFolder, deleteFolder, addFile, updateFile, deleteFile } = useStore();

  // Current navigation: selected root owner + current folder id
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<Folder[]>([]);

  // Modals
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderPublic, setNewFolderPublic] = useState(true);
  const [showNewNote, setShowNewNote] = useState(false);
  const [showNewLink, setShowNewLink] = useState(false);
  const [noteForm, setNoteForm] = useState({ name: '', content: '', isPublic: true });
  const [linkForm, setLinkForm] = useState({ name: '', url: '', isPublic: true });
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;
  const isMe = (ownerId: string) => ownerId === currentUser.id;

  // Root folders: one per user
  const rootFolders = users
    .filter(u => u.active)
    .map(u => folders.find(f => f.id === 'root_' + u.id))
    .filter(Boolean) as Folder[];

  // Current folder contents (visible to user)
  const currentFolder = currentFolderId ? folders.find(f => f.id === currentFolderId) : null;
  const folderOwner = currentFolder ? currentFolder.ownerId : selectedOwnerId;
  const iAmOwner = folderOwner ? isMe(folderOwner) : false;

  const subFolders = folders.filter(f =>
    f.parentId === currentFolderId &&
    (iAmOwner || f.isPublic)
  );

  const folderFiles = files.filter(fi =>
    fi.folderId === (currentFolderId ?? '') &&
    (isMe(fi.ownerId) || fi.isPublic)
  );

  const enterFolder = (folder: Folder) => {
    setBreadcrumb(prev => [...prev, folder]);
    setCurrentFolderId(folder.id);
    if (!selectedOwnerId) setSelectedOwnerId(folder.ownerId);
  };

  const goHome = () => {
    setSelectedOwnerId(null);
    setCurrentFolderId(null);
    setBreadcrumb([]);
  };

  const goToBreadcrumb = (idx: number) => {
    const target = breadcrumb[idx];
    setBreadcrumb(prev => prev.slice(0, idx + 1));
    setCurrentFolderId(target.id);
  };

  // Actions
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !currentFolderId) return;
    addFolder({ name: newFolderName.trim(), ownerId: currentUser.id, parentId: currentFolderId, isPublic: newFolderPublic });
    setNewFolderName('');
    setShowNewFolder(false);
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.name.trim() || !currentFolderId) return;
    addFile({ folderId: currentFolderId, name: noteForm.name.trim(), type: 'note', content: noteForm.content, isPublic: noteForm.isPublic, ownerId: currentUser.id });
    setNoteForm({ name: '', content: '', isPublic: true });
    setShowNewNote(false);
  };

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkForm.name.trim() || !linkForm.url.trim() || !currentFolderId) return;
    addFile({ folderId: currentFolderId, name: linkForm.name.trim(), type: 'link', content: linkForm.url.trim(), isPublic: linkForm.isPublic, ownerId: currentUser.id });
    setLinkForm({ name: '', url: '', isPublic: true });
    setShowNewLink(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentFolderId) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('Arquivo muito grande. Limite: 3 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      const type: FileItem['type'] = file.type.startsWith('image/') ? 'image' : 'document';
      addFile({ folderId: currentFolderId, name: file.name, type, content, mimeType: file.type, isPublic: true, ownerId: currentUser.id });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Root view
  if (!selectedOwnerId) {
    return (
      <div>
        <div className="mb-7">
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#6B1A2C' }}>Pastas Compartilhadas</h1>
          <p className="text-stone-500 mt-0.5 text-sm">Espaço de armazenamento de cada secretaria e presidência — compartilhado com todos</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rootFolders.map(folder => {
            const owner = users.find(u => u.id === folder.ownerId);
            const colors = getUserColor(folder.ownerId, users);
            const label = getUserLabel(folder.ownerId, users);
            const subCount = folders.filter(f => f.parentId === folder.id).length;
            const fileCount = files.filter(f => f.folderId === folder.id && (isMe(f.ownerId) || f.isPublic)).length;
            return (
              <button
                key={folder.id}
                onClick={() => { setSelectedOwnerId(folder.ownerId); enterFolder(folder); }}
                className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 text-left hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: colors.bg }}>
                    📁
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                    {label}
                  </span>
                </div>
                <p className="font-semibold text-stone-800 text-base">{folder.name}</p>
                <p className="text-sm text-stone-400 mt-0.5">{owner?.name}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-stone-400">
                  <span>{subCount} pasta{subCount !== 1 ? 's' : ''}</span>
                  <span>·</span>
                  <span>{fileCount} arquivo{fileCount !== 1 ? 's' : ''}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Folder detail view
  return (
    <div>
      {/* Modals */}
      {showNewFolder && (
        <Modal title="Nova Pasta" onClose={() => setShowNewFolder(false)}>
          <form onSubmit={handleCreateFolder} className="space-y-4">
            <Field label="Nome da pasta">
              <input autoFocus required value={newFolderName} onChange={e => setNewFolderName(e.target.value)} className={iCls} onFocus={fo} onBlur={bl} />
            </Field>
            <TogglePublic value={newFolderPublic} onChange={setNewFolderPublic} />
            <ModalActions onCancel={() => setShowNewFolder(false)} submitLabel="Criar Pasta" />
          </form>
        </Modal>
      )}

      {showNewNote && (
        <Modal title="Nova Nota / Texto" onClose={() => setShowNewNote(false)}>
          <form onSubmit={handleCreateNote} className="space-y-4">
            <Field label="Título"><input autoFocus required value={noteForm.name} onChange={e => setNoteForm(f => ({ ...f, name: e.target.value }))} className={iCls} onFocus={fo} onBlur={bl} /></Field>
            <Field label="Conteúdo">
              <textarea required rows={6} value={noteForm.content} onChange={e => setNoteForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Texto, senha, lista de membros, observações..."
                className={iCls + ' resize-none'} onFocus={fo} onBlur={bl} />
            </Field>
            <TogglePublic value={noteForm.isPublic} onChange={v => setNoteForm(f => ({ ...f, isPublic: v }))} />
            <ModalActions onCancel={() => setShowNewNote(false)} submitLabel="Salvar Nota" />
          </form>
        </Modal>
      )}

      {showNewLink && (
        <Modal title="Novo Link" onClose={() => setShowNewLink(false)}>
          <form onSubmit={handleCreateLink} className="space-y-4">
            <Field label="Nome"><input autoFocus required value={linkForm.name} onChange={e => setLinkForm(f => ({ ...f, name: e.target.value }))} className={iCls} onFocus={fo} onBlur={bl} /></Field>
            <Field label="URL"><input required type="url" value={linkForm.url} onChange={e => setLinkForm(f => ({ ...f, url: e.target.value }))} placeholder="https://" className={iCls} onFocus={fo} onBlur={bl} /></Field>
            <TogglePublic value={linkForm.isPublic} onChange={v => setLinkForm(f => ({ ...f, isPublic: v }))} />
            <ModalActions onCancel={() => setShowNewLink(false)} submitLabel="Salvar Link" />
          </form>
        </Modal>
      )}

      {previewFile && (
        <Modal title={previewFile.name} onClose={() => setPreviewFile(null)}>
          <div>
            {previewFile.type === 'note' && (
              <pre className="whitespace-pre-wrap text-sm text-stone-700 bg-stone-50 rounded-xl p-4 max-h-96 overflow-y-auto leading-relaxed font-sans">{previewFile.content}</pre>
            )}
            {previewFile.type === 'link' && (
              <div className="flex flex-col items-center gap-3 py-4">
                <span className="text-4xl">🔗</span>
                <a href={previewFile.content} target="_blank" rel="noreferrer" className="text-sm font-medium break-all" style={{ color: '#6B1A2C' }}>{previewFile.content}</a>
                <a href={previewFile.content} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl text-sm font-medium text-white cursor-pointer" style={{ backgroundColor: '#6B1A2C' }}>Abrir link</a>
              </div>
            )}
            {previewFile.type === 'image' && (
              <img src={previewFile.content} alt={previewFile.name} className="w-full rounded-xl object-contain max-h-96" />
            )}
            {previewFile.type === 'document' && (
              <div className="flex flex-col items-center gap-3 py-4">
                <span className="text-4xl">📄</span>
                <p className="text-sm text-stone-600">{previewFile.name}</p>
                <a href={previewFile.content} download={previewFile.name} className="px-4 py-2 rounded-xl text-sm font-medium text-white cursor-pointer" style={{ backgroundColor: '#6B1A2C' }}>
                  ⬇ Baixar arquivo
                </a>
              </div>
            )}
            {isMe(previewFile.ownerId) && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
                <button
                  onClick={() => { updateFile(previewFile.id, { isPublic: !previewFile.isPublic }); setPreviewFile({ ...previewFile, isPublic: !previewFile.isPublic }); }}
                  className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 cursor-pointer"
                >
                  {previewFile.isPublic ? '🔓 Público' : '🔒 Privado'} — alterar
                </button>
                <button onClick={() => { deleteFile(previewFile.id); setPreviewFile(null); }} className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 cursor-pointer">
                  Excluir
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Header + breadcrumb */}
      <div className="mb-6">
        <button onClick={goHome} className="flex items-center gap-1.5 text-sm mb-3 cursor-pointer" style={{ color: '#6B1A2C' }}>
          <span>←</span> Todas as pastas
        </button>
        <div className="flex items-center gap-2 flex-wrap text-sm text-stone-500">
          {breadcrumb.map((f, i) => (
            <span key={f.id} className="flex items-center gap-2">
              {i > 0 && <span>/</span>}
              <button
                onClick={() => i < breadcrumb.length - 1 ? goToBreadcrumb(i) : undefined}
                className={`cursor-pointer ${i === breadcrumb.length - 1 ? 'font-semibold text-stone-800' : 'hover:text-stone-800'}`}
              >
                {f.name}
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Owner info */}
      {currentFolder && (() => {
        const owner = users.find(u => u.id === currentFolder.ownerId);
        const colors = getUserColor(currentFolder.ownerId, users);
        return (
          <div className="flex items-center gap-3 mb-6 p-4 bg-white rounded-xl border border-stone-100 shadow-sm">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0" style={{ backgroundColor: colors.text }}>
              {owner?.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-stone-800 text-sm">{owner?.name}</p>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                {getUserLabel(currentFolder.ownerId, users)}
              </span>
            </div>
            {!currentFolder.isPublic && (
              <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-500">🔒 Privada</span>
            )}
          </div>
        );
      })()}

      {/* Action bar — owner only */}
      {iAmOwner && (
        <div className="flex flex-wrap gap-2 mb-5">
          <button onClick={() => setShowNewFolder(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer" style={{ backgroundColor: '#6B1A2C' }}>
            📁 Nova pasta
          </button>
          <button onClick={() => setShowNewNote(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border border-stone-200 text-stone-700 bg-white cursor-pointer hover:bg-stone-50">
            📝 Nota / Texto
          </button>
          <button onClick={() => setShowNewLink(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border border-stone-200 text-stone-700 bg-white cursor-pointer hover:bg-stone-50">
            🔗 Link
          </button>
          <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border border-stone-200 text-stone-700 bg-white cursor-pointer hover:bg-stone-50">
            📎 Upload
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      )}

      {/* Subfolders */}
      {subFolders.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">Pastas</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subFolders.map(f => (
              <div key={f.id} className="flex items-center justify-between gap-3 bg-white rounded-xl border border-stone-100 shadow-sm p-3.5 hover:shadow-md transition-all">
                <button onClick={() => enterFolder(f)} className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                  <span className="text-xl">📁</span>
                  <span className="text-sm font-medium text-stone-800 truncate">{f.name}</span>
                  {!f.isPublic && <span className="text-xs text-stone-400 flex-shrink-0">🔒</span>}
                </button>
                {isMe(f.ownerId) && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => updateFolder(f.id, { isPublic: !f.isPublic })} className="p-1 text-xs text-stone-400 hover:text-stone-600 cursor-pointer" title={f.isPublic ? 'Tornar privada' : 'Tornar pública'}>
                      {f.isPublic ? '🔓' : '🔒'}
                    </button>
                    <button onClick={() => { if (confirm('Excluir pasta?')) deleteFolder(f.id); }} className="p-1 text-xs text-stone-400 hover:text-red-500 cursor-pointer" title="Excluir">✕</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      {folderFiles.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">Arquivos</p>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            {folderFiles.map(fi => {
              const canEdit = isMe(fi.ownerId);
              return (
                <div key={fi.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition-colors">
                  <span className="text-xl flex-shrink-0">{TYPE_ICONS[fi.type]}</span>
                  <div className="flex-1 min-w-0">
                    <button onClick={() => setPreviewFile(fi)} className="text-sm font-medium text-stone-800 hover:text-stone-600 cursor-pointer truncate block text-left w-full">
                      {fi.name}
                    </button>
                    <p className="text-xs text-stone-400 mt-0.5">{new Date(fi.createdAt).toLocaleDateString('pt-BR')} · {fi.isPublic ? '🔓 Público' : '🔒 Privado'}</p>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => updateFile(fi.id, { isPublic: !fi.isPublic })} className="px-2.5 py-1 text-xs rounded-lg border border-stone-200 text-stone-500 cursor-pointer hover:bg-stone-100 transition-colors" title="Alternar visibilidade">
                        {fi.isPublic ? '🔓' : '🔒'}
                      </button>
                      <button onClick={() => { if (confirm('Excluir arquivo?')) deleteFile(fi.id); }} className="px-2.5 py-1 text-xs rounded-lg border border-red-100 text-red-400 cursor-pointer hover:bg-red-50 transition-colors">✕</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subFolders.length === 0 && folderFiles.length === 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-16 text-center text-stone-400">
          <p className="text-4xl mb-3">📂</p>
          <p>{iAmOwner ? 'Pasta vazia. Adicione arquivos, notas ou subpastas.' : 'Nenhum conteúdo público nesta pasta.'}</p>
        </div>
      )}
    </div>
  );
}

// Shared sub-components
function TogglePublic({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="relative w-10 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0"
        style={{ backgroundColor: value ? '#6B1A2C' : '#d1d5db' }}
      >
        <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform" style={{ transform: value ? 'translateX(22px)' : 'translateX(2px)' }} />
      </button>
      <div>
        <p className="text-sm font-medium text-stone-700">{value ? '🔓 Público' : '🔒 Privado'}</p>
        <p className="text-xs text-stone-400">{value ? 'Visível para todos os usuários' : 'Visível apenas para você'}</p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>{children}</div>;
}

function ModalActions({ onCancel, submitLabel }: { onCancel: () => void; submitLabel: string }) {
  return (
    <div className="flex gap-3 justify-end pt-2">
      <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm text-stone-600 border border-stone-200 cursor-pointer">Cancelar</button>
      <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer" style={{ backgroundColor: '#6B1A2C' }}>{submitLabel}</button>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Playfair Display, serif', color: '#6B1A2C' }}>{title}</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 cursor-pointer text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const iCls = 'w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none bg-white';
const fo = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = '#6B1A2C');
const bl = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = '#e7e5e4');
