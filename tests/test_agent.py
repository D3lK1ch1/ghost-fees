"""Tests for Ghost It's plain-Python logic (no network, no LLM, no Agentverse).

Run from the ghost-it folder:   python3 -m unittest discover -s tests -v

The uagents / openai packages are replaced with small stand-ins, so these run on
any Mac with Python 3. They test the parts that must never be wrong: name
matching, money maths, the free check, cancel packs, status updates, feedback
capture and the checked cancel-link table.
"""
import importlib.util
import json
import re
import sys
import types
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent


def _install_stubs():
    """Minimal stand-ins for uagents, uagents_core and openai."""
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
    for name in ("ChatAcknowledgement", "ChatMessage", "EndSessionContent", "TextContent"):
        setattr(chat, name, type(name, (_Model,), {}))
    chat.chat_protocol_spec = object()
    openai = types.ModuleType("openai")
    openai.OpenAI = lambda **kwargs: object()
    for mod_name in ("uagents_core", "uagents_core.contrib", "uagents_core.contrib.protocols"):
        sys.modules.setdefault(mod_name, types.ModuleType(mod_name))
    sys.modules["uagents"] = uagents
    sys.modules["uagents_core.contrib.protocols.chat"] = chat
    sys.modules["openai"] = openai


def load_agent():
    _install_stubs()
    spec = importlib.util.spec_from_file_location("ghost_it_agent", HERE / "agent.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


A = load_agent()


class FakeStorage:
    def __init__(self):
        self.data = {}

    def get(self, key):
        return self.data.get(key)

    def set(self, key, value):
        self.data[key] = value


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


def user_with(items):
    data = A.new_data()
    A.merge_items(data, items)
    return data


class MatchTests(unittest.TestCase):
    def test_known_names(self):
        self.assertEqual(A.match("Netflix"), "netflix")
        self.assertEqual(A.match("stan"), "stan")
        self.assertEqual(A.match("Spotify Premium"), "spotify")

    def test_word_boundaries(self):
        # "stan" must not match inside another word.
        self.assertIsNone(A.match("standard chartered"))

    def test_unknown(self):
        self.assertIsNone(A.match("Bob's Kombucha Club"))


class MoneyTests(unittest.TestCase):
    def test_yearly(self):
        self.assertEqual(A.yearly(10, "month"), 120)
        self.assertEqual(A.yearly(10, None), 120)
        self.assertEqual(A.yearly(25, "week"), 1300)
        self.assertEqual(A.yearly(99, "year"), 99)
        self.assertIsNone(A.yearly(None, "month"))

    def test_money_format(self):
        self.assertEqual(A.money(1234.4), "$1,234")


class MergeTests(unittest.TestCase):
    def test_merge_known_and_unknown(self):
        data = user_with([{"name": "Netflix", "price": 19}, {"name": "Bob's Kombucha", "price": 8}])
        self.assertEqual(data["subs"]["netflix"]["yearly"], 228)
        self.assertEqual(data["subs"]["netflix"]["pack"], "screen")
        other = data["subs"]["other:bob's kombucha"]
        self.assertEqual(other["pack"], "other")
        self.assertEqual(other["yearly"], 96)

    def test_merge_keeps_price_when_missing(self):
        data = user_with([{"name": "Stan", "price": 16}])
        A.merge_items(data, [{"name": "Stan", "renews_day": 12}])
        self.assertEqual(data["subs"]["stan"]["yearly"], 192)
        self.assertEqual(data["subs"]["stan"]["renews_day"], 12)

    def test_bad_renewal_day_ignored(self):
        data = user_with([{"name": "Stan", "price": 16, "renews_day": 40}])
        self.assertIsNone(data["subs"]["stan"]["renews_day"])


class FreeCheckTests(unittest.TestCase):
    def test_totals_and_streaming_double_up(self):
        data = user_with([{"name": "Netflix", "price": 19}, {"name": "Stan", "price": 16}, {"name": "Disney+", "price": 16}])
        text = A.free_check(data, {})
        self.assertIn("$612", text)  # (19 + 16 + 16) x 12
        self.assertIn("Screen", text)

    def test_empty_gets_help(self):
        self.assertEqual(A.free_check(A.new_data(), {}), A.HELP)


class PackTests(unittest.TestCase):
    def test_pack_has_checked_link_and_ghosts_it(self):
        ctx, sender = FakeCtx(), "agent1test"
        data = user_with([{"name": "Netflix", "price": 19}, {"name": "Stan", "price": 16}])
        text = A.deliver_pack(ctx, sender, data, ["screen"])
        self.assertIn(A.CATALOGUE["netflix"][3], text)
        self.assertEqual(data["ghosts"]["netflix"]["status"], "requested")
        self.assertIn("screen", data["paid_packs"])
        saved = json.loads(ctx.storage.get(f"user:{sender}"))
        self.assertIn("stan", saved["ghosts"])

    def test_empty_pack(self):
        text = A.deliver_pack(FakeCtx(), "agent1test", user_with([{"name": "Netflix", "price": 19}]), ["fitness"])
        self.assertIn("don't have any subscriptions in that pack", text)


class StatusTests(unittest.TestCase):
    def setUp(self):
        self.data = user_with([{"name": "Netflix", "price": 19}, {"name": "Stan", "price": 16}])
        A.deliver_pack(FakeCtx(), "agent1test", self.data, ["screen"])

    def test_mixed_update(self):
        changed = A.apply_status_updates(self.data, "Stan stopped, Netflix still charging", [])
        self.assertEqual(set(changed), {"stan", "netflix"})
        self.assertEqual(self.data["ghosts"]["stan"]["status"], "confirmed")
        self.assertEqual(self.data["ghosts"]["netflix"]["status"], "still_charging")

    def test_ghost_list_totals(self):
        A.apply_status_updates(self.data, "Stan stopped", [])
        text = A.ghost_list(self.data)
        self.assertIn("$192", text)  # Stan confirmed
        self.assertIn("$228", text)  # Netflix still waiting


class FeedbackTests(unittest.TestCase):
    def test_feedback_prefix(self):
        self.assertTrue(A.FEEDBACK_RE.match("feedback: add Foxtel"))
        self.assertTrue(A.FEEDBACK_RE.match("Suggestion - add Binge"))
        self.assertFalse(A.FEEDBACK_RE.match("Netflix $19"))

    def test_feedback_saved_and_logged(self):
        ctx = FakeCtx()
        A.save_feedback(ctx, "agent1abcdef", "add Foxtel")
        stored = json.loads(ctx.storage.get("feedback"))
        self.assertEqual(stored[-1]["text"], "add Foxtel")
        self.assertEqual(stored[-1]["user"], "abcdef")  # only the last 6 characters of the address
        self.assertTrue(any("FEEDBACK #1" in line for line in ctx.logger.lines))


class CatalogueTests(unittest.TestCase):
    def test_links_are_https_and_steps_present(self):
        for key, row in A.CATALOGUE.items():
            link, steps = row[3], row[4]
            if link:
                self.assertTrue(link.startswith("https://"), f"{key}: {link}")
            self.assertTrue(steps, f"{key} has no cancel steps")

    def test_aliases_unique(self):
        seen = {}
        for key, row in A.CATALOGUE.items():
            for alias in row[2]:
                self.assertNotIn(alias, seen, f"alias {alias!r} used by {seen.get(alias)} and {key}")
                seen[alias] = key


class PackGateTests(unittest.TestCase):
    """One free Ghost Pack, then the price. Beta delivers everything but explains it."""

    def setUp(self):
        self.saved = A.PAYMENTS_ENABLED
        self.data = user_with([{"name": "Netflix", "price": 19}, {"name": "Spotify", "price": 14}, {"name": "Gym", "price": 25, "period": "week"}])

    def tearDown(self):
        A.PAYMENTS_ENABLED = self.saved

    def test_beta_first_pack_free_then_explains(self):
        A.PAYMENTS_ENABLED = False
        packs, note = A.pack_gate(self.data, ["screen"])
        self.assertEqual(packs, ["screen"])
        self.assertIn("first Ghost Pack is free", note)
        self.assertTrue(self.data["free_pack_used"])
        packs, note = A.pack_gate(self.data, ["sound"])
        self.assertEqual(packs, ["sound"])  # still free in beta
        self.assertIn("Free while we're in beta", note)
        self.assertIn(f"${A.PACK_PRICE} a pack", note)

    def test_paid_one_free_try_then_price(self):
        A.PAYMENTS_ENABLED = True
        packs, note = A.pack_gate(self.data, ["screen"])
        self.assertEqual(packs, ["screen"])
        self.assertIn("free", note)
        A.deliver_pack(FakeCtx(), "agent1test", self.data, packs)
        packs, note = A.pack_gate(self.data, ["sound"])
        self.assertEqual(packs, [])
        self.assertIn("used your free Ghost Pack", note)
        self.assertIn("Sound Pack", note)
        packs, _ = A.pack_gate(self.data, ["screen"])
        self.assertEqual(packs, ["screen"])  # already unlocked stays unlocked

    def test_paid_ghost_everything_gives_one_free(self):
        A.PAYMENTS_ENABLED = True
        packs, note = A.pack_gate(self.data, ["screen", "sound", "fitness", "food"])
        self.assertEqual(len(packs), 1)
        self.assertIn("One pack is on us", note)
        self.assertNotIn("Food", note)  # empty packs are never priced

    def test_empty_pack_does_not_use_free_try(self):
        A.PAYMENTS_ENABLED = True
        packs, note = A.pack_gate(self.data, ["food"])
        self.assertEqual((packs, note), ([], ""))
        self.assertFalse(self.data["free_pack_used"])

    def test_free_check_mentions_first_pack_free(self):
        A.PAYMENTS_ENABLED = False
        self.assertIn("first one is free", A.free_check(self.data, {}))


class StatsTests(unittest.TestCase):
    def setUp(self):
        self.ctx = FakeCtx()
        A.track_usage(self.ctx, "agent1aaaaaa", "check")
        A.track_usage(self.ctx, "agent1bbbbbb", "check")
        A.save_feedback(self.ctx, "agent1bbbbbb", "add Foxtel please")
        A.bump_stat(self.ctx, "packs", 2)

    def test_counts_for_anyone_without_feedback_text(self):
        text = A.stats_reply(self.ctx)
        self.assertIn("**2**", text)  # two people
        self.assertIn("Feedback messages: **1**", text)
        self.assertIn("Ghost Packs given out: **2**", text)
        self.assertNotIn("Foxtel", text)

    def test_owner_code_shows_feedback(self):
        import os
        os.environ["GHOSTIT_OWNER_KEY"] = "s3cret"
        try:
            self.assertIn("add Foxtel please", A.stats_reply(self.ctx, "s3cret"))
            wrong = A.stats_reply(self.ctx, "guess")
            self.assertNotIn("Foxtel", wrong)
            self.assertIn("didn't match", wrong)
        finally:
            del os.environ["GHOSTIT_OWNER_KEY"]

    def test_no_owner_key_set_never_shows_feedback(self):
        self.assertNotIn("Foxtel", A.stats_reply(self.ctx, ""))
        self.assertTrue(A.STATS_RE.match("stats"))
        self.assertTrue(A.STATS_RE.match("STATS abc123"))
        self.assertFalse(A.STATS_RE.match("stats for netflix please"))


if __name__ == "__main__":
    unittest.main()
