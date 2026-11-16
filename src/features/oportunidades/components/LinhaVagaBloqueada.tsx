import { LogoEmpresa } from "./LogoEmpresa";

export function LinhaVagaBloqueada({ logo }: { logo: string | null }) {
  return (
    <div className="flex flex-col gap-3 rounded-md bg-fundo-pagina p-4 sm:flex-row sm:items-center">
      <LogoEmpresa empresa="Empresa parceira" logo={logo} className="size-12" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="h-4 w-1/2 rounded-sm bg-borda-padrao" />
        <span className="h-3 w-2/3 rounded-sm bg-borda-padrao/60" />
        <span className="h-3 w-1/3 rounded-sm bg-borda-padrao/60" />
      </div>
      <span className="h-4 w-16 rounded-sm bg-violeta-50" />
    </div>
  );
}
