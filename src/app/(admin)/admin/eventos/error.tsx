"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardTitulo } from "@/components/ui/Card";
import styles from "@/features/agenda-admin/components/admin.module.css";

// Falha ao falar com o backend (fora do ar, BACKEND_URL incorreta ou erro na API do console).
export default function ErroEventosAdmin({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className={styles.conteudo}>
      <Card>
        <CardTitulo>Não foi possível carregar o console</CardTitulo>
        <p className={styles.texto}>
          O backend da plataforma não respondeu. Confira se ele está no ar e se a BACKEND_URL está configurada,
          e tente novamente.
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
