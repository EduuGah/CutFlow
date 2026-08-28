import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { Reveal } from '../../components/ui/Reveal';

/* ---------------------------------------------------------------------------
   Quadro de horários — o herói da página.
   Em vez de descrever o produto, a página mostra o objeto que o produto
   manipula: a coluna de horários de um barbeiro, com vagas sendo tomadas e
   abertas em tempo real.
--------------------------------------------------------------------------- */

const SLOTS = [
  '09:00', '09:45', '10:30', '11:15', '13:00',
  '13:45', '14:30', '15:15', '16:00', '16:45',
];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const SlotBoard = () => {
  const [taken, setTaken] = useState<string[]>(['09:00', '11:15', '14:30']);
  const [justChanged, setJustChanged] = useState<string | null>(null);
  const takenRef = useRef(taken);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const timer = window.setInterval(() => {
      const current = takenRef.current;
      const free = SLOTS.filter((slot) => !current.includes(slot));
      if (free.length === 0) return;

      const claimed = free[Math.floor(Math.random() * free.length)];
      // O quadro respira: entra uma marcação nova, a mais antiga volta a abrir.
      const next = current.length >= 5 ? [...current.slice(1), claimed] : [...current, claimed];

      takenRef.current = next;
      setTaken(next);
      setJustChanged(claimed);
    }, 2600);

    return () => window.clearInterval(timer);
  }, []);

  const freeCount = SLOTS.length - taken.length;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] backdrop-blur-sm">
      <span
        className="pole-stripes pole-stripes-still absolute inset-y-0 left-0 w-1.5"
        style={{ ['--pole-a' as string]: '#e6bc68', ['--pole-b' as string]: '#0f2a22' }}
        aria-hidden="true"
      />

      <header className="flex items-end justify-between gap-4 border-b border-white/10 px-6 py-5 pl-8">
        <div>
          <p className="type-tag text-brass-bright">
            Hoje ·{' '}
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long' }).replace(/-feira$/, '')}
          </p>
          <p className="type-sign mt-2 text-2xl text-white">Ricardo Alves</p>
        </div>
        <p className="type-num text-right text-sm text-white/50">
          <span
            key={freeCount}
            className="anim-tick block text-2xl font-medium text-white"
          >
            {freeCount}
          </span>
          livres
        </p>
      </header>

      <ul className="grid grid-cols-2 gap-2 p-6 pl-8 sm:grid-cols-2">
        {SLOTS.map((slot, index) => {
          const isTaken = taken.includes(slot);
          return (
            <li
              key={slot}
              className="anim-rise-sm"
              style={{ ['--d' as string]: `${260 + index * 55}ms` }}
            >
              <span
                className={`type-num flex items-center justify-between rounded-lg border px-3.5 py-3 text-sm transition-all duration-500 ${
                  isTaken
                    ? 'border-white/5 bg-transparent text-white/25 line-through'
                    : 'border-white/12 bg-white/[0.06] text-white'
                } ${justChanged === slot && isTaken ? 'anim-pop' : ''}`}
              >
                {slot}
                {!isTaken && (
                  <span className="h-1.5 w-1.5 rounded-full bg-brass-bright" aria-hidden="true" />
                )}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="border-t border-white/10 px-6 py-4 pl-8 text-xs text-white/40">
        Almoço, folga e agenda cheia já saem da conta.
      </p>
    </div>
  );
};

/* ---------------------------------------------------------------------------
   Página
--------------------------------------------------------------------------- */

const STEPS = [
  {
    title: 'Escolha o dia e o profissional',
    body: 'O calendário só oferece quem realmente atende naquele dia da semana.',
  },
  {
    title: 'Veja os horários que sobraram',
    body: 'A duração do serviço entra na conta, então nenhum encaixe fica pela metade.',
  },
  {
    title: 'Confirme e pronto',
    body: 'O horário some da agenda de todo mundo no mesmo instante.',
  },
];

const ROLES = [
  {
    tag: 'Cliente',
    title: 'Marca, acompanha e avalia',
    body: 'Histórico completo, próximos horários e uma nota para o barbeiro depois do corte.',
  },
  {
    tag: 'Barbeiro',
    title: 'Comanda o próprio dia',
    body: 'Inicia e conclui atendimentos, vê o telefone do cliente e bloqueia ausências sozinho.',
  },
  {
    tag: 'Dono',
    title: 'Enxerga a casa inteira',
    body: 'Receita do dia, agenda de toda a equipe, catálogo de serviços e horários de trabalho.',
  },
];

export const Landing = () => {
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="min-h-screen bg-pine-deep text-white">
      {/* Luz de vitrine atrás do herói */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] opacity-70"
        style={{
          background:
            'radial-gradient(60% 55% at 72% 8%, rgba(189,138,44,0.22), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
          <Logo tone="light" />
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/login"
              className="link-underline px-1 text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              Entrar
            </Link>
            <Link to="/register" className="btn btn-brass btn-sm sm:px-5">
              Criar conta
            </Link>
          </div>
        </nav>

        {/* Herói */}
        <header className="mx-auto grid max-w-6xl items-center gap-14 px-5 pt-12 pb-24 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:pt-20 lg:pb-32">
          <div>
            <p
              className="type-tag anim-fade flex items-center gap-3 text-brass-bright"
              style={{ ['--d' as string]: '80ms' }}
            >
              <span className="h-px w-8 bg-brass/50" aria-hidden="true" />
              Agenda de barbearia
            </p>

            <h1
              className="type-display anim-rise mt-6 text-[3.25rem] leading-[0.92] sm:text-[4.5rem] lg:text-[5.25rem]"
              style={{ ['--d' as string]: '140ms' }}
            >
              Escolha o horário.
              <br />
              <span className="text-brass-bright">Sente na cadeira.</span>
            </h1>

            <p
              className="anim-rise mt-7 max-w-lg text-lg leading-relaxed text-white/65"
              style={{ ['--d' as string]: '240ms' }}
            >
              O CutFlow mostra as vagas que cada profissional tem livre de verdade. Você
              escolhe, confirma e o horário sai da agenda de todo mundo na hora.
            </p>

            <div
              className="anim-rise mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
              style={{ ['--d' as string]: '330ms' }}
            >
              <Link to="/register" className="btn btn-brass btn-lg group">
                Criar conta e agendar
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="btn btn-lg border-white/15 bg-white/5 text-white hover:bg-white/10"
              >
                Já tenho conta
              </Link>
            </div>
          </div>

          <div className="anim-rise" style={{ ['--d' as string]: '420ms' }}>
            <SlotBoard />
          </div>
        </header>

        {/* Sequência real do agendamento — por isso a numeração faz sentido */}
        <section className="border-t border-white/8 bg-pine/40">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
            <Reveal>
              <p className="type-tag text-brass-bright">Do toque ao corte</p>
              <h2 className="type-display mt-4 max-w-xl text-[2.4rem] sm:text-[3rem]">
                Três passos, sem telefone
              </h2>
            </Reveal>

            <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/8 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <Reveal as="li" key={step.title} delay={index * 110} className="bg-pine-deep">
                  <div className="flex h-full flex-col gap-5 p-7 sm:p-8">
                    <div className="flex items-center gap-3">
                      <span
                        className="pole h-8 w-2.5"
                        style={{
                          ['--pole-a' as string]: '#e6bc68',
                          ['--pole-b' as string]: '#14392e',
                        }}
                        aria-hidden="true"
                      >
                        <span className="pole-stripes pole-stripes-still absolute inset-0" />
                      </span>
                      <span className="type-num text-3xl text-white/25">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="type-sign text-xl text-white">{step.title}</h3>
                    <p className="text-[0.9375rem] leading-relaxed text-white/55">{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* Quadro da equipe: quem entra por qual porta */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
          <Reveal>
            <p className="type-tag text-brass-bright">Três portas</p>
            <h2 className="type-display mt-4 max-w-2xl text-[2.4rem] sm:text-[3rem]">
              Cada um entra na sua sala
            </h2>
          </Reveal>

          <dl className="mt-12 border-t border-white/10">
            {ROLES.map((role, index) => (
              <Reveal key={role.tag} delay={index * 110}>
                <div className="group grid items-baseline gap-3 border-b border-white/10 py-8 transition-colors duration-300 hover:bg-white/[0.03] sm:grid-cols-[9rem_1fr] sm:gap-8 sm:px-2">
                  <dt className="type-tag text-brass-bright">{role.tag}</dt>
                  <dd>
                    <p className="type-sign text-2xl text-white transition-transform duration-300 group-hover:translate-x-1">
                      {role.title}
                    </p>
                    <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-white/55">
                      {role.body}
                    </p>
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </section>

        {/* Chamada final */}
        <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl border border-brass/25 bg-brass/10 px-7 py-12 text-center sm:px-12 sm:py-16">
              <span
                className="pole-stripes pole-stripes-still absolute inset-x-0 top-0 h-1"
                style={{
                  ['--pole-a' as string]: '#e6bc68',
                  ['--pole-b' as string]: '#14392e',
                }}
                aria-hidden="true"
              />
              <h2 className="type-display text-[2.2rem] sm:text-[3rem]">
                Sua próxima cadeira já está aberta
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[0.9375rem] text-white/60">
                Crie a conta, escolha o profissional e marque o horário em menos de um minuto.
              </p>
              <Link to="/register" className="btn btn-brass btn-lg group mt-8">
                Criar conta
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
        </section>

        <footer className="border-t border-white/8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row sm:px-8">
            <Logo tone="light" />
            <p className="type-num text-xs text-white/35">© {year} CutFlow</p>
          </div>
        </footer>
      </div>
    </div>
  );
};
