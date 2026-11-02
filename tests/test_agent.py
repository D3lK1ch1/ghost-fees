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

    def test_message_with_card(self):
        msg = A.make_msg("hi", ("form", {"a": 1}))
        kinds = [type(c).__name__ for c in msg.content]
        self.assertEqual(kinds, ["TextContent", "MetadataContent"])


if __name__ == "__main__":
    unittest.main()
