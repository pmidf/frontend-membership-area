"use client";

import { Card, CardTitulo } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";

// Falha ao carregar a agenda (backend fora do ar ou indisponível).
export default function ErroAgenda({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className={styles.conteudo}>
      <Card>
        <CardTitulo>Não foi possível carregar a agenda</CardTitulo>
        <p className={styles.vazio}>
          O servidor da agenda não respondeu agora. Tente novamente em alguns instantes.
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
