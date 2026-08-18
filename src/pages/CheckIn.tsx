import { useState } from 'react';
import { useStore } from '../store';
import Logo from '../components/Logo';

interface Props {
  eventId: string;
}

export default function CheckIn({ eventId }: Props) {
  const { events, members, attendances, addAttendance } = useStore();
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'duplicate' | 'error'>('idle');
  const [confirmedName, setConfirmedName] = useState('');
  const [search, setSearch] = useState('');

  const event = events.find(e => e.id === eventId);
  const activeMembers = members.filter(m => m.active);
  const alreadyPresent = attendances.filter(a => a.eventId === eventId).map(a => a.memberId);

  const filteredMembers = activeMembers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = () => {
    if (!selectedMemberId) return;
    const member = members.find(m => m.id === selectedMemberId);
    if (!member) return;

    if (alreadyPresent.includes(selectedMemberId)) {
      setStatus('duplicate');
      setConfirmedName(member.name);
      return;
    }

    addAttendance(eventId, selectedMemberId);
    setStatus('success');
    setConfirmedName(member.name);
    setSelectedMemberId('');
    setSearch('');
  };

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FBF7F2' }}>
        <div className="text-center p-8">
          <Logo size="md" />
          <p className="mt-6 text-stone-500">Evento não encontrado.</p>
        </div>
      </div>
    );
  }

  const formatDate = (d: string) => {
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FBF7F2' }}>
      {/* Header */}
      <div className="flex justify-center pt-8 pb-4">
        <Logo size="md" />
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pb-8">
        <div className="w-full max-w-sm mt-4">
          {/* Event card */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-5">
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Registro de Presença</p>
            <h2 className="text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#6B1A2C' }}>{event.name}</h2>
            <p className="text-sm text-stone-500 mt-1">{formatDate(event.date)} · {event.hours}h · {event.semester}</p>
          </div>

          {/* Success banner */}
          {status === 'success' && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <span className="text-green-500 text-lg mt-0.5">✓</span>
              <div>
                <p className="text-sm font-semibold text-green-800">Presença registrada!</p>
                <p className="text-xs text-green-600 mt-0.5">{confirmedName} — {event.name}</p>
              </div>
            </div>
          )}

          {/* Duplicate banner */}
          {status === 'duplicate' && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <span className="text-amber-500 text-lg mt-0.5">⚠</span>
              <div>
                <p className="text-sm font-semibold text-amber-800">Presença já registrada</p>
                <p className="text-xs text-amber-600 mt-0.5">{confirmedName} já tem presença neste evento.</p>
              </div>
            </div>
          )}

          {/* Member selection */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-stone-700 mb-3">Selecione seu nome</h3>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar nome..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none mb-3"
              onFocus={e => (e.target.style.borderColor = '#6B1A2C')}
              onBlur={e => (e.target.style.borderColor = '#e7e5e4')}
            />
            <div className="max-h-64 overflow-y-auto space-y-1.5">
              {filteredMembers.map(m => {
                const present = alreadyPresent.includes(m.id);
                const selected = selectedMemberId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => { if (!present) { setSelectedMemberId(m.id); setStatus('idle'); } }}
                    disabled={present}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer border"
                    style={
                      present
                        ? { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d', cursor: 'default' }
                        : selected
                        ? { backgroundColor: '#6B1A2C', borderColor: '#6B1A2C', color: '#fff' }
                        : { backgroundColor: 'transparent', borderColor: '#e7e5e4', color: '#374151' }
                    }
                  >
                    <span>{m.name}</span>
                    {present && <span className="text-xs">✓ Presente</span>}
                    {selected && !present && <span className="text-xs">● Selecionado</span>}
                  </button>
                );
              })}
              {filteredMembers.length === 0 && (
                <p className="text-center text-stone-400 text-sm py-4">Nenhum membro encontrado.</p>
              )}
            </div>

            <button
              onClick={handleConfirm}
              disabled={!selectedMemberId}
              className="w-full mt-4 py-3 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer"
              style={{ backgroundColor: selectedMemberId ? '#6B1A2C' : '#c9b4ba' }}
            >
              Confirmar Presença
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
