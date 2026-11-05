# Ghost It: subscription ghosting agent for ASI:One (Agentverse hosted agent)
# v13.5 (5 Nov 2026): `version` reply and a version line under the menu (ASI:One sync check).
# v13.2 (4 Nov 2026): reply sent before the receipt (ASI:One timeout).
# v13 (4 Nov 2026): tap buttons (Fetch.ai feedback), evidence line, Mark ghosted approval, trust line. Text and card in one message, cards on; suggested commands become buttons.
# v12 (3 Nov 2026): text-first. Cards off by default (blank in ASI:One); numbered menu, reply with a number; one-line purpose.
# v11.4 (3 Nov 2026): text and cards sent as separate messages; GHOSTIT_CARDS=off for text only.
# v11.3 (3 Nov 2026): first replies also list the tap-to-try prompts as text (in case cards don't show).
# v11.1 (3 Nov 2026): ASI:One's pre-filled "What's new with you?" gets a welcome and tap cards, not the changelog.
# v11 (3 Nov 2026): consolidate plan (keep one, cancel or rotate the rest, bundle tips).
# v10.1 (3 Nov 2026): answer first with the saving; spend, pay-per-use and bills replies.
# v10 (3 Nov 2026): explanation cards, tap-to-try prompts, Stripe paywall card ($2 or $5).
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
# Paid Ghost Packs: first pack free, then $5 once unlocks every pack (AUD), paid
# with Stripe inside ASI:One. Off until you set these Agentverse secrets:
#   PAYMENTS_ENABLED=true, STRIPE_SECRET_KEY=sk_test_..., STRIPE_PUBLISHABLE_KEY=pk_test_...
# Never put the secret key in the code, the chat or a card.
PAYMENTS_ENABLED = os.environ.get("PAYMENTS_ENABLED", "").lower() == "true"
PACK_PRICE_CENTS = 500   # 3 Nov: one price. First pack free, then $5 once for all
ALL_PRICE_CENTS = 500
STRIPE_SUCCESS_URL = os.environ.get("STRIPE_SUCCESS_URL", "https://agentverse.ai/payment-success")
# Set the secret GHOSTIT_ADMIN_CODE in Agentverse (or change the word here), then type: evidence <your code>
ADMIN_CODE = os.environ.get("GHOSTIT_ADMIN_CODE") or os.environ.get("GHOST_IT_ADMIN_CODE") or "change-me"
# Cards on/off without a code change: Agentverse secret GHOSTIT_CARDS=off sends text only.
# v13 (4 Nov): cards back on. They showed blank on 3 Nov because each card went in its own
# message with no text, and requires_card_interaction was "false". The docs want the text and
# the card in ONE message, and "true" so the buttons work. If a card fails validation ASI:One
# shows the text alone. GHOSTIT_CARDS=off turns them off again.
USE_CARDS = os.environ.get("GHOSTIT_CARDS", "on").lower() != "off"

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
    ("The founders", "help me consolidate my double-ups and triple-ups",
     "`consolidate` gives a plan: keep one, cancel the rest or rotate month by month, with bundle and sharing tips"),
    ("The team", "Ghost It shouldn't repeat the app",
     "Ghost It now fills the gap the bank scan can't see, with a Ghost Pack for each kind of money leak"),
    ("Raj (Fetch.ai), 4 Nov", "tap buttons instead of typing; the link opened the mobile app",
     "every reply has buttons (Consolidate, Get pack, Ghost one, Scan, Mark ghosted, It stopped) and links open the web chat"),
    ("Kingan (Tool Offer agent), 4 Nov", "show the evidence; the person approves; never touch money",
     "each total shows what you typed and the maths, nothing counts until you tap Mark ghosted, and a trust line up front"),
]

# v13 (Kingan, 4 Nov): say plainly that Ghost It never touches money. People decide.
TRUST = "🔒 Ghost It never touches your bank, cards or accounts. It only shows you what to cancel. You decide."
# v8: the one line that says what Ghost It is for (Raj: "not clear what it's trying to do").
# v13.5 (5 Nov): version marker. Fetch.ai (Raj, 5 Nov) said ASI:One can lag behind
# Agentverse after an update, so `version` shows which code actually answered.
VERSION = "v13.5"
STARTED_UTC = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")


def version_reply():
    return (f"👻 **Ghost It {VERSION}** (running since {STARTED_UTC}).\n\n"
            "If you see an older version here, ASI:One is still syncing with Agentverse. "
            "That's a known Fetch.ai delay, and it catches up on its own."), None


PURPOSE = ("👻 **I'm Ghost It. I find subscriptions you pay for twice, and help you cancel them.**\n\n"
           "Streaming, music, AI tools, food, gym and gaming. Real maths, checked cancel links, first pack free. "
           "Tell me what you pay for below.\n\n" + TRUST)


def try_next(*ideas):
    """A short 'Try next' list after a reply, so people always know what to send."""
    return "\n**Try next:** " + " · ".join(f"`{i}`" for i in ideas if i)

# v9.3: typical Australian prices, the same checked list the Ghost Fees app shows
# (src/data/commonSubs.js, checked 2 Nov 2026). Only used when someone names a service
# without a price, and always labelled as typical, never as theirs.
TYPICAL = {
    "netflix": (9.99, 28.99, "Tom's Guide, Oct 2026"), "stan": (9.99, 23.99, "WhistleOut, Jul 2026"),
    "disney": (9.99, 24.99, "Tom's Guide, Apr 2026"), "binge": (10.00, 22.00, "Tom's Guide, Oct 2026"),
    "kayo": (29.99, 45.99, "EFTM, Jan 2026"), "paramount": (7.99, 17.99, "CompareTV, Oct 2026"),
    "prime": (12.99, 12.99, "Finder, Oct 2026"), "appletv": (15.99, 15.99, "Tom's Guide, Oct 2026"),
    "spotify": (15.99, 27.99, "Selectra, Jun 2026"), "icloud": (1.49, 89.99, "Apple"),
    "m365": (16.00, 33.00, "Microsoft"), "gamepass": (12.95, 25.95, "Press Start, Apr 2026"),
    "uberone": (9.99, 9.99, "Uber"),
}
TYPICAL_CHECKED = "2 Nov 2026"

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
    "video": "video streaming apps", "music": "music apps", "storage": "cloud storage plans",
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
        # The period must come right after the price ("$25 a week", "$120/yr"), so
        # "... and Spotify ($13.99/month) per year" isn't read as yearly.
        after = ch[ch.find(amt.group(0)) + len(amt.group(0)):][:16] if amt.group(0) in ch else ch
        if re.match(r"\s*(?:/|a|per|each|every)?\s*(?:month|mo|monthly)\b", after, re.I):
            after = ""
        for pat, label, n in PERIODS:
            if re.search(pat, after, re.I):
                per, times = label, n
                break
        subs.append(dict(key=key or name.lower().replace(" ", ""), known=bool(key), name=name,
                         price=price, per=per, times=times, said=ch.strip()[:60]))
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
    if not full:
        return PURPOSE.replace(" Tell me what you pay for below.", "") + "\n\n" + quick_start_text(), quick_start_card()
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
    # The tap-to-try cards go with every opener, including the full command list.
    return text, (quick_start_card() if USE_CARDS else help_card())


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
        quick_start_text(),
        "",
        "Something unclear? `feedback: ...` and I'll change it.",
        "",
        DISCLAIMER,
    ]
    return "\n".join(lines), quick_start_card()


