import { zodResolver } from "@hookform/resolvers/zod";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { CampoCodigo } from "../campo-codigo/CampoCodigo";
import { CampoTexto } from "../campo-texto/CampoTexto";
import { CampoFormulario } from "./CampoFormulario";

const esquema = z.object({
  email: z.email("Informe um e-mail válido"),
  codigo: z.string().regex(/^\d{6}$/, "Digite os 6 dígitos"),
});

type Dados = z.infer<typeof esquema>;

function Formulario({ aoEnviar }: { aoEnviar: (dados: Dados) => void }) {
  const { register, control, handleSubmit, formState } = useForm<Dados>({
    resolver: zodResolver(esquema),
    defaultValues: { email: "", codigo: "" },
  });

  return (
    <form onSubmit={handleSubmit(aoEnviar)}>
      <CampoTexto rotulo="E-mail" erro={formState.errors.email?.message} {...register("email")} />
      <CampoFormulario
        nome="codigo"
        controle={control}
        renderizar={({ valor, aoMudar, erro }) => (
          <CampoCodigo rotulo="Código" valor={valor} aoMudar={aoMudar} erro={erro} />
        )}
      />
      <button type="submit">Enviar</button>
    </form>
  );
}

describe("CampoFormulario", () => {
  it("exibe os erros do schema em cada campo ao enviar vazio", async () => {
    const aoEnviar = vi.fn();
    render(<Formulario aoEnviar={aoEnviar} />);

    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByText("Informe um e-mail válido")).toBeInTheDocument();
    expect(screen.getByText("Digite os 6 dígitos")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("aria-invalid", "true");
    expect(aoEnviar).not.toHaveBeenCalled();
  });

  it("envia os valores dos campos registrados e controlados", async () => {
    const aoEnviar = vi.fn();
    render(<Formulario aoEnviar={aoEnviar} />);

    await userEvent.type(screen.getByLabelText("E-mail"), "maria@pmidf.org.br");
    await userEvent.click(screen.getByLabelText("Dígito 1 de 6"));
    await userEvent.keyboard("123456");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(aoEnviar).toHaveBeenCalledWith(
      { email: "maria@pmidf.org.br", codigo: "123456" },
      expect.anything(),
    );
  });
});
