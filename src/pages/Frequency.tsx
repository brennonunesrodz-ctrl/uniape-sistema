import { useState } from 'react';
import { useStore } from '../store';
import type { MemberFrequency } from '../types';

const SEMESTERS = ['2025.2', '2026.1', '2026.2'];

export default function Frequency() {
  const { members, events, attendances } = useStore();
  const [semester, setSemester] = useState('2026.1');
  const [search, setSearch] = useState('');

  const semEvents = events.filter(e => e.semester === semester);
  const activeMembers = members.filter(m => m.active);

  const freqs: MemberFrequency[] = activeMembers.map(member => {
    const presences = semEvents.filter(ev =>
      attendances.some(a => a.eventId === ev.id && a.memberId === member.id)
    ).length;
    const hours = semEvents
      .filter(ev => attendances.some(a => a.eventId === ev.id && a.memberId === member.id))
      .reduce((s, ev) => s + ev.hours, 0);
    const percentage = semEvents.length > 0 ? Math.round((presences / semEvents.length) * 100) : 0;
    return {
      member,
      presences,
      total: semEvents.length,
      percentage,
      hours,
      eligible: percentage >= 75,
    };
  }).sort((a, b) => b.percentage - a.percentage);

  const filtered = freqs.filter(f => f.member.name.toLowerCase().includes(search.toLowerCase()));
  const eligibleCount = freqs.filter(f => f.eligible).length;

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#6B1A2C' }}>Frequência</h1>
        <p className="text-stone-500 mt-0.5 text-sm">Visão geral de presença por membro</p>
      </div>

      {/* Semester selector */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {SEMESTERS.map(s => (
          <button
            key={s}
            onClick={() => setSemester(s)}
            className="px-4 py-2 rounded-xl text-sm font-medium border cursor-pointer transition-all"
            style={semester === s ? { backgroundColor: '#6B1A2C', color: '#fff', borderColor: '#6B1A2C' } : { backgroundColor: '#fff', color: '#6b7280', borderColor: '#e7e5e4' }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Total de Eventos" value={semEvents.length} color="#6B1A2C" />
        <SummaryCard label="Carga Horária" value={`${semEvents.reduce((s, e) => s + e.hours, 0)}h`} color="#C4A35A" />
        <SummaryCard label="Membros Ativos" value={activeMembers.length} color="#1A4A6B" />
        <SummaryCard label="Aptos (≥75%)" value={eligibleCount} color="#4A6741" />
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar membro..."
        className="w-full max-w-xs px-3.5 py-2.5 mb-5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none"
        onFocus={e => (e.target.style.borderColor = '#6B1A2C')}
        onBlur={e => (e.target.style.borderColor = '#e7e5e4')}
      />

      {semEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-16 text-center text-stone-400">
          <p className="text-4xl mb-3">📊</p>
          <p>Nenhum evento registrado em {semester}.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">Membro</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">Presenças</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">Carga Hor.</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-stone-500 uppercase tracking-wider min-w-40">Frequência</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map(({ member, presences, total, percentage, hours, eligible }) => (
                <tr key={member.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: eligible ? '#6B1A2C' : '#94a3b8' }}
                      >
                        {member.name.charAt(0)}
                      </div>
                      <span className="font-medium text-stone-800">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="font-semibold text-stone-700">{presences}</span>
                    <span className="text-stone-400">/{total}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="font-semibold" style={{ color: '#C4A35A' }}>{hours}h</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%`, backgroundColor: eligible ? '#4A6741' : percentage >= 50 ? '#C4A35A' : '#dc2626' }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-12 text-right" style={{ color: eligible ? '#4A6741' : '#9a5068' }}>
                        {percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${eligible ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {eligible ? 'Apto' : 'Não apto'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Per-event breakdown */}
      {semEvents.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#6B1A2C' }}>
            Presença por Evento
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {semEvents.map(ev => {
              const count = attendances.filter(a => a.eventId === ev.id).length;
              const pct = activeMembers.length > 0 ? Math.round((count / activeMembers.length) * 100) : 0;
              return (
                <div key={ev.id} className="bg-white rounded-xl border border-stone-100 shadow-sm p-4">
                  <p className="font-medium text-stone-800 text-sm leading-snug mb-2 line-clamp-2">{ev.name}</p>
                  <p className="text-xs text-stone-400 mb-3">{formatDate(ev.date)} · {ev.hours}h</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: '#C4A35A' }} />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: '#6B1A2C' }}>{count}/{activeMembers.length}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
      <p className="text-2xl font-bold" style={{ color, fontFamily: 'Playfair Display, serif' }}>{value}</p>
      <p className="text-xs text-stone-500 mt-0.5">{label}</p>
    </div>
  );
}

function formatDate(d: string) {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}
