"use client";

import { useFormContext, useWatch } from "react-hook-form";

import { URL_POLITICA_DE_PRIVACIDADE, URL_TERMOS_DE_USO } from "@/shared/lib/links-externos";
import {
  CaixaSelecao,
  CampoFormulario,
  CampoSenha,
  CampoTexto,
  ControleSegmentado,
} from "@/shared/ui";

import type { DadosCadastro } from "../../schemas/cadastro.schema";
import { AvisoMesmoEmailPmi } from "./AvisoMesmoEmailPmi";

const classesLinkTermos =
  "font-medium text-texto-marca underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-acao-destaque";

function LinkDocumento({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classesLinkTermos}>
      {children}
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  );
}

export function PassoAcesso() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<DadosCadastro>();
  const filiado = useWatch({ control, name: "filiado_pmi" }) === "sim";

  return (
    <>
      <CampoTexto
        rotulo="Nome completo"
        autoComplete="name"
        placeholder="Como você quer ser chamado"
        erro={errors.nome_completo?.message}
        {...register("nome_completo")}
      />
      <CampoFormulario
        nome="filiado_pmi"
        controle={control}
        renderizar={({ nome, valor, aoMudar, erro }) => (
          <ControleSegmentado
            rotulo="Você já é filiado ao PMI?"
            nome={nome}
            valor={valor || undefined}
            aoMudar={aoMudar}
            erro={erro}
            opcoes={[
              { valor: "sim", rotulo: "Sim" },
              { valor: "nao", rotulo: "Não" },
            ]}
          />
        )}
      />
      {filiado && (
        <>
          <AvisoMesmoEmailPmi />
          <CampoTexto
            rotulo="PMI ID"
            inputMode="numeric"
            placeholder="Ex.: 1234567"
            ajuda="Encontre em pmi.org > MyPMI > Profile (Member ID)."
            erro={errors.pmi_id?.message}
            {...register("pmi_id")}
          />
        </>
      )}
      <CampoTexto
        rotulo="E-mail"
        type="email"
        autoComplete="email"
        placeholder="seu@email.com"
        ajuda={filiado ? "Use o mesmo e-mail cadastrado no MyPMI." : undefined}
        erro={errors.email?.message}
        {...register("email")}
      />
      <CampoSenha
        rotulo="Senha"
        autoComplete="new-password"
        ajuda="Mínimo de 10 caracteres. Evite senhas já usadas em outros sites."
        erro={errors.senha?.message}
        {...register("senha")}
      />
      <CaixaSelecao
        rotulo={
          <>
            Li e aceito os <LinkDocumento href={URL_TERMOS_DE_USO}>Termos de Uso</LinkDocumento> e a{" "}
            <LinkDocumento href={URL_POLITICA_DE_PRIVACIDADE}>
              Política de Privacidade
            </LinkDocumento>{" "}
            do PMI-DF
          </>
        }
        erro={errors.aceite_termos?.message}
        {...register("aceite_termos")}
      />
    </>
  );
}
