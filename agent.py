# Ghost It: subscription ghosting agent for ASI:One (Agentverse hosted agent)
# v7 (2 Nov 2026): clear maths on every reply, interactive cards, app links,
# auto-replies to feedback, evidence command.
#
# No LLM: every number comes from plain Python, so replies are predictable.
# General information about subscriptions only, not financial advice.

import json
import os
import re
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from uuid import uuid4

from uagents import Agent, Context, Protocol
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    MetadataContent,
    TextContent,
    chat_protocol_spec,
)

# Fetch.ai Agent Payment Protocol (seller), as in Fetch's Stripe example. If the
# hosted runtime doesn't have it, the agent keeps working and packs stay free.
try:
    from uagents_core.contrib.protocols.payment import (
        CancelPayment,
        CommitPayment,
        CompletePayment,
        Funds,
        RejectPayment,
        RequestPayment,
        payment_protocol_spec,
    )
    HAVE_PAYMENTS = True
except ImportError:  # pragma: no cover - depends on the hosted runtime
    HAVE_PAYMENTS = False

# ---------------------------------------------------------------- settings
APP_URL = "https://hunt-ghost-fees.base44.app/"
HOURLY_RATE = 30          # used for the "hours of work" nudge, stated in the reply
# Paid Ghost Packs: first pack free, then $2 a pack or $5 for every pack (AUD), paid
# with Stripe inside ASI:One. Off until you set these Agentverse secrets:
#   PAYMENTS_ENABLED=true, STRIPE_SECRET_KEY=sk_test_..., STRIPE_PUBLISHABLE_KEY=pk_test_...
# Never put the secret key in the code, the chat or a card.
PAYMENTS_ENABLED = os.environ.get("PAYMENTS_ENABLED", "").lower() == "true"
PACK_PRICE_CENTS = 200
ALL_PRICE_CENTS = 500
STRIPE_SUCCESS_URL = os.environ.get("STRIPE_SUCCESS_URL", "https://agentverse.ai/payment-success")
# Set the secret GHOSTIT_ADMIN_CODE in Agentverse (or change the word here), then type: evidence <your code>
ADMIN_CODE = os.environ.get("GHOSTIT_ADMIN_CODE", "change-me")
USE_CARDS = True          # set False to send text only

# "You said, we changed" pairs. Add one each time you ship a fix from feedback.
CHANGES = [
    ("A Fetch.ai mentor", "the reply wasn't clear, why $276 a year?",
     "every reply now says what it did, shows the maths line by line, and uses cards"),
    ("A Fetch.ai mentor", "netflix $8.99 espn plus 11.99 paramount 13.99 (typed without commas)",
     "lists without commas are read item by item, prices without $ are understood, and Paramount+ is no longer read as yearly"),
    ("Raj (Fetch.ai)", "not clear what it does; why $276?",
     "every reply says what it did, shows the maths line by line, and uses cards"),
    ("Builders", "AI tools double up",
     "Cursor, Windsurf, Midjourney, Lovable, Replit, Bolt and v0 now recognised"),
    ("The team", "Ghost It shouldn't repeat the app",
     "Ghost It now fills the gap the bank scan can't see, with a Ghost Pack for each kind of money leak"),
]

# v8: the one line that says what Ghost It is for (Raj: "not clear what it's trying to do").
PURPOSE = ("I hunt the money leaks your bank statement can't show you, with a Ghost Pack for each kind: "
           "streaming, music, AI tools, food, gym and gaming. Tell me what you pay for below.")

# v9: what each Ghost Pack hunts. Ghost Fees (the app) reads a statement; Ghost It fills
# the gap: doubles and overlaps across services, things hidden in Apple or Google bundles
# or on another card, and the cost of habits you only see weekly. Facts here are general
# and true for these services; every dollar figure is worked out from what you tell me.
PACK_HUNTS = {
    "Screen": "streaming services doing the same job; keep one and rotate the rest month to month",
    "Sound": "two music apps at once (YouTube Premium already includes YouTube Music); duo and family plans",
    "Tech Stack": "AI tools that do the same job, and cloud storage paid twice (Microsoft 365 includes 1 TB of OneDrive)",
    "Food": "two delivery passes at once, and a meal kit on top of a delivery pass",
    "Gym and Fitness": "what a weekly membership really costs a year, and a gym plus fitness apps",
    "Play": "two or three gaming passes at once",
}
PACK_EMOJI = {"Screen": "📺", "Sound": "🎧", "Tech Stack": "💻", "Food": "🍔", "Gym and Fitness": "💪", "Play": "🎮"}

DISCLAIMER = "_General information about subscriptions, not financial advice._"

# ---------------------------------------------------------------- catalogue
# link=None means no checked link yet. Never guess a link.
C = {}


def add(key, name, pack, aliases, link=None, steps=None, overlap=None, status=""):
    C[key] = dict(key=key, name=name, pack=pack, aliases=aliases, link=link,
                  steps=steps, overlap=overlap, status=status)


