const STEPS = [
  {
    number: '1',
    title: 'Pick your bank',
    body: 'ANZ, CommBank or NAB. Export the CSV or download the PDF statements.',
  },
  {
    number: '2',
    title: 'We hunt the ghosts',
    body: 'Repeat charges, bank fees and sneaky price rises. Three months is plenty.',
  },
  {
    number: '3',
    title: 'Cancel in a minute',
    body: 'We draft the email. You hit send.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto w-full max-w-6xl px-5 pb-24 pt-16 sm:px-8">
      <div className="grid gap-6 sm:grid-cols-3 sm:gap-8">
        {STEPS.map((step) => (
          <div key={step.number} className="relative border-t border-white/[0.08] pt-5">
            <span className="text-xs font-semibold tracking-[0.2em] text-primary/70">{step.number}</span>
            <h3 className="mt-2 text-[15px] font-semibold text-white">{step.title}</h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}