# Ghost It: subscription ghosting agent for ASI:One (Agentverse hosted agent)
# v7 (2 Nov 2026): clear maths on every reply, interactive cards, app links,
# auto-replies to feedback, evidence command.
#
# No LLM: every number comes from plain Python, so replies are predictable.
# General information about subscriptions only, not financial advice.

import json
import os
import re
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

# ---------------------------------------------------------------- settings
APP_URL = "https://hunt-ghost-fees.base44.app/"
HOURLY_RATE = 30          # used for the "hours of work" nudge, stated in the reply
PAYMENTS_ENABLED = False  # packs free during beta
# Set the secret GHOSTIT_ADMIN_CODE in Agentverse (or change the word here), then type: evidence <your code>
ADMIN_CODE = os.environ.get("GHOSTIT_ADMIN_CODE", "change-me")
USE_CARDS = True          # set False to send text only

# "You said, we changed" pairs. Add one each time you ship a fix from feedback.
CHANGES = [
    ("A Fetch.ai mentor", "the reply wasn't clear, why $276 a year?",
     "every reply now says what it did, shows the maths line by line, and uses cards"),
]

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
    "ai": "AI assistants", "design": "design tools", "delivery": "food delivery passes",
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


PERIODS = [
    (r"week|wk|weekly|/w\b", "wk", 52), (r"fortnight", "fortnight", 26),
    (r"quarter", "quarter", 4), (r"year|yr|annual|p\.?a\.?|/y\b", "yr", 1),
]


def parse_subs(text):
    """Return (subs, names_without_price). Each sub: key, name, price, per, times."""
    subs, missing = [], []
    chunks = re.split(r",|;|\n|\band\b|\s\+\s|\.\s", text, flags=re.I)
    for ch in chunks:
        key = find_merchant(ch)
        amt = re.search(r"\$\s*(\d+(?:\.\d{1,2})?)|(\d+(?:\.\d{1,2})?)\s*(?:dollars|aud)", ch, re.I)
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
    v = ctx.storage.get(key)
    return default if v is None else v


def ghost_list(ctx, sender):
    return get(ctx, f"gl:{sender}", {})


def save_list(ctx, sender, gl):
    ctx.storage.set(f"gl:{sender}", gl)


def bump(ctx, field, n=1):
    st = get(ctx, "stats", {})
    st[field] = st.get(field, 0) + n
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

def help_reply():
    text = (
        "**I'm Ghost It.** I add up what your subscriptions really cost, find the doubles, "
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
    card = ("form", {
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
    return text, card


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
        lines.append("\n**Next:** type `" + packs[0].split()[0].lower() + " pack` for cancel steps, "
                     "or `ghost everything` for all of them.")
    lines.append(f"\nMost people have more than they remember. Scan your statement free: {app_link([s['key'] for s in subs if s['known']])}")
    lines.append("\n" + DISCLAIMER)

    ctx.storage.set(f"last:{sender}", subs)
    bump(ctx, "checks")
    bump(ctx, "found_yearly_cents", int(round(total_y * 100)))

    card = ("review", {
        "title": f"Your subscriptions: {money(total_y)} a year",
        "summary_rows": rows[:12],
        "approve_cta": {"label": "Show cancel steps", "primary": True, "selection": {"action": "ghost_all"}},
        "reject_cta": {"label": "Scan my statement", "selection": {"action": "scan"}},
    })
    return "\n".join(lines), card


def ghost_reply(ctx, sender, items, title):
    if not items:
        return ("I don't have any subscriptions from you for that yet. List them first, "
                "e.g. `Netflix $19, Stan $16`.", None)
    add_to_list(ctx, sender, items)
    parts = [f"**What I did:** got the cancel steps for {len(items)} subscription"
             f"{'s' if len(items) != 1 else ''} and added {'them' if len(items) != 1 else 'it'} "
             "to your ghost list as Requested.\n"]
    for s in items:
        parts.append(cancel_block(s["key"] if s.get("known") else s["name"]))
        parts.append("")
    first = items[0]["name"]
    parts.append("**Ready-to-send cancel email** (change the name for each):\n```\n" + cancel_email(first) + "\n```")
    parts.append("\n**Next:** once a charge stops, type `<name> stopped`. In 7 days I'll ask if it really stopped. "
                 "Type `my ghost list` any time.")
    if PAYMENTS_ENABLED:
        parts.append("\nGhost Packs are $2 per category or $5 for all.")
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
    lines = ["**What's new in Ghost It (from your feedback)**"]
    for who, said, changed in CHANGES:
        lines.append(f"- You said: {said}\n  We changed: {changed}.")
    return "\n".join(lines), None


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
             f"- Feedback received: {len(fb)}", "", "**Feedback log**"]
    for f in fb[-30:]:
        lines.append(f"#{f['n']} {f['date']} ({f['who']}): {f['text']}")
    lines.append("\n**You said, we changed**")
    for who, said, changed in CHANGES:
        lines.append(f"- {who}: \"{said}\" -> {changed}")
    return "\n".join(lines), None


# ---------------------------------------------------------------- router
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
        if re.search(r"show cancel steps|ghost_all", low):
            sel = {"action": "ghost_all"}
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
        if a == "ghost_all":
            return ghost_reply(ctx, sender, get(ctx, f"last:{sender}", []), "Cancel steps")
        if a == "scan":
            last = get(ctx, f"last:{sender}", [])
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
        return ghost_reply(ctx, sender, get(ctx, f"last:{sender}", []), "Cancel steps for everything")
    pm = re.search(r"\b(screen|sound|music|gym|fitness|food|tech|play|gaming)\s+pack\b", low)
    if pm:
        pack = PACK_WORDS[pm.group(1)]
        last = [s for s in get(ctx, f"last:{sender}", []) if s.get("known") and C[s["key"]]["pack"] == pack]
        if not last:
            last = [dict(key=k, known=True, name=v["name"], price=None) for k, v in C.items() if v["pack"] == pack][:8]
        return ghost_reply(ctx, sender, last, f"{pack} pack")
    cm = re.search(r"\b(cancel|ghost|stop)\b\s+(.+)", low)
    if cm and "$" not in low:
        key = find_merchant(cm.group(2))
        last = {s["key"]: s for s in get(ctx, f"last:{sender}", [])}
        if key:
            s = last.get(key) or dict(key=key, known=True, name=C[key]["name"], price=None)
            return ghost_reply(ctx, sender, [s], f"Cancel {C[key]['name']}")
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
    if not ctx.storage.get(f"seen:{sender}"):
        ctx.storage.set(f"seen:{sender}", True)
        bump(ctx, "users")
    bump(ctx, "messages")
    try:
        text, card = route(ctx, sender, raw)
    except Exception as e:  # never crash on odd input
        ctx.logger.error(f"route error: {e}")
        text, card = help_reply()
    await ctx.send(sender, make_msg(text, card))


@protocol.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    pass


agent.include(protocol, publish_manifest=True)

if __name__ == "__main__":
    agent.run()
