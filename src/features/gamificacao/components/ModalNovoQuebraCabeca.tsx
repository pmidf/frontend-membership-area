import { Botao, Modal } from "@/shared/ui";

const DICAS = [
  "As peças são completadas quando você troca créditos por peças.",
  "Você consegue créditos indo a eventos do capítulo.",
  "Você só verá o desenho completo quando terminar o quebra-cabeça.",
];

type PropsModalNovoQuebraCabeca = {
  aberto: boolean;
  aoFechar: () => void;
};

export function ModalNovoQuebraCabeca({ aberto, aoFechar }: PropsModalNovoQuebraCabeca) {
  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={
        <span className="block text-center text-h3 md:text-h2">
          Parabéns! Você tem um novo quebra-cabeça!
        </span>
      }
    >
      <div className="flex flex-col items-center gap-6">
        <ul className="flex w-full flex-col gap-4 rounded-md bg-violeta-50 p-5 text-corpo-pequeno font-medium">
          {DICAS.map((dica) => (
            <li key={dica} className="flex gap-2.5">
              {dica}
            </li>
          ))}
        </ul>
        <Botao onClick={aoFechar} data-foco-inicial className="w-full sm:w-70">
          Entendi, vamos lá!
        </Botao>
      </div>
    </Modal>
  );
}
