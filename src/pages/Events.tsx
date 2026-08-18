import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../store';
import type { Event } from '../types';

const SEMESTERS = ['2025.2', '2026.1', '2026.2'];

const SEC_LABELS: Record<string, string> = {
  UNIAPE: 'UNIAPE',
  UniUp: 'UniUp',
  UniE: 'UniE',
  UniScience: 'UniScience',
};
const SEC_COLORS: Record<string, { bg: string; text: string }> = {
  UNIAPE: { bg: '#FBF0EC', text: '#6B1A2C' },
  UniUp: { bg: '#EBF0FB', text: '#1A3A6B' },
  UniE: { bg: '#EBFBF0', text: '#1A6B3A' },
  UniScience: { bg: '#FBF5EB', text: '#6B4A1A' },
};

export default function Events() {
  const { events, attendances, members, users, currentUser, addEvent, addAttendance, removeAttendance } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showQR, setShowQR] = useState<Event | null>(null);
  const [filterSem, setFilterSem] = useState('2026.1');
  const [form, setForm] = useState({ name: '', date: '', hours: '2', semester: '2026.1' });

  const filtered = events.filter(e => e.semester === filterSem);
  const getSecretaria = (userId: string) => users.find(u => u.id === userId);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addEvent({ name: form.name, date: form.date, hours: Number(form.hours), semester: form.semester, createdBy: currentUser!.id });
    setShowForm(false);
    setForm({ name: '', date: '', hours: '2', semester: '2026.1' });
  };

  const eventAttendances = selectedEvent ? attendances.filter(a => a.eventId === selectedEvent.id) : [];
  const activeMembers = members.filter(m => m.active);

  const qrUrl = (ev: Event) => `${window.location.origin}${window.location.pathname}?checkin=${ev.id}`;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#6B1A2C' }}>Eventos</h1>
          <p className="text-stone-500 mt-0.5 text-sm">{filtered.length} evento(s) em {filterSem}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer" style={{ backgroundColor: '#6B1A2C' }}>
          + Novo Evento
        </button>
      </div>

      {showForm && (
        <Modal title="Criar Evento" onClose={() => setShowForm(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Nome do evento">
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Palestra sobre Periodontia" className={iCls} onFocus={fo} onBlur={bl} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Data"><input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={iCls} onFocus={fo} onBlur={bl} /></Field>
              <Field label="Carga horária (h)"><input required type="number" min="1" value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} className={iCls} onFocus={fo} onBlur={bl} /></Field>
            </div>
            <Field label="Semestre">
              <select value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} className={iCls}>
                {SEMESTERS.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-stone-600 border border-stone-200 cursor-pointer">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer" style={{ backgroundColor: '#6B1A2C' }}>Criar Evento</button>
            </div>
          </form>
        </Modal>
      )}

      {showQR && (
        <Modal title="QR Code de Presença" onClose={() => setShowQR(null)}>
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white border-2 border-stone-100 rounded-2xl">
              <QRCodeSVG value={qrUrl(showQR)} size={200} fgColor="#6B1A2C" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-stone-800">{showQR.name}</p>
              <p className="text-sm text-stone-500">{formatDate(showQR.date)} · {showQR.hours}h</p>
            </div>
            <p className="text-xs text-stone-400 text-center">Membros escaneiam este QR Code para registrar presença</p>
            <button onClick={() => window.open(qrUrl(showQR), '_blank')} className="text-xs px-4 py-2 rounded-lg border border-stone-200 text-stone-600 cursor-pointer">
              Abrir link de check-in
            </button>
          </div>
        </Modal>
      )}

      {selectedEvent && (
        <Modal title={`Presença — ${selectedEvent.name}`} onClose={() => setSelectedEvent(null)}>
          <div className="mb-3">
            <p className="text-xs text-stone-500">{formatDate(selectedEvent.date)} · {selectedEvent.hours}h · {selectedEvent.semester}</p>
            <p className="text-sm text-stone-600 mt-1">{eventAttendances.length} de {activeMembers.length} presentes</p>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-stone-50 -mx-2">
            {activeMembers.map(m => {
              const present = eventAttendances.some(a => a.memberId === m.id);
              return (
                <div key={m.id} className="flex items-center justify-between px-2 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center text-white" style={{ backgroundColor: '#6B1A2C' }}>{m.name.charAt(0)}</div>
                    <span className="text-sm text-stone-700">{m.name}</span>
                  </div>
                  <button
                    onClick={() => present ? removeAttendance(selectedEvent.id, m.id) : addAttendance(selectedEvent.id, m.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center border-2 cursor-pointer transition-all"
                    style={present ? { backgroundColor: '#6B1A2C', borderColor: '#6B1A2C' } : { backgroundColor: 'white', borderColor: '#d1d5db' }}
                  >
                    {present && <span className="text-white text-sm">✓</span>}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-stone-400 text-center mt-3">Clique no círculo para marcar/desmarcar presença</p>
        </Modal>
      )}

      <div className="flex gap-2 mb-5 flex-wrap">
        {SEMESTERS.map(s => (
          <button key={s} onClick={() => setFilterSem(s)} className="px-4 py-2 rounded-xl text-sm font-medium border cursor-pointer transition-all"
            style={filterSem === s ? { backgroundColor: '#6B1A2C', color: '#fff', borderColor: '#6B1A2C' } : { backgroundColor: '#fff', color: '#6b7280', borderColor: '#e7e5e4' }}>
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-16 text-center text-stone-400">
          <p className="text-4xl mb-3">📅</p>
          <p>Nenhum evento em {filterSem}.</p>
        </div>
      )}

      <div className="grid gap-4">
        {filtered.map(ev => {
          const sec = getSecretaria(ev.createdBy);
          const secType = sec?.secretariaType ?? 'UNIAPE';
          const colors = SEC_COLORS[secType] ?? SEC_COLORS['UNIAPE'];
          const presences = attendances.filter(a => a.eventId === ev.id).length;
          return (
            <div key={ev.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: colors.bg, color: colors.text }}>{SEC_LABELS[secType] ?? secType}</span>
                  <span className="text-xs text-stone-400">{ev.semester}</span>
                </div>
                <h3 className="font-semibold text-stone-800 text-base truncate">{ev.name}</h3>
                <p className="text-sm text-stone-500 mt-0.5">{formatDate(ev.date)} · {ev.hours}h · {presences} presenças</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setShowQR(ev)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-stone-200 text-stone-600 cursor-pointer hover:bg-stone-50 transition-colors">QR Code</button>
                <button onClick={() => setSelectedEvent(ev)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer" style={{ backgroundColor: '#6B1A2C' }}>Presença</button>
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

function formatDate(d: string) {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}
