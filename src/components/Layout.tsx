import type { ReactNode } from 'react';
import { useState } from 'react';
import type { Page } from '../types';
import { useStore } from '../store';
import Logo from './Logo';

interface NavItem {
  id: Page;
  label: string;
  icon: ReactNode;
  presidentOnly?: boolean;
}

const IconDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);
const IconMembers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconEvents = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconFreq = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const IconCert = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);
const IconFiles = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);
const IconProfile = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconSec = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const IconClose = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <IconDashboard /> },
  { id: 'members', label: 'Membros', icon: <IconMembers /> },
  { id: 'events', label: 'Eventos', icon: <IconEvents /> },
  { id: 'frequency', label: 'Frequência', icon: <IconFreq /> },
  { id: 'certificates', label: 'Certificados', icon: <IconCert />, presidentOnly: true },
  { id: 'files', label: 'Pastas', icon: <IconFiles /> },
  { id: 'secretaries', label: 'Secretarias', icon: <IconSec />, presidentOnly: true },
  { id: 'profile', label: 'Perfil', icon: <IconProfile /> },
];

const SEC_COLORS: Record<string, string> = {
  UNIAPE: '#6B1A2C',
  UniUp: '#1A3A6B',
  UniE: '#1A6B3A',
  UniScience: '#6B4A1A',
};

interface Props {
  page: Page;
  setPage: (p: Page) => void;
  children: ReactNode;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export default function Layout({ page, setPage, children, mobileOpen, setMobileOpen }: Props) {
  const { currentUser, logout, cloudStatus } = useStore();
  const [collapsed, setCollapsed] = useState(false);

  const items = NAV_ITEMS.filter(i => !i.presidentOnly || currentUser?.role === 'presidente');
  const roleLabel = currentUser?.role === 'presidente' ? 'Presidente' : `Sec. ${currentUser?.secretariaType ?? ''}`;
  const roleColor = currentUser?.role === 'presidente' ? '#6B1A2C' : (SEC_COLORS[currentUser?.secretariaType ?? ''] ?? '#6B1A2C');

  const SidebarContent = ({ mini }: { mini?: boolean }) => (
    <div className="flex flex-col h-full">
      <div className={`flex items-center ${mini ? 'justify-center py-5 px-2' : 'justify-between py-5 px-4'} border-b border-white/10`}>
        {mini ? <Logo size="sm" variant="icon" onDark /> : <Logo size="sm" onDark />}
        {!mini && (
          <button onClick={() => setCollapsed(true)} className="hidden lg:flex text-white/30 hover:text-white/60 cursor-pointer p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 19l-7-7 7-7"/><path d="M21 19l-7-7 7-7"/></svg>
          </button>
        )}
        {mini && (
          <button onClick={() => setCollapsed(false)} className="absolute -right-3 top-20 hidden lg:flex w-6 h-6 rounded-full bg-white border border-stone-200 items-center justify-center cursor-pointer shadow-sm" style={{ color: '#6B1A2C' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 5l7 7-7 7"/></svg>
          </button>
        )}
      </div>

      {!mini && (
        <div className="px-3 py-3 mx-3 mt-4 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-xs text-white/50 uppercase tracking-widest mb-0.5">Acesso como</p>
          <p className="text-sm font-semibold text-white truncate">{currentUser?.name}</p>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: roleColor, color: '#fff' }}>
            {roleLabel}
          </span>
        </div>
      )}

      {mini && (
        <div className="flex justify-center mt-4 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: roleColor }}>
            {currentUser?.name.charAt(0)}
          </div>
        </div>
      )}

      <nav className="flex-1 px-2 mt-4 space-y-0.5">
        {items.map(item => {
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setPage(item.id); setMobileOpen(false); }}
              title={mini ? item.label : undefined}
              className={`w-full flex items-center ${mini ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer`}
              style={{ backgroundColor: active ? 'rgba(196,163,90,0.18)' : 'transparent', color: active ? '#C4A35A' : 'rgba(255,255,255,0.65)' }}
            >
              <span style={{ color: active ? '#C4A35A' : 'rgba(255,255,255,0.45)', flexShrink: 0 }}>{item.icon}</span>
              {!mini && <span className="flex-1 text-left">{item.label}</span>}
              {!mini && active && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#C4A35A' }} />}
            </button>
          );
        })}
      </nav>

      {!mini && (
        <div className="mx-3 mb-2 px-3 py-2 rounded-lg text-xs flex items-center gap-2"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: cloudStatus === 'synced' ? 'rgba(196,163,90,0.7)' : 'rgba(255,255,255,0.4)' }}>
          {cloudStatus === 'loading' && <><span className="animate-spin inline-block">⟳</span> Sincronizando...</>}
          {cloudStatus === 'synced' && <>☁ Sincronizado</>}
          {cloudStatus === 'readonly' && <><span>⚠</span> Somente leitura — verifique permissões</>}
          {cloudStatus === 'error' && <><span>✕</span> Sem conexão — dados locais</>}
        </div>
      )}
      <div className={`p-2 border-t border-white/10 ${mini ? 'flex justify-center' : ''}`}>
        <button
          onClick={logout}
          title={mini ? 'Sair' : undefined}
          className={`${mini ? 'p-2.5' : 'w-full flex items-center gap-3 px-3 py-2.5'} rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer`}
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          <IconLogout />
          {!mini && 'Sair'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#FBF7F2' }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col flex-shrink-0 overflow-y-auto relative transition-all duration-200"
        style={{ backgroundColor: '#6B1A2C', width: collapsed ? 64 : 240 }}
      >
        <SidebarContent mini={collapsed} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-64 flex-shrink-0 overflow-y-auto z-50" style={{ backgroundColor: '#6B1A2C' }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-stone-200 bg-white">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1 rounded text-stone-600">
            {mobileOpen ? <IconClose /> : <IconMenu />}
          </button>
          <Logo size="sm" />
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
