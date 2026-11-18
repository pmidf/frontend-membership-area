import { Botao, Modal, cn } from "@/shared/ui";

import { TOTAL_PECAS } from "../tipos/gamificacao";

const CONFETES = [
  "top-[18px] left-[108px] size-2.5 bg-acao-destaque",
  "top-[30px] right-[100px] size-2 bg-alerta-700",
  "top-16 left-32 size-[7px] bg-acao-primaria",
  "top-[78px] right-[124px] size-1.5 bg-acao-destaque",
];

type PropsModalPecaRevelada = {
  pecasObtidas: number | null;
  aoFechar: () => void;
};

function Celebracao() {
  return (
    <div aria-hidden="true" className="relative flex justify-center pt-3">
      {CONFETES.map((classes) => (
        <span key={classes} className={cn("absolute rounded-pill", classes)} />
      ))}
      <span className="flex size-22 items-center justify-center rounded-pill bg-linear-135 from-violeta-500 to-laranja-400 text-[40px] shadow-[0_10px_20px_rgb(79_23_168/0.35)]" />
    </div>
  );
}

function PontosProgresso({ obtidas }: { obtidas: number }) {
  return (
    <div aria-hidden="true" className="flex justify-center gap-1.5">
      {Array.from({ length: TOTAL_PECAS }, (_, indice) => (
        <span
          key={indice}
          data-preenchido={indice < obtidas}
          className={cn(
            "size-3 rounded-pill border",
            indice < obtidas
              ? "border-acao-primaria bg-acao-primaria"
              : "border-borda-padrao bg-fundo-superficie",
          )}
        />
      ))}
    </div>
  );
}

export function ModalPecaRevelada({ pecasObtidas, aoFechar }: PropsModalPecaRevelada) {
  return (
    <Modal
      aberto={pecasObtidas !== null}
      aoFechar={aoFechar}
      topo={<Celebracao />}
      titulo={
        <span className="block text-center text-h3 md:text-[26px]">
          Peça {pecasObtidas} de {TOTAL_PECAS}!
        </span>
      }
      descricao={
        <span className="block text-center">
          Você acabou de encaixar mais uma peça do seu quebra-cabeça em andamento.
        </span>
      }
    >
      <div className="flex flex-col items-center gap-8 pb-2">
        <PontosProgresso obtidas={pecasObtidas ?? 0} />
        <Botao onClick={aoFechar} data-foco-inicial larguraTotal>
          Continuar
        </Botao>
      </div>
    </Modal>
  );
}
