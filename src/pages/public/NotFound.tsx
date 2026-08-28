import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';

export const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-pine-deep px-6 text-center text-white">
    <Logo tone="light" />

    <div className="anim-rise">
      <p className="type-num text-6xl text-brass-bright sm:text-7xl">404</p>
      <h1 className="type-display mt-5 text-[2.2rem] sm:text-[2.8rem]">
        Essa porta não existe
      </h1>
      <p className="mx-auto mt-3 max-w-sm text-[0.9375rem] text-white/55">
        O endereço que você abriu não leva a nenhuma tela do CutFlow.
      </p>
    </div>

    <div className="anim-rise flex flex-wrap justify-center gap-3" style={{ ['--d' as string]: '120ms' }}>
      <Link to="/" className="btn btn-brass group">
        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
        Voltar ao início
      </Link>
      <Link to="/login" className="btn border-white/15 bg-white/5 text-white hover:bg-white/10">
        Entrar na conta
      </Link>
    </div>
  </div>
);
