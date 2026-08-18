import { useStore } from '../store';
import type { Page } from '../types';

interface Props { setPage: (p: Page) => void; }

export default function Dashboard({ setPage }: Props) {
  const { members, events, attendances, currentUser } = useStore();

  const activeMembers = members.filter(m => m.active);
  const currentSemester = '2026.1';
  const semEvents = events.filter(e => e.semester === currentSemester);

  const eligibleCount = activeMembers.filter(member => {
    const presences = semEvents.filter(ev => attendances.some(a => a.eventId === ev.id && a.memberId === member.id)).length;
    return semEvents.length > 0 && (presences / semEvents.length) >= 0.75;
  }).length;

  const recentEvents = [...events].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  const totalHours = semEvents.reduce((s, e) => s + e.hours, 0);

  const isPresidente = currentUser?.role === 'presidente';
  const greeting = isPresidente ? `Olá, ${currentUser?.name.split(' ')[1] ?? currentUser?.name}` : `Olá, ${currentUser?.secretariaType ?? 'Secretaria'}`;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#6B1A2C' }}>
          Dashboard
        </h1>
        <p className="text-stone-500 mt-1">{greeting} — Semestre {currentSemester}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Membros Ativos"
          value={activeMembers.length}
          icon="👥"
          onClick={() => setPage('members')}
          color="#6B1A2C"
        />
        <StatCard
          label="Eventos no Semestre"
          value={semEvents.length}
          icon="📅"
          onClick={() => setPage('events')}
          color="#C4A35A"
        />
        <StatCard
          label="Carga Horária Total"
          value={`${totalHours}h`}
          icon="⏱"
          color="#4A6741"
        />
        <StatCard
          label="Aptos p/ Certificado"
          value={eligibleCount}
          icon="🏅"
          onClick={isPresidente ? () => setPage('certificates') : undefined}
          color="#1A4A6B"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent events */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
            <h2 className="font-semibold text-stone-800" style={{ fontFamily: 'Playfair Display, serif' }}>Eventos Recentes</h2>
            <button onClick={() => setPage('events')} className="text-xs font-medium cursor-pointer" style={{ color: '#6B1A2C' }}>
              Ver todos →
            </button>
          </div>
          <div className="divide-y divide-stone-50">
            {recentEvents.length === 0 && (
              <p className="text-stone-400 text-sm text-center py-8">Nenhum evento criado.</p>
            )}
            {recentEvents.map(ev => {
              const presences = attendances.filter(a => a.eventId === ev.id).length;
              return (
                <div key={ev.id} className="flex items-center gap-4 px-6 py-3.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm" style={{ backgroundColor: '#FBF0EC', color: '#6B1A2C' }}>
                    📅
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{ev.name}</p>
                    <p className="text-xs text-stone-400">{formatDate(ev.date)} · {ev.hours}h · {ev.semester}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: '#6B1A2C' }}>{presences}</p>
                    <p className="text-xs text-stone-400">presenças</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Frequency overview */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
            <h2 className="font-semibold text-stone-800" style={{ fontFamily: 'Playfair Display, serif' }}>Frequência — {currentSemester}</h2>
            <button onClick={() => setPage('frequency')} className="text-xs font-medium cursor-pointer" style={{ color: '#6B1A2C' }}>
              Ver detalhes →
            </button>
          </div>
          <div className="divide-y divide-stone-50">
            {activeMembers.slice(0, 5).map(member => {
              const presences = semEvents.filter(ev => attendances.some(a => a.eventId === ev.id && a.memberId === member.id)).length;
              const pct = semEvents.length > 0 ? Math.round((presences / semEvents.length) * 100) : 0;
              const eligible = pct >= 75;
              return (
                <div key={member.id} className="flex items-center gap-3 px-6 py-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white" style={{ backgroundColor: '#6B1A2C' }}>
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{member.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: eligible ? '#4A6741' : '#C4A35A' }}
                        />
                      </div>
                      <span className="text-xs font-medium w-9 text-right" style={{ color: eligible ? '#4A6741' : '#9a5068' }}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${eligible ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {eligible ? 'Apto' : 'Pendente'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, onClick, color }: { label: string; value: string | number; icon: string; onClick?: () => void; color: string }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-stone-100 shadow-sm p-5 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <div className="w-2 h-2 rounded-full mt-1" style={{ backgroundColor: color }} />
      </div>
      <p className="text-3xl font-bold" style={{ color, fontFamily: 'Playfair Display, serif' }}>{value}</p>
      <p className="text-xs text-stone-500 mt-1">{label}</p>
    </div>
  );
}

function formatDate(d: string) {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}
