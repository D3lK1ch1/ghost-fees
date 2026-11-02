import { CalendarRange, CreditCard, ExternalLink, FileSpreadsheet, MessageCircle, Receipt, Smartphone, Wallet, Zap } from 'lucide-react';
import { GHOST_IT_PAGE } from '@/lib/ghostFees/ghostItAgent';

// "What it finds" tab, part 2: what Ghost Fees can't see yet, and exactly how to
// catch it anyway. Group 1 we can still help with (each has a button that does it);
// group 2 is left out on purpose, with the right free place to look instead.
// "Lay this out and make clear how we can compensate and find things the app can't" (2 Nov)
export const HOME_TAB_EVENT = 'ghostFees:hometab';
const openTab = (key) => window.dispatchEvent(new CustomEvent(HOME_TAB_EVENT, { detail: key }));

const external = (href, label) => ({ href, label });

function CatchCard({ Icon, title, why, how, action }) {
  return (
    <li className="flex flex-col gap-2 rounded-2xl border border-border bg-card/60 p-4 sm:flex-row sm:items-start sm:gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary"><Icon className="h-5 w-5" aria-hidden="true" /></span>
      <div className="min-w-0 flex-1">
        <p className="text-[16px] font-bold text-foreground">{title}</p>
        <p className="mt-0.5 text-[14.5px] leading-snug text-muted-foreground"><b className="text-foreground/80">Why we miss it:</b> {why}</p>
        <p className="mt-1 text-[14.5px] leading-snug text-foreground"><b className="text-primary">How to catch it:</b> {how}</p>
      </div>
      {action && (action.href ? (
        <a href={action.href} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-full border-2 border-primary/70 px-4 py-2 text-[14px] font-bold text-foreground hover:bg-primary/15">
          {action.label} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      ) : (
        <button type="button" onClick={action.onClick} className="inline-flex shrink-0 items-center justify-center self-start rounded-full bg-primary px-4 py-2 text-[14px] font-bold text-primary-foreground">
          {action.label}
        </button>
      ))}
    </li>
  );
}

export default function CatchTheRest({ onUpload }) {
  const canHelp = [
    {
      Icon: CalendarRange,
      title: 'Subscriptions in a short statement',
      why: 'A charge only counts as a subscription once it shows up in 3 or more months, and price rises and doubles are checked on those.',
      how: 'Upload 3 to 12 months. You can add several statements in one go (up to 6 files).',
      action: onUpload && { label: 'Upload more months', onClick: onUpload },
    },
    {
      Icon: CreditCard,
      title: 'Subscriptions on another card or account',
      why: 'We only see the statements you upload, so a credit card or a partner’s account is invisible.',
      how: 'Add that account’s statement too, or tell Ghost It what’s on it and it does the maths and double-ups.',
      action: { href: GHOST_IT_PAGE, label: 'Tell Ghost It' },
    },
    {
      Icon: Smartphone,
      title: 'What’s inside Apple and Google charges',
      why: 'App store subscriptions arrive as one combined charge, so we can’t split them.',
      how: 'On iPhone: Settings > your name > Subscriptions. On Android: Google Play > Payments & subscriptions. Then tick what you have in "Have any of these?".',
      action: { label: 'Check typical prices', onClick: () => openTab('have') },
    },
    {
      Icon: FileSpreadsheet,
      title: 'Scanned or photo PDFs',
      why: 'A PDF that’s a picture of a statement may not be readable.',
      how: 'Download a CSV from your bank’s website (usually Transactions > Export) and upload that instead. CSVs never leave your browser.',
      action: onUpload && { label: 'Upload a CSV', onClick: onUpload },
    },
  ];
  const elsewhere = [
    {
      Icon: Zap,
      title: 'Bills that change every month',
      why: 'Power, gas and phone usage change amount each time, so they aren’t treated as subscriptions.',
      how: 'Compare your plan on the government’s free Energy Made Easy site.',
      action: external('https://www.energymadeeasy.gov.au/', 'Energy Made Easy'),
    },
    {
      Icon: Wallet,
      title: 'Interest and buy-now-pay-later fees',
      why: 'Interest and Afterpay, Zip or Humm fees aren’t counted as ghosts.',
      how: 'Check your card or BNPL app for interest and late fees. Moneysmart has free calculators and help.',
      action: external('https://moneysmart.gov.au/', 'Moneysmart'),
    },
    {
      Icon: Receipt,
      title: 'Everyday spending and shop surcharges',
      why: 'Rent, groceries, transport, transfers and small card surcharges are normal spending, not leaks, so they’re left out on purpose.',
      how: 'Use your bank app’s spending categories. Paying by debit or tap-and-go often avoids surcharges.',
      action: null,
    },
  ];

  return (
    <div className="mx-auto mt-12 max-w-3xl">
      <h3 className="text-center text-[1.4rem] font-semibold leading-tight text-foreground sm:text-[1.7rem]">What it can&apos;t see yet, and how to catch it anyway</h3>
      <p className="mx-auto mt-2 max-w-lg text-center text-[15px] leading-relaxed text-muted-foreground">
        Ghost Fees only flags leaks it can prove from your statement. For everything else, here&apos;s exactly what to do.
      </p>

      <p className="mt-6 text-[13px] font-bold uppercase tracking-[0.14em] text-primary">We can still help you catch these</p>
      <ul className="mt-2 flex flex-col gap-2.5">{canHelp.map((item) => <CatchCard key={item.title} {...item} />)}</ul>

      <p className="mt-6 text-[13px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Left out on purpose, and where to look instead</p>
      <ul className="mt-2 flex flex-col gap-2.5">{elsewhere.map((item) => <CatchCard key={item.title} {...item} />)}</ul>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[14px] text-muted-foreground">
        <MessageCircle className="h-4 w-4 text-primary" aria-hidden="true" /> Not sure about a charge? Ask a ghost guide on your results, or tell Ghost It.
      </p>
    </div>
  );
}