APPLE = "https://support.apple.com/HT202039"
add("netflix", "Netflix", "Screen", ["netflix"], "https://www.netflix.com/cancelplan", "Open the link, confirm cancel", "video")
add("stan", "Stan", "Screen", ["stan"], "https://my.stan.com.au", "Manage Account > Subscription Information > Cancel your subscription (web browser only)", "video")
add("disney", "Disney+", "Screen", ["disney+", "disney plus", "disney"], "https://www.disneyplus.com/account", "Account > Subscription > Cancel subscription", "video", "check once")
add("binge", "BINGE", "Screen", ["binge"], "https://binge.com.au", "My Account > Cancel Subscription. Billed by Telstra? My Telstra > Your subscriptions", "video", "check once")
add("kayo", "Kayo", "Screen", ["kayo"], "https://kayosports.com.au", "My Account > Cancel Subscription. Billed by Telstra? My Telstra", "video", "check once")
add("prime", "Amazon Prime", "Screen", ["amazon prime", "prime video", "prime"], "https://www.amazon.com.au/gp/primecentral", "Prime Membership > Update, cancel and more > End membership", "video", "check once")
add("paramount", "Paramount+", "Screen", ["paramount+", "paramount plus", "paramount"], None, None, "video")
add("appletv", "Apple TV+", "Screen", ["apple tv+", "apple tv"], APPLE, "Settings > your name > Subscriptions > Cancel", "video")
add("foxtel", "Foxtel", "Screen", ["foxtel"], None, None, "video")
add("espn", "ESPN+", "Screen", ["espn plus", "espn+", "espn"], None, None, "video")
add("spotify", "Spotify", "Sound", ["spotify"], "https://support.spotify.com/article/cancel-premium/", "Account > Manage your plan > Cancel subscription", "music")
add("applemusic", "Apple Music", "Sound", ["apple music"], APPLE, "Settings > your name > Subscriptions > Cancel", "music")
add("youtube", "YouTube Premium", "Sound", ["youtube premium", "youtube music", "youtube"], "https://www.youtube.com/paid_memberships", "Manage membership > Deactivate", "music")
add("amazonmusic", "Amazon Music", "Sound", ["amazon music"], None, None, "music")
add("audible", "Audible", "Sound", ["audible"], None, None, None)
add("icloud", "iCloud+", "Tech Stack", ["icloud+", "icloud"], APPLE, "Settings > your name > Subscriptions > Cancel", "storage")
add("googleone", "Google One", "Tech Stack", ["google one"], None, None, "storage")
add("dropbox", "Dropbox", "Tech Stack", ["dropbox"], None, None, "storage")
add("m365", "Microsoft 365", "Tech Stack", ["microsoft 365", "office 365", "m365"], "https://account.microsoft.com/services", "Manage > Cancel subscription", "storage")
add("adobe", "Adobe", "Tech Stack", ["adobe", "creative cloud"], "https://account.adobe.com/plans", "Manage plan > Cancel your plan", "design")
add("canva", "Canva", "Tech Stack", ["canva"], None, None, "design")
add("chatgpt", "ChatGPT", "Tech Stack", ["chatgpt", "openai"], "https://help.openai.com/en/articles/7232927", "Settings > Billing > Cancel plan", "ai")
add("claude", "Claude", "Tech Stack", ["claude"], None, None, "ai")
add("gemini", "Gemini", "Tech Stack", ["gemini"], None, None, "ai")
add("perplexity", "Perplexity", "Tech Stack", ["perplexity"], None, None, "ai")
add("copilot", "Copilot", "Tech Stack", ["copilot"], None, None, "ai")
# v8: builders' AI tools. No checked cancel links yet, so none are guessed.
add("cursor", "Cursor", "Tech Stack", ["cursor"], None, None, "ai")
add("windsurf", "Windsurf", "Tech Stack", ["windsurf", "codeium"], None, None, "ai")
add("midjourney", "Midjourney", "Tech Stack", ["midjourney"], None, None, "ai")
add("lovable", "Lovable", "Tech Stack", ["lovable"], None, None, "ai")
add("replit", "Replit", "Tech Stack", ["replit"], None, None, "ai")
add("bolt", "Bolt", "Tech Stack", ["bolt.new", "bolt"], None, None, "ai")
add("v0", "v0", "Tech Stack", ["v0.dev", "v0"], None, None, "ai")
add("gym", "Gym", "Gym and Fitness", ["anytime fitness", "fitness first", "goodlife", "jetts", "f45", "snap fitness", "plus fitness", "virgin active", "gym"], None, None, None)
add("uberone", "Uber One", "Food", ["uber one", "uber eats"], None, None, "delivery")
add("dashpass", "DashPass", "Food", ["dashpass", "doordash"], None, None, "delivery")
add("hellofresh", "HelloFresh", "Food", ["hellofresh", "hello fresh"], None, None, "mealkit")
add("marleyspoon", "Marley Spoon", "Food", ["marley spoon"], None, None, "mealkit")
add("dinnerly", "Dinnerly", "Food", ["dinnerly"], None, None, "mealkit")
add("youfoodz", "Youfoodz", "Food", ["youfoodz"], None, None, "mealkit")
add("gamepass", "Xbox Game Pass", "Play", ["game pass", "xbox"], None, None, "gaming")
add("psplus", "PlayStation Plus", "Play", ["playstation plus", "ps plus", "psplus", "playstation"], None, None, "gaming")
add("switch", "Nintendo Switch Online", "Play", ["nintendo switch online", "switch online", "nintendo"], None, None, "gaming")
add("nitro", "Discord Nitro", "Play", ["discord nitro", "nitro", "discord"], None, None, None)

OVERLAP_NAMES = {
    "video": "video streaming", "music": "music", "storage": "cloud storage",
    "ai": "AI tools", "design": "design tools", "delivery": "food delivery passes",
    "mealkit": "meal kits", "gaming": "gaming passes",
}
PACKS = ["Screen", "Sound", "Gym and Fitness", "Food", "Tech Stack", "Play"]
PACK_WORDS = {"screen": "Screen", "sound": "Sound", "music": "Sound", "gym": "Gym and Fitness",
              "fitness": "Gym and Fitness", "food": "Food", "tech": "Tech Stack", "play": "Play",
              "gaming": "Play"}

ALIASES = sorted(((a, k) for k, v in C.items() for a in v["aliases"]), key=lambda x: -len(x[0]))

# ---------------------------------------------------------------- helpers
def money(x):
    return f"${x:,.2f}"


def find_merchant(text):
    t = text.lower()
    for alias, key in ALIASES:
        if re.search(r"(?<![a-z])" + re.escape(alias) + r"(?![a-z])", t):
            return key
    return None


# Word boundaries matter: "p.a." must not match the "pa" in "Paramount".
PERIODS = [
    (r"\b(?:week|wk|weekly)\b|/w\b", "wk", 52), (r"\bfortnight", "fortnight", 26),
    (r"\bquarter", "quarter", 4), (r"\b(?:year|yr|yearly|annual|annually)\b|\bp\.?a\.?(?![a-z])|/y\b", "yr", 1),
]

# One "name price [period]" pair, for lists typed without commas, e.g.
# "netflix $8.99 espn plus 11.99 paramount 13.99" (Raj's test, 2 Nov).
PAIR_RE = re.compile(
    r"[^$\d]*?\$?\s*\d+(?:\.\d{1,2})?"
    r"(?:\s*(?:a|per|/|each|every)?\s*(?:week|wk|weekly|fortnight|quarter|year|yr|yearly|annual|month|mo|monthly)\b)?",
    re.I)


def split_pairs(chunk):
    """Split a chunk holding several prices into one piece per price."""
    prices = re.findall(r"\$?\s*\d+(?:\.\d{1,2})?", chunk)
    if len(prices) < 2:
        return [chunk]
    return [m.group(0) for m in PAIR_RE.finditer(chunk) if m.group(0).strip()]


def parse_subs(text):
    """Return (subs, names_without_price). Each sub: key, name, price, per, times."""
    subs, missing = [], []
    chunks = re.split(r",|;|\n|\band\b|\s\+\s|\.\s", text, flags=re.I)
    chunks = [piece for ch in chunks for piece in split_pairs(ch)]
    for ch in chunks:
        key = find_merchant(ch)
        amt = re.search(r"\$\s*(\d+(?:\.\d{1,2})?)|(\d+(?:\.\d{1,2})?)\s*(?:dollars|aud)", ch, re.I)
        if not amt:
            # A bare number counts as a price only if it has cents ("11.99") or
            # follows a known service ("netflix 19"), so "sharehouse of 4" isn't $4.
            bare = re.search(r"(?<![\d.])(\d+\.\d{2})(?![\d.])", ch) or (key and re.search(r"(?<![\d.])(\d+(?:\.\d{1,2})?)(?![\d.])", ch))
            if bare:
                amt = re.match(r"(\d+(?:\.\d{1,2})?)()", bare.group(1))
        if not amt and key is None:
            continue
        if key:
            name = C[key]["name"]
        else:
            name = re.split(r"\$|\d", ch)[0]
            name = re.sub(r"\b(i|we|pay|paying|for|my|a|an|the|also|plus|about|on)\b", " ", name, flags=re.I)
            name = re.sub(r"[^A-Za-z0-9+ &'-]", " ", name).strip().title()
            if not name:
                continue
        if not amt:
            if key not in [s["key"] for s in subs] and name not in missing:
                missing.append(name)
            continue
        price = float(amt.group(1) or amt.group(2))
        per, times = "mo", 12
        for pat, label, n in PERIODS:
            if re.search(pat, ch, re.I):
                per, times = label, n
                break
        subs.append(dict(key=key or name.lower().replace(" ", ""), known=bool(key), name=name,
                         price=price, per=per, times=times))
    return subs, missing


