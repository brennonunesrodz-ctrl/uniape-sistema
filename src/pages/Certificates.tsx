import { useState } from 'react';
import { useStore } from '../store';
import type { Member } from '../types';
import logoSrc from '@/imports/Cart_o_de_boas-vindas_para_funcion_rio_moderno_roxo_e_lil_s.png';

const SEMESTERS = ['2025.2', '2026.1', '2026.2'];

export default function Certificates() {
  const { members, events, attendances, users } = useStore();
  const [semester, setSemester] = useState('2026.1');
  const [printMember, setPrintMember] = useState<{ member: Member; hours: number } | null>(null);

  const president = users.find(u => u.role === 'presidente' && u.active);
  const semEvents = events.filter(e => e.semester === semester);
  const activeMembers = members.filter(m => m.active);

  const eligibles = activeMembers
    .map(member => {
      const presences = semEvents.filter(ev => attendances.some(a => a.eventId === ev.id && a.memberId === member.id)).length;
      const hours = semEvents.filter(ev => attendances.some(a => a.eventId === ev.id && a.memberId === member.id)).reduce((s, ev) => s + ev.hours, 0);
      const pct = semEvents.length > 0 ? Math.round((presences / semEvents.length) * 100) : 0;
      return { member, presences, total: semEvents.length, pct, hours, eligible: pct >= 75 };
    })
    .filter(f => f.eligible);

  const handlePrint = (member: Member, hours: number) => {
    setPrintMember({ member, hours });
    setTimeout(() => window.print(), 300);
  };

  if (printMember) {
    return (
      <>
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#6B1A2C' }}>Pré-visualização do Certificado</h1>
          <div className="flex gap-3">
            <button onClick={() => window.print()} className="px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer" style={{ backgroundColor: '#C4A35A' }}>
              🖨 Imprimir / Salvar PDF
            </button>
            <button onClick={() => setPrintMember(null)} className="px-4 py-2 rounded-xl text-sm font-medium border border-stone-200 text-stone-600 cursor-pointer">
              Voltar
            </button>
          </div>
        </div>
        <Certificate
          member={printMember.member}
          hours={printMember.hours}
          semester={semester}
          presidentName={president?.name ?? ''}
          signatureUrl={president?.signatureUrl}
        />
      </>
    );
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#6B1A2C' }}>Certificados</h1>
        <p className="text-stone-500 mt-0.5 text-sm">Geração de certificados para membros aptos (≥ 75% de frequência)</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {SEMESTERS.map(s => (
          <button key={s} onClick={() => setSemester(s)} className="px-4 py-2 rounded-xl text-sm font-medium border cursor-pointer transition-all"
            style={semester === s ? { backgroundColor: '#6B1A2C', color: '#fff', borderColor: '#6B1A2C' } : { backgroundColor: '#fff', color: '#6b7280', borderColor: '#e7e5e4' }}>
            {s}
          </button>
        ))}
      </div>

      {!president?.signatureUrl && (
        <div className="mb-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <span className="text-amber-500 text-lg mt-0.5">⚠</span>
          <div>
            <p className="text-sm font-medium text-amber-800">Assinatura do presidente não cadastrada</p>
            <p className="text-xs text-amber-600 mt-0.5">Acesse o Perfil para adicionar a assinatura do presidente.</p>
          </div>
        </div>
      )}

      {semEvents.length === 0 ? (
        <EmptyState icon="📜" text={`Nenhum evento em ${semester}.`} />
      ) : eligibles.length === 0 ? (
        <EmptyState icon="🏅" text={`Nenhum membro apto em ${semester}.`} sub="Necessário ≥ 75% de frequência." />
      ) : (
        <>
          <p className="text-sm font-medium text-stone-600 mb-4">{eligibles.length} membro(s) apto(s) para certificação</p>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">Membro</th>
                  <th className="text-center px-4 py-3.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">Freq.</th>
                  <th className="text-center px-4 py-3.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">Carga Hor.</th>
                  <th className="px-6 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {eligibles.map(({ member, pct, hours }) => (
                  <tr key={member.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: '#6B1A2C' }}>{member.name.charAt(0)}</div>
                        <span className="font-medium text-stone-800">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center"><span className="text-sm font-semibold text-green-700">{pct}%</span></td>
                    <td className="px-4 py-4 text-center"><span className="text-sm font-semibold" style={{ color: '#C4A35A' }}>{hours}h</span></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handlePrint(member, hours)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer ml-auto" style={{ backgroundColor: '#6B1A2C' }}>
                        🏅 Gerar Certificado
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({ icon, text, sub }: { icon: string; text: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-16 text-center text-stone-400">
      <p className="text-4xl mb-3">{icon}</p>
      <p>{text}</p>
      {sub && <p className="text-xs mt-2">{sub}</p>}
    </div>
  );
}

function Certificate({ member, hours, semester, presidentName, signatureUrl }: {
  member: Member; hours: number; semester: string; presidentName: string; signatureUrl?: string;
}) {
  return (
    <>
      <style>{`@media print { @page { size: A4 landscape; margin: 0; } }`}</style>
      <div
        id="certificate-print"
        style={{
          width: '277mm',
          height: '190mm',
          backgroundColor: '#fff',
          fontFamily: 'Playfair Display, Georgia, serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '28px 56px',
          border: '3px solid #6B1A2C',
          position: 'relative',
          boxSizing: 'border-box',
          margin: '0 auto',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Corner ornaments */}
        {[['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']].map(([v, h]) => (
          <div key={v + h} style={{
            position: 'absolute', [v]: 10, [h]: 10, width: 44, height: 44,
            [`border${v.charAt(0).toUpperCase() + v.slice(1)}`]: '2px solid #C4A35A',
            [`border${h.charAt(0).toUpperCase() + h.slice(1)}`]: '2px solid #C4A35A',
          }} />
        ))}

        {/* Header row: logo + divider + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 20, width: '100%' }}>
          <img src={logoSrc} alt="UNIAPE" style={{ height: 72, objectFit: 'contain', flexShrink: 0 }} />
          <div style={{ width: 1, height: 72, backgroundColor: '#C4A35A', flexShrink: 0 }} />
          <div>
            <h1 style={{ fontSize: 34, fontWeight: 700, color: '#6B1A2C', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0, lineHeight: 1 }}>
              Certificado
            </h1>
            <p style={{ fontSize: 11, color: '#C4A35A', letterSpacing: '0.35em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', margin: '6px 0 0 2px' }}>
              de participação
            </p>
          </div>
        </div>

        {/* Gold line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22, width: '100%' }}>
          <div style={{ flex: 1, height: 1, backgroundColor: '#C4A35A', opacity: 0.6 }} />
          <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#C4A35A' }} />
          <div style={{ flex: 1, height: 1, backgroundColor: '#C4A35A', opacity: 0.6 }} />
        </div>

        {/* Body text */}
        <p style={{ fontSize: 15.5, color: '#2a1a1a', textAlign: 'center', lineHeight: 2, maxWidth: 620, margin: 0, fontFamily: 'Playfair Display, serif' }}>
          Certificamos que{' '}
          <strong style={{ color: '#6B1A2C', fontWeight: 700 }}>{member.name}</strong>{' '}
          participou das atividades desenvolvidas pela{' '}
          <strong>Unidade Acadêmica de Periodontia e Empreendedorismo – UNIAPE</strong>,
          cumprindo carga horária de{' '}
          <strong style={{ color: '#6B1A2C' }}>{hours} horas</strong>{' '}
          durante o semestre <strong>{semester}</strong>.
        </p>

        {/* Thin separator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '22px 0', width: '100%', maxWidth: 600 }}>
          <div style={{ flex: 1, height: 1, backgroundColor: '#e7e5e4' }} />
          <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#C4A35A' }} />
          <div style={{ flex: 1, height: 1, backgroundColor: '#e7e5e4' }} />
        </div>

        {/* Signature */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {signatureUrl && (
            <img src={signatureUrl} alt="Assinatura" style={{ height: 48, objectFit: 'contain', marginBottom: 4 }} />
          )}
          <div style={{ width: 180, height: 1, backgroundColor: '#6B1A2C' }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: '#6B1A2C', textAlign: 'center', margin: '4px 0 0' }}>{presidentName}</p>
          <p style={{ fontSize: 10, color: '#9a7a85', fontFamily: 'Inter, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Presidente da UNIAPE</p>
        </div>
      </div>
    </>
  );
}
