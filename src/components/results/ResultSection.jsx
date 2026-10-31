export default function ResultSection({ title, hint, empty, children }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);

  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[17px] font-semibold tracking-tight text-white">{title}</h2>
        {hint && <span className="text-[12px] text-muted-foreground">{hint}</span>}
      </div>
      <div className="mt-3 space-y-2.5">
        {hasChildren ? children : <p className="rounded-2xl border border-dashed border-white/[0.08] px-4 py-5 text-[13px] text-muted-foreground">{empty}</p>}
      </div>
    </section>
  );
}