def yearly(s):
    return round(s["price"] * s["times"], 2)


def overlaps(subs):
    groups = {}
    for s in subs:
        o = C[s["key"]]["overlap"] if s["known"] else None
        if o:
            groups.setdefault(o, []).append(s)
    return {k: v for k, v in groups.items() if len(v) >= 2}


def life_stage(text):
    t = text.lower()
    if re.search(r"\bstudent|\buni\b|university", t):
        return "Student tip: some music and streaming services have student plans. Check eligibility on their sites."
    if re.search(r"share ?house|housemate|flatmate", t):
        return "Share house tip: check whether housemates already pay for the same streaming service."
    if re.search(r"\bfamily\b|\bkids\b", t):
        return "Family tip: family plans let one bill cover several people for some music and streaming services."
    if re.search(r"\bcouple\b|partner|wife|husband|girlfriend|boyfriend", t):
        return "Couple tip: duo and family plans let one bill cover two people for some services. Check you're not both paying for the same one."
    return None


def app_link(keys=None):
    link = APP_URL + "?ref=asi1"
    if keys:
        link += "&subs=" + ",".join(k for k in keys[:8])
    return link


def cancel_block(key_or_name):
    m = C.get(key_or_name)
    if not m:
        name = key_or_name
        return (f"**{name}**\n- No checked cancel link yet. Search \"{name} cancel subscription\" "
                f"on their official website, or check your sign-up email.\n"
                "- Signed up on iPhone or Android? Cancel in Apple or Google Play instead.")
    lines = [f"**{m['name']}**"]
    if m["link"]:
        lines.append(f"- Cancel link: {m['link']}")
    else:
        lines.append(f"- No checked cancel link yet. Search \"{m['name']} cancel subscription\" on their official website, or check your sign-up email.")
    if m["steps"]:
        lines.append(f"- Steps: {m['steps']}")
    if m["key"] == "gym":
        lines.append("- Gyms often need notice in writing or in person. Check your contract for the notice period.")
    lines.append("- Signed up on iPhone or Android? Cancel in Apple (Settings > your name > Subscriptions) or Google Play instead.")
    return "\n".join(lines)


def cancel_email(name):
    return (f"Subject: Please cancel my {name} subscription\n\n"
            f"Hi {name} team,\n"
            "Please cancel my subscription linked to this email address, effective immediately, "
            "and confirm in writing that no further charges will be made.\n"
            "Thanks,\n[Your name]")


# ---------------------------------------------------------------- storage
def get(ctx, key, default):
    """Read storage safely. An earlier Ghost It version on Agentverse saved some values
    as JSON text, so a string is parsed, and anything of the wrong shape (a string
    where a dict or list is expected) falls back to the default instead of crashing."""
    v = ctx.storage.get(key)
    if v is None:
        return default
    if isinstance(v, str) and isinstance(default, (dict, list)):
        try:
            v = json.loads(v)
        except (ValueError, TypeError):
            return default
    if isinstance(default, dict) and not isinstance(v, dict):
        return default
    if isinstance(default, list) and not isinstance(v, list):
        return default
    return v


def last_subs(ctx, sender):
    """The subscriptions this person has told us about, skipping anything an older
    version saved in another shape."""
    return [s for s in get(ctx, f"last:{sender}", []) if isinstance(s, dict) and s.get("key") and s.get("name")]


def ghost_list(ctx, sender):
    gl = get(ctx, f"gl:{sender}", {})
    return {k: v for k, v in gl.items() if isinstance(v, dict)}


def save_list(ctx, sender, gl):
    ctx.storage.set(f"gl:{sender}", gl)


def bump(ctx, field, n=1):
    st = get(ctx, "stats", {})
    old = st.get(field, 0)
    # An older version stored some counters as lists; start those again from 0.
    st[field] = (old if isinstance(old, (int, float)) else 0) + n
    ctx.storage.set("stats", st)


def add_to_list(ctx, sender, items):
    gl = ghost_list(ctx, sender)
    today = datetime.now(timezone.utc).strftime("%d %b")
    for s in items:
        k = s["key"]
        if k not in gl or gl[k]["status"] == "Still charging":
            gl[k] = dict(name=s["name"], yearly=yearly(s) if s.get("price") else 0,
                         status="Requested", date=today)
    save_list(ctx, sender, gl)
    bump(ctx, "ghosted", len(items))
    return gl


# ---------------------------------------------------------------- replies
# Each reply returns (text, card) where card is None or (kind, payload).

def help_reply(full=False):
    """v8: vague or first messages get one purpose line and the form card. The full
    command list is for `commands`, and for text-only mode (no cards)."""
    if not full and USE_CARDS:
        return PURPOSE, help_card()
    text = (
        PURPOSE + "\n\n**I'm Ghost It.** I add up what your subscriptions really cost, find the doubles, "
        "give you the real cancel steps, and track that they actually stopped.\n\n"
        "**Try one of these:**\n"
        "1. List what you pay: `Netflix $19, Stan $16, Spotify $14, gym $25 a week`\n"
        "2. Get cancel steps for a category: `screen pack` (also sound, gym, food, tech, play)\n"
        "3. Cancel one: `cancel Stan`\n"
        "4. See your list: `my ghost list`, then `Stan stopped` or `Stan still charging`\n"
        "5. Price rise: `Netflix went from $16.99 to $18.99`\n"
        "6. Tell us what to fix: `feedback: ...`\n\n"
        f"Want the ones you forgot? Scan your bank statement free in the Ghost Fees app: {app_link()}\n\n"
        + DISCLAIMER
    )
    return text, help_card()


def about_reply():
    """"What were you created to do?": the gap Ghost It fills and its Ghost Packs."""
    lines = [
        "**I'm Ghost It.** I hunt the money leaks your bank statement can't show you.",
        "",
        "The Ghost Fees app reads your statement. I fill the gap: doubles across services, "
        "subscriptions hidden in Apple or Google bundles or on another card, and what weekly habits really cost a year. "
        "Each **Ghost Pack** hunts one kind of leak:",
        "",
    ]
    for pack in PACKS:
        lines.append(f"{PACK_EMOJI.get(pack, '')} **{pack}:** {PACK_HUNTS[pack]}")
    lines += [
        "",
        "Every pack shows the maths, then the official cancel steps and a ready email, and I check after 7 days that it stopped.",
        "",
        "**Try it:** `ChatGPT $30, Claude $30, Cursor $30, Copilot $15`, or fill in the card below.",
        "Something unclear? `feedback: ...` and I'll change it.",
        "",
        DISCLAIMER,
    ]
    return "\n".join(lines), help_card()


def help_card():
    return ("form", {
        "title": "What do you pay for?",
        "fields": [
            {"name": "subs", "kind": "text", "label": "Name and price, e.g. Netflix $19, gym $25 a week", "required": True},
            {"name": "who", "kind": "select", "label": "Who's it for? (optional, changes the tips)",
             "options": [{"value": "me", "label": "Just me"}, {"value": "couple", "label": "Couple"},
                         {"value": "family", "label": "Family"}, {"value": "sharehouse", "label": "Share house"},
                         {"value": "student", "label": "Student"}]},
        ],
        "submit_cta": {"label": "Check my subscriptions", "selection": {"action": "check"}},
    })


