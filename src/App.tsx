import { useState } from 'react';
import { StoreProvider, useStore } from './store';
import type { Page } from './types';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Events from './pages/Events';
import Frequency from './pages/Frequency';
import Certificates from './pages/Certificates';
import Profile from './pages/Profile';
import Secretaries from './pages/Secretaries';
import FilesPage from './pages/Files';
import CheckIn from './pages/CheckIn';

const urlParams = new URLSearchParams(window.location.search);
const CHECKIN_EVENT_ID = urlParams.get('checkin');

function AppInner() {
  const { currentUser } = useStore();
  const [page, setPage] = useState<Page>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  if (CHECKIN_EVENT_ID) return <CheckIn eventId={CHECKIN_EVENT_ID} />;
  if (!currentUser) return <Login />;

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard setPage={setPage} />;
      case 'members': return <Members />;
      case 'events': return <Events />;
      case 'frequency': return <Frequency />;
      case 'certificates': return currentUser.role === 'presidente' ? <Certificates /> : <NoAccess />;
      case 'secretaries': return currentUser.role === 'presidente' ? <Secretaries /> : <NoAccess />;
      case 'files': return <FilesPage />;
      case 'profile': return <Profile />;
      default: return <Dashboard setPage={setPage} />;
    }
  };

  return (
    <Layout page={page} setPage={setPage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}>
      {renderPage()}
    </Layout>
  );
}

function NoAccess() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-stone-400">
      <p className="text-4xl mb-3">🔒</p>
      <p>Acesso restrito ao Presidente.</p>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  );
}
