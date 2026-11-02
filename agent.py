# Ghost.it: subscription ghosting agent for Fetch.ai Agentverse (hosted agent)
# Works on its own (sells Ghost Packs per category) and links to the Ghost Fees web app.
# Paste this whole file into your hosted agent's agent.py on Agentverse.
# Hosted agents get ASI1_API_KEY and ASI1_BASE_URL injected automatically.
#
# Design rules:
# - All money maths and all cancel links come from plain Python (never the LLM).
# - Cancel links only from the checked table below. Unknown services get no link.
# - General tips about subscriptions only. Nothing about financial products.

import json
import os
import re
from urllib.parse import quote
import math
from datetime import date, datetime, timedelta, timezone
from uuid import uuid4

from openai import OpenAI
from uagents import Agent, Context, Protocol
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    TextContent,
    chat_protocol_spec,
)

# ---------------- Settings ----------------
MODEL = "asi1"                 # if "model not found", copy the model name from Agentverse's chat example
APP_URL = "https://hunt-ghost-fees.base44.app/"
PACK_PRICE = 2                 # AUD per Ghost Pack
ALL_PRICE = 5                  # AUD for every pack
PAYMENTS_ENABLED = False       # False = packs are free during beta. Turn on after wiring the Payment Protocol.
HOURLY_RATE = 30               # used for "hours of work" nudge, stated as an assumption
FOLLOW_UP_DAYS = 7
TRIAL_REMIND_DAYS = 2           # calendar reminder this many days before a free trial charges
DEFAULT_TRIAL_DAYS = 7         # assumed trial length when the user doesn't say (the shortest common one)
AU_TZ = timezone(timedelta(hours=10))  # Australian Eastern time, for trial dates
RENEW_REMIND_DAYS = 2           # renewal reminder this many days before each charge
INVEST_RATE = 0.08              # hypothetical long-run average return, same assumption as GoldMind

client = OpenAI(
    base_url=os.environ.get("ASI1_BASE_URL", "https://api.asi1.ai/v1"),
    api_key=os.environ.get("ASI1_API_KEY", ""),
)
agent = Agent()
protocol = Protocol(spec=chat_protocol_spec)

# ---------------- Packs and catalogue ----------------
PACKS = {
    "screen": "Screen Pack (video and sport streaming)",
    "sound": "Sound Pack (music and audio)",
    "fitness": "Gym and Fitness Pack",
    "food": "Food Pack (delivery memberships and meal kits)",
    "tech": "Tech Stack Pack (storage, software, AI tools)",
    "play": "Play Pack (gaming)",
    "other": "Other",
}

APPLE = ("https://support.apple.com/HT202039", "On iPhone: Settings > your name > Subscriptions > choose it > Cancel Subscription.")
GOOGLE = ("https://play.google.com/store/account/subscriptions", "Google Play > Payments & subscriptions > Subscriptions > choose it > Cancel.")

# key: (display name, pack, aliases, cancel link or None, steps, group for overlap)
CATALOGUE = {
    "netflix": ("Netflix", "screen", ["netflix"], "https://www.netflix.com/cancelplan", "Open the link and confirm Cancel.", "video"),
    "stan": ("Stan", "screen", ["stan"], "https://my.stan.com.au", "Manage Account > Subscription Information > Cancel your subscription (web browser only).", "video"),
    "binge": ("BINGE", "screen", ["binge"], "https://binge.com.au", "My Account > Cancel Subscription. If Telstra bills you: My Telstra > Your subscriptions.", "video"),
    "kayo": ("Kayo", "screen", ["kayo"], "https://kayosports.com.au", "My Account > Cancel Subscription. If Telstra bills you: My Telstra > Your subscriptions.", "video"),
    "disney": ("Disney+", "screen", ["disney", "disney+", "disney plus"], "https://www.disneyplus.com/account", "Account > Subscription > Cancel Subscription.", "video"),
    "prime": ("Amazon Prime", "screen", ["prime", "amazon prime", "prime video"], "https://www.amazon.com.au/gp/primecentral", "Prime Membership > Update, cancel and more > End membership.", "video"),
    "paramount": ("Paramount+", "screen", ["paramount", "paramount+"], None, "Account > Subscription > Cancel, on their website.", "video"),
    "appletv": ("Apple TV+", "screen", ["apple tv", "apple tv+"], APPLE[0], APPLE[1], "video"),
    "foxtel": ("Foxtel", "screen", ["foxtel"], None, "Foxtel often needs notice by phone or online chat; check your plan for notice periods.", "video"),
    "spotify": ("Spotify", "sound", ["spotify"], "https://support.spotify.com/article/cancel-premium/", "Account > Manage your plan > Cancel subscription.", "music"),
    "applemusic": ("Apple Music", "sound", ["apple music"], APPLE[0], APPLE[1], "music"),
    "youtube": ("YouTube Premium", "sound", ["youtube", "youtube premium", "youtube music"], "https://www.youtube.com/paid_memberships", "Manage membership > Deactivate.", "music"),
    "audible": ("Audible", "sound", ["audible"], None, "Account details > Cancel membership, on the Audible website.", "audio"),
    "amazonmusic": ("Amazon Music Unlimited", "sound", ["amazon music"], None, "Amazon account > Memberships & Subscriptions > Cancel.", "music"),
    "gym": ("Gym membership", "fitness", ["gym", "anytime fitness", "fitness first", "goodlife", "jetts", "f45", "snap fitness", "plus fitness", "virgin active", "crunch"], None,
            "Gyms often need written notice or a form, and some have notice periods or fees. Check your membership agreement, then ask the front desk for the cancellation form.", "gym"),
    "fitnessapp": ("Fitness app", "fitness", ["strava", "myfitnesspal", "peloton", "fitness+", "apple fitness", "fitbit premium", "centr"], None,
                   "Usually in the app's Account > Subscription, or in Apple/Google subscriptions if you paid there.", "fitapp"),
    "uberone": ("Uber One", "food", ["uber one", "uber eats pass", "eats pass"], None, "Uber app > Account > Uber One > Manage membership > End membership.", "delivery"),
    "dashpass": ("DashPass", "food", ["dashpass", "doordash"], None, "DoorDash app > Account > DashPass > End subscription.", "delivery"),
    "mealkit": ("Meal kit", "food", ["hellofresh", "marley spoon", "dinnerly", "youfoodz", "everyplate", "lite n easy"], None,
                "Account settings > Plan or Subscription > Cancel or pause. Check the weekly cut-off day so the next box isn't charged.", "mealkit"),
    "icloud": ("iCloud+", "tech", ["icloud", "icloud+"], APPLE[0], "iPhone: Settings > your name > iCloud > Manage storage > Change plan > Downgrade.", "storage"),
    "googleone": ("Google One", "tech", ["google one", "google storage"], None, "Google One app or website > Settings > Cancel membership.", "storage"),
    "dropbox": ("Dropbox", "tech", ["dropbox"], None, "Dropbox website > Settings > Plan > Cancel plan.", "storage"),
    "m365": ("Microsoft 365", "tech", ["microsoft 365", "office 365", "office", "onedrive"], "https://account.microsoft.com/services", "Manage > Cancel subscription.", "storage"),
    "adobe": ("Adobe", "tech", ["adobe", "photoshop", "lightroom", "creative cloud", "acrobat"], "https://account.adobe.com/plans", "Manage plan > Cancel your plan. Annual plans paid monthly can have an early cancel fee.", "design"),
    "canva": ("Canva Pro", "tech", ["canva"], None, "Canva > Settings > Billing & plans > Cancel subscription.", "design"),
    "chatgpt": ("ChatGPT Plus", "tech", ["chatgpt", "openai"], "https://help.openai.com/en/articles/7232927", "Settings > Billing > Cancel plan.", "ai"),
    "claude": ("Claude Pro", "tech", ["claude"], None, "Settings > Billing > Cancel, on the website you subscribed through.", "ai"),
    "gemini": ("Gemini / Google AI plan", "tech", ["gemini", "google ai"], None, "Usually through Google One settings > Cancel membership.", "ai"),
    "perplexity": ("Perplexity Pro", "tech", ["perplexity"], None, "Settings > Subscription > Cancel.", "ai"),
    "gamepass": ("Xbox Game Pass", "play", ["game pass", "xbox"], None, "Microsoft account > Services & subscriptions > Manage > Cancel.", "console"),
    "psplus": ("PlayStation Plus", "play", ["playstation plus", "ps plus", "psn"], None, "PlayStation account > Subscriptions Management > Turn off auto-renew.", "console"),
    "nintendo": ("Nintendo Switch Online", "play", ["nintendo", "switch online"], None, "Nintendo Account > Shop menu > Turn off automatic renewal.", "console"),
    "discord": ("Discord Nitro", "play", ["discord", "nitro"], None, "Discord > User Settings > Subscriptions > Cancel.", "gamingextra"),
}