def check_reply(ctx, sender, text, subs, missing):
    total_y = sum(yearly(s) for s in subs)
    total_m = total_y / 12
    ov = overlaps(subs)
    n = len(subs)

    lines = [f"**What I did:** added up your {n} subscription{'s' if n != 1 else ''} "
             "and checked for doubles.\n", "**The maths**"]
    rows = []
    for s in subs:
        y = yearly(s)
        lines.append(f"- {s['name']}: {money(s['price'])}/{s['per']} x {s['times']} = **{money(y)}/yr**")
        rows.append({"label": s["name"], "value": f"{money(s['price'])}/{s['per']} x {s['times']} = {money(y)}/yr"})
    lines.append(f"\n**Total: {money(total_y)} a year** (about {money(total_m)} a month)")
    hours = total_y / HOURLY_RATE
    lines.append(f"That's about {hours:.0f} hours of work a year at ${HOURLY_RATE}/hr.")
    rows.append({"label": "Total a year", "value": money(total_y)})

    if ov:
        lines.append("\n**Doubles found**")
        for g, items in ov.items():
            gy = sum(yearly(s) for s in items)
            names = ", ".join(s["name"] for s in items)
            lines.append(f"- {len(items)} {OVERLAP_NAMES[g]}: {names} = {money(gy)}/yr. "
                         "Options: keep one, rotate month to month, or pause the rest.")
            rows.append({"label": f"Double-up: {OVERLAP_NAMES[g]}", "value": f"{names} ({money(gy)}/yr)"})
    else:
        lines.append("\nNo doubles found.")
        rows.append({"label": "Double-ups", "value": "None found"})

    lines.append("\nAsk yourself for each one: would you sign up today at this price?")
    tip = life_stage(text)
    if tip:
        lines.append(f"\n{tip}")
    if missing:
        lines.append(f"\nI need a price for: {', '.join(missing)}. Add it like `{missing[0]} $15`.")
    packs = sorted({C[s['key']]['pack'] for s in subs if s['known']})
    if packs:
        lines.append("\n**Your Ghost Packs:** " + ", ".join(f"{PACK_EMOJI.get(p, '')} {p}" for p in packs) +
                     ". Each one hunts its own kind of leak.")
        lines.append("**Next:** type `" + packs[0].split()[0].lower() + " pack` for its leaks and cancel steps, "
                     "or `ghost everything` for all of them.")
        first = next((s["name"] for s in subs if s["known"]), subs[0]["name"])
        lines.append(f"Cancel one: type `cancel {first}`.")
    lines.append(f"\nMost people have more than they remember. Scan your statement free: {app_link([s['key'] for s in subs if s['known']])}")
    lines.append("\n" + DISCLAIMER)

    # Remember everything they've told us, not just this message (newest price wins),
    # so `screen pack` after an AI-tools check still finds their streaming services.
    known = {s["key"]: s for s in last_subs(ctx, sender) if isinstance(s, dict) and "key" in s}
    known.update({s["key"]: s for s in subs})
    ctx.storage.set(f"last:{sender}", list(known.values())[-40:])
    bump(ctx, "checks")
    bump(ctx, "found_yearly_cents", int(round(total_y * 100)))

    card = ("review", {
        "title": f"Your subscriptions: {money(total_y)} a year",
        "summary_rows": rows[:12],
        # Review cards take two buttons: the pack for the first group, and the app.
        "approve_cta": ({"label": f"Get {packs[0]} pack", "primary": True, "selection": {"action": "pack", "pack": packs[0]}}
                        if packs else {"label": "Show cancel steps", "primary": True, "selection": {"action": "ghost_all"}}),
        "reject_cta": {"label": "Scan my statement", "selection": {"action": "scan"}},
    })
    return "\n".join(lines), card


def pack_leaks(items, pack):
    """The specialised leak hunt for one pack, from what the person told us. Plain maths."""
    subs = [s for s in items if s.get("known") and s.get("price") and C[s["key"]]["pack"] == pack]
    keys = {s["key"] for s in subs}
    out = []
    for g, group in overlaps(subs).items():
        total = sum(yearly(s) for s in group)
        cheapest = min(group, key=yearly)
        out.append(f"{len(group)} {OVERLAP_NAMES[g]} ({', '.join(s['name'] for s in group)}) = {money(total)}/yr. "
                   f"Keep just {cheapest['name']} and save {money(total - yearly(cheapest))}/yr, or rotate one a month.")
    if {"spotify", "youtube"} <= keys:
        out.append("YouTube Premium already includes YouTube Music, so Spotify may be a double.")
    if "m365" in keys and keys & {"icloud", "googleone", "dropbox"}:
        out.append("Microsoft 365 already includes 1 TB of OneDrive storage, so another storage plan may be a double.")
    if keys & {"uberone", "dashpass"} and keys & {"hellofresh", "marleyspoon", "dinnerly", "youfoodz"}:
        out.append("A meal kit and a delivery pass at once: check you use both each week.")
    for s in subs:
        if s["per"] == "wk":
            out.append(f"{s['name']} at {money(s['price'])} a week is {money(yearly(s))} a year. Would you pay that up front?")
    return out


def packs_reply():
    lines = ["**Ghost Packs: each one hunts a different kind of money leak**", ""]
    for pack in PACKS:
        lines.append(f"{PACK_EMOJI.get(pack, '')} **{pack} pack:** {PACK_HUNTS[pack]}.")
    lines.append("\nList what you pay (e.g. `Netflix $19, Stan $16, Spotify $14, YouTube Premium $17`) "
                 "and I'll run every pack that fits. Then type a pack, e.g. `screen pack`, for its leaks and cancel steps.")
    lines.append(f"\nFor the ones you've forgotten, the Ghost Fees app reads your bank statement: {app_link()}")
    card = ("carousel", {
        "title": "Ghost Packs",
        "subtitle": "Each one hunts a different kind of money leak",
        "items": [{
            "id": pack.lower().replace(" ", "-"), "title": f"{PACK_EMOJI.get(pack, '')} {pack}",
            "subtitle": "Hunts", "secondary_text": PACK_HUNTS[pack][:120],
            "primary_cta": {"label": f"Run {pack} pack", "selection": {"action": "pack", "pack": pack}},
        } for pack in PACKS],
    })
    return "\n".join(lines), card


