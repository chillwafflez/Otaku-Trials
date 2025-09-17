import placeholder from "../assets/placeholder.png";

function AnimePoster({ src, className }: { src?: string | null; className?: string }) {
  const safeSrc = src?.trim() || placeholder;

  return (
    <img
      src={safeSrc}
      loading="lazy"
      className={className}
      onError={(e) => {
        // if the real URL 404s switch to placeholder
        const img = e.currentTarget as HTMLImageElement;
        if (img.src !== placeholder) img.src = placeholder;
      }}
    />
  );
}

export { AnimePoster };