OVERLAP_TIPS = {
    "video": (3, "{n} video streaming services. A common approach is to keep one and rotate the others month by month around the shows or sport seasons you want."),
    "music": (2, "{n} music services. Most people only listen on one."),
    "storage": (2, "{n} cloud storage plans. You may be paying twice for the same photos and files."),
    "ai": (2, "{n} AI tool subscriptions. Many people end up using just one most days."),
    "console": (2, "{n} console gaming passes. Check which one you actually played this month."),
    "delivery": (2, "{n} food delivery memberships. These only pay off if you order often enough on that one app."),
    "design": (2, "{n} design tools. Check whether one covers what you use the other for."),
}

LIFE_STAGE_TIPS = {
    "student": "Student tip: several music and software services offer student pricing. Check eligibility on their sites.",
    "couple": "Couple tip: duo and family plans let two people share one subscription. Check if you're both paying separately.",
    "family": "Family tip: family plans cover several people for one price. Check for separate accounts in the household.",
    "sharehouse": "Sharehouse tip: housemates often each pay for the same streaming services. One shared account (where the terms allow) can cover the house.",
}

# Swap and bundle tips. Only general, checked facts; prices come from the user, never guessed.
# any: trigger keys, min: how many of them needed, with: also need at least one of these.
SWAP_RULES = [
    {"any": {"applemusic", "appletv", "icloud"}, "min": 2,
     "tip": "Apple One bundles Apple Music, Apple TV+, Apple Arcade and iCloud+ in one plan. {paid}Compare that with Apple One's current price on apple.com."},
    {"any": {"youtube"}, "with": {"spotify", "applemusic", "amazonmusic"},
     "tip": "YouTube Premium already includes YouTube Music, so you may not need {other} as well."},
    {"any": {"m365"}, "with": {"dropbox", "googleone", "icloud"},
     "tip": "Microsoft 365 already includes 1TB of OneDrive storage per person. Check if that covers what you keep in {other}."},
    {"any": {"prime"}, "with": {"amazonmusic"},
     "tip": "Amazon Prime already includes Amazon Music Prime. Check if that's enough before paying for Music Unlimited too."},
    {"any": {"gemini"}, "with": {"googleone"},
     "tip": "Google's AI plans are sold through Google One and include storage. Check you aren't paying for two Google One plans."},
    {"any": {"kayo", "binge"}, "min": 2,
     "tip": "Kayo and BINGE are both Foxtel Group services. Check their sites for a combined offer before paying for both separately."},
]

PRIVACY = ("I never need your bank login, card number or statement. I only keep the subscription names and prices you type, "
           "and you can say \"delete my data\" any time.")

FEEDBACK_ASK = "💬 _Got one thing I should change? Start a message with **feedback**, e.g. \"feedback: add Foxtel\"._"

FOOTER = ("_General information about subscriptions, not financial advice. Steps come from each company's own help pages; "
          "if you paid through Apple or Google Play, cancel there instead._")

# ---------------- LLM: extraction only ----------------
EXTRACT_PROMPT = """Extract subscriptions from the user's message. Reply with JSON only:
{"intent": "check" | "buy_pack" | "buy_all" | "list" | "update_status" | "trial" | "feedback" | "delete" | "help",
 "items": [{"name": string, "price": number or null, "period": "month" | "year" | "week" | null, "old_price": number or null, "renews_day": number 1-31 or null}],
 "pack": one of ["screen","sound","fitness","food","tech","play"] or null,
 "status_updates": [{"name": string, "status": "confirmed" | "still_charging" | "ghosted"}],
 "life_stage": "student" | "couple" | "family" | "sharehouse" | "solo" | null,
 "takeaway_orders_per_month": number or null,
 "takeaway_fees_per_order": number or null,
 "feedback_text": string or null,
 "goal": {"name": string, "target": number} or null,
 "trials": [{"name": string, "days_ago": number or null, "length_days": number or null, "ends_on": "YYYY-MM-DD" or null, "price_after": number or null, "period": "month" | "year" | "week" | null}]}
Rules: "$15" with no period means per month. "check" = user lists what they pay for or asks if it's too much.
"buy_pack" = user wants a pack, to ghost/cancel a category, or says e.g. "screen pack". "buy_all" = all packs / ghost everything.
"list" = asks for their ghost list or progress. "update_status" = says something stopped, was confirmed, or is still charging.
"feedback" = user gives an opinion or suggestion about this agent; put their words in feedback_text.
"delete" = user asks to delete or forget their data.
"trial" = user says they started (or are on) a free trial. Put each one in "trials", NOT in "items". days_ago: 0 for today,
1 for yesterday, null if not said. length_days: e.g. "7 day trial" = 7, "a month" = 30, null if not said.
ends_on only if the user gives the end date. price_after = what it costs after the trial, if said.
renews_day = day of the month it charges, e.g. "Netflix renews on the 14th" = 14 (intent "check").
goal = something the user is saving for with an amount, e.g. "saving $1500 for a trip" = {"name": "a trip", "target": 1500}.
Map food delivery and takeaway to items only if it's a membership (Uber One, DashPass, meal kits)."""