def pack_report(ctx, sender, items, pack):
    """v9.1: a pack's leak hunt, shown like the original Ghost It: the maths line by line,
    the leaks with the saving, and a review card with Cancel steps / Scan my statement."""
    priced = [s for s in items if s.get("price")]
    add_to_list(ctx, sender, items)
    ctx.storage.set(f"lastpack:{sender}", pack)
    found = pack_leaks(items, pack)
    total = sum(yearly(x) for x in priced)
    emoji = PACK_EMOJI.get(pack, "")
    lines = [f"{emoji} **{pack} pack** hunts {PACK_HUNTS[pack]}.\n",
             f"**What I did:** checked your {len(items)} subscription{'s' if len(items) != 1 else ''} in this pack "
             "and added them to your ghost list as Requested.\n", "**The maths**"]
    rows = []
    for x in priced:
        line = f"{money(x['price'])}/{x['per']} x {x['times']} = {money(yearly(x))}/yr"
        lines.append(f"- {x['name']}: {line}")
        rows.append({"label": x["name"], "value": line})
    lines.append(f"\n**Pack total: {money(total)} a year**")
    rows.append({"label": "Pack total", "value": f"{money(total)} a year"})
    if found:
        lines.append("\n**Leaks found**")
        lines += [f"- {f}" for f in found]
        rows += [{"label": "Leak" if i == 0 else "", "value": f} for i, f in enumerate(found)]
        saving = sum(sum(yearly(x) for x in g) - yearly(min(g, key=yearly)) for g in overlaps(priced).values())
        if saving > 0:
            rows.append({"label": "You could save", "value": f"{money(saving)} a year"})
    else:
        lines.append("\nNo leaks of this kind in what you told me.")
        rows.append({"label": "Leaks", "value": "None found"})
    lines.append("\n**Cancel links**")
    for x in items:
        link = (C.get(x["key"]) or {}).get("link")
        lines.append(f"- {x['name']}: {link or 'no checked link yet, search their official site'}")
    lines.append("\n**Next:** tap **Cancel steps** for the steps and a ready email, or type `cancel steps`.")
    lines.append("\n" + ("Your first Ghost Pack is free. After that, $2 a pack or $5 for every pack, paid once in the chat."
                         if paying() else "Ghost Packs are free during beta."))
    lines.append("\n" + DISCLAIMER)
    card = ("review", {
        "title": f"{emoji} {pack} pack: {money(total)} a year",
        "summary_rows": [r for r in rows if r["label"] or r["value"]][:12],
        "approve_cta": {"label": "Cancel steps", "primary": True, "selection": {"action": "steps", "pack": pack}},
        "reject_cta": {"label": "Scan my statement", "selection": {"action": "scan"}},
    })
    return "\n".join(lines), card


def ghost_reply(ctx, sender, items, title, browse=False, steps_only=False):
    """browse=True: the person hasn't told us they have these (e.g. `screen pack` before
    listing anything), so show the steps but don't add them to their ghost list.
    steps_only=True: just the cancel steps (after the pack report)."""
    if not items:
        return ("I don't have any subscriptions from you for that yet. List them first, "
                "e.g. `Netflix $19, Stan $16`.", None)
    pack_name = title.replace(" pack", "") if title.endswith(" pack") else None
    if pack_name in PACK_HUNTS and not browse and not steps_only and any(x.get("price") for x in items):
        return pack_report(ctx, sender, items, pack_name)
    if steps_only:
        pack_name = None
    hunt = []
    if pack_name in PACK_HUNTS:
        found = [] if browse else pack_leaks(items, pack_name)
        hunt = [f"{PACK_EMOJI.get(pack_name, '')} **{title} hunts:** {PACK_HUNTS[pack_name]}."]
        if found:
            hunt.append("**Leaks found:**")
            hunt += [f"- {line}" for line in found]
        elif not browse:
            hunt.append("No leaks of this kind in what you told me. Cancel steps below in case you still want them.")
        hunt.append("")
    if browse:
        parts = hunt + [f"**What I did:** got the cancel steps for the {title}. You haven't told me which of these you have, "
                 "so I haven't added any to your ghost list. Type `cancel Netflix` (or any name) to add one.\n"]
    else:
        add_to_list(ctx, sender, items)
        parts = hunt + [f"**What I did:** got the cancel steps for {len(items)} subscription"
                 f"{'s' if len(items) != 1 else ''} and added {'them' if len(items) != 1 else 'it'} "
                 "to your ghost list as Requested.\n"]
    for s in items:
        parts.append(cancel_block(s["key"] if s.get("known") else s["name"]))
        parts.append("")
    first = items[0]["name"]
    parts.append("**Ready-to-send cancel email** (change the name for each):\n```\n" + cancel_email(first) + "\n```")
    parts.append("\n**Next:** once a charge stops, type `<name> stopped`. In 7 days I'll ask if it really stopped. "
                 "Type `my ghost list` any time.")
    if paying():
        parts.append("\nYour first Ghost Pack is free. After that, $2 a pack or $5 for every pack, paid once in the chat.")
    else:
        parts.append("\nGhost Packs are free during beta.")
    parts.append("\n" + DISCLAIMER)

    if len(items) == 1:
        s = items[0]
        m = C.get(s["key"]) if s.get("known") else None
        rows = [{"label": "Cancel link", "value": (m or {}).get("link") or "No checked link yet"},
                {"label": "Steps", "value": (m or {}).get("steps") or f"Search \"{s['name']} cancel subscription\" on their site"},
                {"label": "Bought on a phone?", "value": "Cancel in Apple or Google Play"}]
        if s.get("price"):
            rows.insert(0, {"label": "You'd save", "value": f"{money(yearly(s))} a year"})
        card = ("detail", {
            "title": f"Cancel {s['name']}",
            "summary_rows": rows,
            "ctas": [{"label": "I've cancelled it", "primary": True, "selection": {"action": "stopped", "merchant": s["key"]}},
                     {"label": "My ghost list", "selection": {"action": "list"}}],
        })
    else:
        card = ("carousel", {
            "title": title,
            "subtitle": "Tap one when you've cancelled it",
            "items": [{
                "id": s["key"], "title": s["name"],
                "subtitle": (money(yearly(s)) + " a year") if s.get("price") else "Price not given",
                "secondary_text": ((C.get(s["key"]) or {}).get("steps") or "Search their site for the cancel page")[:120],
                "badges": [{"label": "Requested", "variant": "warning"}],
                "primary_cta": {"label": "I've cancelled it", "selection": {"action": "stopped", "merchant": s["key"]}},
            } for s in items[:10]],
        })
    return "\n".join(parts), card


def list_reply(ctx, sender):
    gl = ghost_list(ctx, sender)
    if not gl:
        return ("Your ghost list is empty. List what you pay, e.g. `Netflix $19, Stan $16`, "
                "then type `ghost everything`.", None)
    today = datetime.now(timezone.utc)
    lines = ["**Your ghost list**"]
    confirmed = 0.0
    rows = []
    for k, g in gl.items():
        nudge = ""
        if g["status"] == "Requested":
            try:
                d = datetime.strptime(g["date"] + f" {today.year}", "%d %b %Y").replace(tzinfo=timezone.utc)
                if (today - d).days >= 7:
                    nudge = " (7+ days: did it stop charging?)"
            except ValueError:
                pass
        if g["status"] == "Stopped":
            confirmed += g.get("yearly", 0)
        amt = f", {money(g['yearly'])}/yr" if g.get("yearly") else ""
        lines.append(f"- {g['name']}: {g['status']} since {g['date']}{amt}{nudge}")
        rows.append({"label": g["name"], "value": f"{g['status']}{amt}"})
    lines.append(f"\n**Confirmed stopped: {money(confirmed)} a year**")
    lines.append("\nUpdate one: `Stan stopped` or `Stan still charging`.")
    rows.append({"label": "Confirmed stopped", "value": f"{money(confirmed)} a year"})
    card = ("review", {
        "title": "Your ghost list",
        "summary_rows": rows[:12],
        "approve_cta": {"label": "Check a new statement", "primary": True, "selection": {"action": "scan"}},
        "reject_cta": {"label": "Add more subscriptions", "selection": {"action": "help"}},
    })
    return "\n".join(lines), card


