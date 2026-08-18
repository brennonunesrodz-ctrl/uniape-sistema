import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User, Member, Event, Attendance, Folder, FileItem } from './types';
import { apiGet, apiSet, testWrite } from './lib/api';

// ── Seed data ────────────────────────────────────────────────────────────────

const SEED_USERS: User[] = [
  { id: 'u1', name: 'Dr. Ana Beatriz Ferreira', email: 'presidente@uniape.com', password: 'uniape123', role: 'presidente', active: true },
  { id: 'u2', name: 'Secretaria UNIAPE', email: 'sec.uniape@uniape.com', password: 'uniape123', role: 'secretaria', secretariaType: 'UNIAPE', active: true },
  { id: 'u3', name: 'Secretaria UniUp', email: 'sec.uniup@uniape.com', password: 'uniape123', role: 'secretaria', secretariaType: 'UniUp', active: true },
  { id: 'u4', name: 'Secretaria UniE', email: 'sec.unie@uniape.com', password: 'uniape123', role: 'secretaria', secretariaType: 'UniE', active: true },
  { id: 'u5', name: 'Secretaria UniScience', email: 'sec.uniscience@uniape.com', password: 'uniape123', role: 'secretaria', secretariaType: 'UniScience', active: true },
];

const SEED_MEMBERS: Member[] = [
  { id: 'm1', name: 'Carlos Eduardo Mendes', active: true },
  { id: 'm2', name: 'Larissa Oliveira Santos', active: true },
  { id: 'm3', name: 'Pedro Henrique Costa', active: true },
  { id: 'm4', name: 'Fernanda Lima Rocha', active: true },
  { id: 'm5', name: 'Rafael Sousa Alves', active: true },
  { id: 'm6', name: 'Juliana Martins Pereira', active: true },
  { id: 'm7', name: 'Lucas Rodrigues Neves', active: true },
  { id: 'm8', name: 'Beatriz Carvalho Dias', active: true },
];

const SEED_EVENTS: Event[] = [
  { id: 'e1', name: 'Palestra: Periodontia Regenerativa', date: '2026-03-10', hours: 2, semester: '2026.1', createdBy: 'u2', qrCode: 'qr_e1' },
  { id: 'e2', name: 'Workshop: Empreendedorismo em Odontologia', date: '2026-03-24', hours: 4, semester: '2026.1', createdBy: 'u3', qrCode: 'qr_e2' },
  { id: 'e3', name: 'Seminário: Inovação Clínica', date: '2026-04-07', hours: 3, semester: '2026.1', createdBy: 'u4', qrCode: 'qr_e3' },
  { id: 'e4', name: 'Mesa Redonda: Casos Clínicos em Periodontia', date: '2026-04-21', hours: 2, semester: '2026.1', createdBy: 'u2', qrCode: 'qr_e4' },
  { id: 'e5', name: 'Simpósio de Implantodontia', date: '2026-05-05', hours: 6, semester: '2026.1', createdBy: 'u5', qrCode: 'qr_e5' },
];

