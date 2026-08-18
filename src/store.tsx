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

const SEED_MEMBERS: Member[] = [];

const SEED_EVENTS: Event[] = [];

const SEED_ATTENDANCES: Attendance[] = [];

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

// ── One-time migration: wipe test data from localStorage ─────────────────────
const TEST_MEMBER_IDS = ['m1','m2','m3','m4','m5','m6','m7','m8'];
const TEST_EVENT_IDS  = ['e1','e2','e3','e4','e5'];

function wipeSeedDataFromCache() {
  if (localStorage.getItem('uniape_seed_wiped_v1')) return;
  try {
    const raw = localStorage.getItem('uniape_members');
    if (raw) {
      const members = JSON.parse(raw) as Member[];
      const clean = members.filter(m => !TEST_MEMBER_IDS.includes(m.id));
      localStorage.setItem('uniape_members', JSON.stringify(clean));
    }
    const rawE = localStorage.getItem('uniape_events');
    if (rawE) {
      const events = JSON.parse(rawE) as Event[];
      const clean = events.filter(e => !TEST_EVENT_IDS.includes(e.id));
      localStorage.setItem('uniape_events', JSON.stringify(clean));
    }
    const rawA = localStorage.getItem('uniape_attendances');
    if (rawA) {
      const atts = JSON.parse(rawA) as Attendance[];
      const clean = atts.filter(a => !TEST_EVENT_IDS.includes(a.eventId) && !TEST_MEMBER_IDS.includes(a.memberId));
      localStorage.setItem('uniape_attendances', JSON.stringify(clean));
    }
  } catch { /* ignore */ }
  localStorage.setItem('uniape_seed_wiped_v1', '1');
}

wipeSeedDataFromCache();

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