def llm_json(system: str, user: str) -> dict:
    r = client.chat.completions.create(
        model=MODEL, max_tokens=700,
        messages=[{"role": "system", "content": system + f"\nToday's date is {today_au().isoformat()}."},
                  {"role": "user", "content": user}],
    )
    raw = r.choices[0].message.content or ""
    m = re.search(r"\{.*\}", raw, re.S)
    return json.loads(m.group(0)) if m else {"intent": "help"}


# ---------------- Matching and maths (plain Python) ----------------
def match(name: str):
    n = name.lower().strip()
    best = None
    for key, (_, _, aliases, *_rest) in CATALOGUE.items():
        for a in aliases:
            if re.search(r"(?<![a-z0-9])" + re.escape(a) + r"(?![a-z0-9])", n):
                if not best or len(a) > best[1]:
                    best = (key, len(a))
    return best[0] if best else None


def yearly(price, period):
    if price is None:
        return None
    p = float(price)
    return {"year": p, "week": p * 52}.get(period or "month", p * 12)


def money(x):
    return f"${x:,.0f}"


def new_data():
    return {"subs": {}, "ghosts": {}, "trials": {}, "life_stage": None, "paid_packs": [], "free_pack_used": False, "goal": None, "mind": None}


def today_au():
    return datetime.now(AU_TZ).date()


def load(ctx, sender):
    raw = ctx.storage.get(f"user:{sender}")
    data = json.loads(raw) if raw else new_data()
    for k, v in new_data().items():
        data.setdefault(k, v)
    return data


def save(ctx, sender, data):
    ctx.storage.set(f"user:{sender}", json.dumps(data))


def merge_items(data, items):
    for it in items or []:
        key = match(it.get("name", "")) or "other:" + it.get("name", "").lower().strip()
        prev = data["subs"].get(key, {})
        data["subs"][key] = {
            "name": CATALOGUE[key][0] if key in CATALOGUE else it.get("name", "").strip().title(),
            "pack": CATALOGUE[key][1] if key in CATALOGUE else "other",
            "yearly": yearly(it.get("price"), it.get("period")) if it.get("price") is not None else prev.get("yearly"),
            "old_price": it.get("old_price") or prev.get("old_price"),
            "price": it.get("price") if it.get("price") is not None else prev.get("price"),
            "period": (it.get("period") or "month") if it.get("price") is not None else prev.get("period", "month"),
            "renews_day": _day(it.get("renews_day")) or prev.get("renews_day"),
        }


def _day(x):
    try:
        d = int(x)
        return d if 1 <= d <= 31 else None
    except (TypeError, ValueError):
        return None


# ---------------- Replies ----------------
def free_check(data, d) -> str:
    subs = data["subs"]
    if not subs:
        return HELP
    lines = ["## Your ghost check"]
    total, unknown = 0.0, []
    for pk, label in PACKS.items():
        items = [(k, s) for k, s in subs.items() if s["pack"] == pk]
        if not items:
            continue
        pk_total = sum(s["yearly"] or 0 for _, s in items)
        lines.append(f"\n**{label}**: {money(pk_total)} a year" if pk_total else f"\n**{label}**")
        for k, s in items:
            y = s["yearly"]
            if y:
                total += y
                hours = max(1, round(y / HOURLY_RATE))
                extra = f" (about {hours} hour{'s' if hours != 1 else ''} of work a year at ${HOURLY_RATE}/hr)"
                if s.get("old_price") and s.get("price") and float(s["price"]) > float(s["old_price"]):
                    extra += f". You agreed to ${float(s['old_price']):.2f}; it's now ${float(s['price']):.2f}"
                lines.append(f"- {s['name']}: {money(y)} a year{extra}")
            else:
                unknown.append(s["name"])
                lines.append(f"- {s['name']}: price not given")

    # overlaps
    groups = {}
    for k in subs:
        if k in CATALOGUE:
            groups.setdefault(CATALOGUE[k][5], []).append(CATALOGUE[k][0])
    overlaps = [OVERLAP_TIPS[g][1].format(n=len(v)) + f" ({', '.join(v)})"
                for g, v in groups.items() if g in OVERLAP_TIPS and len(v) >= OVERLAP_TIPS[g][0]]

    lines.append(f"\n### Total: {money(total)} a year ({money(total / 12)} a month)")
    if total:
        lines.append(mini_future(total))
    if unknown:
        lines.append(f"_Add prices for {', '.join(unknown)} to include them, e.g. \"Stan $16\"._")
    if overlaps:
        lines.append("\n**Overlaps spotted**")
        lines += [f"- {o}" for o in overlaps]
    if d.get("takeaway_orders_per_month") and d.get("takeaway_fees_per_order"):
        f = float(d["takeaway_orders_per_month"]) * float(d["takeaway_fees_per_order"]) * 12
        lines.append(f"\n**Takeaway habit:** about {money(f)} a year in delivery and service fees alone.")
    tip = LIFE_STAGE_TIPS.get(data.get("life_stage") or "")
    if tip:
        lines.append(f"\n{tip}")
    video_n = sum(1 for k in subs if k in CATALOGUE and CATALOGUE[k][5] == "video" and subs[k].get("yearly"))
    if video_n >= 3:
        lines.append("\n📅 **Rotate instead of stacking:** say \"rotation plan\" for a month-by-month plan with calendar reminders.")
    swap_tips = swaps(data)
    if swap_tips:
        lines.append("\n**Swap and save**")
        lines += [f"- {t}" for t in swap_tips]
    lines.append("\n**Quick test for each one:** would you sign up today at this price? If not, it's a ghost.")
    if total:
        lines.append(mind_line(data, total))
    lines.append("⏰ **On a free trial?** Say e.g. \"started Paramount+ trial today\" and I'll set a reminder before it charges.")

    packs_here = sorted({s["pack"] for s in subs.values() if s["pack"] in PACKS and s["pack"] != "other"})
    price_line = ("your first one is free, and every pack is free during the beta" if not PAYMENTS_ENABLED
                  else f"your first one is free, then ${PACK_PRICE} per pack or ${ALL_PRICE} for all")
    lines.append(f"\n**Ghost them:** get a Ghost Pack ({price_line}) with official cancel steps, a ready cancel email, "
                 f"and follow-up tracking. Say e.g. \"{packs_here[0] if packs_here else 'screen'} pack\" or \"ghost everything\".")
    lines.append(renewal_section(data))
    lines.append(app_line(subs))
    return "\n".join(lines)


def cancel_email(name):
    return (f"Subject: Cancel my {name} subscription\n\nHi {name} team,\nPlease cancel my subscription effective today "
            f"and confirm in writing that no further charges will be made.\nAccount email: [your email]\nThanks,\n[Your name]")


def packs_with_subs(data, packs):
    return [pk for pk in packs if any(s["pack"] == pk for s in data["subs"].values())]