const SEED_ATTENDANCES: Attendance[] = [
  { id: 'a1', eventId: 'e1', memberId: 'm1', timestamp: '2026-03-10T09:00:00' },
  { id: 'a2', eventId: 'e1', memberId: 'm2', timestamp: '2026-03-10T09:05:00' },
  { id: 'a3', eventId: 'e1', memberId: 'm3', timestamp: '2026-03-10T09:10:00' },
  { id: 'a4', eventId: 'e1', memberId: 'm4', timestamp: '2026-03-10T09:15:00' },
  { id: 'a5', eventId: 'e1', memberId: 'm5', timestamp: '2026-03-10T09:20:00' },
  { id: 'a6', eventId: 'e1', memberId: 'm6', timestamp: '2026-03-10T09:25:00' },
  { id: 'a7', eventId: 'e2', memberId: 'm1', timestamp: '2026-03-24T09:00:00' },
  { id: 'a8', eventId: 'e2', memberId: 'm2', timestamp: '2026-03-24T09:05:00' },
  { id: 'a9', eventId: 'e2', memberId: 'm3', timestamp: '2026-03-24T09:10:00' },
  { id: 'a10', eventId: 'e2', memberId: 'm5', timestamp: '2026-03-24T09:20:00' },
  { id: 'a11', eventId: 'e2', memberId: 'm7', timestamp: '2026-03-24T09:30:00' },
  { id: 'a12', eventId: 'e2', memberId: 'm8', timestamp: '2026-03-24T09:35:00' },
  { id: 'a13', eventId: 'e3', memberId: 'm1', timestamp: '2026-04-07T09:00:00' },
  { id: 'a14', eventId: 'e3', memberId: 'm2', timestamp: '2026-04-07T09:05:00' },
  { id: 'a15', eventId: 'e3', memberId: 'm4', timestamp: '2026-04-07T09:15:00' },
  { id: 'a16', eventId: 'e3', memberId: 'm6', timestamp: '2026-04-07T09:25:00' },
  { id: 'a17', eventId: 'e3', memberId: 'm7', timestamp: '2026-04-07T09:30:00' },
  { id: 'a18', eventId: 'e4', memberId: 'm1', timestamp: '2026-04-21T09:00:00' },
  { id: 'a19', eventId: 'e4', memberId: 'm2', timestamp: '2026-04-21T09:05:00' },
  { id: 'a20', eventId: 'e4', memberId: 'm3', timestamp: '2026-04-21T09:10:00' },
  { id: 'a21', eventId: 'e4', memberId: 'm5', timestamp: '2026-04-21T09:20:00' },
  { id: 'a22', eventId: 'e4', memberId: 'm8', timestamp: '2026-04-21T09:35:00' },
  { id: 'a23', eventId: 'e5', memberId: 'm1', timestamp: '2026-05-05T09:00:00' },
  { id: 'a24', eventId: 'e5', memberId: 'm2', timestamp: '2026-05-05T09:05:00' },
  { id: 'a25', eventId: 'e5', memberId: 'm3', timestamp: '2026-05-05T09:10:00' },
  { id: 'a26', eventId: 'e5', memberId: 'm4', timestamp: '2026-05-05T09:15:00' },
  { id: 'a27', eventId: 'e5', memberId: 'm5', timestamp: '2026-05-05T09:20:00' },
  { id: 'a28', eventId: 'e5', memberId: 'm6', timestamp: '2026-05-05T09:25:00' },
  { id: 'a29', eventId: 'e5', memberId: 'm7', timestamp: '2026-05-05T09:30:00' },
  { id: 'a30', eventId: 'e5', memberId: 'm8', timestamp: '2026-05-05T09:35:00' },
];

function makeSeedFolders(users: User[]): Folder[] {
  return users.map(u => ({
    id: 'root_' + u.id,
    name: u.role === 'presidente' ? 'Presidente — ' + u.name : (u.secretariaType ?? 'Secretaria'),
    ownerId: u.id,
    parentId: null,
    isPublic: true,
    createdAt: '2026-01-01T00:00:00',
  }));
}

// ── Local cache helpers ──────────────────────────────────────────────────────

function lsGet<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem('uniape_' + key);
    if (!raw) return seed;
    return JSON.parse(raw) as T;
  } catch { return seed; }
}

function lsSet<T>(key: string, data: T) {
  try { localStorage.setItem('uniape_' + key, JSON.stringify(data)); } catch { /* quota */ }
}

// Save to localStorage immediately, then push to Supabase in background.
function persist<T>(key: string, data: T) {
  lsSet(key, data);
  apiSet(key as Parameters<typeof apiSet>[0], data);
}

// ── Context ──────────────────────────────────────────────────────────────────