# v9.4: tap-to-try examples, so the first reply is something to press, not a blank form.
QUICK_STARTS = [
    ("🎧 Paying twice for music?", "Spotify $14, YouTube Premium $17", "Sound pack"),
    ("💻 Too many AI tools?", "ChatGPT $30, Claude $30, Cursor $30, Copilot $15", "Tech Stack pack"),
    ("🧩 Which one should I keep?", "Netflix $19, Stan $16, Disney+ $16. Which one should I keep?", "Consolidate plan"),
    ("💪 What does my gym really cost?", "gym $25 a week", "Gym pack"),
]


MENU = [example for _, example, _ in QUICK_STARTS] + ["How does it work?", "packs",
        "Is it free?", "Is my data safe?", "How do you calculate it?", "what's new"]
# Short, plain menu lines. ASI:One joins single line breaks and shows backticks, so
# each line is its own paragraph and examples are plain text (3 Nov).
MENU_LABELS = [
    "🎧 Music: am I paying twice? (Spotify + YouTube Premium)",
    "💻 AI tools: too many? (ChatGPT, Claude, Cursor, Copilot)",
    "🧩 Streaming: which one should I keep? (Netflix, Stan, Disney+)",
    "💪 Gym: what does $25 a week cost a year?",
    "❓ How does it work?",
    "👻 See all six Ghost Packs",
]
# Common questions, numbered on from the menu (3 Nov: "list the common questions under hi").
QUESTION_LABELS = ["💳 Is it free?", "🔒 Is my data safe?", "🧮 How do you work out the numbers?", "🆕 What's new?"]


def quick_start_text():
    """The preloaded prompts as a numbered menu. Reply with just the number."""
    lines = ["**Reply with a number to try one:**"]
    lines += [f"**{i}.** {label}" for i, label in enumerate(MENU_LABELS, 1)]
    lines.append("**Common questions:**")
    lines += [f"**{i}.** {label}" for i, label in enumerate(QUESTION_LABELS, len(MENU_LABELS) + 1)]
    lines.append("Or just tell me what you pay for, like: Netflix $19, gym $25 a week")
    lines.append(f"_Ghost It {VERSION} · type `version` to check_")
    return "\n\n".join(lines)


def quick_start_card():
    return ("carousel", {
        "title": "Tap one to try a Ghost Pack",
        "subtitle": "Or type what you pay for, e.g. Netflix $19, gym $25 a week",
        "items": [{
            "id": f"qs{i}", "title": title, "subtitle": pack, "secondary_text": example,
            "primary_cta": {"label": "Try this", "selection": {"action": "check", "subs": example}},
        } for i, (title, example, pack) in enumerate(QUICK_STARTS)] + [{
            "id": "qs-own", "title": "✍️ Use my own", "subtitle": "Add what you pay for",
            "secondary_text": "Name and price, weekly or monthly",
            "primary_cta": {"label": "Add mine", "selection": {"action": "form"}},
        }, {
            "id": "qs-how", "title": "❓ How does it work?", "subtitle": "30-second explainer",
            "secondary_text": "What I do, what's free, what I keep about you",
            "primary_cta": {"label": "Explain", "selection": {"action": "explain"}},
        }],
    })


# v10: explanation cards. Each one answers a question people ask before they trust an
# agent with their money: how it works, what a pack is, what it costs, how the maths
# works, what I keep. A carousel menu, then one detail card per topic.
EXPLAINERS = {
    "how": ("❓ How Ghost It works", [
        ("1. Tell me", "What you pay for, e.g. Netflix $19, gym $25 a week"),
        ("2. The maths", "I work out the real yearly cost, line by line"),
        ("3. Ghost Packs", "Each pack hunts one kind of leak and shows what you'd save"),
        ("4. Consolidate", "Keep one, cancel or rotate the rest, with the saving"),
        ("5. Cancel", "Official cancel links, the steps and a ready email"),
        ("6. Check", "After 7 days I ask if the charge really stopped"),
    ], ("Try an example", {"action": "check", "subs": "Netflix $19, Stan $16, Disney+ $16"}), "packs"),
    "packs": ("👻 What's a Ghost Pack?", [
        ("What it is", "A hunt for one kind of money leak"),
    ] + [(f"{PACK_EMOJI[p]} {p}", PACK_HUNTS[p][:90]) for p in ["Screen", "Sound", "Tech Stack", "Food", "Gym and Fitness", "Play"]],
        ("See all packs", {"action": "packs"}), "price"),
    "price": ("💳 What does it cost?", [
        ("Your first pack", "Free"),
        ("Every other pack", "$5 AUD once, unlocks them all forever"),
        ("Subscription", "Never. Ghost It won't become another subscription"),
        ("How you pay", "Card checkout by Stripe, right inside the chat"),
        ("Always free", "Adding up your subscriptions, doubles and your ghost list"),
    ], ("Try my free pack", {"action": "check", "subs": "Spotify $14, YouTube Premium $17"}), "maths"),
    "maths": ("🧮 How I do the maths", [
        ("Weekly", "price x 52"), ("Fortnightly", "price x 26"), ("Monthly", "price x 12"),
        ("Yearly", "price x 1"),
        ("Saving", "the pack total minus the cheapest one you keep"),
        ("No guessing", "Plain maths, no AI guessing. Typical prices are labelled typical, with a source"),
    ], ("Try the gym maths", {"action": "check", "subs": "gym $25 a week"}), "data"),
    "data": ("🔒 What I keep about you", [
        ("I keep", "The subscriptions you tell me and your ghost list"),
        ("I never see", "Your bank, email or card details (Stripe handles payment)"),
        ("Delete it", "Type `delete my data` and it's gone"),
        ("Financial advice", "No: general information about subscriptions, not financial advice"),
    ], ("Start with mine", {"action": "form"}), "how"),
}
EXPLAIN_WORDS = {"how": "how", "pack": "packs", "packs": "packs", "price": "price", "cost": "price",
                 "maths": "maths", "math": "maths", "data": "data", "privacy": "data"}


def explain_menu_reply():
    lines = ["**Quick explainers.** Tap one, or just tell me what you pay for.", ""]
    lines += [f"- {t}" for t, *_ in EXPLAINERS.values()]
    card = ("carousel", {
        "title": "How Ghost It works",
        "subtitle": "Tap a question",
        "items": [{
            "id": f"ex-{k}", "title": t, "subtitle": rows[0][0], "secondary_text": rows[0][1][:120],
            "primary_cta": {"label": "Tell me", "selection": {"action": "explain", "topic": k}},
        } for k, (t, rows, _, _) in EXPLAINERS.items()],
    })
    return "\n".join(lines), card


