"use client";

import type { ReactElement } from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldPathValue,
  type FieldValues,
  type RefCallBack,
} from "react-hook-form";

export type CampoControlado<T extends FieldValues, N extends FieldPath<T>> = {
  nome: N;
  valor: FieldPathValue<T, N>;
  aoMudar: (valor: FieldPathValue<T, N>) => void;
  aoSair: () => void;
  ref: RefCallBack;
  erro?: string;
};

type PropsCampoFormulario<T extends FieldValues, N extends FieldPath<T>> = {
  nome: N;
  controle: Control<T>;
  renderizar: (campo: CampoControlado<T, N>) => ReactElement;
};

export function CampoFormulario<T extends FieldValues, N extends FieldPath<T>>({
  nome,
  controle,
  renderizar,
}: PropsCampoFormulario<T, N>) {
  return (
    <Controller
      name={nome}
      control={controle}
      render={({ field, fieldState }) =>
        renderizar({
          nome: field.name,
          valor: field.value,
          aoMudar: field.onChange,
          aoSair: field.onBlur,
          ref: field.ref,
          erro: fieldState.error?.message,
        })
      }
    />
  );
}
