export default function Portrait({ kind }: { kind: string }) {
  return (
    <div className={`portrait portrait-${kind}`} aria-hidden="true">
      <div className="halo" />
      <div className="portrait-floor" />
      <div className="figure">
        <div className="body" />
        <div className="collar" />
        <div className="head">
          <i />
          <i />
          <b />
        </div>
        <div className="detail" />
      </div>
      {kind === 'villain' && (
        <div className="pet">
          <i />
          <i />
        </div>
      )}
    </div>
  )
}
