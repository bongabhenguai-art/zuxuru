import unittest
from datetime import datetime, timezone, timedelta
from closer import assess, dashboard, Page

class CloserTests(unittest.TestCase):
    def setUp(self):
        self.now = datetime.now(timezone.utc)
        self.quote = 'We are looking for a designer for denim uniforms.'
        self.lead = {'name': 'TEST FIXTURE — not a customer', 'quote': self.quote, 'need': 'Denim uniform design', 'requester_verified': True}
        self.evidence = {'status': 'available', 'source_url': 'https://example.com/request', 'text': self.quote, 'published_at': self.now.isoformat()}
    def test_evidenced_request_prepares_offer_without_claiming_sale(self):
        r = assess(self.lead, self.evidence, self.now)
        self.assertEqual(r['qualification'], 'Ready for quote review'); self.assertFalse(r['ready_to_buy']); self.assertIsNone(r['package']['price_zar'])
    def test_listing_or_ai_draft_is_not_buyer_intent(self):
        self.evidence['text'] = 'We sell designer denim uniforms.'
        self.assertEqual(assess(self.lead, self.evidence, self.now)['qualification'], 'Needs review')
    def test_unknown_stale_future_and_blocked_sources(self):
        for date in (None, (self.now - timedelta(days=31)).isoformat(), (self.now + timedelta(days=1)).isoformat()):
            self.evidence['published_at'] = date
            self.assertEqual(assess(self.lead, self.evidence, self.now)['qualification'], 'Needs review')
        self.evidence['published_at'] = self.now.isoformat(); self.evidence['status'] = 'blocked'
        self.assertFalse(assess(self.lead, self.evidence, self.now)['quote_verified'])
    def test_owner_identity_review_required(self):
        self.lead['requester_verified'] = False
        self.assertEqual(assess(self.lead, self.evidence, self.now)['stage'], 'Lead')
    def test_dashboard_escapes_untrusted_content(self):
        self.lead['name'] = '<script>alert(1)</script>'
        output = dashboard([assess(self.lead, self.evidence, self.now)])
        self.assertNotIn('<script>', output); self.assertIn('&lt;script&gt;', output)
    def test_page_discards_script_text_and_reads_date(self):
        p = Page(); p.feed('<meta property="article:published_time" content="2026-10-07"><script>fake buyer</script><p>real page</p>')
        self.assertNotIn('fake buyer', p.parts); self.assertEqual(p.published, '2026-10-07')

if __name__ == '__main__': unittest.main()
