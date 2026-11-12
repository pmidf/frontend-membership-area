import { PainelExclusivoFiliados } from "@/features/conversao/components/PainelExclusivoFiliados";

export function PainelPreviaConteudos() {
  return (
    <PainelExclusivoFiliados
      titulo="Você está vendo uma prévia"
      descricao="Filie-se ao PMI-DF para assistir às gravações e baixar os materiais completos do capítulo."
      origem="CONTEUDO"
      rotuloCta="Quero me filiar"
      mostrarJaSouFiliado={false}
    />
  );
}
