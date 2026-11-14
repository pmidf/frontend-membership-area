"use client";

import { useState } from "react";

import {
  Abas,
  Alerta,
  Avatar,
  Botao,
  Cartao,
  DialogoConfirmacao,
  Esqueleto,
  EstadoErro,
  EstadoVazio,
  Etiqueta,
  FiltrosChip,
  Modal,
  Paginacao,
  SeloStatus,
  Tabela,
  TextoTruncado,
  useAvisos,
  type ColunaTabela,
} from "@/shared/ui";

import { SecaoCatalogo } from "./SecaoCatalogo";

type LinhaExemplo = { id: string; titulo: string; parceiro: string; resgates: number };

const linhas: LinhaExemplo[] = [
  { id: "1", titulo: "Voucher do exame PMP", parceiro: "PMI Global", resgates: 18 },
  { id: "2", titulo: "Assinatura SmartKanvas", parceiro: "SmartKanvas", resgates: 104 },
  { id: "3", titulo: "Desconto em curso de liderança", parceiro: "Impact Hub", resgates: 37 },
];

const colunas: ColunaTabela<LinhaExemplo>[] = [
  { id: "titulo", cabecalho: "Benefício", celula: (linha) => linha.titulo },
  { id: "parceiro", cabecalho: "Parceiro", celula: (linha) => linha.parceiro },
  { id: "resgates", cabecalho: "Resgates", celula: (linha) => linha.resgates, alinhamento: "fim" },
];

export function CatalogoExibicao() {
  const avisos = useAvisos();
  const [modalAberto, setModalAberto] = useState(false);
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [aba, setAba] = useState<"lista" | "calendario">("lista");
  const [categorias, setCategorias] = useState(["todas"]);
  const [pagina, setPagina] = useState(1);
  const [selecionados, setSelecionados] = useState<string[]>([]);

  return (
    <>
      <SecaoCatalogo titulo="Etiquetas, selos e avatares">
        <div className="flex flex-wrap items-center gap-2">
          <Etiqueta>Violeta</Etiqueta>
          <Etiqueta tom="aqua">Educação</Etiqueta>
          <Etiqueta tom="neutro">Ferramentas</Etiqueta>
          <SeloStatus tom="aqua">Filiado ativo</SeloStatus>
          <SeloStatus tom="sucesso">Publicado</SeloStatus>
          <SeloStatus>Rascunho</SeloStatus>
          <SeloStatus tom="alerta">Encerra em breve</SeloStatus>
          <SeloStatus tom="erro">Suspensa</SeloStatus>
        </div>
        <div className="flex items-center gap-3">
          <Avatar nome="Maria Souza" tamanho="sm" />
          <Avatar nome="Camila Lopes" />
          <Avatar nome="Rafael Lima" tamanho="lg" />
        </div>
      </SecaoCatalogo>

      <SecaoCatalogo titulo="Alertas e avisos">
        <Alerta titulo="Validação em andamento">Estamos consultando a base do PMI.</Alerta>
        <Alerta tom="sucesso" titulo="Filiação confirmada">
          Você já tem acesso ao clube de benefícios.
        </Alerta>
        <Alerta tom="alerta" titulo="Não localizamos sua filiação na base do PMI">
          A atualização pode levar alguns dias.
        </Alerta>
        <Alerta tom="erro" titulo="Os dados informados não conferem">
          Verifique o PMI ID e o e-mail cadastrado no MyPMI.
        </Alerta>
        <div className="flex flex-wrap gap-3">
          <Botao variante="secundario" onClick={() => avisos.sucesso("Vaga publicada")}>
            Aviso de sucesso
          </Botao>
          <Botao variante="secundario" onClick={() => avisos.erro("Não foi possível exportar")}>
            Aviso de erro
          </Botao>
        </div>
      </SecaoCatalogo>

      <SecaoCatalogo titulo="Modal e confirmação">
        <div className="flex flex-wrap gap-3">
          <Botao onClick={() => setModalAberto(true)}>Abrir modal</Botao>
          <Botao variante="perigo" onClick={() => setConfirmacaoAberta(true)}>
            Suspender conta
          </Botao>
        </div>
        <Modal
          aberto={modalAberto}
          aoFechar={() => setModalAberto(false)}
          titulo="Seu código está pronto"
          descricao="Resgate registrado em 31/08/2026 às 14:22."
          rodape={<Botao onClick={() => setModalAberto(false)}>Copiar código</Botao>}
        >
          <p className="rounded-md border-2 border-dashed border-acao-primaria bg-violeta-50 p-4 text-center text-h2 text-texto-marca">
            PMIDF-BRISK-30OFF
          </p>
        </Modal>
        <DialogoConfirmacao
          aberto={confirmacaoAberta}
          aoFechar={() => setConfirmacaoAberta(false)}
          aoConfirmar={() => setConfirmacaoAberta(false)}
          titulo="Suspender conta?"
          descricao="A pessoa perde o acesso imediatamente."
          rotuloConfirmar="Suspender"
          tom="perigo"
          motivo={{ rotulo: "Motivo", obrigatorio: true, tamanhoMinimo: 5, tamanhoMaximo: 500 }}
        />
      </SecaoCatalogo>

      <SecaoCatalogo titulo="Abas, filtros e paginação">
        <Abas
          rotulo="Visualização da agenda"
          ativa={aba}
          aoMudar={setAba}
          abas={[
            { valor: "lista", rotulo: "Lista", conteudo: <p>Eventos em lista.</p> },
            { valor: "calendario", rotulo: "Calendário", conteudo: <p>Eventos no calendário.</p> },
          ]}
        />
        <FiltrosChip
          rotulo="Categoria"
          selecionados={categorias}
          aoMudar={setCategorias}
          opcoes={[
            { valor: "todas", rotulo: "Todas" },
            { valor: "EDUCACAO", rotulo: "Educação" },
            { valor: "FERRAMENTAS", rotulo: "Ferramentas" },
          ]}
        />
        <Paginacao pagina={pagina} totalPaginas={4} aoMudar={setPagina} />
      </SecaoCatalogo>

      <SecaoCatalogo titulo="Cartões, tabela e estados">
        <Cartao interativo className="max-w-xs p-4">
          <TextoTruncado
            className="text-corpo-pequeno"
            texto="Assinatura anual de ferramenta de gestão de cronogramas para equipes de projeto"
          />
        </Cartao>
        <Tabela
          rotulo="Benefícios de exemplo"
          colunas={colunas}
          itens={linhas}
          chave={(linha) => linha.id}
          selecao={{
            selecionados,
            aoMudar: setSelecionados,
            rotulo: (linha) => `Selecionar ${linha.titulo}`,
          }}
        />
        <Esqueleto variante="cartao" quantidade={1} rotulo="Carregando exemplo" />
        <EstadoVazio
          titulo="Nenhum benefício encontrado"
          descricao="Tente outro termo ou limpe os filtros."
          acao={<Botao variante="secundario">Limpar filtros</Botao>}
        />
        <EstadoErro aoTentarNovamente={() => undefined} compacto />
      </SecaoCatalogo>
    </>
  );
}