def pack_gate(data, packs):
    """One free try, then charge. Returns (packs to deliver now, note for the reply).

    Everyone's first Ghost Pack is free. While PAYMENTS_ENABLED is False (beta)
    every pack is still delivered, and the note explains how it will work. Once
    it's True, only the free pack and packs already unlocked are delivered; the
    rest get the price. Packs with nothing in them never use up the free one.
    """
    wanted = packs_with_subs(data, packs)
    unlocked = set(data.get("paid_packs") or [])
    free_left = not data.get("free_pack_used")
    price = f"${PACK_PRICE} a pack or ${ALL_PRICE} for every pack"
    if not wanted:
        return [], ""
    if not PAYMENTS_ENABLED:
        if free_left:
            data["free_pack_used"] = True
            return wanted, f"🎁 **Your first Ghost Pack is free.** After the beta, more packs are {price}. Everything is free while we're in beta."
        return wanted, f"🎁 Free while we're in beta. After the beta, your first pack stays free, then it's {price}."
    deliver = [pk for pk in wanted if pk in unlocked]
    locked = [pk for pk in wanted if pk not in unlocked]
    if free_left and locked:
        deliver.append(locked.pop(0))
        data["free_pack_used"] = True
    if not locked:
        return deliver, "🎁 **This Ghost Pack is free**, your one free try." if free_left else ""
    names = ", ".join(PACKS[pk].split(" (")[0] for pk in locked)
    lead = "🎁 One pack is on us. " if deliver else "You've used your free Ghost Pack. "
    return deliver, f"{lead}**{names}**: {price}. Paying in chat is coming soon."


def deliver_pack(ctx, sender, data, packs) -> str:
    now = datetime.now(timezone.utc).isoformat()
    out = []
    for pk in packs:
        items = [(k, s) for k, s in data["subs"].items() if s["pack"] == pk]
        if not items:
            continue
        out.append(f"## {PACKS[pk]}")
        for k, s in items:
            link, steps = (CATALOGUE[k][3], CATALOGUE[k][4]) if k in CATALOGUE else (None, None)
            out.append(f"### {s['name']}")
            out.append(f"- **Cancel:** {link}" if link else "- **Cancel:** no checked link yet. Search their official site for \"cancel subscription\".")
            if steps:
                out.append(f"- **Steps:** {steps}")
            out.append("- **Paid through iPhone or Android?** " + APPLE[1] + " / " + GOOGLE[1])
            out.append("```\n" + cancel_email(s["name"]) + "\n```")
            data["ghosts"][k] = {"name": s["name"], "yearly": s.get("yearly"), "status": "requested", "date": now}
        if pk not in data["paid_packs"]:
            data["paid_packs"].append(pk)
    save(ctx, sender, data)
    if not out:
        return "I don't have any subscriptions in that pack for you yet. Tell me what you pay for first, e.g. \"Netflix $19, Stan $16\"."
    out.append(f"\nI've added these to your ghost list. In {FOLLOW_UP_DAYS} days I'll ask if they stopped charging. "
               "Say \"my ghost list\" any time.")
    out.append(app_line(data["subs"]))
    return "\n".join(out)


STOPPED_RE = re.compile(r"\b(stopped|cancell?ed|gone|confirmed|ghosted|done|ended|no longer charg\w*|not charging)\b")
CHARGING_RE = re.compile(r"\b(still (charg\w*|billing|paying|taking)|charged (me )?again|keeps? charging)\b")


def _norm_status(s):
    s = (s or "").lower().strip().replace(" ", "_")
    if s in ("confirmed", "stopped", "cancelled", "canceled", "done", "ghosted_confirmed"):
        return "confirmed"
    if s in ("still_charging", "charging", "still_billing"):
        return "still_charging"
    return None


def apply_status_updates(data, text, llm_updates) -> list:
    """Update ghost statuses. Plain-Python rules on the user's words win; the LLM fills gaps."""
    ghosts = data["ghosts"]
    if not ghosts:
        return []
    found = {}
    # Rules: split into chunks ("Stan stopped, Netflix still charging") and match each chunk.
    for chunk in re.split(r"[,;.\n]|\band\b|\bbut\b", text.lower()):
        status = "still_charging" if CHARGING_RE.search(chunk) else "confirmed" if STOPPED_RE.search(chunk) else None
        if not status or "trial" in chunk:
            continue
        keys = [k for k in ghosts if (match(chunk) == k) or ghosts[k]["name"].lower() in chunk]
        if not keys and len(ghosts) == 1 and not match(chunk):
            keys = list(ghosts)  # "it stopped" with only one thing on the list
        for k in keys:
            found[k] = status
    for u in llm_updates or []:
        k = match(u.get("name", ""))
        st = _norm_status(u.get("status"))
        if k and k in ghosts and st and k not in found:
            found[k] = st
    for k, st in found.items():
        ghosts[k]["status"] = st
    return list(found)


def ghost_list(data) -> str:
    g = data["ghosts"]
    if not g:
        return "Your ghost list is empty. Tell me what you pay for and I'll check it."
    icons = {"requested": "⏳ Requested", "confirmed": "✅ Stopped", "still_charging": "⚠️ Still charging"}
    saved = sum((x.get("yearly") or 0) for x in g.values() if x["status"] == "confirmed")
    pending = sum((x.get("yearly") or 0) for x in g.values() if x["status"] == "requested")
    lines = ["## Your ghost list"] + [f"- {x['name']}: {icons.get(x['status'], x['status'])}" for x in g.values()]
    lines.append(f"\n**Ghosted and confirmed:** {money(saved)} a year. **Waiting to confirm:** {money(pending)} a year.")
    lines.append("Update me any time, e.g. \"Stan stopped\" or \"Netflix still charging\".")
    return "\n".join(lines)


def follow_ups(data) -> str:
    due = []
    for x in data["ghosts"].values():
        if x["status"] == "requested":
            days = (datetime.now(timezone.utc) - datetime.fromisoformat(x["date"])).days
            if days >= FOLLOW_UP_DAYS:
                due.append(x["name"])
    if not due:
        return ""
    return f"👻 Quick check: did {', '.join(due)} stop charging? Reply \"stopped\" or \"still charging\" for each.\n\n---\n\n"


ROTATE_RE = re.compile(r"\b(rotat\w*|rotation plan)\b", re.I)
KEEP_RE = re.compile(r"\bkeep\s+([a-z0-9+ ]+?)(?:\s*(?:,|\.|and|$))", re.I)


def cal_link(title, day, details):
    d1, d2 = day.strftime("%Y%m%d"), (day + timedelta(days=1)).strftime("%Y%m%d")
    return ("https://calendar.google.com/calendar/render?action=TEMPLATE"
            f"&text={quote(title)}&dates={d1}/{d2}&details={quote(details)}")