interface StoreCtx {
  currentUser: User | null;
  users: User[];
  members: Member[];
  events: Event[];
  attendances: Attendance[];
  folders: Folder[];
  files: FileItem[];
  cloudStatus: 'loading' | 'synced' | 'readonly' | 'error';
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  addUser: (u: Omit<User, 'id'>) => void;
  addMember: (name: string) => void;
  updateMember: (id: string, patch: Partial<Member>) => void;
  addEvent: (e: Omit<Event, 'id' | 'qrCode'>) => Event;
  addAttendance: (eventId: string, memberId: string) => boolean;
  removeAttendance: (eventId: string, memberId: string) => void;
  addFolder: (f: Omit<Folder, 'id' | 'createdAt'>) => void;
  updateFolder: (id: string, patch: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  addFile: (f: Omit<FileItem, 'id' | 'createdAt'>) => void;
  updateFile: (id: string, patch: Partial<FileItem>) => void;
  deleteFile: (id: string) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage (instant). Supabase data loads asynchronously.
  const [users, setUsers] = useState<User[]>(() => lsGet('users', SEED_USERS));
  const [members, setMembers] = useState<Member[]>(() => lsGet('members', SEED_MEMBERS));
  const [events, setEvents] = useState<Event[]>(() => lsGet('events', SEED_EVENTS));
  const [attendances, setAttendances] = useState<Attendance[]>(() => lsGet('attendances', SEED_ATTENDANCES));
  const [folders, setFolders] = useState<Folder[]>(() => lsGet('folders', makeSeedFolders(SEED_USERS)));
  const [files, setFiles] = useState<FileItem[]>(() => lsGet('files', []));
  const [cloudStatus, setCloudStatus] = useState<'loading' | 'synced' | 'readonly' | 'error'>('loading');

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const id = localStorage.getItem('currentUserId');
    if (!id) return null;
    const us = lsGet<User[]>('users', SEED_USERS);
    return us.find(u => u.id === id) ?? null;
  });

  // ── Sync from Supabase on mount ───────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function syncFromCloud() {
      try {
        const [cu, cm, ce, ca, cf, cfi] = await Promise.all([
          apiGet<User[]>('users'),
          apiGet<Member[]>('members'),
          apiGet<Event[]>('events'),
          apiGet<Attendance[]>('attendances'),
          apiGet<Folder[]>('folders'),
          apiGet<FileItem[]>('files'),
        ]);
        if (cancelled) return;

        // If cloud has no data yet, seed it now.
        const usersToUse = cu ?? SEED_USERS;
        const membersToUse = cm ?? SEED_MEMBERS;
        const eventsToUse = ce ?? SEED_EVENTS;
        const attendancesToUse = ca ?? SEED_ATTENDANCES;
        const foldersToUse = cf ?? makeSeedFolders(usersToUse);
        const filesToUse = cfi ?? [];

        if (!cu) apiSet('users', usersToUse);
        if (!cm) apiSet('members', membersToUse);
        if (!ce) apiSet('events', eventsToUse);
        if (!ca) apiSet('attendances', attendancesToUse);
        if (!cf) apiSet('folders', foldersToUse);
        if (!cfi) apiSet('files', filesToUse);

        setUsers(usersToUse);
        setMembers(membersToUse);
        setEvents(eventsToUse);
        setAttendances(attendancesToUse);
        setFolders(foldersToUse);
        setFiles(filesToUse);

        // Refresh currentUser from synced user list (password/signature may have changed)
        const id = localStorage.getItem('currentUserId');
        if (id) {
          const u = usersToUse.find(u => u.id === id);
          if (u) setCurrentUser(u);
        }

        lsSet('users', usersToUse);
        lsSet('members', membersToUse);
        lsSet('events', eventsToUse);
        lsSet('attendances', attendancesToUse);
        lsSet('folders', foldersToUse);
        lsSet('files', filesToUse);

        // Verify write capability
        const canWrite = await testWrite();
        setCloudStatus(canWrite ? 'synced' : 'readonly');
      } catch {
        if (!cancelled) setCloudStatus('error');
      }
    }

    syncFromCloud();

    // Re-sync when the tab regains focus (simple multi-device sync).
    const onFocus = () => syncFromCloud();
    window.addEventListener('focus', onFocus);
    return () => { cancelled = true; window.removeEventListener('focus', onFocus); };
  }, []);

  // ── Auth ──────────────────────────────────────────────────────────────────

  const login = useCallback((email: string, password: string) => {
    const u = users.find(u => u.email === email && u.password === password && u.active);
    if (u) { setCurrentUser(u); localStorage.setItem('currentUserId', u.id); return true; }
    return false;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('currentUserId');
  }, []);

  // ── Users ────────────────────────────────────────────────────────────────

  const updateUser = useCallback((id: string, patch: Partial<User>) => {
    setUsers(prev => {
      const next = prev.map(u => u.id === id ? { ...u, ...patch } : u);
      persist('users', next);
      if (currentUser?.id === id) setCurrentUser(next.find(u => u.id === id)!);
      return next;
    });
    if (patch.name) {
      setFolders(prev => {
        const u = users.find(x => x.id === id);
        const next = prev.map(f => f.id === 'root_' + id
          ? { ...f, name: (u?.role === 'presidente' ? 'Presidente — ' : '') + patch.name! }
          : f);
        persist('folders', next);
        return next;
      });
    }
  }, [currentUser, users]);

  const addUser = useCallback((u: Omit<User, 'id'>) => {
    const id = 'u' + Date.now();
    const newUser: User = { ...u, id };
    const rootFolder: Folder = {
      id: 'root_' + id,
      name: u.role === 'presidente' ? 'Presidente — ' + u.name : (u.secretariaType ?? 'Secretaria'),
      ownerId: id,
      parentId: null,
      isPublic: true,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => { const next = [...prev, newUser]; persist('users', next); return next; });
    setFolders(prev => { const next = [...prev, rootFolder]; persist('folders', next); return next; });
  }, []);

  // ── Members ──────────────────────────────────────────────────────────────

  const addMember = useCallback((name: string) => {
    setMembers(prev => { const next = [...prev, { id: 'm' + Date.now(), name, active: true }]; persist('members', next); return next; });
  }, []);

  const updateMember = useCallback((id: string, patch: Partial<Member>) => {
    setMembers(prev => { const next = prev.map(m => m.id === id ? { ...m, ...patch } : m); persist('members', next); return next; });
  }, []);

  // ── Events ───────────────────────────────────────────────────────────────

  const addEvent = useCallback((e: Omit<Event, 'id' | 'qrCode'>): Event => {
    const id = 'e' + Date.now();
    const event: Event = { ...e, id, qrCode: 'qr_' + id };
    setEvents(prev => { const next = [...prev, event]; persist('events', next); return next; });
    return event;
  }, []);

  // ── Attendances ──────────────────────────────────────────────────────────

  const addAttendance = useCallback((eventId: string, memberId: string): boolean => {
    setAttendances(prev => {
      if (prev.find(a => a.eventId === eventId && a.memberId === memberId)) return prev;
      const next = [...prev, { id: 'a' + Date.now(), eventId, memberId, timestamp: new Date().toISOString() }];
      persist('attendances', next);
      return next;
    });
    return true;
  }, []);

  const removeAttendance = useCallback((eventId: string, memberId: string) => {
    setAttendances(prev => { const next = prev.filter(a => !(a.eventId === eventId && a.memberId === memberId)); persist('attendances', next); return next; });
  }, []);

  // ── Folders ──────────────────────────────────────────────────────────────

  const addFolder = useCallback((f: Omit<Folder, 'id' | 'createdAt'>) => {
    setFolders(prev => { const next = [...prev, { ...f, id: 'f' + Date.now(), createdAt: new Date().toISOString() }]; persist('folders', next); return next; });
  }, []);

  const updateFolder = useCallback((id: string, patch: Partial<Folder>) => {
    setFolders(prev => { const next = prev.map(f => f.id === id ? { ...f, ...patch } : f); persist('folders', next); return next; });
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setFolders(prev => { const next = prev.filter(f => f.id !== id); persist('folders', next); return next; });
    setFiles(prev => { const next = prev.filter(fi => fi.folderId !== id); persist('files', next); return next; });
  }, []);

  // ── Files ─────────────────────────────────────────────────────────────────

  const addFile = useCallback((f: Omit<FileItem, 'id' | 'createdAt'>) => {
    setFiles(prev => { const next = [...prev, { ...f, id: 'fi' + Date.now(), createdAt: new Date().toISOString() }]; persist('files', next); return next; });
  }, []);

  const updateFile = useCallback((id: string, patch: Partial<FileItem>) => {
    setFiles(prev => { const next = prev.map(f => f.id === id ? { ...f, ...patch } : f); persist('files', next); return next; });
  }, []);

  const deleteFile = useCallback((id: string) => {
    setFiles(prev => { const next = prev.filter(f => f.id !== id); persist('files', next); return next; });
  }, []);

  return (
    <Ctx.Provider value={{
      currentUser, users, members, events, attendances, folders, files, cloudStatus,
      login, logout, updateUser, addUser, addMember, updateMember,
      addEvent, addAttendance, removeAttendance,
      addFolder, updateFolder, deleteFolder, addFile, updateFile, deleteFile,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
