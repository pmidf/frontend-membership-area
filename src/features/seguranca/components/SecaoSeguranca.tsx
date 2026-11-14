import { CartaoSenha } from "./CartaoSenha";
import { ListaSessoes } from "./ListaSessoes";

export function SecaoSeguranca() {
  return (
    <section id="seguranca" aria-labelledby="titulo-seguranca" className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 id="titulo-seguranca" className="text-h3">
          Segurança
        </h2>
        <p className="text-corpo-pequeno text-texto-secundario">
          Gerencie sua senha e os aparelhos conectados à sua conta.
        </p>
      </header>
      <CartaoSenha />
      <ListaSessoes />
    </section>
  );
}