def rotation_plan(data, text="") -> str:
    subs = data["subs"]
    video = [k for k in subs if k in CATALOGUE and CATALOGUE[k][5] == "video" and subs[k].get("yearly")]
    if len(video) < 2:
        return ("A rotation plan needs at least 2 streaming services with prices, "
                "e.g. \"Netflix $19, Stan $16, Disney+ $16\".")
    keep = None
    m = KEEP_RE.search(text or "")
    if m:
        k = match(m.group(1))
        if k in video:
            keep = k
    rotating = [k for k in video if k != keep]
    monthly = {k: subs[k]["yearly"] / 12 for k in video}
    now_total = sum(monthly.values())
    keep_cost = monthly[keep] if keep else 0
    today = datetime.now(timezone.utc).date()
    first = (today.replace(day=1) + timedelta(days=32)).replace(day=1)
    lines = ["## 📅 Your streaming rotation plan",
             f"Instead of paying for {len(video)} services at once ({money(now_total)} a month), watch "
             + (f"**{subs[keep]['name']}** all the time plus " if keep else "")
             + "one other service each month.\n",
             "| Month | Watch | Cost that month | Reminder |", "|---|---|---|---|"]
    plan_cost = 0.0
    month = first
    for i in range(6):
        k = rotating[i % len(rotating)]
        nxt = rotating[(i + 1) % len(rotating)]
        cost = keep_cost + monthly[k]
        plan_cost += cost
        label = month.strftime("%b %Y")
        watch = (f"{subs[keep]['name']} + " if keep else "") + subs[k]["name"]
        remind_day = (month + timedelta(days=32)).replace(day=1) - timedelta(days=3)
        link = CATALOGUE[nxt][3] or ""
        details = (f"Ghost.it rotation: cancel {subs[k]['name']} before it renews"
                   + (f", then start {subs[nxt]['name']}." if nxt != k else ".")
                   + (f" Cancel steps: {CATALOGUE[k][3]}" if CATALOGUE[k][3] else ""))
        cal = cal_link(f"Switch {subs[k]['name']} → {subs[nxt]['name']} (Ghost.it)", remind_day, details)
        lines.append(f"| {label} | {watch} | {money(cost)} | [Add to calendar]({cal}) |")
        month = (month + timedelta(days=32)).replace(day=1)
    saved = now_total * 6 - plan_cost
    lines.append(f"\n**You'd save about {money(saved)} over 6 months ({money(saved * 2)} a year).**")
    lines.append("Each reminder is set 3 days before the month ends, so you can cancel before the next charge. "
                 "Most services keep working until the end of the month you've paid for.")
    if not keep:
        lines.append("Want one service all the time? Say e.g. \"rotation plan, keep Netflix\".")
    lines.append("_I can't cancel or restart subscriptions for you: that would need your passwords, and I never ask for them._")
    return "\n".join(lines)


def app_line(subs) -> str:
    keys = [k for k in subs if k in CATALOGUE][:15]
    url = APP_URL + "?ref=asi1" + (f"&subs={','.join(keys)}" if keys else "")
    priced = [f"{k}:{subs[k]['yearly'] / 12:.2f}" for k in keys if subs[k].get("yearly")]
    if priced:
        url += "&prices=" + ",".join(priced)
    return f"\n🔍 **Find the ones you've forgotten:** scan your bank statement free in Ghost Fees: {url}"


def swaps(data) -> list:
    subs, have, out = data["subs"], set(data["subs"]), []
    for r in SWAP_RULES:
        hit = have & r["any"]
        if len(hit) < r.get("min", 1):
            continue
        extra = have & r.get("with", set())
        if "with" in r and not extra:
            continue
        keys = hit | extra
        priced = [subs[k] for k in keys if subs[k].get("yearly")]
        paid = ""
        if len(priced) >= 2:
            paid = (f"You pay ${sum(s['yearly'] for s in priced) / 12:,.2f} a month for "
                    f"{', '.join(s['name'] for s in priced)} now. ")
        out.append(r["tip"].format(paid=paid, other=" or ".join(subs[k]["name"] for k in sorted(extra))))
    if data.get("life_stage") in ("couple", "family", "sharehouse") and "spotify" in have:
        out.append("Spotify Duo (2 people) and Family plans cost less than paying for separate accounts.")
    return out


# ---------------- Free trial alarm ----------------
TRIAL_RE = re.compile(r"\btrials?\b", re.I)
TRIAL_LIST_RE = re.compile(r"\b(my|list|show)\b.*\btrials?\b", re.I)
TRIAL_KEEP_RE = re.compile(r"\b(keep|keeping|kept|staying with|stay with)\b")
TRIAL_HELP = ("⏰ Tell me which free trial and when you started it, e.g. \"started Paramount+ trial today\" "
              "or \"Kayo 7 day trial, started yesterday, $25 a month after\". I'll set a reminder before it charges.")


def nice_day(d):
    return f"{d:%a} {d.day} {d:%b}"


def trial_key(name):
    return match(name) or "other:" + name.lower().strip()


def add_trials(data, trials) -> str:
    today = today_au()
    out = ["## ⏰ Free trial alarm"]
    for t in trials or []:
        name = (t.get("name") or "").strip()
        if not name:
            continue
        key = trial_key(name)
        disp = CATALOGUE[key][0] if key in CATALOGUE else name.title()
        try:
            start = today - timedelta(days=max(0, int(t.get("days_ago") or 0)))
        except (TypeError, ValueError):
            start = today
        end, assumed = None, False
        try:
            end = date.fromisoformat(t["ends_on"]) if t.get("ends_on") else None
        except (TypeError, ValueError):
            end = None
        if end and not (today - timedelta(days=60) <= end <= today + timedelta(days=400)):
            end = None
        if not end:
            try:
                length = int(t.get("length_days") or 0)
            except (TypeError, ValueError):
                length = 0
            if length <= 0:
                length, assumed = DEFAULT_TRIAL_DAYS, True
            end = start + timedelta(days=length)
        y = yearly(t.get("price_after"), t.get("period")) if t.get("price_after") is not None else None
        prev = data["trials"].get(key, {})
        y = y if y is not None else prev.get("yearly")
        data["trials"][key] = {"name": disp, "start": start.isoformat(), "end": end.isoformat(),
                               "yearly": y, "status": "active", "end_alerted": False}

        out.append(f"\n### {disp}")
        if end < today:
            out.append(f"- **Trial ended:** {nice_day(end)}. If you didn't cancel, it may already be charging you.")
        else:
            note = (f" _(I assumed {DEFAULT_TRIAL_DAYS} days, the shortest common length. If yours is longer, say e.g. "
                    f"\"{disp} trial 30 days\".)_" if assumed else "")
            out.append(f"- **Trial ends:** {nice_day(end)}{note}")
            remind = max(today, end - timedelta(days=TRIAL_REMIND_DAYS))
            link = CATALOGUE[key][3] if key in CATALOGUE else None
            details = (f"Ghost.it: your {disp} free trial ends {nice_day(end)}. Cancel today if you don't want to pay."
                       + (f" Cancel here: {link}" if link else ""))
            cal = cal_link(f"Cancel {disp} free trial? (Ghost.it)", remind, details)
            out.append(f"- **Reminder:** [Add to calendar for {nice_day(remind)}]({cal}), "
                       f"{TRIAL_REMIND_DAYS} days before it starts charging.")
        out.append(f"- **If you forget:** it turns into {money(y)} a year." if y else
                   f"- **If you forget:** tell me the price after the trial, e.g. \"{disp} $15 a month\", and I'll show what it would cost.")
        if key in CATALOGUE and CATALOGUE[key][3]:
            out.append(f"- **Cancel:** {CATALOGUE[key][3]}")
        elif key in CATALOGUE and CATALOGUE[key][4]:
            out.append(f"- **Cancel:** {CATALOGUE[key][4]}")
        else:
            out.append("- **Cancel:** no checked link yet. Search their official site for \"cancel free trial\".")
        out.append("- **Started it on iPhone or Android?** " + APPLE[1] + " / " + GOOGLE[1])
    if len(out) == 1:
        return TRIAL_HELP
    out.append("\n_Some services end the trial the moment you cancel. To use the whole trial, cancel on your reminder day._")
    out.append("I can only reply when you message me, so the calendar reminder is your real alarm. "
               "When you've decided, say e.g. \"cancelled the trial\" or \"keeping it\" with the name, or \"my trials\" to see them all.")
    return "\n".join(out)


