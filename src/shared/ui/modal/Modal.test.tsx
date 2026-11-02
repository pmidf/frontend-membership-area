import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { DialogoConfirmacao } from "./DialogoConfirmacao";
import { Modal } from "./Modal";

function ExemploModal() {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <button onClick={() => setAberto(true)}>Abrir</button>
      <Modal
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo="Seu código está pronto"
        descricao="Resgate registrado"
        rodape={<button>Copiar código</button>}
      >
        <p>PMIDF-30OFF</p>
      </Modal>
    </>
  );
}

describe("Modal", () => {
  it("abre rotulado, prende o foco e devolve o foco ao gatilho ao fechar com Esc", async () => {
    render(<ExemploModal />);
    const gatilho = screen.getByRole("button", { name: "Abrir" });

    await userEvent.click(gatilho);
    const dialogo = screen.getByRole("dialog", { name: "Seu código está pronto" });
    expect(dialogo).toHaveAccessibleDescription("Resgate registrado");
    expect(screen.getByRole("button", { name: "Fechar" })).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Copiar código" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Fechar" })).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Copiar código" })).toHaveFocus();

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(gatilho).toHaveFocus();
  });

  it("fecha pelo botão e pelo clique fora, e trava a rolagem enquanto aberto", async () => {
    render(<ExemploModal />);

    await userEvent.click(screen.getByRole("button", { name: "Abrir" }));
    expect(document.body.style.overflow).toBe("hidden");
    await userEvent.click(screen.getByRole("button", { name: "Fechar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");

    await userEvent.click(screen.getByRole("button", { name: "Abrir" }));
    await userEvent.click(screen.getByRole("dialog"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("DialogoConfirmacao", () => {
  it("só habilita a confirmação com motivo preenchido e envia o motivo sem espaços", async () => {
    const aoConfirmar = vi.fn();
    render(
      <DialogoConfirmacao
        aberto
        aoFechar={vi.fn()}
        aoConfirmar={aoConfirmar}
        titulo="Suspender conta?"
        rotuloConfirmar="Suspender"
        tom="perigo"
        motivo={{ rotulo: "Motivo", obrigatorio: true, tamanhoMinimo: 5, tamanhoMaximo: 500 }}
      />,
    );

    const confirmar = screen.getByRole("button", { name: "Suspender" });
    expect(confirmar).toBeDisabled();

    await userEvent.type(screen.getByLabelText("Motivo"), "   ab ");
    expect(confirmar).toBeDisabled();

    await userEvent.type(screen.getByLabelText("Motivo"), "uso indevido  ");
    expect(confirmar).toBeEnabled();
    await userEvent.click(confirmar);

    expect(aoConfirmar).toHaveBeenCalledWith("ab uso indevido");
  });

  it("aceita motivo opcional e mostra o erro informado", async () => {
    const aoConfirmar = vi.fn();
    const aoFechar = vi.fn();
    render(
      <DialogoConfirmacao
        aberto
        aoFechar={aoFechar}
        aoConfirmar={aoConfirmar}
        titulo="Encerrar vaga?"
        rotuloConfirmar="Encerrar"
        motivo={{ rotulo: "Motivo do encerramento" }}
        erro="A vaga já estava encerrada."
      />,
    );

    expect(screen.getByLabelText("Motivo do encerramento (opcional)")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("A vaga já estava encerrada.");

    await userEvent.click(screen.getByRole("button", { name: "Encerrar" }));
    expect(aoConfirmar).toHaveBeenCalledWith(undefined);

    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(aoFechar).toHaveBeenCalled();
  });
});
