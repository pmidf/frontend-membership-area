"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import {
  Botao,
  CaixaSelecao,
  CampoAreaTexto,
  CampoBusca,
  CampoCodigo,
  CampoSelecao,
  CampoSenha,
  CampoTexto,
  CartaoOpcao,
  ControleSegmentado,
  IndicadorEtapas,
  Interruptor,
} from "@/shared/ui";

import { FormularioDemonstracao } from "./FormularioDemonstracao";
import { SecaoCatalogo } from "./SecaoCatalogo";

const opcoesGenero = [
  { valor: "FEMININO", rotulo: "Feminino" },
  { valor: "MASCULINO", rotulo: "Masculino" },
  { valor: "PREFIRO_NAO_INFORMAR", rotulo: "Prefiro não informar" },
];

export function CatalogoComponentes() {
  const [filiado, setFiliado] = useState<"sim" | "nao" | undefined>("sim");
  const [codigo, setCodigo] = useState("12");
  const [termo, setTermo] = useState("");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-display">Componentes</h1>
        <p className="text-texto-secundario">
          Catálogo do design system da Área de Membros, para revisão visual e de acessibilidade.
        </p>
      </header>

      <SecaoCatalogo titulo="Botões">
        <div className="flex flex-wrap items-center gap-3">
          <Botao>Primário</Botao>
          <Botao variante="secundario">Secundário</Botao>
          <Botao variante="fantasma">Fantasma</Botao>
          <Botao variante="perigo">Perigo</Botao>
          <Botao variante="link">Link</Botao>
          <Botao tamanho="sm" icone={<Plus aria-hidden="true" className="size-4" />}>
            Pequeno com ícone
          </Botao>
          <Botao carregando>Carregando</Botao>
          <Botao disabled>Desabilitado</Botao>
        </div>
      </SecaoCatalogo>

      <SecaoCatalogo titulo="Campos de texto">
        <div className="grid gap-4 md:grid-cols-2">
          <CampoTexto rotulo="Padrão" placeholder="seu@email.com" ajuda="Texto de ajuda" />
          <CampoTexto rotulo="Com erro" defaultValue="maria@" erro="Informe um e-mail válido" />
          <CampoTexto rotulo="Somente leitura" defaultValue="Camila Lopes" readOnly />
          <CampoTexto rotulo="Desabilitado" defaultValue="—" disabled />
          <CampoSenha rotulo="Senha" defaultValue="segredo-forte" />
          <CampoSelecao
            rotulo="Gênero"
            opcoes={opcoesGenero}
            textoVazio="Selecione"
            defaultValue=""
          />
        </div>
        <CampoAreaTexto
          rotulo="Mini bio"
          maxLength={600}
          defaultValue="Gerencio obras de infraestrutura urbana no Distrito Federal."
        />
      </SecaoCatalogo>

      <SecaoCatalogo titulo="Seleção">
        <CaixaSelecao rotulo="Li e aceito os Termos de Uso e a Política de Privacidade do PMI-DF" />
        <CaixaSelecao rotulo="Caixa com erro" erro="É preciso aceitar os termos" />
        <Interruptor
          rotulo="Gamificação"
          descricao="Conquiste peças de quebra-cabeça ao participar de eventos."
          defaultChecked
        />
        <ControleSegmentado
          rotulo="Você já é filiado ao PMI?"
          valor={filiado}
          aoMudar={setFiliado}
          opcoes={[
            { valor: "sim", rotulo: "Sim" },
            { valor: "nao", rotulo: "Não" },
          ]}
        />
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-rotulo">Forma de resgate</legend>
          <CartaoOpcao
            name="forma-resgate"
            value="CUPOM"
            defaultChecked
            rotulo="Cupom compartilhado"
            descricao="Um único código serve para todos os filiados."
          />
          <CartaoOpcao
            name="forma-resgate"
            value="INSTRUCAO"
            rotulo="Instrução por texto"
            descricao="Sem código. O filiado recebe o passo a passo."
          />
        </fieldset>
      </SecaoCatalogo>

      <SecaoCatalogo titulo="Código, etapas e busca">
        <CampoCodigo
          rotulo="Código de 6 dígitos"
          valor={codigo}
          aoMudar={setCodigo}
          ajuda="O código vale por 24 horas."
        />
        <IndicadorEtapas atual={2} total={4} titulo="Dados pessoais" />
        <CampoBusca
          rotulo="Buscar benefício"
          placeholder="Buscar por parceiro ou vantagem"
          aoBuscar={setTermo}
        />
        <p className="text-corpo-pequeno text-texto-secundario">
          Último termo buscado: {termo || "—"}
        </p>
      </SecaoCatalogo>

      <SecaoCatalogo titulo="Formulário com validação">
        <FormularioDemonstracao />
      </SecaoCatalogo>
    </div>
  );
}