def explain_reply(topic):
    if topic not in EXPLAINERS:
        return explain_menu_reply()
    title, rows, (try_label, try_sel), nxt = EXPLAINERS[topic]
    lines = [f"**{title}**", ""] + [f"- **{a}:** {b}" for a, b in rows]
    if topic == "price" and not paying():
        lines.append("\n_Right now Ghost Packs are free while we're in beta._")
    lines.append(try_next(try_label.lower() if try_sel.get("action") != "check" else try_sel["subs"],
                          f"explain {nxt}"))
    card = ("detail", {
        "title": title,
        "summary_rows": [{"label": a, "value": b} for a, b in rows],
        "ctas": [{"label": try_label, "primary": True, "selection": try_sel},
                 {"label": f"Next: {EXPLAINERS[nxt][0]}", "selection": {"action": "explain", "topic": nxt}}],
    })
    return "\n".join(lines), card


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

    # Same groups and keep-one rule as the consolidate plan, so the numbers always match.
    groups = plan_groups([x for x in subs if x.get("known") and x.get("price")])
    saving = sum(sum(yearly(x) for x in grp) - yearly(min(grp, key=yearly)) for _, _, grp in groups)
    if groups and saving > 0:
        _, label, items_ = max(groups, key=lambda t: len(t[2]))
        head = (f"👻 **{money(total_y)} a year, and {len(items_)} {label} do the same job.** "
                f"Keep {'one' if len(groups) == 1 else 'one of each'} and save up to **{money(saving)} a year**. "
                "Tap **🧩 Consolidate** below for the plan.")
    else:
        head = f"👻 **{money(total_y)} a year** across {n} regular payment{'s' if n != 1 else ''}. No doubles."
    lines = [head, "", f"**What I did:** added up your {n} payment{'s' if n != 1 else ''} "
             "and checked for doubles.\n", "**The maths**"]
    rows = []
    for s in subs:
        y = yearly(s)
        lines.append(f"- {s['name']}: {money(s['price'])}/{s['per']} x {s['times']} = **{money(y)}/yr**")
        rows.append({"label": s["name"], "value": f"{money(s['price'])}/{s['per']} x {s['times']} = {money(y)}/yr"})
    # v13 (Kingan's evidence idea): show exactly what each number came from.
    said = [f"\"{x['said']}\"" for x in subs if x.get("said")]
    if said:
        lines.append("**From your message:** " + " · ".join(said[:10]))
    lines.append("Every number is what you told me times how often it's charged. Nothing guessed.")
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
    keys = {s["key"] for s in subs}
    if {"spotify", "youtube"} <= keys:
        lines.append("- **Yes, you're paying twice for music:** YouTube Premium already includes YouTube Music.")
        rows.append({"label": "Bundle", "value": "YouTube Premium includes YouTube Music"})

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
        lines.append("**Next:** tap a button below, or type `" + packs[0].split()[0].lower() + " pack` for its leaks "
                     "and cancel steps, or `ghost everything` for all of them.")
        first = next((s["name"] for s in subs if s["known"]), subs[0]["name"])
        lines.append(f"Cancel one: type `cancel {first}`.")
    lines.append(f"\nMost people have more than they remember. Scan your statement free: {app_link([s['key'] for s in subs if s['known']])}")
    first_pack = (packs[0].split()[0].lower() + " pack") if packs else "packs"
    lines.append(try_next("consolidate" if ov else first_pack, first_pack if ov else f"cancel {subs[0]['name']}", "my ghost list"))
    lines.append("\n" + DISCLAIMER)

    # Remember everything they've told us, not just this message (newest price wins),
    # so `screen pack` after an AI-tools check still finds their streaming services.
    known = {s["key"]: s for s in last_subs(ctx, sender) if isinstance(s, dict) and "key" in s}
    known.update({s["key"]: s for s in subs})
    ctx.storage.set(f"last:{sender}", list(known.values())[-40:])
    bump(ctx, "checks")
    bump(ctx, "found_yearly_cents", int(round(total_y * 100)))

    first_known = next((x for x in subs if x["known"]), subs[0])
    ctas = []
    if ov:
        ctas.append({"label": "🧩 Consolidate", "primary": True, "selection": {"action": "consolidate"}})
    if packs:
        ctas.append(dict({"label": f"🎒 Get {packs[0]} pack", "selection": {"action": "pack", "pack": packs[0]}}, **({} if ov else {"primary": True})))
    ctas.append({"label": f"✂️ Ghost {first_known['name']}", "selection": {"action": "say", "text": f"cancel {first_known['name']}"}})
    ctas.append({"label": "🔍 Scan my statement", "selection": {"action": "scan"}})
    card = ("detail", {"title": f"Your subscriptions: {money(total_y)} a year", "summary_rows": rows[:12], "ctas": ctas[:4]})
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


def typical_reply(ctx, sender, names):
    """Services named without prices: typical yearly ranges, doubles, and what to send next."""
    keys = []
    for n in names:
        k = find_merchant(n)
        if k and k not in keys:
            keys.append(k)
    items = [dict(key=k, known=True, name=C[k]["name"], price=None) for k in keys]
    lines = ["**What I did:** you didn't give prices, so I used typical Australian prices "
             f"(checked {TYPICAL_CHECKED}). Send yours for exact maths, e.g. `{items[0]['name'] if items else 'Netflix'} $19`.\n",
             "**Typical cost a year**"]
    rows, low_total, high_total, unknown = [], 0.0, 0.0, []
    for x in items:
        t = TYPICAL.get(x["key"])
        if not t:
            unknown.append(x["name"])
            continue
        lo, hi, src = t
        low_total += lo * 12
        high_total += hi * 12
        rng = money(lo * 12) if lo == hi else f"{money(lo * 12)} to {money(hi * 12)}"
        per = money(lo) if lo == hi else f"{money(lo)} to {money(hi)}"
        lines.append(f"- {x['name']}: {per}/mo x 12 = **{rng}/yr** ({src})")
        rows.append({"label": x["name"], "value": f"{rng}/yr (typical)"})
    if low_total:
        both = money(low_total) if low_total == high_total else f"{money(low_total)} to {money(high_total)}"
        lines.append(f"\n**Typically {both} a year together.**")
        rows.append({"label": "Typical total", "value": f"{both} a year"})
    if unknown:
        lines.append(f"\nI don't have a checked typical price for {', '.join(unknown)}. Send what you pay, e.g. `{unknown[0]} $5`.")
    ov = overlaps(items)
    if ov:
        lines.append("\n**Doubles found**")
        for g, group in ov.items():
            lines.append(f"- {len(group)} {OVERLAP_NAMES[g]}: {', '.join(x['name'] for x in group)}. "
                         "Options: keep one, rotate month to month, or pause the rest.")
            rows.append({"label": f"Double-up: {OVERLAP_NAMES[g]}", "value": ", ".join(x["name"] for x in group)})
        extra = [x for x in ov.get("music", [])]
        if {"spotify", "youtube"} <= set(keys):
            lines.append("- YouTube Premium already includes YouTube Music, so Spotify may be a double.")
    else:
        lines.append("\nNo doubles between these.")
    ctx.storage.set(f"last:{sender}", list({x["key"]: x for x in last_subs(ctx, sender) + items}.values())[-40:])
    packs = sorted({C[k]["pack"] for k in keys})
    if packs:
        lines.append(f"\n**Next:** send your real prices, or type `{packs[0].split()[0].lower()} pack` for the cancel steps.")
    lines.append(try_next(f"{items[0]['name']} $19" if items else "Netflix $19", (packs[0].split()[0].lower() + " pack") if packs else "packs"))
    lines.append("\n_Typical prices, not yours. General information, not financial advice._")
    card = ("review", {
        "title": "Typical cost of what you named",
        "summary_rows": rows[:12],
        "approve_cta": ({"label": f"Get {packs[0]} pack", "primary": True, "selection": {"action": "pack", "pack": packs[0]}}
                        if packs else {"label": "Add my prices", "primary": True, "selection": {"action": "help"}}),
        "reject_cta": {"label": "Scan my statement", "selection": {"action": "scan"}},
    })
    return "\n".join(lines), card


def spend_reply():
    """'How much am I spending?': the one thing I need, and a form to give it."""
    return ("**Let's find out.** I can't see your bank, so tell me what you pay and I'll add up the year line by line.\n\n"
            "Type it like this: `Netflix $19, Spotify $14, gym $25 a week, phone $45`. Bills work too: `electricity $540 a quarter`.\n\n"
            f"Don't remember them all? The Ghost Fees app reads a bank statement (CSV or PDF, no bank login): {app_link()}"
            + try_next("Netflix $19, Spotify $14, gym $25 a week"), help_card())


