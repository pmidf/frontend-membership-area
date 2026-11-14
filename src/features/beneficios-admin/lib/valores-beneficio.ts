import { camposDiferentes } from "@/shared/lib/campos-diferentes";

import type { AtualizarBeneficio, BeneficioAdmin } from "../api/beneficios-admin.api";
import type { DadosBeneficio } from "../schemas/beneficio.schema";

export function valoresDoBeneficio(beneficio: BeneficioAdmin): DadosBeneficio {
  return {
    titulo: beneficio.titulo,
    legenda: beneficio.legenda,
    descricao: beneficio.descricao,
    imagem: beneficio.imagem,
    categoria: beneficio.categoria,
    tipo_resgate: beneficio.tipo_resgate,
    cod_cupom: beneficio.cod_cupom ?? "",
    desc_instrucao: beneficio.desc_instrucao ?? "",
    vigencia_inicio: beneficio.vigencia_inicio,
    vigencia_fim: beneficio.vigencia_fim ?? "",
  };
}

function normalizar(dados: DadosBeneficio): AtualizarBeneficio {
  return {
    titulo: dados.titulo.trim(),
    legenda: dados.legenda.trim(),
    descricao: dados.descricao.trim(),
    imagem: dados.imagem.trim(),
    categoria: dados.categoria,
    tipo_resgate: dados.tipo_resgate,
    cod_cupom: dados.tipo_resgate === "CUPOM" ? dados.cod_cupom.trim() : null,
    desc_instrucao: dados.tipo_resgate === "INSTRUCAO" ? dados.desc_instrucao.trim() : null,
    vigencia_inicio: dados.vigencia_inicio,
    vigencia_fim: dados.vigencia_fim || null,
  };
}

export function camposAlteradosDoBeneficio(
  iniciais: DadosBeneficio,
  atuais: DadosBeneficio,
): AtualizarBeneficio {
  return camposDiferentes(normalizar(iniciais), normalizar(atuais));
}
