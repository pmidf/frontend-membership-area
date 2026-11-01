import Image from "next/image";

import { EstadoApi } from "@/features/saude/components/EstadoApi";

export default function PaginaInicial() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 px-4 text-center">
      <Image
        src="/brand/logo-pmi-df.png"
        alt="PMI Distrito Federal"
        width={220}
        height={61}
        priority
      />
      <h1 className="text-h2">Área de Membros PMI-DF</h1>
      <p className="text-texto-secundario">
        A comunidade de gerenciamento de projetos do DF em um só lugar.
      </p>
      <EstadoApi />
    </main>
  );
}
