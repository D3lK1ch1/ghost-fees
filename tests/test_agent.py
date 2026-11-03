"""Tests for Ghost It v7 (no network, no LLM, no Agentverse).

Run from the ghost-it folder:   python3 -m unittest discover -s tests -v

uagents / uagents_core are replaced with small stand-ins, so these run on any Mac
with Python 3. The first 9 tests are the 9 prompts from FINAL_UPDATE_PACK.md,
Step A4, sent through the agent's own router as one user would.
"""
import importlib.util
import json
import os
import re
import sys
import types
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent


def _install_stubs():
    class _Protocol:
        def __init__(self, *args, **kwargs):
            pass

        def on_message(self, *args, **kwargs):
            return lambda fn: fn

    class _Agent:
        def __init__(self, *args, **kwargs):
            pass

        def include(self, *args, **kwargs):
            pass

    class _Model:
        def __init__(self, **kwargs):
            self.__dict__.update(kwargs)

    uagents = types.ModuleType("uagents")
    uagents.Agent, uagents.Context, uagents.Protocol = _Agent, object, _Protocol
    chat = types.ModuleType("uagents_core.contrib.protocols.chat")
    for name in ("ChatAcknowledgement", "ChatMessage", "EndSessionContent", "MetadataContent", "TextContent"):
        setattr(chat, name, type(name, (_Model,), {}))
    chat.chat_protocol_spec = object()
    for mod_name in ("uagents_core", "uagents_core.contrib", "uagents_core.contrib.protocols"):
        sys.modules.setdefault(mod_name, types.ModuleType(mod_name))
    sys.modules["uagents"] = uagents
    sys.modules["uagents_core.contrib.protocols.chat"] = chat


