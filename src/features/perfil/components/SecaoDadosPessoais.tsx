"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { opcoesEscolaridade, opcoesGenero } from "@/features/auth/lib/opcoes-cadastro";
import { aplicarErrosDeCampo } from "@/shared/api/aplicar-erros-de-campo";
import { ehErroApi } from "@/shared/api/erro-api";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { CamposEndereco, type ClassesCamposEndereco } from "@/shared/endereco/CamposEndereco";
import { useAvisoAoSair } from "@/shared/hooks/useAvisoAoSair";
import { mascararTelefone } from "@/shared/lib/mascaras";
import type { Perfil } from "@/shared/sessao/tipos";
import { Botao, CampoFormulario, CampoSelecao, CampoTexto, Cartao, useAvisos } from "@/shared/ui";

import { useAtualizarPerfil } from "../api/perfil.queries";
import { camposAlterados, valoresDoPerfil } from "../lib/campos-alterados";
import { esquemaPerfil, type DadosPerfil } from "../schemas/perfil.schema";

const ID_FORMULARIO = "formulario-dados-pessoais";

const NOTA_NOME_SINCRONIZADO =
  "Sincronizado da base do PMI — para corrigir, atualize seu cadastro no PMI Global.";

const classesEndereco: ClassesCamposEndereco = {
  cep: "sm:col-span-4",
  logradouro: "sm:col-span-8",
  numero: "sm:col-span-3",
  complemento: "sm:col-span-9",
  bairro: "sm:col-span-5",
  cidade: "sm:col-span-5",
  uf: "sm:col-span-2",
};

export function SecaoDadosPessoais({ perfil }: { perfil: Perfil }) {
  const avisos = useAvisos();
  const atualizacao = useAtualizarPerfil();
  const formulario = useForm<DadosPerfil>({
    resolver: zodResolver(esquemaPerfil),
    defaultValues: valoresDoPerfil(perfil),
  });
  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isDirty },
  } = formulario;
  const nomeSincronizado = perfil.filiacao?.situacao === "APROVADO";

  useAvisoAoSair(isDirty);

  function tratarErro(erro: unknown) {
    if (ehErroApi(erro) && erro.codigo === "NOME_DEFINIDO_PELO_PMI") {
      setError("nome_completo", { message: mensagemDeErro(erro) }, { shouldFocus: true });
      return;
    }
    if (aplicarErrosDeCampo(erro, setError).length === 0) avisos.erro(mensagemDeErro(erro));
  }

  const salvar = handleSubmit(async (dados) => {
    if (atualizacao.isPending) return;
    const alterados = camposAlterados(valoresDoPerfil(perfil), dados);
    if (Object.keys(alterados).length === 0) {
      reset(valoresDoPerfil(perfil));
      return;
    }
    try {
      reset(valoresDoPerfil(await atualizacao.mutateAsync(alterados)));
      avisos.sucesso("Dados atualizados.");
    } catch (erro) {
      tratarErro(erro);
    }
  });

  return (
    <section
      id="dados-pessoais"
      aria-labelledby="titulo-dados-pessoais"
      className="flex flex-col gap-4"
    >
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 id="titulo-dados-pessoais" className="text-h3">
            Dados pessoais
          </h2>
          <p className="text-corpo-pequeno text-texto-secundario">
            Mantenha seus dados corretos e atualizados.
          </p>
        </div>
        <Botao
          type="submit"
          form={ID_FORMULARIO}
          disabled={!isDirty}
          carregando={atualizacao.isPending}
          className="max-sm:w-full"
        >
          Salvar alterações
        </Botao>
      </header>

      <Cartao className="p-6">
        <FormProvider {...formulario}>
          <form id={ID_FORMULARIO} noValidate onSubmit={salvar} className="flex flex-col gap-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <CampoTexto
                rotulo="Nome completo"
                autoComplete="name"
                readOnly={nomeSincronizado}
                ajuda={nomeSincronizado ? NOTA_NOME_SINCRONIZADO : undefined}
                className="sm:col-span-2"
                erro={errors.nome_completo?.message}
                {...register("nome_completo")}
              />
              <CampoTexto rotulo="E-mail principal" value={perfil.email ?? ""} readOnly />
              <CampoFormulario
                nome="telefone"
                controle={control}
                renderizar={({ nome, valor, aoMudar, aoSair, ref, erro }) => (
                  <CampoTexto
                    rotulo="Telefone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="(61) 9 9999-9999"
                    name={nome}
                    value={valor}
                    onChange={(evento) => aoMudar(mascararTelefone(evento.target.value))}
                    onBlur={aoSair}
                    ref={ref}
                    erro={erro}
                  />
                )}
              />
              <CampoTexto
                rotulo="Data de nascimento"
                type="date"
                autoComplete="bday"
                erro={errors.data_nascimento?.message}
                {...register("data_nascimento")}
              />
              <CampoSelecao
                rotulo="Gênero"
                opcoes={opcoesGenero}
                erro={errors.genero?.message}
                {...register("genero")}
              />
              <CampoSelecao
                rotulo="Escolaridade"
                opcoes={opcoesEscolaridade}
                erro={errors.escolaridade?.message}
                {...register("escolaridade")}
              />
              <CampoTexto
                rotulo="Empresa"
                autoComplete="organization"
                erro={errors.empresa?.message}
                {...register("empresa")}
              />
              <CampoTexto
                rotulo="Cargo"
                autoComplete="organization-title"
                erro={errors.cargo?.message}
                {...register("cargo")}
              />
              <CampoTexto
                rotulo="LinkedIn (opcional)"
                type="url"
                inputMode="url"
                placeholder="https://linkedin.com/in/seu-perfil"
                erro={errors.linkedin_url?.message}
                {...register("linkedin_url")}
              />
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-corpo font-bold">Endereço</h3>
              <div className="grid gap-5 sm:grid-cols-12">
                <CamposEndereco classes={classesEndereco} />
              </div>
            </div>
          </form>
        </FormProvider>
      </Cartao>
    </section>
  );
}
