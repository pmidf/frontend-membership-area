"use client";

import { CartaoSurpresa } from "@/features/gamificacao/components/CartaoSurpresa";
import { ImagemQuebraCabeca } from "@/features/gamificacao/components/ImagemQuebraCabeca";
import { TabuleiroQuebraCabeca } from "@/features/gamificacao/components/TabuleiroQuebraCabeca";
import { Botao, Modal } from "@/shared/ui";

import { ehImagemValida, type DadosQuebraCabeca } from "../schemas/quebra-cabeca.schema";

const PECAS_DE_EXEMPLO = [0, 3, 5];

type PropsModalPreviaQuebraCabeca = {
  aberto: boolean;
  dados: DadosQuebraCabeca;
  aoFechar: () => void;
};

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-rotulo text-texto-secundario">{titulo}</h3>
      {children}
    </section>
  );
}

export function ModalPreviaQuebraCabeca({ aberto, dados, aoFechar }: PropsModalPreviaQuebraCabeca) {
  const pecasDeExemplo = PECAS_DE_EXEMPLO.filter((indice) =>
    ehImagemValida(dados.recortes[indice]?.trim() ?? ""),
  ).map((indice) => ({ indice, recorte: dados.recortes[indice].trim() }));

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      largura="lg"
      titulo="Pré-visualização"
      descricao="É assim que os filiados verão até alguém completar — e depois de concluir."
      rodape={
        <Botao variante="secundario" onClick={aoFechar} className="sm:mr-auto sm:w-40">
          Voltar a editar
        </Botao>
      }
    >
      <div className="flex flex-col gap-6">
        <Secao titulo="No catálogo">
          <div className="max-w-76">
            <CartaoSurpresa />
          </div>
        </Secao>
        <Secao titulo="Montando (exemplo com 3 peças)">
          <TabuleiroQuebraCabeca pecas={pecasDeExemplo} className="max-w-96" />
        </Secao>
        <Secao titulo="Ao concluir">
          <ImagemQuebraCabeca
            src={ehImagemValida(dados.imagem_original.trim()) ? dados.imagem_original.trim() : ""}
            className="aspect-[2/1] w-full max-w-120 rounded-md"
          />
          <div className="flex flex-col gap-1">
            <p className="text-h3">{dados.nome.trim() || "Nome do quebra-cabeça"}</p>
            <p className="text-corpo-pequeno font-medium text-texto-marca">
              {dados.legenda.trim() || "Legenda curta"}
            </p>
          </div>
          <p className="text-corpo-pequeno whitespace-pre-line text-texto-secundario">
            {dados.historia.trim() || "A história por trás da imagem aparece aqui."}
          </p>
        </Secao>
      </div>
    </Modal>
  );
}
