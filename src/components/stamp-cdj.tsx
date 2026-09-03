export function StampCdj() {
  return (
    <div className="stamp-cdj size-44 sm:size-52 md:size-64 lg:size-72" role="img" aria-label="Filthfactory">
      <img src="/art/brand/logo.png?v=chrome3" alt="" className="stamp-cdj-face" fetchPriority="high" decoding="async" />
      <div className="stamp-cdj-deck" aria-hidden="true">
        <div className="stamp-cdj-platter">
          <span className="stamp-cdj-ring" />
          <span className="stamp-cdj-played" />
          <span className="stamp-cdj-cue" />
        </div>
        <div className="stamp-cdj-hub" />
      </div>
    </div>
  );
}
