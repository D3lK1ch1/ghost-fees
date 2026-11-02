import React from "react";
import { Link } from "react-router-dom";
import { Check, Lock, Sparkles } from "lucide-react";
import ReceiptGhost from "@/components/site/ReceiptGhost";

// Sign in, sign up and password pages. Beside the form (above it on phones): the
// promise, what Free and Pro give you, and the privacy line, so people know what
// they're signing up for. "Where's the sign in with a clean UVP description?" (2 Nov)
const FREE = ["3 statement scans", "Your full total, every leak in dollars", "1 try of a ghost guide"];
const PRO = ["Unlimited scans and all 4 ghost guides", "Cassy finds cancel pages and phone numbers", "Ghost List checks the charges stopped"];

function BrandPanel() {
  return (
    <div className="text-center lg:text-left">
      <Link to="/" className="inline-flex items-center gap-2.5">
        <ReceiptGhost width={30} className="animate-bob" />
        <span className="text-[24px] font-extrabold leading-none text-foreground" style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}>
          Ghost <span className="text-[#5ee6c8]">Fees</span>
        </span>
      </Link>
      <p className="mt-5 font-heading text-[30px] font-bold leading-tight text-foreground lg:text-[38px]">
        Ghost them once. <span className="text-primary">Pay once.</span>
      </p>
      <p className="mx-auto mt-2 max-w-md text-[16px] leading-snug text-muted-foreground lg:mx-0">
        Find the subscriptions and bank fees you forgot you&apos;re paying, then cancel them. No bank login.
      </p>
      <div className="mt-5 hidden gap-3 sm:grid sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card/60 p-4 text-left">
          <p className="text-[15px] font-bold text-foreground">Free</p>
          <ul className="mt-2 space-y-1.5">
            {FREE.map((line) => <li key={line} className="flex gap-2 text-[14px] leading-snug text-muted-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{line}</li>)}
          </ul>
        </div>
        <div className="rounded-2xl border-2 border-primary bg-primary/10 p-4 text-left">
          <p className="flex items-center gap-1.5 text-[15px] font-bold text-foreground"><Sparkles className="h-4 w-4 text-primary" aria-hidden="true" /> Pro · $10 once</p>
          <ul className="mt-2 space-y-1.5">
            {PRO.map((line) => <li key={line} className="flex gap-2 text-[14px] leading-snug text-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{line}</li>)}
          </ul>
        </div>
      </div>
      <p className="mt-4 inline-flex items-center gap-2 text-[14px] text-muted-foreground">
        <Lock className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        We keep your email and scan count. Never your statement.
      </p>
    </div>
  );
}

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <BrandPanel />
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary">
              <Icon className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
            </div>
            <h1 className="text-[28px] font-bold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="mt-1.5 text-[15px] text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
            {children}
          </div>
          {footer && <p className="mt-5 text-center text-[14px] text-muted-foreground">{footer}</p>}
        </div>
      </div>
    </div>
  );
}
