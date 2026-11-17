"use client";

import { CalendarX } from "lucide-react";
import Link from "next/link";

import { useEventosAgenda } from "@/features/agenda/api/agenda.queries";
import { ImagemEvento } from "@/features/agenda/components/ImagemEvento";
import type { Evento } from "@/features/agenda/types";
import { Cartao, EstadoVazio } from "@/shared/ui";

import { proximosEventos, rotuloEvento } from "../lib/selecionar-destaques";
import { SecaoInicio } from "./SecaoInicio";
import { ItemTrilho, TrilhoInicio } from "./TrilhoInicio";

const TITULO = "Próximos eventos";

function CartaoEventoInicio({ evento }: { evento: Evento }) {
  return (
    <Cartao interativo className="relative flex h-full flex-col gap-3 p-4">
      <ImagemEvento src={evento.imagemUrl} className="h-32" />
      <h3 className="line-clamp-2 text-corpo font-bold">
        <Link
          href={`/agenda/${encodeURIComponent(evento.id)}`}
          className="after:absolute after:inset-0 focus-visible:outline-none"
        >
          {evento.titulo}
        </Link>
      </h3>
      <p className="mt-auto text-legenda text-texto-secundario">{rotuloEvento(evento)}</p>
    </Cartao>
  );
}

function ListaEventos({ eventos }: { eventos: Evento[] }) {
  const proximos = proximosEventos(eventos, new Date());

  if (proximos.length === 0) {
    return (
      <EstadoVazio
        icone={CalendarX}
        titulo="Nenhum evento agendado"
        descricao="Os próximos encontros do capítulo aparecem aqui assim que forem publicados."
        className="py-6"
      />
    );
  }

  return (
    <TrilhoInicio rotulo={TITULO}>
      {proximos.map((evento) => (
        <ItemTrilho key={evento.id}>
          <CartaoEventoInicio evento={evento} />
        </ItemTrilho>
      ))}
    </TrilhoInicio>
  );
}

export function ProximosEventosInicio() {
  const eventos = useEventosAgenda();

  return (
    <SecaoInicio
      titulo={TITULO}
      rotuloLink="Ver agenda completa"
      href="/agenda"
      consulta={eventos}
      mensagemErro="A agenda está indisponível no momento."
    >
      {eventos.data && <ListaEventos eventos={eventos.data} />}
    </SecaoInicio>
  );
}
