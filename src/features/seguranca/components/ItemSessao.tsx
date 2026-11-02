import { Monitor, Smartphone } from "lucide-react";

import { formatarDataHora, tempoDesde } from "@/shared/lib/datas";
import { Botao, SeloStatus } from "@/shared/ui";

import type { SessaoAtiva } from "../api/seguranca.api";
import { descreverDispositivo, formatarIp } from "../lib/descrever-dispositivo";

type PropsItemSessao = {
  sessao: SessaoAtiva;
  aoEncerrar: (sessao: SessaoAtiva) => void;
};

export function ItemSessao({ sessao, aoEncerrar }: PropsItemSessao) {
  const { tipo, descricao } = descreverDispositivo(sessao.user_agent);
  const Icone = tipo === "celular" ? Smartphone : Monitor;

  return (
    <li className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-violeta-50">
        <Icone
          role="img"
          aria-label={tipo === "celular" ? "Celular" : "Computador"}
          className="size-5 text-texto-marca"
        />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="flex flex-wrap items-center gap-2 text-corpo-pequeno font-medium">
          {descricao}
          {sessao.atual && <SeloStatus tom="aqua">Esta sessão</SeloStatus>}
        </p>
        <p className="text-legenda text-texto-secundario">
          {formatarIp(sessao.ip)} · Último acesso{" "}
          <time dateTime={sessao.data_ultimo_uso} title={formatarDataHora(sessao.data_ultimo_uso)}>
            {tempoDesde(sessao.data_ultimo_uso)}
          </time>
        </p>
      </div>
      {!sessao.atual && (
        <Botao
          variante="secundario"
          tamanho="sm"
          onClick={() => aoEncerrar(sessao)}
          aria-label={`Encerrar a sessão ${descricao}`}
        >
          Encerrar
        </Botao>
      )}
    </li>
  );
}