def update_trials(data, text) -> list:
    """'cancelled Paramount+ trial' / 'keeping Paramount+'. Only touches active trials named in the message."""
    active = {k: t for k, t in data["trials"].items() if t["status"] == "active"}
    if not active:
        return []
    done = []
    for chunk in re.split(r"[,;.\n]|\band\b|\bbut\b", text.lower()):
        keys = [k for k in active if match(chunk) == k or active[k]["name"].lower() in chunk]
        if not keys and len(active) == 1 and TRIAL_RE.search(chunk) and not match(chunk):
            keys = list(active)  # "cancelled the trial" with only one trial running
        if TRIAL_KEEP_RE.search(chunk):
            status = "kept"
        elif STOPPED_RE.search(chunk) and not CHARGING_RE.search(chunk):
            status = "cancelled"
        else:
            continue
        for k in keys:
            t = data["trials"][k]
            if t["status"] != "active":
                continue
            t["status"] = status
            if status == "kept":
                data["subs"][k] = {"name": t["name"], "pack": CATALOGUE[k][1] if k in CATALOGUE else "other",
                                   "yearly": t.get("yearly"), "old_price": None,
                                   "price": round(t["yearly"] / 12, 2) if t.get("yearly") else None}
            done.append((k, status))
    return done


def trial_update_reply(data, done) -> str:
    lines = []
    for k, status in done:
        t = data["trials"][k]
        if status == "cancelled":
            lines.append(f"✅ **{t['name']} trial cancelled** before it charged."
                         + (f" That's {money(t['yearly'])} a year you'll never pay." if t.get("yearly") else ""))
        else:
            lines.append(f"👍 **Keeping {t['name']}.** I've added it to your subscriptions"
                         + (f" at {money(t['yearly'])} a year." if t.get("yearly") else ". Tell me the price to include it in your totals."))
    lines.append("\nSay \"my trials\" to see the rest, or list what you pay for to get a full ghost check.")
    return "\n".join(lines)


def trial_list(data) -> str:
    tr = data["trials"]
    if not tr:
        return TRIAL_HELP
    today = today_au()
    icons = {"cancelled": "✅ Cancelled in time", "kept": "👍 Kept"}
    lines = ["## ⏰ Your free trials"]
    for t in tr.values():
        end = date.fromisoformat(t["end"])
        if t["status"] == "active":
            left = (end - today).days
            state = (f"⏳ ends {nice_day(end)} (in {left} day{'s' if left != 1 else ''})" if left > 0 else
                     "⚠️ ends today" if left == 0 else f"⚠️ ended {nice_day(end)}: did you cancel?")
        else:
            state = icons.get(t["status"], t["status"])
        lines.append(f"- {t['name']}: {state}" + (f" ({money(t['yearly'])} a year if kept)" if t.get("yearly") and t["status"] == "active" else ""))
    saved = sum(t.get("yearly") or 0 for t in tr.values() if t["status"] == "cancelled")
    if saved:
        lines.append(f"\n**Trials cancelled in time:** {money(saved)} a year you won't pay.")
    return "\n".join(lines)


def trial_alerts(data) -> str:
    today, msgs = today_au(), []
    for t in data["trials"].values():
        if t["status"] != "active":
            continue
        end = date.fromisoformat(t["end"])
        left = (end - today).days
        cost = f" Cancel now if you don't want to pay {money(t['yearly'])} a year." if t.get("yearly") else " Cancel now if you don't want to pay."
        if 0 <= left <= TRIAL_REMIND_DAYS:
            when = "today" if left == 0 else "tomorrow" if left == 1 else f"on {nice_day(end)}"
            msgs.append(f"⏰ Your **{t['name']}** free trial ends {when}.{cost}")
        elif left < 0 and not t.get("end_alerted"):
            t["end_alerted"] = True
            msgs.append(f"⏰ Your **{t['name']}** free trial ended {nice_day(end)}. If you didn't cancel, it's probably charging now. "
                        f"Say \"cancelled {t['name']} trial\" or \"keeping {t['name']}\".")
    return ("\n".join(msgs) + "\n\n---\n\n") if msgs else ""


# ---------------- Money mind + future you (behavioural finance layer, from GoldMind) ----------------
# Tone rules (same as GoldMind): no praise, no shame words, at most two sentences, always uses the user's real numbers.
MINDS = {
    "drifter": ("The Drifter", "Quietly looks away. Defers money decisions.",
                "Ostrich effect: renewals keep charging whether you look or not. Not looking costs {year} a year."),
    "reactor": ("The Reactor", "Fast decisions, regrets later.",
                "Loss aversion: giving up a show feels worse than keeping {year} a year feels good. "
                "A rotation plan keeps the shows and drops the stacking."),
    "bookkeeper": ("The Bookkeeper", "Treats different money differently.",
                   "Mental accounting: {day} a day sits in the 'too small to count' box. Added up, it's {year} a year."),
    "now": ("The Now", "Present beats future, every time.",
            "Present bias: this month's {month} feels real and the 10-year {ten} doesn't. It's the same money."),
    "bandwagon": ("The Bandwagon", "Buys what peers buy.",
                  "Herding: subscriptions joined for the one show everyone's talking about tend to outlast the show. "
                  "Is that show finished?"),
    "autopilot": ("The Autopilot", "Whatever the default is, stays.",
                  "Status quo bias: every one of these renews unless you act. Tell me renewal days, e.g. "
                  "\"Netflix renews on the 14th\", and the reminders do the acting."),
}
DEFAULT_MIND = ("Status quo bias: subscriptions renew unless you act, and that default is the business model. "
                "Here it's {year} a year.")
MIND_LIST_RE = re.compile(r"\bmoney (mind|type|personality)\b", re.I)
MIND_SET_RE = re.compile(r"\b(?:i'?m|i am|money mind:?|my type is)\s+(?:a |an |the )?(drifter|reactor|bookkeeper|bandwagon|autopilot)\b"
                         r"|\b(?:i'?m|i am|money mind:?|my type is)\s+(?:a |an |the )(now)\b", re.I)
