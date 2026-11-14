"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { aplicarErrosDeCampo } from "@/shared/api/aplicar-erros-de-campo";
import { ehErroApi } from "@/shared/api/erro-api";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { IndicadorForcaSenha } from "@/shared/senha/IndicadorForcaSenha";
import { Alerta, Botao, CampoSenha, Modal, useAvisos } from "@/shared/ui";

import { useTrocarSenha } from "../api/seguranca.queries";
import { esquemaTrocarSenha, type DadosTrocarSenha } from "../schemas/trocar-senha.schema";

export const AVISO_SENHA_TROCADA = "Senha alterada. As outras sessões foram encerradas.";

const ID_FORMULARIO = "formulario-trocar-senha";

const valoresIniciais: DadosTrocarSenha = { senha_atual: "", nova_senha: "", confirmacao: "" };

type PropsModalTrocarSenha = {
  aberto: boolean;
  aoFechar: () => void;
};

export function ModalTrocarSenha({ aberto, aoFechar }: PropsModalTrocarSenha) {
  const avisos = useAvisos();
  const troca = useTrocarSenha();
  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<DadosTrocarSenha>({
    resolver: zodResolver(esquemaTrocarSenha),
    defaultValues: valoresIniciais,
  });
  const novaSenha = useWatch({ control, name: "nova_senha" });

  function fechar() {
    reset(valoresIniciais);
    troca.reset();
    aoFechar();
  }

  const salvar = handleSubmit(async ({ senha_atual, nova_senha }) => {
    if (troca.isPending) return;
    try {
      await troca.mutateAsync({ senha_atual, nova_senha });
      avisos.sucesso(AVISO_SENHA_TROCADA);
      fechar();
    } catch (erro) {
      if (!ehErroApi(erro)) return;
      if (erro.codigo === "SENHA_ATUAL_INCORRETA") {
        setError("senha_atual", { message: mensagemDeErro(erro) }, { shouldFocus: true });
      } else {
        aplicarErrosDeCampo(erro, setError);
      }
    }
  });

  const erroGeral =
    troca.error && !(ehErroApi(troca.error) && troca.error.status === 422)
      ? mensagemDeErro(troca.error)
      : null;

  return (
    <Modal
      aberto={aberto}
      aoFechar={fechar}
      titulo="Trocar senha"
      descricao="Ao salvar, as outras sessões serão encerradas. Esta continua conectada."
      rodape={
        <>
          <Botao variante="secundario" onClick={fechar} disabled={troca.isPending}>
            Cancelar
          </Botao>
          <Botao type="submit" form={ID_FORMULARIO} carregando={troca.isPending}>
            Salvar
          </Botao>
        </>
      }
    >
      <form id={ID_FORMULARIO} noValidate onSubmit={salvar} className="flex flex-col gap-5">
        <CampoSenha
          rotulo="Senha atual"
          autoComplete="current-password"
          data-foco-inicial
          erro={errors.senha_atual?.message}
          {...register("senha_atual")}
        />
        <CampoSenha
          rotulo="Nova senha"
          autoComplete="new-password"
          ajuda={<IndicadorForcaSenha senha={novaSenha} />}
          erro={errors.nova_senha?.message}
          {...register("nova_senha")}
        />
        <CampoSenha
          rotulo="Confirmar nova senha"
          autoComplete="new-password"
          erro={errors.confirmacao?.message}
          {...register("confirmacao")}
        />
        {erroGeral && <Alerta tom="erro" titulo={erroGeral} />}
      </form>
    </Modal>
  );
}
