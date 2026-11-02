"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  configurarOuvintesSessao,
  encerrarSessaoLocal,
  iniciarSessao,
  renovarSessao,
  type SessaoEmitida,
} from "@/shared/api/token-sessao";

import { buscarPerfil, chavesSessao, encerrarSessaoNoServidor } from "./sessao.api";
import type { Perfil } from "./tipos";

export type EstadoSessao = "carregando" | "anonimo" | "autenticado";

export type ValorSessao = {
  estado: EstadoSessao;
  perfil: Perfil | null;
  ehFiliado: boolean;
  ehAdmin: boolean;
  entrar: (sessao: SessaoEmitida) => Promise<void>;
  sair: () => Promise<void>;
};

export const ContextoSessao = createContext<ValorSessao | null>(null);

export function ProvedorSessao({ children }: { children: ReactNode }) {
  const clienteConsultas = useQueryClient();
  const [inicializada, setInicializada] = useState(false);
  const [temToken, setTemToken] = useState(false);

  const consultaPerfil = useQuery({
    queryKey: chavesSessao.perfil,
    queryFn: buscarPerfil,
    enabled: temToken,
    retry: false,
  });

  const encerrarLocalmente = useCallback(() => {
    encerrarSessaoLocal();
    setTemToken(false);
    clienteConsultas.clear();
  }, [clienteConsultas]);

  useEffect(() => {
    configurarOuvintesSessao({ aoExpirar: encerrarLocalmente });
    let ativo = true;
    void renovarSessao().then((renovou) => {
      if (!ativo) return;
      setTemToken(renovou);
      setInicializada(true);
    });
    return () => {
      ativo = false;
      configurarOuvintesSessao({});
    };
  }, [encerrarLocalmente]);

  const entrar = useCallback(
    async (sessao: SessaoEmitida) => {
      iniciarSessao(sessao);
      setTemToken(true);
      setInicializada(true);
      await clienteConsultas.invalidateQueries({ queryKey: chavesSessao.perfil });
    },
    [clienteConsultas],
  );

  const sair = useCallback(async () => {
    await encerrarSessaoNoServidor().catch(() => undefined);
    encerrarLocalmente();
  }, [encerrarLocalmente]);

  const valor = useMemo<ValorSessao>(() => {
    const perfil = temToken ? (consultaPerfil.data ?? null) : null;
    const carregandoPerfil = temToken && !perfil && !consultaPerfil.isError;
    const estado: EstadoSessao =
      !inicializada || carregandoPerfil ? "carregando" : perfil ? "autenticado" : "anonimo";

    return {
      estado,
      perfil,
      ehFiliado: perfil?.papeis.filiado ?? false,
      ehAdmin: perfil?.papeis.admin ?? false,
      entrar,
      sair,
    };
  }, [inicializada, temToken, consultaPerfil.data, consultaPerfil.isError, entrar, sair]);

  return <ContextoSessao.Provider value={valor}>{children}</ContextoSessao.Provider>;
}