FUTURE_RE = re.compile(r"\b(future|projection|project|forecast|in \d+ years|over \d+ years|long run)\b", re.I)
REMIND_RE = re.compile(r"\b(my )?(renewal )?reminders?\b", re.I)


def mind_line(data, total) -> str:
    vals = {"day": f"${total / 365:,.2f}", "month": money(total / 12), "year": money(total), "ten": money(total * 10)}
    m = MINDS.get(data.get("mind") or "")
    text = (m[2] if m else DEFAULT_MIND).format(**vals)
    tail = "" if m else " _Say \"money mind\" for tips tuned to you._"
    return f"\n🧠 **Mind check:** {text}{tail}"


def bar(v, vmax, w=12):
    n = max(0, min(w, round(w * v / vmax))) if vmax else 0
    return "█" * n + "░" * (w - n)


def mini_future(total) -> str:
    rows = [f"{y:>2} yr  {bar(total * y, total * 10)}  {money(total * y)}" for y in (1, 5, 10)]
    return "\n🔮 **If nothing changes:**\n```\n" + "\n".join(rows) + "\n```\n_Say \"future\" for the full picture._"


def future_value(monthly, years, rate=INVEST_RATE):
    r = rate / 12
    return monthly * ((1 + r) ** (12 * years) - 1) / r


def future_view(data) -> str:
    subs = data["subs"]
    total = sum(s.get("yearly") or 0 for s in subs.values())
    if not total:
        return "Tell me what you pay for with prices first, e.g. \"Netflix $19, Stan $16\", and I'll project it."
    ghosted = {k: g for k, g in data["ghosts"].items() if g["status"] in ("requested", "confirmed") and k in subs}
    cut = sum(subs[k].get("yearly") or 0 for k in ghosted)
    after = total - cut
    lines = ["## 🔮 Future you",
             f"What your subscriptions add up to at today's prices ({money(total / 12)} a month), before any price rises:",
             "```", "         Keep all" + (" " * 12 + "After ghosting" if cut else "")]
    vmax = total * 20
    for y in (1, 5, 10, 20):
        row = f"{y:>2} yr  {bar(total * y, vmax)} {money(total * y):>8}"
        if cut:
            row += f"   {bar(after * y, vmax)} {money(after * y):>8}"
        lines.append(row)
    lines.append("```")
    if cut:
        names = ", ".join(g["name"] for g in ghosted.values())
        lines.append(f"Ghosting **{names}** keeps **{money(cut * 10)}** with you over 10 years, {money(cut * 20)} over 20.")
        monthly = cut / 12
        what = f"the {money(monthly)} a month you've ghosted"
    else:
        lines.append("Ghost something (e.g. \"screen pack\") and I'll chart the difference.")
        monthly = total / 12
        what = f"your {money(monthly)} a month"
    lines.append(f"\nIf {what} went into an investment at {INVEST_RATE:.0%} average return instead, in 10 years it could be about "
                 f"**{money(future_value(monthly, 10))}** ({money(future_value(monthly, 20))} in 20).")
    lines.append(f"_Hypothetical, not financial advice: {INVEST_RATE:.0%} is a long-run market average, not a forecast._")
    g = data.get("goal")
    if g and g.get("target"):
        if cut:
            months = math.ceil(float(g["target"]) / (cut / 12))
            lines.append(f"\n🎯 **{g['name'].capitalize()} ({money(float(g['target']))}):** what you've ghosted covers it in "
                         f"{months} month{'s' if months != 1 else ''}. That's the whole calculation.")
        else:
            lines.append(f"\n🎯 **{g['name'].capitalize()} ({money(float(g['target']))}):** ghost something and I'll show how many months "
                         "it pays for it.")
    else:
        lines.append("\n🎯 Saving for something? Say e.g. \"saving $1500 for a trip\" and I'll show how fast ghosting gets you there.")
    lines.append("\n🧠 **Mind check:** Present bias makes the monthly price feel real and the 20-year total feel imaginary. "
                 "They're the same money.")
    return "\n".join(lines)


def mind_list() -> str:
    lines = ["## 🧠 What's your money mind?", "Six common patterns (from behavioural finance research). Which sounds most like you?\n"]
    lines += [f"- **{n}**: {d}" for n, d, _ in MINDS.values()]
    lines.append("\nReply e.g. \"I'm an Autopilot\" and I'll tune my tips to it. No right answer, it's just a pattern.")
    return "\n".join(lines)


def set_mind(data, key) -> str:
    data["mind"] = key
    n, d, _ = MINDS[key]
    total = sum(s.get("yearly") or 0 for s in data["subs"].values())
    out = [f"🧠 **{n}**: {d}"]
    out.append(mind_line(data, total) if total else
               "\nTell me what you pay for, e.g. \"Netflix $19, Stan $16\", and I'll show what that pattern costs you.")
    return "\n".join(out)


# ---------------- Renewal reminders ----------------
def renewal_link(s):
    today = today_au()
    rd = s["renews_day"]
    remind_dom = rd - RENEW_REMIND_DAYS
    if remind_dom < 1 or remind_dom > 28:
        remind_dom = 28                  # every month has a 28th; covers renewals on the 1st, 2nd and 31st
    first = today.replace(day=remind_dom)
    if first < today:
        first = (first.replace(day=1) + timedelta(days=32)).replace(day=remind_dom)
    yearly_plan = s.get("period") == "year"
    rule = "RRULE:FREQ=YEARLY" if yearly_plan else "RRULE:FREQ=MONTHLY"
    price = f" (${float(s['price']):.2f})" if s.get("price") else ""
    details = f"Ghost.it: {s['name']}{price} charges on the {rd}{_th(rd)}. Would you sign up today at this price? If not, ghost it."
    url = cal_link(f"{s['name']} renews soon (Ghost.it)", first, details) + "&recur=" + quote(rule)
    return url, remind_dom, yearly_plan


def renewal_section(data) -> str:
    subs = [s for s in data["subs"].values() if s.get("renews_day")]
    if not subs:
        return ("\n📅 **Renewal reminders:** tell me when each one charges, e.g. \"Netflix renews on the 14th\", "
                "and I'll give you a reminder before every charge.")
    lines = ["\n📅 **Renewal reminders** (repeat automatically)"]
    for s in subs:
        url, dom, yr = renewal_link(s)
        lines.append(f"- {s['name']} charges on the {s['renews_day']}{_th(s['renews_day'])}: "
                     f"[remind me on the {dom}{_th(dom)} {'each year' if yr else 'every month'}]({url})")
    return "\n".join(lines)


