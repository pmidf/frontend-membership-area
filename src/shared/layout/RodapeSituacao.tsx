"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";

import { BotaoQueroSerFiliado } from "@/features/conversao/components/BotaoQueroSerFiliado";
import { formatarMesAno } from "@/shared/lib/datas";
import { useSessao } from "@/shared/sessao/useSessao";
import { classesBotao } from "@/shared/ui/botao/Botao";

type PropsRodapeSituacao = {
  aoNavegar?: () => void;
};

function CartaoFiliado({ dataExpiracao }: { dataExpiracao: string | null }) {
  return (
    <div className="flex flex-col gap-2 rounded-md bg-violeta-950 p-4 text-texto-inverso">
      <p className="text-corpo-pequeno font-medium">Filiado ativo</p>
      {dataExpiracao && (
        <p className="text-legenda">Filiação válida até {formatarMesAno(dataExpiracao)}</p>
      )}
    </div>
  );
}

function CartaoPlanoGratuito() {
  return (
    <div className="flex flex-col gap-3 rounded-md bg-acao-primaria p-4 text-texto-inverso">
      <p className="text-corpo-pequeno font-medium">Você está no plano gratuito</p>
      <p className="text-legenda">Filie-se ao PMI-DF e libere benefícios, conteúdo e conquistas.</p>
      <BotaoQueroSerFiliado rotulo="Quero me filiar" variante="inverso" tamanho="sm" larguraTotal />
    </div>
  );
}

function CartaoVisitante({ aoNavegar }: PropsRodapeSituacao) {
  return (
    <div className="flex flex-col gap-3 rounded-md bg-violeta-950 p-4 text-texto-inverso">
      <p className="text-corpo-pequeno font-medium">Entre para ver sua trilha</p>
      <p className="text-legenda">Acesse benefícios, conteúdos e conquistas da comunidade.</p>
      <Link
        href="/login"
        onClick={aoNavegar}
        className={classesBotao({ variante: "inverso", tamanho: "sm", larguraTotal: true })}
      >
        Entrar
      </Link>
      <Link
        href="/cadastro"
        onClick={aoNavegar}
        className="text-center text-corpo-pequeno font-medium text-texto-inverso underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-acao-destaque"
      >
        Criar conta
      </Link>
    </div>
  );
}

export function RodapeSituacao({ aoNavegar }: PropsRodapeSituacao) {
  const { estado, perfil, ehFiliado, ehAdmin } = useSessao();

  if (estado === "carregando") return null;
  if (estado === "anonimo" || !perfil) return <CartaoVisitante aoNavegar={aoNavegar} />;

  return (
    <div className="flex flex-col gap-3">
      {ehAdmin && (
        <Link
          href="/admin"
          onClick={aoNavegar}
          className="flex items-center gap-2 rounded-md border border-branco/20 px-3 py-2.5 text-corpo-pequeno font-medium text-texto-inverso hover:bg-branco/10 focus-visible:outline-2 focus-visible:outline-acao-destaque"
        >
          <ShieldCheck aria-hidden="true" className="size-5 text-acao-destaque" />
          Console administrativo
        </Link>
      )}
      {ehFiliado ? (
        <CartaoFiliado dataExpiracao={perfil.filiacao?.data_expiracao ?? null} />
      ) : (
        <CartaoPlanoGratuito />
      )}
    </div>
  );
}
