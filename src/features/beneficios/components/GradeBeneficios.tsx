import type { ItemBeneficio } from "../tipos/beneficio";
import { CartaoBeneficio } from "./CartaoBeneficio";

type PropsGradeBeneficios = {
  itens: ItemBeneficio[];
  consultaAtual: string;
};

export function GradeBeneficios({ itens, consultaAtual }: PropsGradeBeneficios) {
  const sufixo = consultaAtual ? `?${consultaAtual}` : "";

  return (
    <ul aria-label="Benefícios" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {itens.map((beneficio) => (
        <li key={beneficio.id_beneficio}>
          <CartaoBeneficio
            beneficio={beneficio}
            href={`/beneficios/${beneficio.id_beneficio}${sufixo}`}
          />
        </li>
      ))}
    </ul>
  );
}
