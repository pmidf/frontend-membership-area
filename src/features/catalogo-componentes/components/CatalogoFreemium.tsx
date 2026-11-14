"use client";

import { BloqueioSecao } from "@/features/conversao/components/BloqueioSecao";
import { BotaoQueroSerFiliado } from "@/features/conversao/components/BotaoQueroSerFiliado";
import { PainelExclusivoFiliados } from "@/features/conversao/components/PainelExclusivoFiliados";
import { PreviaBloqueada } from "@/features/conversao/components/PreviaBloqueada";
import { SeloExclusivo } from "@/features/conversao/components/SeloExclusivo";
import { Cartao } from "@/shared/ui";

import { SecaoCatalogo } from "./SecaoCatalogo";

type ConteudoExemplo = { id: string; titulo: string; bloqueado: boolean };

const conteudos: ConteudoExemplo[] = [
  { id: "1", titulo: "Gestão ágil em obras públicas", bloqueado: false },
  { id: "2", titulo: "Liderança em projetos de alto risco", bloqueado: true },
  { id: "3", titulo: "PMO na prática", bloqueado: true },
];

export function CatalogoFreemium() {
  return (
    <SecaoCatalogo titulo="Freemium">
      <div className="flex flex-wrap items-center gap-3">
        <BotaoQueroSerFiliado />
        <SeloExclusivo />
      </div>
      <PainelExclusivoFiliados descricao="Filie-se ao PMI-DF para ter acesso ao clube de benefícios e aos conteúdos exclusivos." />
      <PreviaBloqueada
        itens={conteudos}
        chave={(conteudo) => conteudo.id}
        resumoAcessivel="2 conteúdos exclusivos para filiados"
        className="grid gap-3 md:grid-cols-3"
        renderizarItem={(conteudo) => (
          <Cartao className="h-full p-4">
            <p className="text-rotulo">{conteudo.titulo}</p>
          </Cartao>
        )}
      />
      <BloqueioSecao
        titulo="Filie-se para começar a colecionar peças"
        descricao="Cada presença confirmada em um evento vira 1 crédito para o quebra-cabeça."
      >
        <div className="grid h-64 grid-cols-4 gap-2">
          {Array.from({ length: 12 }, (_, indice) => (
            <div key={indice} className="rounded-md bg-violeta-50" />
          ))}
        </div>
      </BloqueioSecao>
    </SecaoCatalogo>
  );
}