def status_reply(ctx, sender, key, status):
    gl = ghost_list(ctx, sender)
    match = None
    for k, g in gl.items():
        if k == key or g["name"].lower() == str(key).lower():
            match = k
    if not match:
        return (f"{C.get(key, {}).get('name', key)} isn't on your ghost list yet. Type `cancel {C.get(key, {}).get('name', key)}` first.", None)
    gl[match]["status"] = status
    gl[match]["date"] = datetime.now(timezone.utc).strftime("%d %b")
    save_list(ctx, sender, gl)
    if status == "Stopped":
        bump(ctx, "stopped")
        bump(ctx, "stopped_yearly_cents", int(round(gl[match].get("yearly", 0) * 100)))
    text, card = list_reply(ctx, sender)
    head = (f"**What I did:** marked {gl[match]['name']} as {status}.\n\n" if status == "Stopped" else
            f"**What I did:** marked {gl[match]['name']} as still charging. Try the steps again, "
            "or check if it was billed through Apple, Google Play or your phone/internet provider.\n\n")
    return head + text, card


def price_rise_reply(text, m):
    a, b = float(m.group(1)), float(m.group(2))
    key = find_merchant(text)
    name = C[key]["name"] if key else "That subscription"
    diff = b - a
    return (f"**What I did:** worked out the price rise.\n\n**The maths**\n"
            f"- {name}: {money(b)} - {money(a)} = {money(diff)} more a month\n"
            f"- {money(diff)} x 12 = **{money(diff * 12)} more a year** ({diff / a * 100:.0f}% rise)\n\n"
            f"You agreed to {money(a)}. Would you sign up today at {money(b)}?\n"
            f"Type `cancel {name}` for the steps.\n\n" + DISCLAIMER, None)


def feedback_reply(ctx, sender, body):
    fb = get(ctx, "feedback", [])
    fb.append({"n": len(fb) + 1, "date": datetime.now(timezone.utc).strftime("%d %b %H:%M"),
               "who": sender[-8:], "text": body[:500]})
    ctx.storage.set("feedback", fb)
    bump(ctx, "feedback")
    lines = [f"**Thanks! Logged as feedback #{len(fb)}.** The team reads every one and replies "
             "with what changed.\n", "**What's changed from feedback so far:**"]
    for who, said, changed in CHANGES[-5:]:
        lines.append(f"- {who} said: \"{said}\" We changed: {changed}.")
    return "\n".join(lines), None


def whats_new_reply():
    """Also the answer to ASI:One's pre-filled "What's new with you, Ghost.it?", so it
    starts with what Ghost It is for, then the latest changes, one thing to try and the card."""
    lines = [PURPOSE.replace(" Tell me what you pay for below.", ""), "", "**What's new (from your feedback)**"]
    for who, said, changed in CHANGES[-3:]:
        lines.append(f"- {who} said: \"{said}\" We changed: {changed}.")
    lines.append("\n**Try it:** `ChatGPT $30, Claude $30, Cursor $30, Copilot $15`, or add yours below.")
    lines.append("Something unclear? `feedback: ...` and I'll change it.")
    return "\n".join(lines), help_card()


def evidence_reply(ctx):
    st = get(ctx, "stats", {})
    fb = get(ctx, "feedback", [])
    lines = ["**Evidence (copy into your submission)**",
             f"- Unique users: {st.get('users', 0)}",
             f"- Messages: {st.get('messages', 0)}",
             f"- Subscription checks: {st.get('checks', 0)}",
             f"- $ found (yearly, all users): {money(st.get('found_yearly_cents', 0) / 100)}",
             f"- Subscriptions ghosted (requested): {st.get('ghosted', 0)}",
             f"- Confirmed stopped: {st.get('stopped', 0)} ({money(st.get('stopped_yearly_cents', 0) / 100)}/yr)",
             f"- Card taps: {st.get('card_taps', 0)}",
             f"- Free Ghost Packs used: {st.get('free_packs', 0)}",
             f"- Paid Ghost Packs: {st.get('paid_packs', 0)} ({money(st.get('paid_cents', 0) / 100)} taken)",
             f"- Feedback received: {len(fb)}", "", "**Feedback log**"]
    for f in fb[-30:]:
        lines.append(f"#{f['n']} {f['date']} ({f['who']}): {f['text']}")
    lines.append("\n**You said, we changed**")
    for who, said, changed in CHANGES:
        lines.append(f"- {who}: \"{said}\" -> {changed}")
    return "\n".join(lines), None


# ---------------------------------------------------------------- paid packs
def paying():
    """True only when payments are switched on AND Stripe keys AND the protocol exist."""
    return bool(PAYMENTS_ENABLED and HAVE_PAYMENTS and os.environ.get("STRIPE_SECRET_KEY")
                and os.environ.get("STRIPE_PUBLISHABLE_KEY"))


def packs_for(items):
    """Which Ghost Packs a set of subscriptions belongs to. Unknown services are free."""
    return sorted({C[s["key"]]["pack"] for s in items if s.get("known") and s["key"] in C})


def pack_access(ctx, sender, items, title, everything=False):
    """One free try, then the price. Returns (ok, note). When not ok, the request is
    saved so the paid card can deliver it after Stripe confirms the payment."""
    if not paying():
        return True, ""
    packs = packs_for(items)
    unlocked = get(ctx, f"unlocked:{sender}", [])
    if not packs or "all" in unlocked or all(p in unlocked for p in packs):
        return True, ""
    if not everything and len(packs) == 1 and not get(ctx, f"free_used:{sender}", False):
        ctx.storage.set(f"free_used:{sender}", True)
        ctx.storage.set(f"unlocked:{sender}", unlocked + packs)
        bump(ctx, "free_packs")
        return True, f"🎁 **The {packs[0]} pack is your free one.** More packs are $2 each, or $5 for all."
    cents = ALL_PRICE_CENTS if everything or len(packs) > 1 else PACK_PRICE_CENTS
    ctx.storage.set(f"pending_pay:{sender}", {"items": items, "title": title,
                                              "packs": ["all"] if cents == ALL_PRICE_CENTS else packs, "cents": cents})
    what = "every Ghost Pack" if cents == ALL_PRICE_CENTS else f"the {packs[0]} pack"
    return False, (f"**What I did:** found the cancel steps for {what}.\n\n"
                   f"You've used your free pack, so this one is **${cents / 100:.2f} once** "
                   f"({'every pack, forever' if cents == ALL_PRICE_CENTS else 'or $5.00 for every pack'}). "
                   "Pay with the card below and your cancel steps and emails arrive straight away.\n\n" + DISCLAIMER)


