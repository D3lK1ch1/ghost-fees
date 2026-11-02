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
        self.assertIn("no prices yet", reply)

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

    def test_message_with_card(self):
        msg = A.make_msg("hi", ("form", {"a": 1}))
        kinds = [type(c).__name__ for c in msg.content]
        self.assertEqual(kinds, ["TextContent", "MetadataContent"])


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
        self.assertIn("$2.00 once", reply)
        self.assertIsNone(card)
        self.assertNotIn("spotify.com", reply)  # steps only after paying
        pending = self.P.get(self.ctx, f"pending_pay:{SENDER}", None)
        self.assertEqual((pending["cents"], pending["packs"]), (200, ["Sound"]))

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
        self.assertEqual((req.accepted_funds[0].amount, req.accepted_funds[0].currency, req.accepted_funds[0].payment_method), ("2.00", "AUD", "stripe"))
        self.assertEqual(req.metadata["stripe"]["checkout_session_id"], "cs_test_123")
        self.assertNotIn("sk_test", json.dumps(req.metadata))  # secret key never leaves the agent
        self.assertTrue(all(isinstance(v, str) for v in req.metadata["stripe"].values()))
        commit = types.SimpleNamespace(funds=types.SimpleNamespace(payment_method="stripe"), transaction_id="cs_test_123")
        asyncio.run(self.P.on_commit(self.ctx, SENDER, commit))
        kinds = [type(m).__name__ for m in self.ctx.sent]
        self.assertIn("CompletePayment", kinds)
        delivered = self.ctx.sent[-1].content[0].text
        self.assertIn("Paid, thank you", delivered)
        self.assertIn("spotify", delivered.lower())
        self.assertIn("Sound", self.P.get(self.ctx, f"unlocked:{SENDER}", []))
        self.P.ADMIN_CODE = "s3cret"
        ev, _ = self.P.route(self.ctx, SENDER, "evidence s3cret")
        self.assertIn("Paid Ghost Packs: 1 ($2.00 taken)", ev)
        self.assertIn("Free Ghost Packs used: 1", ev)
        reply, _ = self.P.route(self.ctx, SENDER, "sound pack")  # unlocked now: no price
        self.assertNotIn("$2.00 once", reply)

    def test_unpaid_commit_is_cancelled(self):
        self.P.route(self.ctx, SENDER, "screen pack")
        self.P.route(self.ctx, SENDER, "sound pack")
        asyncio.run(self.P.send_payment_request(self.ctx, SENDER))
        self.status = "unpaid"
        commit = types.SimpleNamespace(funds=types.SimpleNamespace(payment_method="stripe"), transaction_id="cs_test_123")
        asyncio.run(self.P.on_commit(self.ctx, SENDER, commit))
        self.assertEqual(type(self.ctx.sent[-1]).__name__, "CancelPayment")
        self.assertNotIn("Sound", self.P.get(self.ctx, f"unlocked:{SENDER}", []))

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
            self.assertEqual(reply, A.PURPOSE, msg)
            self.assertEqual(card[0], "form", msg)

    def test_text_only_fallback_keeps_the_commands(self):
        A.USE_CARDS = False
        try:
            reply, _ = A.route(FakeCtx(), SENDER, "hi")
            self.assertTrue(reply.startswith(A.PURPOSE))
            self.assertIn("screen pack", reply)
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
            self.assertIn("I find subscriptions you're paying for twice", reply, msg)
            self.assertIn("Check it stopped", reply, msg)
            self.assertEqual(card[0], "form", msg)
            self.assertNotIn("—", reply)

    def test_hi_is_still_one_line(self):
        reply, _ = A.route(FakeCtx(), SENDER, "hi")
        self.assertEqual(reply, A.PURPOSE)


class AsiOneGreeting(unittest.TestCase):
    """ASI:One pre-fills "What's new with you, Ghost.it?" on the profile."""

    def test_whats_new_with_you_leads_with_the_purpose_and_a_card(self):
        reply, card = A.route(FakeCtx(), SENDER, "What's new with you, Ghost.it?")
        self.assertTrue(reply.startswith("I find subscriptions you're paying for twice"))
        self.assertIn("AI tools double up", reply)
        self.assertIn("Try it", reply)
        self.assertEqual(card[0], "form")


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
        self.assertEqual(len(ctx.sent), 2)  # the acknowledgement and the reply
        reply = ctx.sent[1].content[0].text
        self.assertIn("$419.64", reply)
