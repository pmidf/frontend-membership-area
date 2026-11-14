import Image from "next/image";

const destaques = [
  "Clube de vantagens exclusivo para filiados",
  "Conteúdo, eventos e vagas do capítulo",
  "Reconhecimento pela sua trajetória no PMI",
];

const frase = "A comunidade de gerenciamento de projetos do DF em um só lugar.";

function Logo() {
  return (
    <span className="flex w-fit rounded-md bg-branco px-4 py-2.5">
      <Image
        src="/brand/logo-pmi-df.png"
        alt="PMI Distrito Federal"
        width={184}
        height={51}
        priority
      />
    </span>
  );
}

export function PainelInstitucional() {
  return (
    <>
      <header className="flex flex-col items-center gap-4 rounded-b-lg bg-linear-to-br from-violeta-950 to-violeta-500 px-6 pt-8 pb-6 text-center text-texto-inverso lg:hidden">
        <Logo />
        <p className="max-w-xs text-corpo-pequeno">{frase}</p>
      </header>

      <aside className="hidden w-120 shrink-0 bg-linear-to-br from-violeta-950 to-violeta-500 text-texto-inverso lg:block">
        <div className="sticky top-0 flex h-screen flex-col justify-between p-12">
          <Logo />
          <div className="flex flex-col gap-8">
            <p className="text-display">{frase}</p>
            <ul className="flex flex-col gap-4">
              {destaques.map((destaque) => (
                <li key={destaque} className="flex items-center gap-3 text-corpo">
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 rounded-pill bg-acao-destaque"
                  />
                  {destaque}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-legenda text-violeta-300">PMI-DF · Project Management Institute</p>
        </div>
      </aside>
    </>
  );
}