def stripe_call(method, path, data=None):
    """Stripe's REST API with the standard library (no extra package on Agentverse)."""
    body = urllib.parse.urlencode(data).encode() if data else None
    req = urllib.request.Request(f"https://api.stripe.com/v1/{path}", data=body, method=method,
                                 headers={"Authorization": f"Bearer {os.environ.get('STRIPE_SECRET_KEY', '')}"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode())


def create_checkout(sender, cents, label):
    """An embedded Stripe Checkout session, as in Fetch's Stripe example."""
    session = stripe_call("POST", "checkout/sessions", {
        "ui_mode": "embedded",
        "redirect_on_completion": "if_required",
        "mode": "payment",
        "payment_method_types[0]": "card",
        "return_url": f"{STRIPE_SUCCESS_URL}?session_id={{CHECKOUT_SESSION_ID}}",
        "line_items[0][quantity]": "1",
        "line_items[0][price_data][currency]": "aud",
        "line_items[0][price_data][unit_amount]": str(cents),
        "line_items[0][price_data][product_data][name]": f"Ghost It: {label}",
        "line_items[0][price_data][product_data][description]": "Official cancel steps, ready cancel emails and did-it-stop tracking. Paid once.",
        "metadata[user_address]": sender,
        "metadata[service]": "ghost_pack",
    })
    # Every value is a string: the payment protocol's metadata is dict[str, str].
    return {"client_secret": session["client_secret"], "id": session["id"], "checkout_session_id": session["id"],
            "publishable_key": os.environ.get("STRIPE_PUBLISHABLE_KEY", ""), "currency": "aud",
            "amount_cents": str(cents), "ui_mode": "embedded"}


def payment_paid(session_id, sender):
    session = stripe_call("GET", f"checkout/sessions/{urllib.parse.quote(session_id)}")
    return session.get("payment_status") == "paid" and (session.get("metadata") or {}).get("user_address") == sender


async def send_payment_request(ctx, sender):
    pending = get(ctx, f"pending_pay:{sender}", None)
    if not pending:
        return
    label = "every Ghost Pack" if pending["packs"] == ["all"] else f"{pending['packs'][0]} pack"
    try:
        checkout = create_checkout(sender, pending["cents"], label)
    except Exception as e:  # Stripe down or keys wrong: say so, never crash
        ctx.logger.error(f"stripe checkout failed: {e}")
        await ctx.send(sender, make_msg("Payments aren't working right now. Try again in a minute.", None))
        return
    pending["session"] = checkout["id"]
    ctx.storage.set(f"pending_pay:{sender}", pending)
    await ctx.send(sender, RequestPayment(
        accepted_funds=[Funds(currency="AUD", amount=f"{pending['cents'] / 100:.2f}", payment_method="stripe")],
        recipient=str(ctx.agent.address),
        deadline_seconds=1800,
        reference=checkout["id"],
        description=f"Ghost It: {label}. Cancel steps, ready emails and did-it-stop tracking. Paid once.",
        metadata={"stripe": checkout, "service": "ghost_pack"},
    ))
    ctx.logger.info(f"PAY_REQUEST ...{sender[-6:]} {label} {pending['cents']}c")


async def on_commit(ctx, sender, msg):
    """Buyer says they paid: check with Stripe, then complete and deliver the pack."""
    pending = get(ctx, f"pending_pay:{sender}", None)
    ok = (msg.funds.payment_method == "stripe" and msg.transaction_id and pending
          and pending.get("session") == msg.transaction_id)
    try:
        ok = bool(ok and payment_paid(msg.transaction_id, sender))
    except Exception as e:
        ctx.logger.error(f"stripe verify failed: {e}")
        ok = False
    if not ok:
        await ctx.send(sender, CancelPayment(transaction_id=msg.transaction_id,
                                             reason="Payment not completed yet. Please finish checkout."))
        return
    await ctx.send(sender, CompletePayment(transaction_id=msg.transaction_id))
    ctx.storage.set(f"unlocked:{sender}", get(ctx, f"unlocked:{sender}", []) + pending["packs"])
    ctx.storage.set(f"pending_pay:{sender}", None)
    bump(ctx, "paid_packs")
    bump(ctx, "paid_cents", pending["cents"])
    ctx.logger.info(f"PAID ...{sender[-6:]} {pending['packs']} {pending['cents']}c")
    text, card = ghost_reply(ctx, sender, pending["items"], pending["title"])
    await ctx.send(sender, make_msg("**Paid, thank you!** 👻 Here are your cancel steps.\n\n" + text, card))


async def on_reject(ctx, sender, msg):
    ctx.storage.set(f"pending_pay:{sender}", None)
    await ctx.send(sender, make_msg("No worries, nothing was charged. Your free check and ghost list still work. "
                                    "Type `my ghost list` any time.", None))


# ---------------------------------------------------------------- router
def gated_ghost(ctx, sender, items, title, everything=False, browse=False, steps_only=False):
    ok, note = pack_access(ctx, sender, items, title, everything)
    if not ok:
        return note, None
    text, card = ghost_reply(ctx, sender, items, title, browse=browse, steps_only=steps_only)
    return ((note + "\n\n" + text) if note else text), card


def route(ctx, sender, raw):
    text = raw.strip()
    text = re.sub(r"^@\S+\s*", "", text)   # strip @ghostit
    low = text.lower()

    # 1. Card taps arrive as JSON (direct @mention) ...
    sel = None
    try:
        obj = json.loads(text)
        if isinstance(obj, dict) and obj.get("action"):
            sel = obj
    except (ValueError, TypeError):
        pass
    # ... or as planner prose. Map the key phrases.
    if sel is None:
        if re.fullmatch(r"\s*cancel steps\s*", low):
            sel = {"action": "steps"}
        elif re.search(r"show cancel steps|ghost_all", low):
            sel = {"action": "ghost_all"}
        elif re.search(r"\bget (?:the )?(screen|sound|gym and fitness|gym|food|tech stack|tech|play) pack\b", low):
            word = re.search(r"\bget (?:the )?(screen|sound|gym and fitness|gym|food|tech stack|tech|play) pack\b", low).group(1).split()[0]
            sel = {"action": "pack", "pack": PACK_WORDS.get(word, "Screen")}
        elif re.search(r"scan my statement|check a new statement|\bscan\b", low) and "$" not in low:
            sel = {"action": "scan"}
        elif re.search(r"(i've|i have) cancelled", low):
            k = find_merchant(low)
            if k:
                sel = {"action": "stopped", "merchant": k}

    if sel:
        bump(ctx, "card_taps")
        a = sel.get("action")
        if a == "check":
            subs_text = str(sel.get("subs", "")) + " " + str(sel.get("who", ""))
            subs, missing = parse_subs(subs_text)
            if subs:
                return check_reply(ctx, sender, subs_text, subs, missing)
            return help_reply()
        if a == "pack":
            pack = sel.get("pack") if sel.get("pack") in PACKS else "Screen"
            last = [s for s in last_subs(ctx, sender) if s.get("known") and C[s["key"]]["pack"] == pack]
            if not last:
                browse = [dict(key=k, known=True, name=v["name"], price=None) for k, v in C.items() if v["pack"] == pack][:8]
                return gated_ghost(ctx, sender, browse, f"{pack} pack", browse=True)
            return gated_ghost(ctx, sender, last, f"{pack} pack")
        if a == "steps":
            pack = sel.get("pack") if sel.get("pack") in PACKS else get(ctx, f"lastpack:{sender}", "Screen")
            items = [x for x in last_subs(ctx, sender) if x.get("known") and C[x["key"]]["pack"] == pack]
            return gated_ghost(ctx, sender, items, f"Cancel steps: {pack} pack", steps_only=True)
        if a == "ghost_all":
            return gated_ghost(ctx, sender, last_subs(ctx, sender), "Cancel steps", everything=True)
        if a == "scan":
            last = last_subs(ctx, sender)
            return (f"Scan your bank statement free (CSV or PDF, no bank login): "
                    f"{app_link([s['key'] for s in last if s.get('known')])}\n"
                    "It finds the subscriptions you forgot, trials that turned paid, and price rises.", None)
        if a == "stopped":
            return status_reply(ctx, sender, sel.get("merchant", ""), "Stopped")
        if a == "list":
            return list_reply(ctx, sender)
        if a == "help":
            return help_reply()

    # 2. Typed commands
    if re.search(r"\b(delete|erase|forget|wipe)\b.*\b(my data|my info\w*|my details|my list|everything|all my)\b", low):
        # Privacy promise in the README: forget this person's list and last check.
        ctx.storage.set(f"gl:{sender}", {})
        ctx.storage.set(f"last:{sender}", [])
        return ("**What I did:** deleted your subscriptions and ghost list. I no longer hold anything about you. 👻\n\n"
                "Start again any time by listing what you pay, e.g. `Netflix $19, Stan $16`.", None)
    if low.startswith("feedback"):
        return feedback_reply(ctx, sender, text.split(":", 1)[-1].strip() if ":" in text else text[8:].strip())
    if low.startswith("evidence"):
        code = text[8:].strip()
        if ADMIN_CODE != "change-me" and code == ADMIN_CODE:
            return evidence_reply(ctx)
        return ("Evidence is for the Ghost It team only.", None)
    if re.search(r"(created|made|built|designed) (you )?(to|for)|what (were|are) you (for|made|built|created)|who are you|what is this|what are you|about you|your purpose", low):
        return about_reply()
    if re.fullmatch(r"\s*(packs?|ghost packs?|what packs\??|list packs|show packs)\s*", low):
        return packs_reply()
    if re.fullmatch(r"\s*(commands|menu|what can you do\??|all commands)\s*", low):
        return help_reply(full=True)
    if re.search(r"what'?s new|changelog", low):
        return whats_new_reply()
    if re.search(r"ghost ?list|my list", low):
        return list_reply(ctx, sender)
    m = re.search(r"from \$?\s*(\d+(?:\.\d{1,2})?) to \$?\s*(\d+(?:\.\d{1,2})?)", low)
    if m:
        return price_rise_reply(text, m)
    m = re.search(r"(.+?)\s+(stopped|still charging)\b", low)
    if m and "$" not in low:
        key = find_merchant(m.group(1)) or m.group(1).strip()
        return status_reply(ctx, sender, key, "Stopped" if m.group(2) == "stopped" else "Still charging")
    if re.search(r"ghost everything|all packs|ghost all|cancel all", low):
        return gated_ghost(ctx, sender, last_subs(ctx, sender), "Cancel steps for everything", everything=True)
    pm = re.search(r"\b(screen|sound|music|gym|fitness|food|tech|play|gaming)\s+pack\b", low)
    if pm:
        pack = PACK_WORDS[pm.group(1)]
        last = [s for s in last_subs(ctx, sender) if s.get("known") and C[s["key"]]["pack"] == pack]
        if not last:
            browse = [dict(key=k, known=True, name=v["name"], price=None) for k, v in C.items() if v["pack"] == pack][:8]
            return gated_ghost(ctx, sender, browse, f"{pack} pack", browse=True)
        return gated_ghost(ctx, sender, last, f"{pack} pack")
    cm = re.search(r"\b(cancel|ghost|stop)\b\s+(.+)", low)
    if cm and "$" not in low:
        key = find_merchant(cm.group(2))
        last = {s["key"]: s for s in last_subs(ctx, sender)}
        if key:
            s = last.get(key) or dict(key=key, known=True, name=C[key]["name"], price=None)
            return gated_ghost(ctx, sender, [s], f"Cancel {C[key]['name']}")
        name = cm.group(2).strip(" ?.!").title()
        return ghost_reply(ctx, sender, [dict(key=name.lower(), known=False, name=name, price=None)], f"Cancel {name}")

    # 3. A list of subscriptions
    subs, missing = parse_subs(text)
    if subs:
        return check_reply(ctx, sender, text, subs, missing)
    if missing:
        names = ", ".join(missing)
        return (f"**What I did:** found {names}, but no prices yet, so I can't add them up.\n\n"
                f"Add prices like `{missing[0]} $19, ...` and I'll show the yearly cost and any doubles.\n"
                f"Want to cancel now? Type `cancel {missing[0]}`.\n\n"
                f"Scan your statement free to see the exact amounts: {app_link()}", None)
    return help_reply()


# ---------------------------------------------------------------- chat protocol
agent = Agent()
protocol = Protocol(spec=chat_protocol_spec)


def make_msg(text, card):
    content = [TextContent(type="text", text=text)]
    if card and USE_CARDS:
        kind, payload = card
        content.append(MetadataContent(type="metadata", metadata={
            "card_protocol_version": "1",
            "requires_card_interaction": "true",
            "card_kind": kind,
            "card_payload": json.dumps(payload),
            "preferred_drawer_width_px": "540",
        }))
    return ChatMessage(timestamp=datetime.now(timezone.utc), msg_id=uuid4(), content=content)


@protocol.on_message(ChatMessage)
async def handle_message(ctx: Context, sender: str, msg: ChatMessage):
    await ctx.send(sender, ChatAcknowledgement(timestamp=datetime.now(timezone.utc),
                                               acknowledged_msg_id=msg.msg_id))
    raw = " ".join(c.text for c in msg.content if isinstance(c, TextContent)).strip()
    if not raw:
        return
    try:
        if not ctx.storage.get(f"seen:{sender}"):
            ctx.storage.set(f"seen:{sender}", True)
            bump(ctx, "users")
        bump(ctx, "messages")
    except Exception as e:  # counters must never stop a reply
        ctx.logger.error(f"stats error: {e}")
    try:
        text, card = route(ctx, sender, raw)
    except Exception as e:  # never crash on odd input
        ctx.logger.error(f"route error: {type(e).__name__}: {e}")
        text, card = help_reply()
    await ctx.send(sender, make_msg(text, card))
    pending = get(ctx, f"pending_pay:{sender}", None)
    if paying() and isinstance(pending, dict) and not pending.get("session"):
        await send_payment_request(ctx, sender)


@protocol.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    pass


agent.include(protocol, publish_manifest=True)

# Paid Ghost Packs: the seller side of Fetch's Agent Payment Protocol.
if HAVE_PAYMENTS:
    payment_proto = Protocol(spec=payment_protocol_spec, role="seller")

    @payment_proto.on_message(CommitPayment)
    async def handle_commit(ctx: Context, sender: str, msg: CommitPayment):
        await on_commit(ctx, sender, msg)

    @payment_proto.on_message(RejectPayment)
    async def handle_reject(ctx: Context, sender: str, msg: RejectPayment):
        await on_reject(ctx, sender, msg)

    agent.include(payment_proto, publish_manifest=True)

if __name__ == "__main__":
    agent.run()
