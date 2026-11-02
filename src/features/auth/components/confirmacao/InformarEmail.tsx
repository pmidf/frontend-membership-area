"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Botao, CampoTexto } from "@/shared/ui";

import {
  esquemaEmailConfirmacao,
  type DadosEmailConfirmacao,
} from "../../schemas/confirmacao.schema";

export function InformarEmail({ aoInformar }: { aoInformar: (email: string) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DadosEmailConfirmacao>({
    resolver: zodResolver(esquemaEmailConfirmacao),
    defaultValues: { email: "" },
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-h2">Confirme seu e-mail</h1>
        <p className="text-texto-secundario">
          Informe o e-mail usado no cadastro para digitar o código que enviamos.
        </p>
      </header>
      <form
        noValidate
        onSubmit={handleSubmit(({ email }) => aoInformar(email))}
        className="flex flex-col gap-5"
      >
        <CampoTexto
          rotulo="E-mail"
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          erro={errors.email?.message}
          {...register("email")}
        />
        <Botao type="submit" larguraTotal>
          Continuar
        </Botao>
      </form>
    </div>
  );
}
