import unittest
from planner import build_plan, markdown

class PlannerTests(unittest.TestCase):
    def test_candidates_and_unavailable_repositories_do_not_become_matched_links(self):
        snapshot = {"checked_on":"2026-10-07", "profiles":[
            {"platform":"Facebook", "status":"matched", "url":"https://example.com/matched"},
            {"platform":"YouTube", "status":"matched_crosslink", "url":"https://example.com/channel"},
            {"platform":"Pinterest", "status":"candidate", "url":"https://example.com/candidate"},
            {"platform":"GitHub", "status":"access_unavailable", "url":"https://example.com/repo"},
            {"platform":"LinkedIn", "status":"matched_historical", "url":"https://example.com/old"},
        ]}
        plan = build_plan("bonga", "visibility", snapshot)
        self.assertEqual(len(plan["matched_public_links"]), 2)
        self.assertEqual(len(plan["needs_review"]), 3)
        self.assertIn("Confirm ownership", plan["next_steps"][0])
        self.assertIn("no language-model call", plan["mode"])

    def test_brand_and_goal_change_the_plan(self):
        plan = build_plan("ai", "identity", {"profiles":[]})
        self.assertEqual(plan["brand"], "Innovative AI Design")
        self.assertIn("wordmark", plan["next_steps"][1])
        self.assertIn("Designing the Future with AI", markdown(plan))
        self.assertNotIn("follower", markdown(plan).lower())

    def test_unknown_brand_and_goal_fail_clearly(self):
        for brand, goal in [("unknown", "identity"), ("bonga", "unknown")]:
            with self.assertRaises(ValueError):
                build_plan(brand, goal, {})

if __name__ == "__main__":
    unittest.main()
