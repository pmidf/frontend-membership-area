"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardTitulo } from "@/components/ui/Card";
import styles from "@/features/agenda-admin/components/admin.module.css";

// Falha ao falar com o Sympla (token ausente ou inválido, Sympla fora do ar ou bloqueando requisições).
export default function ErroEventosAdmin({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className={styles.conteudo}>
      <Card>
        <CardTitulo>Não foi possível falar com o Sympla</CardTitulo>
        <p className={styles.texto}>
          Confira se o SYMPLA_TOKEN está configurado no servidor e tente novamente. Se o problema continuar, o Sympla
          pode estar fora do ar ou limitando as requisições.
        </p>
        <div>
          <Button tipo="secundaria" onClick={reset}>
            Tentar novamente
          </Button>
        </div>
      </Card>
    </div>
  );
}