def usage_reply():
    """Pay-per-use or credit billing: how to work out what it costs, with the maths."""
    return ("**Pay-per-use costs: here's how to work it out.**\n\n"
            "**The maths:** units you use x price per unit = what you pay.\n"
            "- Example: 40 applications a month x $0.50 each = **$20.00 a month**\n"
            "- $20.00 x 12 = **$240.00 a year**\n\n"
            "**Where to find your usage:** the provider's billing or usage page (often under Account, Billing or Usage). "
            "Most let you set a spending limit or an alert. Turn one on so it can't surprise you.\n\n"
            "**What I can do:** tell me what you spent last month, e.g. `ChatGPT API $23, Midjourney $15`, and I'll show the year "
            "and whether any of your AI tools double up."
            + try_next("ChatGPT $30, Claude $30, Cursor $30", "tech pack") + "\n\n" + DISCLAIMER, None)


def cant_do_reply():
    """Honest answer for things Ghost It can't do (read email, connect a bank, etc.)."""
    return ("I can't read your email or connect to your bank, so I won't guess.\n\n"
            "**Quickest way:** copy the amounts from those bills here, e.g. `electricity $540 a quarter, internet $85, phone $45`, "
            "and I'll add up the year and spot any doubles.\n\n"
            "**What else I can do:** tell me what you pay for (e.g. `Netflix $19, Spotify $14, gym $25 a week`) and I'll show "
            "the yearly cost line by line, find doubles with my Ghost Packs, and give the official cancel steps.\n\n"
            f"To find bills and subscriptions from your bank statement, the Ghost Fees app reads a CSV or PDF (no bank login): {app_link()}", help_card())


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


# ---------------------------------------------------------------- consolidate (v11)
# After a double-up: keep one, cancel the rest, or rotate, plus bundle and sharing tips.
# Every dollar figure is plain maths from what the person told us. Tips are general
# facts about the services, with no prices we haven't checked.
AI_KINDS = {
    "chat": ({"chatgpt", "claude", "gemini", "perplexity"}, "general AI chat"),
    "code": ({"cursor", "copilot", "windsurf", "replit", "bolt", "v0", "lovable"}, "AI coding"),
}
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def bundle_tips(group_key, keys):
    tips = []
    if group_key == "music":
        if "youtube" in keys:
            tips.append("YouTube Premium already includes YouTube Music, so you may not need another music app.")
        tips.append("Live with someone who also pays? Spotify Duo and Family put 2 to 6 people at one address on one plan.")
        if keys & {"applemusic", "icloud", "appletv"}:
            tips.append("Apple One bundles Apple Music, Apple TV+ and iCloud+ in one bill. Compare it with what you pay now.")
    elif group_key == "storage":
        if "m365" in keys:
            tips.append("Microsoft 365 already includes 1 TB of OneDrive storage.")
        tips.append("Most storage plans can be shared with family (Google One with up to 5 others, iCloud+ through Family Sharing).")
    elif group_key == "video":
        tips.append("Most streaming apps let you cancel and come back any month, so rotating loses nothing but the wait.")
        if "prime" in keys:
            tips.append("Prime Video comes with Amazon Prime, so if you keep Prime for delivery, that's your free one.")
    elif group_key == "ai":
        tips.append("Most people need one general AI chat (ChatGPT, Claude or Gemini) and at most one coding tool.")
    elif group_key == "delivery":
        tips.append("Check your bank card and phone plan perks first: some include a delivery membership.")
    elif group_key == "mealkit":
        tips.append("One meal kit at a time is plenty. Most let you skip weeks for free instead of cancelling.")
    elif group_key == "gaming":
        tips.append("Keep the pass for the console you play most, and rotate the others month to month.")
    return tips


def keep_choice(ctx, sender, group):
    """The one to keep: the person's choice (`keep Netflix`) if it's in the group, else the cheapest."""
    prefs = get(ctx, f"keep:{sender}", [])
    for k in prefs if isinstance(prefs, list) else []:
        for x in group:
            if x["key"] == k:
                return x, "your pick"
    return min(group, key=yearly), "the cheapest"


def plan_groups(subs):
    """Overlap groups to consolidate. AI tools split into chat and coding: keep one of each."""
    out = []
    for g, group in overlaps(subs).items():
        if g != "ai":
            out.append((g, OVERLAP_NAMES[g], group))
            continue
        rest = list(group)
        for kind, (keys, label) in AI_KINDS.items():
            part = [x for x in group if x["key"] in keys]
            rest = [x for x in rest if x["key"] not in keys]
            if len(part) > 1:
                out.append(("ai", f"{label} tools", part))
        if len(rest) > 1:
            out.append(("ai", "other AI tools", rest))
    return out


def rotation(group, start=None):
    """One service a month, cheapest first, for the next 12 months. Returns (schedule, yearly cost)."""
    start = start or datetime.now(timezone.utc).month  # next month = index of this month
    order = sorted(group, key=yearly)
    sched, cost = [], 0.0
    for i in range(12):
        x = order[i % len(order)]
        cost += yearly(x) / 12
        if i < len(order):
            sched.append(f"{MONTHS[(start + i) % 12]} {x['name']}")
    return sched, round(cost, 2)


def consolidate_reply(ctx, sender, pack=None):
    subs = [s for s in last_subs(ctx, sender) if isinstance(s, dict) and s.get("known") and s.get("price")
            and s.get("key") in C and (pack is None or C[s["key"]]["pack"] == pack)]
    groups = plan_groups(subs)
    if not groups:
        where = f" in the {pack} pack" if pack else ""
        return (f"**Nothing to consolidate{where} yet.** I need two or more that do the same job, with prices, "
                "e.g. `Netflix $19, Stan $16, Disney+ $16`." + try_next("Netflix $19, Stan $16, Disney+ $16", "packs"), None)
    lines = ["🧩 **Your consolidate plan**" + (f" ({pack} pack)" if pack else ""), ""]
    rows, cancel_keys, total_save, shown = [], [], 0.0, set()
    for g, label, group in groups:
        gy = sum(yearly(x) for x in group)
        keep, why = keep_choice(ctx, sender, group)
        drop = [x for x in group if x is not keep]
        save = gy - yearly(keep)
        total_save += save
        cancel_keys += [x["key"] for x in drop]
        sched, rot_cost = rotation(group)
        lines.append(f"**{len(group)} {label}: {money(gy)} a year**")
        lines.append(f"- ✅ **Keep:** {keep['name']} ({money(yearly(keep))}/yr), {why}.")
        lines.append(f"- ✂️ **Cancel:** {', '.join(x['name'] for x in drop)}")
        lines.append(f"- 💰 **Save {money(save)} a year** ({money(gy)} - {money(yearly(keep))})")
        lines.append(f"- 🔁 **Or rotate, one a month:** {', '.join(sched)}, then repeat = {money(rot_cost)}/yr, "
                     f"save {money(gy - rot_cost)}")
        for tip in bundle_tips(g, {x['key'] for x in group}):
            if tip not in shown:
                shown.add(tip)
                lines.append(f"- 💡 {tip}")
        lines.append("")
        rows += [{"label": f"Keep ({label})", "value": f"{keep['name']}, {money(yearly(keep))}/yr"},
                 {"label": "Cancel", "value": ", ".join(x["name"] for x in drop)},
                 {"label": "Save", "value": f"{money(save)} a year"}]
    lines.append(f"**Total you could save: {money(total_save)} a year** (about {money(total_save / 12)} a month).")
    first_other = next((x["name"] for _, _, grp in groups for x in grp if x["key"] not in get(ctx, f"keep:{sender}", [])), None)
    lines.append("\nWant to keep a different one? Type `keep <name>`" + (f", e.g. `keep {first_other}`." if first_other else "."))
    lines.append(try_next("cancel the others", f"keep {first_other}" if first_other else None, "my ghost list"))
    lines.append("\n" + DISCLAIMER)
    rows.append({"label": "Total saving", "value": f"{money(total_save)} a year"})
    ctx.storage.set(f"cancelkeys:{sender}", cancel_keys)
    bump(ctx, "consolidations")
    card = ("detail", {
        "title": f"🧩 Save {money(total_save)} a year",
        "summary_rows": rows[:12],
        "ctas": [{"label": "Cancel the others", "primary": True, "selection": {"action": "cancel_others"}},
                 {"label": "My ghost list", "selection": {"action": "list"}}],
    })
    return "\n".join(lines), card


