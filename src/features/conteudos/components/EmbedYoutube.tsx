const PERMISSOES_PLAYER =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";

type PropsEmbedYoutube = { src: string; titulo: string; className?: string };

export function EmbedYoutube({ src, titulo, className }: PropsEmbedYoutube) {
  return (
    <iframe
      src={src}
      title={titulo}
      allow={PERMISSOES_PLAYER}
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      className={className}
    />
  );
}
