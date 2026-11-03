import React from "react";
import { Link } from "react-router-dom";
import { Check, Lock, Sparkles, MessageCircle } from "lucide-react";
import ReceiptGhost from "@/components/site/ReceiptGhost";
import GhostMark from "@/components/site/GhostMark";
import { TEAM } from "@/components/landing/GhostTeam";
import { GHOST_IT_MASCOT } from "@/lib/ghostFees/ghostItAgent";
import ThemeChooser from "@/components/auth/ThemeChooser";
import DataSafety from "@/components/site/DataSafety";

// Sign in, sign up and password pages. Beside the form (below it on phones, so the
// form is first): the purpose, the ghost team and what each does, and what's on offer
// (Free, Pro, Ghost It packs), then the privacy line. "Better design of the front page
// with the agents and what's on offer and the purpose" (3 Nov).
const FREE = ["3 statement scans, your full total", "Cancel steps, emails and the Ghost List", "1 ghost guide chat and 1 Cassy lookup"];
const PRO = ["Unlimited scans", "All 4 ghost guides, as much as you like", "Cassy for every subscription, and the PDF report"];

function TeamGrid() {
  return (
    <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
      {TEAM.map((agent, index) => (
        <li
          key={agent.key}
          className={`team-cascade flex items-center gap-3 rounded-2xl border bg-card/60 px-3 py-2.5 text-left ${agent.key === "ghostit" ? "sm:col-span-2" : ""}`}
          style={{ borderColor: `${agent.color}55`, background: `linear-gradient(90deg, ${agent.color}1a, transparent 70%)`, animationDelay: `${index * 90}ms` }}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: `${agent.color}2e` }} aria-hidden="true">
            {agent.key === "ghostit" ? (
              <img src={GHOST_IT_MASCOT} alt="" className="h-10 w-10 object-contain" />
            ) : (
              <GhostMark className="h-7 w-7" style={{ color: agent.color }} eyeColor="#1a1230" />
            )}
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-x-2">
              <span className="text-[15px] font-bold leading-tight text-foreground">{agent.name}</span>
              <span className="text-[12.5px] font-bold" style={{ color: agent.color }}>{agent.job}</span>
            </span>
            <span className="mt-0.5 block text-[13.5px] leading-snug text-muted-foreground">{agent.does}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Offer() {
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
        <p className="mt-2 text-[12.5px] text-muted-foreground">Never a subscription.</p>
      </div>
      <Link
        to="/ghostit"
        className="flex items-start gap-3 rounded-2xl border border-[#8FB8FF55] bg-[#8FB8FF14] p-4 text-left hover:border-[#8FB8FF] sm:col-span-2"
      >
        <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#8FB8FF]" aria-hidden="true" />
        <span>
          <span className="block text-[15px] font-bold text-foreground">Ghost It in ASI:One · first Ghost Pack free</span>
          <span className="mt-0.5 block text-[14px] leading-snug text-muted-foreground">
            Then $5 once unlocks every pack, paid in the chat. Finds what you pay for twice, like YouTube Premium and Spotify, and plans which to keep, cancel or rotate.
          </span>
        </span>
      </Link>
    </div>
  );
}

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
        <span className="font-semibold text-foreground">Our purpose:</span> find the subscriptions and bank fees you forgot
        you&apos;re paying, and help you cancel them. Upload a statement. No bank login.
      </p>

      <p className="mt-6 text-[13px] font-bold uppercase tracking-[0.14em] text-primary">Pick your theme</p>
      <ThemeChooser variant="cards" />

      <p className="mt-6 text-[13px] font-bold uppercase tracking-[0.14em] text-primary">Your ghost team</p>
      <TeamGrid />

      <p className="mt-6 text-[13px] font-bold uppercase tracking-[0.14em] text-primary">What&apos;s on offer</p>
      <Offer />

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
      <div className="grid w-full max-w-6xl items-start gap-10 lg:grid-cols-[1.15fr_1fr]">
        {/* Phones: the form first, then who we are. Desktop: who we are on the left. */}
        <div className="order-2 lg:order-1">
          <BrandPanel />
        </div>
        <div className="order-1 mx-auto w-full max-w-md lg:sticky lg:top-10 lg:order-2">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary">
              <Icon className="h-6 w-6 shrink-0 text-primary-foreground" aria-hidden="true" />
            </div>
            <h1 className="text-[28px] font-bold leading-tight tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="mt-1.5 text-[15px] leading-snug text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
            <ThemeChooser />
            {children}
          </div>
          {footer && <p className="mt-5 text-center text-[14px] text-muted-foreground">{footer}</p>}
          <p className="mt-3 text-center"><DataSafety /></p>
        </div>
      </div>
    </div>
  );
}