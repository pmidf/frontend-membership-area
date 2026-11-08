"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Botao, CampoCodigo, CampoFormulario, CampoSenha, CampoTexto } from "@/shared/ui";

const esquema = z.object({
  email: z.email("Informe um e-mail válido"),
  senha: z.string().min(10, "Use pelo menos 10 caracteres"),
  codigo: z.string().regex(/^\d{6}$/, "Digite os 6 dígitos"),
});

type DadosDemonstracao = z.infer<typeof esquema>;

export function FormularioDemonstracao() {
  const [enviado, setEnviado] = useState(false);
  const { register, control, handleSubmit, formState } = useForm<DadosDemonstracao>({
    resolver: zodResolver(esquema),
    defaultValues: { email: "", senha: "", codigo: "" },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(() => setEnviado(true))}
      className="flex max-w-sm flex-col gap-4"
    >
      <CampoTexto
        rotulo="E-mail"
        type="email"
        erro={formState.errors.email?.message}
        {...register("email")}
      />
      <CampoSenha rotulo="Senha" erro={formState.errors.senha?.message} {...register("senha")} />
      <CampoFormulario
        nome="codigo"
        controle={control}
        renderizar={({ valor, aoMudar, erro }) => (
          <CampoCodigo rotulo="Código de confirmação" valor={valor} aoMudar={aoMudar} erro={erro} />
        )}
      />
      <Botao type="submit" larguraTotal>
        Validar formulário
      </Botao>
      {enviado && (
        <p role="status" className="text-corpo-pequeno text-aqua-600">
          Formulário válido.
        </p>
      )}
    </form>
  );
}
