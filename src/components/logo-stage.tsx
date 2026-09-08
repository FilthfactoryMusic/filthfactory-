export function LogoStage({ label }: { label?: string }) {
  return (
    <div className="relative grid aspect-video w-full place-items-center overflow-hidden bg-bg">
      <img
        src="/art/brand/logo-stamp.png"
        alt=""
        className="ff-logo-spin size-[58%] max-h-72 object-contain"
      />
      {label ? (
        <p className="absolute bottom-3 font-display text-xs font-semibold uppercase tracking-[0.28em] text-muted">
          {label}
        </p>
      ) : null}
    </div>
  );
}