def keep_reply(ctx, sender, key):
    prefs = [k for k in get(ctx, f"keep:{sender}", []) if k != key] if isinstance(get(ctx, f"keep:{sender}", []), list) else []
    ctx.storage.set(f"keep:{sender}", [key] + prefs[:9])
    text, card = consolidate_reply(ctx, sender)
    return f"**Got it, keeping {C[key]['name']}.**\n\n" + text, card


def cancel_others(ctx, sender):
    keys = get(ctx, f"cancelkeys:{sender}", [])
    known = {s["key"]: s for s in last_subs(ctx, sender) if isinstance(s, dict) and "key" in s}
    items = [known[k] for k in keys if k in known] if isinstance(keys, list) else []
    if not items:
        return ("Run `consolidate` first so I know which ones to cancel.", None)
    return gated_ghost(ctx, sender, items, "Cancel the others", everything=len(packs_for(items)) > 1)


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
    if overlaps(priced):
        lines.append("\n🧩 **Consolidate:** type `consolidate` for a plan: keep one, cancel the rest or rotate, with the saving.")
    lines.append("\n**Next:** tap **Cancel steps** for the steps and a ready email, or type `cancel steps`.")
    lines.append("\n" + ("Your first Ghost Pack is free. After that, $5 once unlocks every pack, paid in the chat."
                         if paying() else "Ghost Packs are free during beta."))
    lines.append(try_next("cancel steps", f"{items[0]['name']} stopped" if items else None, "packs"))
    lines.append("\n" + DISCLAIMER)
    card = ("review", {
        "title": f"{emoji} {pack} pack: {money(total)} a year",
        "summary_rows": [r for r in rows if r["label"] or r["value"]][:12],
        "approve_cta": {"label": "Cancel steps", "primary": True, "selection": {"action": "steps", "pack": pack}},
        "reject_cta": ({"label": "Consolidate plan", "selection": {"action": "consolidate", "pack": pack}} if overlaps(priced)
                       else {"label": "Scan my statement", "selection": {"action": "scan"}}),
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
        # v13 (Kingan, 4 Nov): nothing counts as ghosted until the person taps Mark ghosted.
        parts = hunt + [f"**What I did:** got the cancel steps for {len(items)} subscription"
                 f"{'s' if len(items) != 1 else ''}. Nothing is marked yet: once you've sent the cancel request, "
                 "tap **👻 Mark ghosted** and I'll add it to your ghost list.\n"]
    for s in items:
        parts.append(cancel_block(s["key"] if s.get("known") else s["name"]))
        parts.append("")
    first = items[0]["name"]
    parts.append("**Ready-to-send cancel email** (change the name for each):\n```\n" + cancel_email(first) + "\n```")
    parts.append(f"\n**Next:** tap **👻 Mark ghosted** (or type `{first} ghosted`). In 7 days I'll ask if it really stopped. "
                 "Type `my ghost list` any time.")
    if paying():
        parts.append("\nYour first Ghost Pack is free. After that, $5 once unlocks every pack, paid in the chat.")
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
            "ctas": [{"label": "👻 Mark ghosted", "primary": True, "selection": {"action": "mark", "merchant": s["key"]}},
                     {"label": "👻 My ghost list", "selection": {"action": "list"}}],
        })
    else:
        card = ("carousel", {
            "title": title,
            "subtitle": "Tap Mark ghosted once you've sent the cancel request",
            "items": [{
                "id": s["key"], "title": s["name"],
                "subtitle": (money(yearly(s)) + " a year") if s.get("price") else "Price not given",
                "secondary_text": ((C.get(s["key"]) or {}).get("steps") or "Search their site for the cancel page")[:120],
                "primary_cta": {"label": "👻 Mark ghosted", "selection": {"action": "mark", "merchant": s["key"]}},
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
    waiting = [k for k, g in gl.items() if g["status"] in ("Requested", "Still charging")]
    ctas = [dict({"label": f"✅ {gl[k]['name']} stopped", "selection": {"action": "stopped", "merchant": k}}, **({"primary": True} if i == 0 else {}))
            for i, k in enumerate(waiting[:2])]
    ctas.append(dict({"label": "🔍 Scan my statement", "selection": {"action": "scan"}}, **({} if ctas else {"primary": True})))
    ctas.append({"label": "➕ Add more", "selection": {"action": "help"}})
    card = ("detail", {"title": "Your ghost list", "summary_rows": rows[:12], "ctas": ctas[:4]})
    return "\n".join(lines), card


def mark_reply(ctx, sender, key):
    """Mark ghosted: the person says they've sent the cancel request (v13, human approval)."""
    known = {x["key"]: x for x in last_subs(ctx, sender) if isinstance(x, dict) and "key" in x}
    item = known.get(key) or (dict(key=key, known=True, name=C[key]["name"], price=None) if key in C else None)
    if not item:
        name = str(key).strip().title()
        item = dict(key=name.lower(), known=False, name=name, price=None)
    gl = ghost_list(ctx, sender)
    if item["key"] in gl and gl[item["key"]]["status"] in ("Requested", "Stopped"):
        text, card = list_reply(ctx, sender)
        return f"{item['name']} is already on your ghost list.\n\n" + text, card
    add_to_list(ctx, sender, [item])
    text, card = list_reply(ctx, sender)
    return (f"👻 **Marked {item['name']} as ghosted.** Your savings count it once the charge really stops: "
            f"tap **✅ It stopped** or type `{item['name']} stopped`.\n\n" + text, card)


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


def welcome_reply():
    """ASI:One's own pre-filled "What's new with you, Ghost.it?" (we can't change that
    text). A new visitor gets a welcome, not a changelog: what Ghost It does, the newest
    thing, and tap-to-try cards. `what's new` on its own still shows the feedback log."""
    lines = [PURPOSE.replace(" Tell me what you pay for below.", ""), "",
             "🧩 **New:** paying for two or three of the same thing? I'll plan which one to keep, "
             "and cancel or rotate the rest, with the saving worked out.", "",
             quick_start_text(),
             "Every change from your feedback: `what's new`."]
    return "\n".join(lines), quick_start_card()


def whats_new_reply():
    """Also the answer to ASI:One's pre-filled "What's new with you, Ghost.it?", so it
    starts with what Ghost It is for, then the latest changes, one thing to try and the card."""
    lines = [PURPOSE.replace(" Tell me what you pay for below.", ""), "", "**What's new (from your feedback)**"]
    # Outside people first (Raj round 1 and 2, Kingan): the you-said-we-changed story.
    outside = [c for c in CHANGES if not c[0].startswith(("The founders", "The team", "A Fetch.ai mentor"))]
    for who, said, changed in outside[-4:]:
        lines.append(f"- {who} said: \"{said}\" We changed: {changed}.")
    lines.append("\n**Try it:** tap a card below, or send `ChatGPT $30, Claude $30, Cursor $30, Copilot $15`.")
    lines.append("Something unclear? `feedback: ...` and I'll change it.")
    return "\n".join(lines), quick_start_card()


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
             f"- Feedback received: {len(fb)}",
             f"- Billing: {billing_status()}", "", "**Feedback log**"]
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
        return True, f"🎁 **The {packs[0]} pack is your free one.** Every other pack: $5 once, forever."
    cents = ALL_PRICE_CENTS   # one price: $5 unlocks every pack
    ctx.storage.set(f"pending_pay:{sender}", {"items": items, "title": title,
                                              "packs": ["all"] if cents == ALL_PRICE_CENTS else packs, "cents": cents})
    return False, paywall_reply(packs, cents)


def paywall_reply(packs, cents):
    """v10: the price, explained on a card, with a choice of one pack or every pack.
    Stripe's checkout arrives as its own message straight after this one."""
    price = f"${cents / 100:.2f}"
    text = (f"🔓 **You've used your free pack. Every Ghost Pack is {price} once.**\n\n"
            "You get the official cancel steps, a ready cancel email and a check after 7 days that it stopped.\n\n"
            f"Tap **Pay {price}** below. Stripe's checkout opens in this chat and I never see your card. "
            "Never a subscription.\n\n" + DISCLAIMER)
    rows = [{"label": "Unlocks", "value": "Every Ghost Pack, forever"},
            {"label": "Price", "value": f"{price} AUD once"},
            {"label": "You get", "value": "Cancel steps, a ready email and a did-it-stop check"},
            {"label": "Payment", "value": "Stripe checkout in this chat"}]
    ctas = [{"label": f"💳 Pay {price}", "primary": True, "selection": {"action": "buy", "plan": "all"}},
            {"label": "👻 Not now", "selection": {"action": "list"}}]
    return text, ("detail", {"title": "🔓 Unlock every Ghost Pack", "summary_rows": rows, "ctas": ctas})


def buy_reply(ctx, sender, plan):
    """Tapped Pay or '$5 for every pack': (re)open checkout for that plan."""
    pending = get(ctx, f"pending_pay:{sender}", None)
    if not paying():
        return "Ghost Packs are free while we're in beta, so there's nothing to pay. Type `packs` to run one.", None
    if not isinstance(pending, dict):
        pending = {"items": last_subs(ctx, sender), "title": "Cancel steps for everything", "packs": [], "cents": 0}
    if plan in ("all", "pack"):   # one price: always every pack
        pending.update(packs=["all"], cents=ALL_PRICE_CENTS)
    elif not pending.get("packs"):
        return "Pick a pack first, e.g. `sound pack`, or tap **$5 for every pack**.", None
    pending["session"] = None   # handle_message sends a fresh Stripe checkout after this reply
    ctx.storage.set(f"pending_pay:{sender}", pending)
    label = "every Ghost Pack" if pending["packs"] == ["all"] else f"the {pending['packs'][0]} pack"
    return (f"💳 Opening Stripe checkout for {label} (${pending['cents'] / 100:.2f} AUD, once). "
            "Your cancel steps arrive the moment it's paid.", None)


def billing_status():
    """One line for `evidence <code>` and `billing <code>`: is Ghost It charging? Never shows the key."""
    if not PAYMENTS_ENABLED:
        return "OFF (PAYMENTS_ENABLED is not true in Agentverse Secrets)"
    if not HAVE_PAYMENTS:
        return "OFF (this uAgents version has no payment protocol)"
    problem = stripe_key_problem()
    if problem:
        return f"OFF ({problem})"
    if not os.environ.get("STRIPE_PUBLISHABLE_KEY"):
        return "OFF (STRIPE_PUBLISHABLE_KEY is missing)"
    mode = "TEST mode" if os.environ.get("STRIPE_SECRET_KEY", "").startswith(("sk_test_", "rk_test_")) else "LIVE mode"
    return f"ON, {mode}, ${ALL_PRICE_CENTS / 100:.2f} once unlocks every pack"


def stripe_key_problem():
    """Why the Stripe secret key can't work, or None. 3 Nov: the saved key held the
    hidden-key dots Stripe shows (•••), so every checkout failed."""
    key = os.environ.get("STRIPE_SECRET_KEY", "").strip()
    if not key:
        return "STRIPE_SECRET_KEY is empty"
    if not key.isascii() or "•" in key or "*" in key:
        return "STRIPE_SECRET_KEY looks masked (it has dots or stars). In Stripe press Reveal test key and paste the full sk_test_... value"
    if not key.startswith(("sk_test_", "sk_live_", "rk_test_", "rk_live_")):
        return "STRIPE_SECRET_KEY should start with sk_test_ (or sk_live_)"
    pub = os.environ.get("STRIPE_PUBLISHABLE_KEY", "").strip()
    if not pub.isascii() or "•" in pub or not pub.startswith(("pk_test_", "pk_live_")):
        return "STRIPE_PUBLISHABLE_KEY should be the full pk_test_... value, not a masked one"
    return None


def stripe_call(method, path, data=None):
    """Stripe's REST API with the standard library (no extra package on Agentverse)."""
    problem = stripe_key_problem()
    if problem:
        raise ValueError(problem)
    body = urllib.parse.urlencode(data).encode() if data else None
    req = urllib.request.Request(f"https://api.stripe.com/v1/{path}", data=body, method=method,
                                 headers={"Authorization": f"Bearer {os.environ.get('STRIPE_SECRET_KEY', '').strip()}"})
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
        # 4 Nov: never leave someone stuck at a checkout that can't open. This pack is free,
        # and the log line above says why, so the team can fix the key.
        ctx.storage.set(f"unlocked:{sender}", get(ctx, f"unlocked:{sender}", []) + pending["packs"])
        ctx.storage.set(f"pending_pay:{sender}", None)
        bump(ctx, "stripe_down_free")
        ctx.logger.info(f"STRIPE_DOWN gave ...{sender[-6:]} {pending['packs']} free")
        text, card = ghost_reply(ctx, sender, pending["items"], pending["title"])
        await send_reply(ctx, sender, "💳 Checkout isn't available right now, so this one's on us. 👻\n\n" + text, card)
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
    await send_reply(ctx, sender, "**Paid, thank you!** 👻 Here are your cancel steps.\n\n" + text, card)


async def on_reject(ctx, sender, msg):
    ctx.storage.set(f"pending_pay:{sender}", None)
    await ctx.send(sender, make_msg("No worries, nothing was charged. Your free check and ghost list still work. "
                                    "Type `my ghost list` any time.", None))


# ---------------------------------------------------------------- router
def gated_ghost(ctx, sender, items, title, everything=False, browse=False, steps_only=False):
    ok, note = pack_access(ctx, sender, items, title, everything)
    if not ok:
        return note
    text, card = ghost_reply(ctx, sender, items, title, browse=browse, steps_only=steps_only)
    return ((note + "\n\n" + text) if note else text), card


# "Which one should I keep?" with a list: go straight to the consolidate plan.
KEEP_Q = re.compile(r"which (?:one |ones )?(?:should i|to|do i) keep|consolidate|which (?:one|ones) to cancel|what should i cancel")


def route(ctx, sender, raw):
    text = raw.strip()
    text = re.sub(r"^@\S+\s*", "", text)   # strip @ghostit
    m = re.fullmatch(r"\s*#?(\d{1,2})[.)]?\s*", text)
    if m and 1 <= int(m.group(1)) <= len(MENU):
        text = MENU[int(m.group(1)) - 1]
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
        if a == "say" and sel.get("text") and not str(sel["text"]).lstrip().startswith("{"):
            return route(ctx, sender, str(sel["text"]))
        if a == "check":
            subs_text = str(sel.get("subs", "")) + " " + str(sel.get("who", ""))
            subs, missing = parse_subs(subs_text)
            if subs and KEEP_Q.search(subs_text.lower()):
                check_reply(ctx, sender, subs_text, subs, missing)   # saves the list
                return consolidate_reply(ctx, sender)
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
        if a == "mark":
            return mark_reply(ctx, sender, sel.get("merchant", ""))
        if a == "list":
            return list_reply(ctx, sender)
        if a == "help":
            return help_reply()
        if a == "consolidate":
            return consolidate_reply(ctx, sender, sel.get("pack") if sel.get("pack") in PACKS else None)
        if a == "cancel_others":
            return cancel_others(ctx, sender)
        if a == "buy":
            return buy_reply(ctx, sender, sel.get("plan", "pack"))
        if a == "explain":
            return explain_reply(sel.get("topic")) if sel.get("topic") else explain_menu_reply()
        if a == "packs":
            return packs_reply()
        if a == "form":
            return "Add what you pay for, with prices. Weekly or yearly is fine too.", help_card()

    # 2. Typed commands
    if re.search(r"\b(delete|erase|forget|wipe)\b.*\b(my data|my info\w*|my details|my list|everything|all my)\b", low):
        # Privacy promise in the README: forget this person's list and last check.
        ctx.storage.set(f"gl:{sender}", {})
        ctx.storage.set(f"last:{sender}", [])
        return ("**What I did:** deleted your subscriptions and ghost list. I no longer hold anything about you. 👻\n\n"
                "Start again any time by listing what you pay, e.g. `Netflix $19, Stan $16`.", None)
    if low.startswith("feedback"):
        return feedback_reply(ctx, sender, text.split(":", 1)[-1].strip() if ":" in text else text[8:].strip())
    if low.startswith("billing"):
        code = text[7:].strip()
        if ADMIN_CODE != "change-me" and code == ADMIN_CODE:
            return f"💳 **Billing:** {billing_status()}", None
        return ("Billing is for the Ghost It team only.", None)
    if low.startswith("evidence"):
        code = text[8:].strip()
        if ADMIN_CODE != "change-me" and code == ADMIN_CODE:
            return evidence_reply(ctx)
        return ("Evidence is for the Ghost It team only.", None)
    if re.fullmatch(r"\s*(version|about version|what version(?: are you)?\??|which version\??|v\d+(?:\.\d+)?\??)\s*", low):
        return version_reply()
    if re.search(r"(created|made|built|designed) (you )?(to|for)|what (were|are) you (for|made|built|created)|who are you|what is this|what are you|about you|your purpose", low):
        return about_reply()
    if re.fullmatch(r"\s*(consolidate|consolidate plan|combine|merge|rotate|rotation plan|which (?:one )?should i keep\??)(?:\s+(\w+))?(?:\s+pack)?\s*", low):
        word = re.fullmatch(r"\s*\S+(?:\s+plan)?(?:\s+(\w+))?.*", low).group(1)
        return consolidate_reply(ctx, sender, PACK_WORDS.get(word or "", None))
    if re.fullmatch(r"\s*cancel (?:the )?others\s*", low):
        return cancel_others(ctx, sender)
    km = re.fullmatch(r"\s*keep\s+(.+?)\s*", low)
    if km and find_merchant(km.group(1)):
        return keep_reply(ctx, sender, find_merchant(km.group(1)))
    em = re.fullmatch(r"\s*explain\s*(\w+)?\s*", low)
    if em:
        return explain_reply(EXPLAIN_WORDS.get(em.group(1) or "", "")) if em.group(1) else explain_menu_reply()
    if re.search(r"^\$?5 for every pack|^pay \$?5|^buy (?:all|every)", low):
        return buy_reply(ctx, sender, "all")
    plain_q = "$" not in low and not find_merchant(low)   # a question, not a list of subscriptions
    if plain_q and re.search(r"how (?:does|do) (?:it|this|you|ghost ?it) work|how it works|^how\??$", low):
        return explain_reply("how")
    if plain_q and re.search(r"pay[- ]per[- ]use|usage[- ]based|credits?\b.*\b(pay|use|bill)|metered|per token|api (?:bill|cost|usage)", low):
        return usage_reply()
    if plain_q and re.search(r"how much (?:am i|do i|i'?m) (?:spend|pay)|what am i (?:spending|paying)|(?:total|add up) (?:my )?(?:subscriptions|bills)", low):
        return spend_reply()
    if plain_q and re.search(r"is (?:it|ghost ?it|this) free|how much (?:does|do|is) (?:it|this|ghost ?it|you|a pack|packs|the packs?)\b.*cost|how much (?:is|are) (?:ghost ?it|a pack|packs|pro)|cost(?:s)? (?:to use|anything)|^pric(?:e|ing)\??$|what do (?:you|packs) cost|do i (?:have to )?pay (?:you|for (?:this|ghost ?it|packs))", low):
        return explain_reply("price")
    if plain_q and re.search(r"is my data|privacy|safe to|what do you (?:keep|store|save)|do you (?:keep|store|see)", low):
        return explain_reply("data")
    if plain_q and re.search(r"how do you (?:calculate|work out|do the maths)|where do (?:the|your) numbers", low):
        return explain_reply("maths")
    if re.fullmatch(r"\s*(packs?|ghost packs?|what packs\??|list packs|show packs)\s*", low):
        return packs_reply()
    if re.fullmatch(r"\s*(commands|menu|what can you do\??|all commands)\s*", low):
        return help_reply(full=True)
    if re.search(r"what'?s new with you|what'?s up\b|what'?s happening", low):
        return welcome_reply()
    if re.search(r"what'?s new|changelog", low):
        return whats_new_reply()
    if re.search(r"ghost ?list|my list", low):
        return list_reply(ctx, sender)
    m = re.search(r"from \$?\s*(\d+(?:\.\d{1,2})?) to \$?\s*(\d+(?:\.\d{1,2})?)", low)
    if m:
        return price_rise_reply(text, m)
    mk = re.fullmatch(r"\s*(?:mark\s+)?(.+?)\s+(?:as\s+)?ghosted\s*[.!]?\s*", low)
    if mk and "$" not in low:
        return mark_reply(ctx, sender, find_merchant(mk.group(1)) or mk.group(1).strip())
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
        if re.search(r"\b(what|which|should|save|money|subscriptions|everything|stuff|things)\b", cm.group(2)):
            return ("**Which to cancel?** Tell me what you pay for and I'll show which ones double up and what you'd save "
                    "if you kept just one, e.g. `Netflix $19, Stan $16, Disney+ $16, Spotify $14`.\n\n"
                    "Or type `packs` to see what each Ghost Pack hunts.", help_card())
        name = cm.group(2).strip(" ?.!").title()
        return ghost_reply(ctx, sender, [dict(key=name.lower(), known=False, name=name, price=None)], f"Cancel {name}")

    # 3. A list of subscriptions
    subs, missing = parse_subs(text)
    if subs and KEEP_Q.search(low):
        check_reply(ctx, sender, text, subs, missing)   # saves the list, same as a normal check
        return consolidate_reply(ctx, sender)
    if subs:
        return check_reply(ctx, sender, text, subs, missing)
    if missing and any(find_merchant(n) for n in missing):
        return typical_reply(ctx, sender, missing)
    if missing:
        names = ", ".join(missing)
        return (f"**What I did:** found {names}, but no prices yet, so I can't add them up.\n\n"
                f"Add prices like `{missing[0]} $19, ...` and I'll show the yearly cost and any doubles.\n"
                f"Want to cancel now? Type `cancel {missing[0]}`.\n\n"
                f"Scan your statement free to see the exact amounts: {app_link()}", None)
    if re.search(r"\b(gmail|email|e-mail|inbox|bank account|connect my bank|log ?in to my bank|read my|scan my email)\b", low):
        return cant_do_reply()
    return help_reply()


# ---------------------------------------------------------------- chat protocol
# Hosted on Agentverse: Agent() with no arguments. Plan B (4 Nov, Raj's mailbox tip): set
# GHOSTIT_LOCAL_SEED to run the same code on a computer, connected through a mailbox.
if os.environ.get("GHOSTIT_LOCAL_SEED"):
    # 5 Nov: publish the full profile on every start. Without these, uagents publishes an
    # empty picture and description each time, which is why ASI:One showed a plain robot.
    _readme = os.path.join(os.path.dirname(os.path.abspath(__file__)), "agentverse-readme.md")
    agent = Agent(name=os.environ.get("GHOSTIT_LOCAL_NAME", "Ghost.it"),
                  seed=os.environ["GHOSTIT_LOCAL_SEED"], port=int(os.environ.get("GHOSTIT_LOCAL_PORT", "8001")),
                  mailbox=True, publish_agent_details=True,
                  handle=os.environ.get("GHOSTIT_HANDLE", "ghostit"),
                  description="I hunt the money leaks your bank statement can't show you. A Ghost Pack for streaming, music, AI tools, food, gym and gaming.",
                  avatar_url=os.environ.get("GHOSTIT_AVATAR_URL", "https://storage.googleapis.com/agentverse-prod-assets/agent-avatars-pub/939401106.jpg"),
                  readme_path=_readme if os.path.exists(_readme) else None)
else:
    agent = Agent()
protocol = Protocol(spec=chat_protocol_spec)


def for_asi(text):
    """ASI:One shows `inline code` with the backticks and joins single line breaks, so
    inline code becomes "quoted" and lines that aren't list items get a blank line."""
    parts = re.split(r"(```.*?```)", text, flags=re.S)
    out = []
    for i, part in enumerate(parts):
        if i % 2:              # fenced block (the cancel email): keep as is
            out.append(part)
            continue
        part = re.sub(r"`([^`\n]+)`", r'"\1"', part)
        part = re.sub(r"\n(?!\n|\s*[-*] |\s*\d+\. )", "\n\n", part)
        out.append(part)
    text = re.sub(r"\n{3,}", "\n\n", "".join(out))
    # No angle brackets: a reply with "keep <name>" sat 28 s and never showed (3 Nov).
    return text.replace("<name>", "a name").replace("<", "‹").replace(">", "›")


def card_meta(card):
    kind, payload = card
    return MetadataContent(type="metadata", metadata={
        "card_protocol_version": "1",
        "requires_card_interaction": "true",
        "card_kind": kind,
        "card_payload": json.dumps(payload),
        "preferred_drawer_width_px": "540",
    })


def make_msg(text, card=None):
    """The reply text, plus its card in the same message (Agentverse interactive cards docs)."""
    content = [TextContent(type="text", text=for_asi(text))]
    if card:
        content.append(card_meta(card))
    return ChatMessage(timestamp=datetime.now(timezone.utc), msg_id=uuid4(), content=content)


# v13 (4 Nov, Fetch.ai feedback): "instead of asking people to type consolidate, give a
# button". Every reply that suggests commands (`consolidate`, the Try next list) gets them
# as tap buttons. A tap sends {"action": "say", "text": ...}, which runs like typing it.
CMD_RE = re.compile(r"`([^`\n]{2,48})`")
BUTTON_EMOJI = [("consolidate", "🧩"), ("ghost list", "👻"), ("cancel", "✂️"), ("pack", "🎒"), ("scan", "🔍"),
                ("feedback", "💬"), ("explain", "❓"), ("how", "❓"), ("buy", "💳"), ("stopped", "✅"), ("delete", "🗑️")]


def button_label(cmd):
    emoji = next((e for word, e in BUTTON_EMOJI if word in cmd.lower()), "▶️")
    label = cmd[0].upper() + cmd[1:]
    return f"{emoji} {label if len(label) <= 34 else label[:33] + '…'}"


def next_buttons(text, limit=4):
    """Tap buttons for the commands a reply suggests, the Try next line first."""
    tail = text.split("**Try next:**", 1)
    ordered = CMD_RE.findall(tail[1]) + CMD_RE.findall(tail[0]) if len(tail) == 2 else CMD_RE.findall(text)
    cmds = []
    for c in (x.strip() for x in ordered):
        if "..." in c or "…" in c or "<" in c or c.lower() in {x.lower() for x in cmds}:
            continue
        cmds.append(c)
        if len(cmds) == limit:
            break
    if not cmds:
        return None
    return ("detail", {
        "title": "Tap to keep going",
        "ctas": [dict({"label": button_label(c), "selection": {"action": "say", "text": c}}, **({"primary": True} if i == 0 else {}))
                 for i, c in enumerate(cmds)],
    })


async def send_reply(ctx, sender, text, card=None):
    if USE_CARDS and card is None:
        card = next_buttons(text)
    if not USE_CARDS:
        card = None
    try:
        await ctx.send(sender, make_msg(text, card))
    except Exception as e:  # a card must never stop the text reply
        ctx.logger.error(f"card send failed: {e}")
        await ctx.send(sender, make_msg(text))


@protocol.on_message(ChatMessage)
async def handle_message(ctx: Context, sender: str, msg: ChatMessage):
    raw = " ".join(c.text for c in msg.content if isinstance(c, TextContent)).strip()
    # v13.2 (4 Nov): the reply goes out BEFORE the receipt. Logs showed the first envelope
    # leaves in ~2 s and the second 30 to 45 s later, so with the receipt first the real
    # reply arrived after ASI:One had stopped waiting ("Reasoning..." forever).
    ack = ChatAcknowledgement(timestamp=datetime.now(timezone.utc), acknowledged_msg_id=msg.msg_id)
    if not raw:
        await ctx.send(sender, ack)
        return
    import time as _t
    t0 = _t.monotonic()
    try:
        text, card = route(ctx, sender, raw)
    except Exception as e:  # never crash on odd input
        ctx.logger.error(f"route error: {type(e).__name__}: {e}")
        text, card = help_reply()
    t1 = _t.monotonic()
    # v13.3 (5 Nov): acknowledge FIRST, as the Agent Chat Protocol requires, then reply.
    # uagents sends one envelope at a time, so with the reply first it waited ~30 s for
    # ASI:One, which was waiting for our acknowledgement (logs: send=30.5s, then a
    # "Timeout waiting for dispense response" and nothing shown). Counters come after.
    # v13.4 (5 Nov): ASI:One takes 25 to 30 s to accept each envelope at busy times and
    # drops replies that arrive after ~30 s, so the reply goes FIRST (it is what people see)
    # and the receipt after. Each send is timed on its own.
    await send_reply(ctx, sender, text, card)
    t_reply = _t.monotonic()
    await ctx.send(sender, ack)
    ctx.logger.info(f"TIMING route={t1 - t0:.1f}s reply={t_reply - t1:.1f}s ack={_t.monotonic() - t_reply:.1f}s chars={len(text)} cards={'on' if USE_CARDS and card else 'off'}")
    try:
        if not ctx.storage.get(f"seen:{sender}"):
            ctx.storage.set(f"seen:{sender}", True)
            bump(ctx, "users")
        bump(ctx, "messages")
    except Exception as e:  # counters must never stop a reply
        ctx.logger.error(f"stats error: {e}")
    t2 = _t.monotonic()
    pending = get(ctx, f"pending_pay:{sender}", None)
    if paying() and isinstance(pending, dict) and not pending.get("session"):
        await send_payment_request(ctx, sender)
    # v13.2: how long the work after the reply takes. Agentverse may hold outgoing
    # messages until the handler ends, so this must stay near zero.
    ctx.logger.info(f"TIMING after-reply stats={t2 - t1:.1f}s pay={_t.monotonic() - t2:.1f}s")


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