def load_agent():
    _install_stubs()
    os.environ.setdefault("GHOSTIT_CARDS", "on")  # card tests; the live default is off
    spec = importlib.util.spec_from_file_location("ghost_it_agent", HERE / "agent.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


A = load_agent()


class FakeStorage:
    """Agentverse storage: get/set of JSON-able values."""

    def __init__(self):
        self.data = {}

    def get(self, key):
        value = self.data.get(key)
        return json.loads(value) if isinstance(value, str) and value[:1] in "[{" else value

    def set(self, key, value):
        self.data[key] = json.dumps(value) if isinstance(value, (list, dict)) else value


class FakeLogger:
    def __init__(self):
        self.lines = []

    def info(self, text):
        self.lines.append(text)

    error = warning = info


class FakeCtx:
    def __init__(self):
        self.storage = FakeStorage()
        self.logger = FakeLogger()


SENDER = "agent1qtester000000"


class PackPrompts(unittest.TestCase):
    """The 9 prompts from Step A4, in order, as one person's chat."""

    @classmethod
    def setUpClass(cls):
        cls.ctx = FakeCtx()

    def say(self, text):
        reply, card = A.route(self.ctx, SENDER, text)
        self.assertIsInstance(reply, str)
        return reply, card

    def test_1_check_six_subs_couple(self):
        reply, card = self.say("Netflix $19, Stan $16, Disney+ $16, Spotify $14, iCloud $4.49, Google One $3.49. We're a couple.")
        maths = re.findall(r"= \*\*\$[\d,]+\.\d\d/yr\*\*", reply)
        self.assertEqual(len(maths), 6, reply)
        self.assertIn("$875.76", reply)
        self.assertRegex(reply.lower(), r"3 .*(video|streaming)")
        self.assertRegex(reply.lower(), r"2 .*storage")
        self.assertRegex(reply.lower(), r"couple")
        self.assertIn("ref=asi1", reply)
        self.assertIsNotNone(card)

    def test_2_screen_pack(self):
        reply, card = self.say("screen pack")
        self.assertIn("https://www.netflix.com/cancelplan", reply)
        self.assertGreaterEqual(reply.lower().count("cancel"), 3)
        self.assertIsNotNone(card)

    def test_3_ghost_list(self):
        reply, _ = self.say("my ghost list")
        self.assertGreaterEqual(reply.count("Requested"), 3, reply)

    def test_4_stan_stopped(self):
        reply, _ = self.say("Stan stopped")
        self.assertIn("$192.00", reply)

    def test_5_weekly_gym(self):
        reply, _ = self.say("gym $25 a week")
        self.assertIn("$1,300.00", reply)
        self.assertRegex(reply, r"\$25\.00/wk x 52")

    def test_6_price_rise(self):
        reply, _ = self.say("Netflix went from $16.99 to $18.99")
        self.assertIn("$24.00", reply)
        self.assertIn("12%", reply)

    def test_7_feedback(self):
        reply, _ = self.say("feedback: add Foxtel")
        self.assertIn("#1", reply)
        self.assertRegex(reply.lower(), r"you said|we changed|thank")

    def test_8_off_topic_no_crash(self):
        reply, card = self.say("what's the weather")
        self.assertTrue(reply)
        self.assertIsNotNone(card)  # help comes with the add-subscriptions form

    def test_9_evidence_needs_code(self):
        reply, _ = self.say("evidence guess")
        self.assertIn("team only", reply)
        saved = A.ADMIN_CODE
        A.ADMIN_CODE = "s3cret"
        try:
            reply, _ = self.say("evidence s3cret")
        finally:
            A.ADMIN_CODE = saved
        self.assertIn("Feedback received: 1", reply)
        self.assertIn("add Foxtel", reply)


class RajsPrompt(unittest.TestCase):
    """Raj (Fetch.ai) typed this on 2 Nov; v6 said $276 a year without explaining it."""

    def test_list_without_commas(self):
        reply, card = A.route(FakeCtx(), SENDER, "@ghostit netflix $8.99 espn plus 11.99 paramount 13.99")
        self.assertIn("Netflix: $8.99/mo x 12 = **$107.88/yr**", reply)
        self.assertIn("ESPN+: $11.99/mo x 12 = **$143.88/yr**", reply)
        self.assertIn("Paramount+: $13.99/mo x 12 = **$167.88/yr**", reply)
        self.assertIn("$419.64", reply)
        self.assertRegex(reply.lower(), r"3 video")
        self.assertIsNotNone(card)

    def test_paramount_is_not_yearly(self):
        subs, _ = A.parse_subs("paramount 13.99")
        self.assertEqual(subs[0]["per"], "mo")

    def test_numbers_that_are_not_prices(self):
        subs, _ = A.parse_subs("sharehouse of 4 with Netflix $19")
        self.assertEqual([(s["name"], s["price"]) for s in subs], [("Netflix", 19.0)])


class EdgeCases(unittest.TestCase):
    def test_disney_plus_keeps_price(self):
        subs, missing = A.parse_subs("Disney+ $16")
        self.assertEqual([(s["name"], s["price"]) for s in subs], [("Disney+", 16.0)])
        self.assertEqual(missing, [])

    def test_unknown_service_is_not_given_a_link(self):
        reply, _ = A.route(FakeCtx(), SENDER, "cancel Bob's Kombucha Club")
        self.assertNotIn("http", reply.split("Scan")[0].split("ref=asi1")[0].replace("https://hunt-ghost-fees", ""))

    def test_names_without_prices(self):
        reply, _ = A.route(FakeCtx(), SENDER, "Netflix and Stan")
        self.assertIn("typical Australian prices", reply)
        self.assertIn("Send yours for exact maths", reply)

    def test_card_tap_json(self):
        ctx = FakeCtx()
        reply, _ = A.route(ctx, SENDER, json.dumps({"action": "check", "subs": "Netflix $19, Stan $16"}))
        self.assertIn("$420.00", reply)

    def test_evidence_disabled_with_default_code(self):
        saved = A.ADMIN_CODE
        A.ADMIN_CODE = "change-me"
        try:
            reply, _ = A.route(FakeCtx(), SENDER, "evidence change-me")
        finally:
            A.ADMIN_CODE = saved
        self.assertIn("team only", reply)

    def test_admin_code_from_secret(self):
        os.environ["GHOSTIT_ADMIN_CODE"] = "from-secret"
        try:
            self.assertEqual(load_agent().ADMIN_CODE, "from-secret")
        finally:
            del os.environ["GHOSTIT_ADMIN_CODE"]

    def test_cancel_links_are_https(self):
        for key, row in A.C.items():
            if row["link"]:
                self.assertTrue(row["link"].startswith("https://"), key)

    def test_delete_my_data(self):
        ctx = FakeCtx()
        A.route(ctx, SENDER, "Netflix $19, Stan $16")
        A.route(ctx, SENDER, "screen pack")
        reply, _ = A.route(ctx, SENDER, "please delete my data")
        self.assertIn("deleted", reply)
        self.assertEqual(A.ghost_list(ctx, SENDER), {})
        reply, _ = A.route(ctx, SENDER, "my ghost list")
        self.assertNotIn("Requested", reply)
        # "ghost everything" must not wipe anything
        A.route(ctx, SENDER, "Netflix $19")
        A.route(ctx, SENDER, "ghost everything")
        self.assertTrue(A.ghost_list(ctx, SENDER))

    def test_text_and_card_are_separate_messages(self):
        # v11.4: the text never travels with a card, so a rejected card can't hide it.
        self.assertEqual([type(c).__name__ for c in A.make_msg("hi").content], ["TextContent"])
        self.assertEqual([type(c).__name__ for c in A.card_msg(("form", {"a": 1})).content], ["MetadataContent"])
        ctx = PaidCtx()
        asyncio.run(A.send_reply(ctx, SENDER, "hi", ("form", {"a": 1})))
        self.assertEqual([type(m.content[0]).__name__ for m in ctx.sent], ["TextContent", "MetadataContent"])


if __name__ == "__main__":
    unittest.main()


# ---------------------------------------------------------------- paid packs
import asyncio


def load_paid_agent():
    """The agent with payments switched on, Fetch's payment module and Stripe faked."""
    class _Model:
        def __init__(self, **kwargs):
            self.__dict__.update(kwargs)

    pay = types.ModuleType("uagents_core.contrib.protocols.payment")
    for name in ("CancelPayment", "CommitPayment", "CompletePayment", "Funds", "RejectPayment", "RequestPayment"):
        setattr(pay, name, type(name, (_Model,), {}))
    pay.payment_protocol_spec = object()
    sys.modules["uagents_core.contrib.protocols.payment"] = pay
    os.environ.update(PAYMENTS_ENABLED="true", STRIPE_SECRET_KEY="sk_test_x", STRIPE_PUBLISHABLE_KEY="pk_test_x")
    try:
        module = load_agent()
    finally:
        for key in ("PAYMENTS_ENABLED", "STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY"):
            os.environ.pop(key, None)
        del sys.modules["uagents_core.contrib.protocols.payment"]
    # load_agent ran before the env was cleared; keep the module's view of the keys.
    module.os = types.SimpleNamespace(environ={"STRIPE_SECRET_KEY": "sk_test_x", "STRIPE_PUBLISHABLE_KEY": "pk_test_x"})
    return module


class PaidCtx(FakeCtx):
    def __init__(self):
        super().__init__()
        self.sent = []
        self.agent = types.SimpleNamespace(address="agent1qghostit")

    async def send(self, to, msg):
        self.sent.append(msg)


class PaidPacks(unittest.TestCase):
    def setUp(self):
        self.P = load_paid_agent()
        self.calls = []
        self.status = "paid"

        def fake_stripe(method, path, data=None):
            self.calls.append((method, path, data))
            if method == "POST":
                return {"id": "cs_test_123", "client_secret": "cs_secret"}
            return {"payment_status": self.status, "metadata": {"user_address": SENDER}}

        self.P.stripe_call = fake_stripe
        self.ctx = PaidCtx()
        self.P.route(self.ctx, SENDER, "Netflix $19, Stan $16, Spotify $14")

    def test_payments_on(self):
        self.assertTrue(self.P.paying())

    def test_first_pack_free_second_priced(self):
        reply, _ = self.P.route(self.ctx, SENDER, "screen pack")
        self.assertIn("your free one", reply)
        self.assertIn("https://www.netflix.com/cancelplan", reply)
        reply, card = self.P.route(self.ctx, SENDER, "sound pack")
        self.assertIn("$5.00 once", reply)
        self.assertEqual(card[0], "detail")  # v10: the price explained on a card
        self.assertEqual(card[1]["ctas"][0]["selection"], {"action": "buy", "plan": "all"})
        self.assertNotIn("spotify.com", reply)  # steps only after paying
        pending = self.P.get(self.ctx, f"pending_pay:{SENDER}", None)
        self.assertEqual((pending["cents"], pending["packs"]), (500, ["all"]))  # 3 Nov: one price

    def test_ghost_everything_is_five(self):
        self.P.route(self.ctx, SENDER, "screen pack")
        reply, _ = self.P.route(self.ctx, SENDER, "ghost everything")
        self.assertIn("$5.00 once", reply)

    def test_request_then_verified_commit_delivers(self):
        self.P.route(self.ctx, SENDER, "screen pack")
        self.P.route(self.ctx, SENDER, "sound pack")
        asyncio.run(self.P.send_payment_request(self.ctx, SENDER))
        req = self.ctx.sent[-1]
        self.assertEqual(type(req).__name__, "RequestPayment")
        self.assertEqual((req.accepted_funds[0].amount, req.accepted_funds[0].currency, req.accepted_funds[0].payment_method), ("5.00", "AUD", "stripe"))
        self.assertEqual(req.metadata["stripe"]["checkout_session_id"], "cs_test_123")
        self.assertNotIn("sk_test", json.dumps(req.metadata))  # secret key never leaves the agent
        self.assertTrue(all(isinstance(v, str) for v in req.metadata["stripe"].values()))
        commit = types.SimpleNamespace(funds=types.SimpleNamespace(payment_method="stripe"), transaction_id="cs_test_123")
        asyncio.run(self.P.on_commit(self.ctx, SENDER, commit))
        kinds = [type(m).__name__ for m in self.ctx.sent]
        self.assertIn("CompletePayment", kinds)
        delivered = next(m.content[0].text for m in reversed(self.ctx.sent) if hasattr(m, "content") and hasattr(m.content[0], "text"))
        self.assertIn("Paid, thank you", delivered)
        self.assertIn("spotify", delivered.lower())
        self.assertIn("all", self.P.get(self.ctx, f"unlocked:{SENDER}", []))
        self.P.ADMIN_CODE = "s3cret"
        ev, _ = self.P.route(self.ctx, SENDER, "evidence s3cret")
        self.assertIn("Paid Ghost Packs: 1 ($5.00 taken)", ev)
        self.assertIn("Free Ghost Packs used: 1", ev)
        reply, _ = self.P.route(self.ctx, SENDER, "sound pack")  # unlocked now: no price
        self.assertNotIn("$5.00 once", reply)

    def test_unpaid_commit_is_cancelled(self):
        self.P.route(self.ctx, SENDER, "screen pack")
        self.P.route(self.ctx, SENDER, "sound pack")
        asyncio.run(self.P.send_payment_request(self.ctx, SENDER))
        self.status = "unpaid"
        commit = types.SimpleNamespace(funds=types.SimpleNamespace(payment_method="stripe"), transaction_id="cs_test_123")
        asyncio.run(self.P.on_commit(self.ctx, SENDER, commit))
        self.assertEqual(type(self.ctx.sent[-1]).__name__, "CancelPayment")
        self.assertNotIn("all", self.P.get(self.ctx, f"unlocked:{SENDER}", []))

    def test_wrong_session_is_cancelled(self):
        self.P.route(self.ctx, SENDER, "screen pack")
        self.P.route(self.ctx, SENDER, "sound pack")
        asyncio.run(self.P.send_payment_request(self.ctx, SENDER))
        commit = types.SimpleNamespace(funds=types.SimpleNamespace(payment_method="stripe"), transaction_id="cs_test_OTHER")
        asyncio.run(self.P.on_commit(self.ctx, SENDER, commit))
        self.assertEqual(type(self.ctx.sent[-1]).__name__, "CancelPayment")


class BetaStaysFree(unittest.TestCase):
    def test_no_keys_means_free(self):
        self.assertFalse(A.paying())
        ctx = FakeCtx()
        A.route(ctx, SENDER, "Netflix $19, Spotify $14")
        A.route(ctx, SENDER, "screen pack")
        reply, _ = A.route(ctx, SENDER, "sound pack")
        self.assertIn("free during beta", reply)


class V8(unittest.TestCase):
    """agent-update-pack.md (v8, 2 Nov): purpose first, AI tools, card buttons, CHANGES."""

    def test_purpose_first_for_vague_messages(self):
        for msg in ["hi", "help", "what do you do", "what's the weather"]:
            reply, card = A.route(FakeCtx(), SENDER, msg)
            self.assertTrue(reply.startswith(A.PURPOSE.split(" Tell me")[0]), msg)
            self.assertEqual(card[0], "carousel", msg)

    def test_text_only_fallback_keeps_the_commands(self):
        A.USE_CARDS = False
        try:
            reply, _ = A.route(FakeCtx(), SENDER, "hi")
            self.assertTrue(reply.startswith(A.PURPOSE.split(" Tell me")[0]))
            self.assertIn("**1.**", reply)  # v12: the numbered menu, no cards needed
        finally:
            A.USE_CARDS = True

    def test_ai_tools_double_up(self):
        reply, card = A.route(FakeCtx(), SENDER, "ChatGPT $30, Claude $30, Cursor $30, Copilot $15")
        self.assertIn("$1,260.00 a year", reply)
        self.assertIn("4 AI tools", reply)
        self.assertEqual(reply.count("/mo x 12"), 4)

    def test_new_ai_tools_recognised_without_guessed_links(self):
        for key in ["cursor", "windsurf", "midjourney", "lovable", "replit", "bolt", "v0"]:
            self.assertIn(key, A.C)
            self.assertIsNone(A.C[key]["link"])
            self.assertEqual(A.C[key]["overlap"], "ai")

    def test_results_card_buttons(self):
        _, card = A.route(FakeCtx(), SENDER, "Netflix $19, Stan $16")
        kind, payload = card
        self.assertEqual(kind, "review")
        self.assertEqual(payload["approve_cta"]["label"], "Get Screen pack")
        self.assertEqual(payload["approve_cta"]["selection"], {"action": "pack", "pack": "Screen"})
        self.assertEqual(payload["reject_cta"]["label"], "Scan my statement")

    def test_get_pack_button_gives_their_pack(self):
        ctx = FakeCtx()
        A.route(ctx, SENDER, "Netflix $19, Stan $16, Disney+ $16")
        reply, _ = A.route(ctx, SENDER, json.dumps({"action": "pack", "pack": "Screen"}))
        self.assertIn("3 subscriptions", reply)

    def test_screen_pack_after_another_list_still_finds_them(self):
        ctx = FakeCtx()
        A.route(ctx, SENDER, "Netflix $19, Stan $16, Disney+ $16")
        A.route(ctx, SENDER, "ChatGPT $30, Claude $30")
        reply, _ = A.route(ctx, SENDER, "screen pack")
        self.assertIn("3 subscriptions", reply)
        reply, _ = A.route(ctx, SENDER, "Stan stopped")
        self.assertIn("$192.00", reply)

    def test_pack_with_nothing_listed_adds_nothing_to_the_ghost_list(self):
        ctx = FakeCtx()
        reply, _ = A.route(ctx, SENDER, "screen pack")
        self.assertIn("haven't added any", reply)
        self.assertEqual(A.ghost_list(ctx, SENDER), {})

    def test_changes_has_raj_and_builders(self):
        reply, _ = A.route(FakeCtx(), SENDER, "what's new")
        self.assertIn("not clear what it does; why $276?", reply)
        self.assertIn("AI tools double up", reply)

    def test_no_em_dashes_in_replies(self):
        ctx = FakeCtx()
        for msg in ["hi", "Netflix $19, Stan $16", "screen pack", "my ghost list", "what's new", "ChatGPT $30, Cursor $30"]:
            reply, _ = A.route(ctx, SENDER, msg)
            self.assertNotIn("—", reply, msg)


class About(unittest.TestCase):
    """ASI:One's profile suggests "Tell me what you were created to do"."""

    def test_created_to_do_gets_the_purpose_and_what_it_does(self):
        for msg in ["Tell me what you were created to do", "who are you", "what is this", "what were you made for?"]:
            reply, card = A.route(FakeCtx(), SENDER, msg)
            self.assertIn("can't show you", reply, msg)
            self.assertIn("Ghost Pack", reply, msg)
            self.assertEqual(card[0], "carousel", msg)
            self.assertNotIn("—", reply)

    def test_hi_is_purpose_then_the_prompts(self):
        # v11.3: one purpose line, then the tap-to-try prompts as text too.
        reply, _ = A.route(FakeCtx(), SENDER, "hi")
        first, rest = reply.split("\n", 1)
        self.assertIn("I'm Ghost It", first)
        self.assertIn("**Reply with a number to try one:**", rest)
        self.assertIn("How does it work?", rest)


class AsiOneGreeting(unittest.TestCase):
    """ASI:One pre-fills "What's new with you, Ghost.it?" on the profile."""

    def test_whats_new_with_you_leads_with_the_purpose_and_a_card(self):
        reply, card = A.route(FakeCtx(), SENDER, "What's new with you, Ghost.it?")
        self.assertIn("I find subscriptions you pay for twice", reply.split("\n")[0])
        self.assertIn("**New:**", reply)  # a welcome, not the changelog
        self.assertNotIn("We changed", reply)
        self.assertIn("Reply with a number", reply)
        self.assertEqual(card[0], "carousel")


class OldStorage(unittest.TestCase):
    """An earlier Ghost It on Agentverse saved some values as JSON text (2 Nov crash:
    'str' object has no attribute 'get')."""

    def test_stats_saved_as_text_does_not_crash(self):
        import asyncio

        class Ctx(FakeCtx):
            def __init__(self):
                super().__init__()
                self.sent = []

            async def send(self, to, msg):
                self.sent.append(msg)

        ctx = Ctx()
        ctx.storage.set("stats", "not a dict")
        ctx.storage.set(f"last:{SENDER}", '[{"key": "netflix"}]')
        ctx.storage.set(f"gl:{SENDER}", "old text")
        msg = type("M", (), {})()
        msg.msg_id = "x"
        msg.content = [A.TextContent(type="text", text="@ghostit netflix $8.99 espn plus 11.99 paramount 13.99")]
        asyncio.run(A.handle_message(ctx, SENDER, msg))
        self.assertEqual(len(ctx.sent), 3)  # the acknowledgement, the reply text, then its card
        reply = ctx.sent[1].content[0].text
        self.assertIn("$419.64", reply)


class OldCounters(unittest.TestCase):
    def test_counter_saved_as_a_list_restarts(self):
        ctx = FakeCtx()
        ctx.storage.set("stats", {"users": ["a", "b"], "messages": 3})
        A.bump(ctx, "users")
        A.bump(ctx, "messages")
        self.assertEqual(ctx.storage.get("stats"), {"users": 1, "messages": 4})


class V9Packs(unittest.TestCase):
    """Ghost It fills the gap the app can't see, with specialised Ghost Packs."""

    def test_sound_pack_finds_youtube_music_double(self):
        ctx = FakeCtx()
        A.route(ctx, SENDER, "Spotify $14, YouTube Premium $17")
        reply, card = A.route(ctx, SENDER, "sound pack")
        self.assertIn("Leaks found", reply)
        self.assertIn("Spotify: $14.00/mo x 12 = $168.00/yr", reply)
        self.assertEqual(card[0], "review")
        self.assertEqual(card[1]["approve_cta"]["label"], "Cancel steps")
        steps, steps_card = A.route(ctx, SENDER, json.dumps({"action": "steps", "pack": "Sound"}))
        self.assertIn("Cancel link", steps)
        self.assertEqual(steps_card[0], "carousel")
        self.assertIn("YouTube Premium already includes YouTube Music", reply)

    def test_tech_pack_ai_tools_saving(self):
        ctx = FakeCtx()
        A.route(ctx, SENDER, "ChatGPT $30, Claude $30, Cursor $30, Copilot $15")
        reply, _ = A.route(ctx, SENDER, "tech pack")
        self.assertIn("Keep just Copilot and save $1,080.00/yr", reply)

    def test_packs_command_lists_every_pack(self):
        reply, card = A.route(FakeCtx(), SENDER, "packs")
        for pack in A.PACKS:
            self.assertIn(pack, reply)
        self.assertEqual(card[0], "carousel")
        self.assertEqual(len(card[1]["items"]), len(A.PACKS))

    def test_results_name_their_packs(self):
        reply, _ = A.route(FakeCtx(), SENDER, "Netflix $19, Spotify $14")
        self.assertIn("Your Ghost Packs", reply)


class V93BetterAnswers(unittest.TestCase):
    """Messages ASI:One actually sends that used to get weak replies (rating 2.2)."""

    def test_names_only_get_typical_yearly_cost_and_doubles(self):
        reply, card = A.route(FakeCtx(), SENDER, "I pay for Netflix, Stan and Disney+. Is that too much?")
        self.assertIn("$119.88 to $347.88/yr", reply)
        self.assertIn("3 video streaming", reply)
        self.assertIn("Typical prices, not yours", reply)
        self.assertEqual(card[0], "review")

    def test_storage_names_only(self):
        reply, _ = A.route(FakeCtx(), SENDER, "I'm paying for iCloud and Google One. Do I need both?")
        self.assertIn("2 cloud storage", reply)
        self.assertIn("Google One", reply)

    def test_which_to_cancel_is_advice_not_a_company(self):
        reply, _ = A.route(FakeCtx(), SENDER, "What subscriptions should I cancel to save money?")
        self.assertNotIn("To Save Money", reply)
        self.assertIn("Which to cancel", reply)

    def test_monthly_price_not_read_as_yearly(self):
        reply, _ = A.route(FakeCtx(), SENDER, "Compare Netflix ($18.99/month) and Spotify ($13.99/month) per year.")
        self.assertIn("Spotify: $13.99/mo x 12 = **$167.88/yr**", reply)

    def test_yearly_still_works(self):
        reply, _ = A.route(FakeCtx(), SENDER, "Amazon Prime $139 a year")
        self.assertIn("$139.00/yr x 1", reply)

    def test_cant_read_email(self):
        reply, _ = A.route(FakeCtx(), SENDER, "Every morning, search my Gmail for bills and payment-due notices")
        self.assertIn("can't read your email", reply)
        self.assertIn("base44.app", reply)


class QuickStarts(unittest.TestCase):
    def test_first_reply_has_tap_to_try_examples(self):
        _, card = A.route(FakeCtx(), SENDER, "hi")
        self.assertEqual(card[0], "carousel")
        self.assertGreaterEqual(len(card[1]["items"]), 4)

    def test_tapping_an_example_runs_it(self):
        _, card = A.route(FakeCtx(), SENDER, "hi")
        sel = card[1]["items"][0]["primary_cta"]["selection"]
        reply, _ = A.route(FakeCtx(), SENDER, json.dumps(sel))
        self.assertIn("$372.00 a year", reply)

    def test_use_my_own_opens_the_form(self):
        _, card = A.route(FakeCtx(), SENDER, json.dumps({"action": "form"}))
        self.assertEqual(card[0], "form")


class V10(unittest.TestCase):
    """Explanation cards, more tap-to-try prompts, and the $2 / $5 choice at the paywall."""

    def test_first_reply_offers_explainer(self):
        _, card = A.route(FakeCtx(), SENDER, "hi")
        actions = [i["primary_cta"]["selection"]["action"] for i in card[1]["items"]]
        self.assertIn("explain", actions)

    def test_explainer_questions(self):
        for msg, topic in [("how does it work?", "How Ghost It works"), ("is it free?", "What does it cost"),
                           ("is my data safe?", "What I keep"), ("how do you calculate it?", "How I do the maths"),
                           ("explain packs", "Ghost Pack")]:
            reply, card = A.route(FakeCtx(), SENDER, msg)
            self.assertIn(topic, reply, msg)
            self.assertEqual(card[0], "detail", msg)
            self.assertEqual(len(card[1]["ctas"]), 2, msg)

    def test_explain_menu_and_taps(self):
        _, card = A.route(FakeCtx(), SENDER, "explain")
        self.assertEqual(card[0], "carousel")
        self.assertEqual(len(card[1]["items"]), len(A.EXPLAINERS))
        reply, card = A.route(FakeCtx(), SENDER, json.dumps({"action": "explain", "topic": "price"}))
        self.assertIn("$5 AUD", reply)
        self.assertIn("free while we're in beta", reply)  # no keys in tests

    def test_list_with_how_much_is_still_maths(self):
        reply, _ = A.route(FakeCtx(), SENDER, "Netflix $19, Stan $16. How much is that a year?")
        self.assertIn("The maths", reply)

    def test_buy_when_free(self):
        reply, _ = A.route(FakeCtx(), SENDER, json.dumps({"action": "buy", "plan": "all"}))
        self.assertIn("free while we're in beta", reply)


class V10Paid(PaidPacks):
    def test_upgrade_to_all_reopens_checkout(self):
        self.P.route(self.ctx, SENDER, "screen pack")
        self.P.route(self.ctx, SENDER, "sound pack")
        asyncio.run(self.P.send_payment_request(self.ctx, SENDER))
        reply, _ = self.P.route(self.ctx, SENDER, json.dumps({"action": "buy", "plan": "all"}))
        self.assertIn("$5.00", reply)
        pending = self.P.get(self.ctx, f"pending_pay:{SENDER}", None)
        self.assertEqual((pending["cents"], pending["packs"], pending["session"]), (500, ["all"], None))
        asyncio.run(self.P.send_payment_request(self.ctx, SENDER))
        self.assertEqual(self.ctx.sent[-1].accepted_funds[0].amount, "5.00")


class V10Prompts(unittest.TestCase):
    def test_paying_twice_for_music_says_yes(self):
        reply, _ = A.route(FakeCtx(), SENDER, "Spotify $14, YouTube Premium $17. Am I paying twice?")
        self.assertIn("YouTube Premium already includes YouTube Music", reply)


class V10Useful(unittest.TestCase):
    """Real queries ASI:One sent Ghost It (Agentverse Discovery, 3 Nov)."""

    def test_answer_first_with_saving(self):
        reply, _ = A.route(FakeCtx(), SENDER, "Netflix $19, Stan $16, Disney+ $16. Is that too much?")
        first = reply.splitlines()[0]
        self.assertIn("$612.00 a year", first)
        self.assertIn("save up to **$420.00 a year**", first)  # $612 - the $16 one kept ($192)

    def test_spending_question_is_not_our_price(self):
        reply, card = A.route(FakeCtx(), SENDER, "how much am I spending on subscriptions")
        self.assertIn("Let's find out", reply)
        self.assertNotIn("$2 AUD", reply)
        self.assertEqual(card[0], "form")

    def test_pay_per_use_gets_the_maths(self):
        reply, _ = A.route(FakeCtx(), SENDER, "If there's a credit system where you pay per use, how do I know how much I'm using or what I have to pay?")
        self.assertIn("units you use x price per unit", reply)

    def test_gmail_bills_offers_paste(self):
        reply, _ = A.route(FakeCtx(), SENDER, "Every morning, search my Gmail for bills, invoices, and payment-due notices")
        self.assertIn("copy the amounts from those bills here", reply)

    def test_bills_add_up(self):
        reply, _ = A.route(FakeCtx(), SENDER, "Electricity $540 a quarter, internet $85, phone $45")
        self.assertIn("$540.00/quarter x 4 = **$2,160.00/yr**", reply)

    def test_our_price_still_answers(self):
        for msg in ["is it free?", "how much does it cost?", "how much is a pack?"]:
            reply, _ = A.route(FakeCtx(), SENDER, msg)
            self.assertIn("$5 AUD", reply, msg)


class V11Consolidate(unittest.TestCase):
    def setUp(self):
        self.ctx = FakeCtx()
        A.route(self.ctx, SENDER, "Netflix $19, Stan $16, Disney+ $16, Spotify $14, YouTube Premium $17, "
                                  "ChatGPT $30, Claude $30, Cursor $30, Copilot $15")

    def test_plan_keeps_cheapest_and_shows_saving(self):
        reply, card = A.route(self.ctx, SENDER, "consolidate")
        self.assertIn("**Keep:** Stan ($192.00/yr), the cheapest", reply)
        self.assertIn("Save $420.00 a year** ($612.00 - $192.00)", reply)
        self.assertIn("YouTube Premium already includes YouTube Music", reply)
        self.assertEqual(card[0], "detail")
        self.assertEqual(card[1]["ctas"][0]["selection"], {"action": "cancel_others"})

    def test_ai_tools_split_chat_and_coding(self):
        reply, _ = A.route(self.ctx, SENDER, "consolidate")
        self.assertIn("2 general AI chat tools", reply)
        self.assertIn("2 AI coding tools", reply)
        self.assertEqual(reply.count("Most people need one general AI chat"), 1)
        # 420 + 204 + 360 + 360
        self.assertIn("Total you could save: $1,344.00 a year", reply)

    def test_rotation_maths(self):
        reply, _ = A.route(self.ctx, SENDER, "consolidate screen")
        # 4 months each: 16x4 + 16x4 + 19x4 = 204
        self.assertIn("= $204.00/yr, save $408.00", reply)
        self.assertNotIn("music apps", reply)

    def test_keep_changes_the_plan_and_cancel_others(self):
        reply, _ = A.route(self.ctx, SENDER, "keep Netflix")
        self.assertIn("**Keep:** Netflix ($228.00/yr), your pick", reply)
        reply, _ = A.route(self.ctx, SENDER, "cancel the others")
        self.assertIn("https://my.stan.com.au", reply)
        self.assertNotIn("netflix.com/cancelplan", reply)

    def test_pack_report_offers_consolidate(self):
        reply, card = A.route(self.ctx, SENDER, "screen pack")
        self.assertIn("type `consolidate`", reply)
        self.assertEqual(card[1]["reject_cta"]["selection"], {"action": "consolidate", "pack": "Screen"})

    def test_nothing_to_consolidate(self):
        ctx = FakeCtx()
        A.route(ctx, SENDER, "Netflix $19, gym $25 a week")
        reply, _ = A.route(ctx, SENDER, "consolidate")
        self.assertIn("Nothing to consolidate", reply)


class V11Headline(unittest.TestCase):
    def test_headline_matches_consolidate_plan(self):
        ctx = FakeCtx()
        reply, _ = A.route(ctx, SENDER, "ChatGPT $30, Claude $30, Cursor $30, Copilot $15")
        self.assertIn("Keep one of each and save up to **$720.00 a year**", reply.splitlines()[0])
        plan, _ = A.route(ctx, SENDER, "consolidate")
        self.assertIn("Total you could save: $720.00 a year", plan)


class OpenersGetCards(unittest.TestCase):
    """Whatever someone sends first, they get the tap-to-try cards (3 Nov)."""

    def test_every_opener_has_the_cards(self):
        for msg in ["hi", "hello", "help", "start", "what can you do?", "menu", "?",
                    "Tell me what you were created to do", "What's new with you, Ghost.it?"]:
            _, card = A.route(FakeCtx(), SENDER, msg)
            self.assertEqual(card[0], "carousel", msg)
            self.assertIn("qs-how", [item["id"] for item in card[1]["items"]], msg)


class KeepQuestion(unittest.TestCase):
    def test_list_with_which_should_i_keep_gives_the_plan(self):
        reply, card = A.route(FakeCtx(), SENDER, "Netflix $19, Stan $16, Disney+ $16. Which one should I keep?")
        self.assertIn("Your consolidate plan", reply)
        self.assertIn("Save $420.00 a year", reply)
        self.assertEqual(card[0], "detail")

    def test_quick_start_card_runs_the_plan(self):
        _, card = A.route(FakeCtx(), SENDER, "hi")
        item = next(i for i in card[1]["items"] if i["title"].startswith("🧩"))
        reply, _ = A.route(FakeCtx(), SENDER, json.dumps(item["primary_cta"]["selection"]))
        self.assertIn("Your consolidate plan", reply)


class V12TextFirst(unittest.TestCase):
    def test_number_runs_the_menu_item(self):
        ctx = FakeCtx()
        A.route(ctx, SENDER, "hi")
        reply, _ = A.route(ctx, SENDER, "2")   # 💻 Too many AI tools?
        self.assertIn("$1,260.00 a year", reply.splitlines()[0])
        reply, _ = A.route(ctx, SENDER, "5")   # How does it work?
        self.assertIn("How Ghost It works", reply)

    def test_live_default_is_text_only(self):
        old = os.environ.pop("GHOSTIT_CARDS", None)
        try:
            B = load_agent.__wrapped__() if hasattr(load_agent, "__wrapped__") else None
            import importlib.util as u
            spec = u.spec_from_file_location("ghost_it_textonly", HERE / "agent.py")
            mod = u.module_from_spec(spec); spec.loader.exec_module(mod)
            self.assertFalse(mod.USE_CARDS)
            reply, _ = mod.route(FakeCtx(), SENDER, "hi")
            self.assertIn("I find subscriptions you pay for twice", reply)
            self.assertIn("**1.**", reply)
        finally:
            if old is not None:
                os.environ["GHOSTIT_CARDS"] = old


class V12Questions(unittest.TestCase):
    def test_common_questions_by_number(self):
        reply, _ = A.route(FakeCtx(), SENDER, "hi")
        self.assertIn("**Common questions:**", reply)
        for n, expect in [("7", "What does it cost"), ("8", "What I keep"), ("9", "How I do the maths"), ("10", "What's new")]:
            r, _ = A.route(FakeCtx(), SENDER, n)
            self.assertIn(expect, r, n)