def _th(n):
    return "th" if 11 <= n % 100 <= 13 else {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th")


def save_feedback(ctx, sender, note) -> str:
    raw = ctx.storage.get("feedback")
    fb = json.loads(raw) if raw else []
    fb.append({"date": datetime.now(timezone.utc).isoformat(), "user": sender[-6:], "text": note[:1000]})
    ctx.storage.set("feedback", json.dumps(fb[-500:]))
    ctx.logger.info(f"FEEDBACK #{len(fb)} from ...{sender[-6:]}: {note[:300]}")
    return ("Thank you, that's saved 🙏 Real feedback is how Ghost.it gets better. "
            "I'll work on it. Anything else, just start a message with **feedback** again.")


def track_usage(ctx, sender, intent):
    raw = ctx.storage.get("stats")
    st = json.loads(raw) if raw else {"messages": 0, "users": []}
    st["messages"] += 1
    if sender[-6:] not in st["users"]:
        st["users"].append(sender[-6:])
    ctx.storage.set("stats", json.dumps(st))
    ctx.logger.info(f"USAGE message #{st['messages']} from ...{sender[-6:]} intent={intent} unique_users={len(st['users'])}")


FEEDBACK_RE = re.compile(r"^\s*(feedback|suggestion)\b[\s:,-]*", re.I)
DELETE_RE = re.compile(r"\b(delete|erase|forget|wipe)\b.*\b(my data|my info\w*|my details|everything|all my)\b", re.I)


HELP = ("Hi, I'm Ghost.it 👻 Tell me what you pay for and I'll show what it really costs, where you're doubling up, "
        "and how to ghost the ones you don't need.\n\n"
        "Example: \"Netflix $19, Stan $16, Spotify $14, gym $25 a week, iCloud $4.49\"\n"
        "Optional: tell me if you're a student, couple, family or sharehouse for tailored tips.\n\n"
        "⏰ Starting a free trial? Say \"started Paramount+ trial today\" and I'll set a reminder 2 days before it charges.\n"
        "📅 Say \"Netflix renews on the 14th\" for a monthly reminder before each charge.\n"
        "🔮 Say \"future\" to see what your subscriptions cost over 1, 5, 10 and 20 years.\n"
        "🧠 Say \"money mind\" to get tips tuned to how you handle money.\n\n"
        + PRIVACY)


# ---------------- Chat protocol ----------------
def reply(text: str) -> ChatMessage:
    return ChatMessage(timestamp=datetime.now(timezone.utc), msg_id=uuid4(),
                       content=[TextContent(type="text", text=text), EndSessionContent(type="end-session")])


@protocol.on_message(ChatMessage)
async def handle_message(ctx: Context, sender: str, msg: ChatMessage):
    await ctx.send(sender, ChatAcknowledgement(timestamp=datetime.now(timezone.utc), acknowledged_msg_id=msg.msg_id))
    text = " ".join(c.text for c in msg.content if isinstance(c, TextContent)).strip()
    if not text:
        return
    data = load(ctx, sender)

    if FEEDBACK_RE.match(text) and FEEDBACK_RE.sub("", text, count=1).strip():
        track_usage(ctx, sender, "feedback")
        await ctx.send(sender, reply(save_feedback(ctx, sender, FEEDBACK_RE.sub("", text, count=1).strip())))
        return
    if DELETE_RE.search(text):
        track_usage(ctx, sender, "delete")
        save(ctx, sender, new_data())
        await ctx.send(sender, reply("Done. I've deleted your subscriptions, ghost list and settings. 👻"))
        return

    try:
        d = llm_json(EXTRACT_PROMPT, text)
    except Exception as e:
        ctx.logger.error(f"extract failed: {e}")
        await ctx.send(sender, reply(HELP))
        return

    if d.get("life_stage") and d["life_stage"] != "solo":
        data["life_stage"] = d["life_stage"]
    new_trials = [t for t in (d.get("trials") or []) if isinstance(t, dict) and t.get("name")]
    trial_keys = {trial_key(t["name"]) for t in new_trials}
    items = [it for it in (d.get("items") or []) if trial_key(it.get("name", "")) not in trial_keys]
    merge_items(data, items)
    g = d.get("goal")
    if isinstance(g, dict) and g.get("target"):
        try:
            data["goal"] = {"name": str(g.get("name") or "your goal")[:60], "target": float(g["target"])}
        except (TypeError, ValueError):
            pass
    trial_done = [] if (new_trials or ROTATE_RE.search(text)) else update_trials(data, text)
    updated = apply_status_updates(data, text, d.get("status_updates"))
    if updated and d.get("intent") not in ("buy_pack", "buy_all"):
        d["intent"] = "update_status"
    save(ctx, sender, data)
    nudge = trial_alerts(data) + follow_ups(data)
    save(ctx, sender, data)

    intent = "trial" if (new_trials or trial_done) else d.get("intent", "help")
    track_usage(ctx, sender, intent)
    if intent == "feedback" and d.get("feedback_text"):
        await ctx.send(sender, reply(save_feedback(ctx, sender, d["feedback_text"])))
        return
    if intent == "delete":
        save(ctx, sender, new_data())
        await ctx.send(sender, reply("Done. I've deleted your subscriptions, ghost list and settings. 👻"))
        return
    try:
        if new_trials:
            body = add_trials(data, new_trials)
            ctx.logger.info(f"TRIAL_SET by ...{sender[-6:]}: {', '.join(t['name'] for t in new_trials)}")
        elif trial_done:
            body = trial_update_reply(data, trial_done)
            for k, st in trial_done:
                ctx.logger.info(f"TRIAL_{st.upper()} by ...{sender[-6:]}: {data['trials'][k]['name']}")
        elif TRIAL_LIST_RE.search(text):
            body = trial_list(data)
        elif MIND_SET_RE.search(text):
            m = MIND_SET_RE.search(text)
            body = set_mind(data, (m.group(1) or m.group(2)).lower())
        elif MIND_LIST_RE.search(text):
            body = mind_list()
        elif FUTURE_RE.search(text) or (d.get("goal") and not d.get("items")):
            body = future_view(data)
        elif REMIND_RE.search(text) and not d.get("items"):
            body = renewal_section(data).strip()
        elif d.get("intent") == "trial":
            body = TRIAL_HELP
        elif intent in ("buy_all", "buy_pack") and (intent == "buy_all" or d.get("pack")):
            asked = [p for p in PACKS if p != "other"] if intent == "buy_all" else [d["pack"]]
            allowed, note = pack_gate(data, asked)  # one free try, then the price (see pack_gate)
            body = deliver_pack(ctx, sender, data, allowed or asked) if (allowed or not packs_with_subs(data, asked)) else ""
            body = (note + "\n\n" + body).strip() if note else body
            ctx.logger.info(f"PACK by ...{sender[-6:]}: asked={asked} delivered={allowed} free_used={data.get('free_pack_used')}")
        elif ROTATE_RE.search(text):
            body = rotation_plan(data, text)
        elif intent in ("list", "update_status"):
            body = ghost_list(data)
        elif intent == "check" or d.get("items"):
            body = free_check(data, d)
        else:
            body = HELP
    except Exception as e:
        ctx.logger.error(f"reply failed: {e}")
        body = "Sorry, something went wrong. Try listing your subscriptions with prices, e.g. \"Netflix $19, Stan $16\"."
    save(ctx, sender, data)

    await ctx.send(sender, reply(nudge + body + "\n\n" + FEEDBACK_ASK + "\n\n" + FOOTER))


@protocol.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    pass


agent.include(protocol, publish_manifest=True)
