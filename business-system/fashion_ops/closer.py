"""Evidence-first fashion offer preparation. No outreach, payments or inferred buyers."""
import argparse
import hashlib
import html
import json
import re
import sys
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, build_opener

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'visibility'))
from backlinks import public_url, Redirects

STAGES = ['Lead', 'Personal Profile', 'Development Deal', 'Ready-to-Buy', 'Sales', 'Closer', 'Close', 'Sale', 'Customer']
INTENT = re.compile(r'\b(looking for|seeking|need|wanted|request for quotation|rfq|commission|quotation|quote for)\b', re.I)
FASHION = re.compile(r'\b(designer|dress|gown|garment|tailor|denim|couture|fashion|uniform|outfit|wear)\b', re.I)


class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts = []; self.published = None; self.ignore = 0
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('script', 'style', 'noscript'): self.ignore += 1
        if tag == 'meta' and attrs.get('property') == 'article:published_time': self.published = attrs.get('content')
        if tag == 'time' and attrs.get('datetime') and not self.published: self.published = attrs['datetime']
    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'noscript'): self.ignore = max(0, self.ignore - 1)
    def handle_data(self, data):
        if not self.ignore: self.parts.append(data)


def fetch(url):
    result = {'source_url': url, 'checked_at': datetime.now(timezone.utc).isoformat(), 'status': 'unavailable', 'text': '', 'published_at': None}
    try:
        public_url(url)
        with build_opener(Redirects()).open(Request(url, headers={'User-Agent': 'BongaFashionResearch/1.0'}), timeout=15) as response:
            public_url(response.url)
            if 'text/html' not in response.headers.get('content-type', ''): result['status'] = 'unsupported'; return result
            raw = response.read(1_000_001)
            if len(raw) > 1_000_000: result['status'] = 'too_large'; return result
            page = Page(); page.feed(raw.decode('utf-8', errors='replace'))
            result.update(status='available', text=' '.join(' '.join(page.parts).split()), published_at=page.published, final_url=response.url)
    except HTTPError as exc: result['status'] = 'blocked' if exc.code in (401, 403, 429, 999) else 'unavailable'
    except Exception: pass
    return result


def fresh(value, now):
    try:
        stamp = datetime.fromisoformat(value.replace('Z', '+00:00'))
        if stamp.tzinfo is None: stamp = stamp.replace(tzinfo=timezone.utc)
        return 0 <= (now - stamp).total_seconds() <= 30 * 86400
    except (ValueError, TypeError, AttributeError): return False


def assess(lead, evidence, now):
    name = str(lead.get('name', 'Business to review'))[:100]
    need = str(lead.get('need', ''))[:1000]
    quote = ' '.join(str(lead.get('quote', '')).split())[:1000]
    source = evidence.get('source_url', '')
    # Buyer intent is checked in the actual quote, never in our personalised draft.
    quote_verified = len(quote) >= 20 and evidence.get('status') == 'available' and quote.casefold() in evidence.get('text', '').casefold()
    request = bool(quote_verified and INTENT.search(quote) and FASHION.search(quote))
    recent = fresh(evidence.get('published_at'), now)
    identity = lead.get('requester_verified') is True
    fit = bool(FASHION.search(need))
    score = (35 if request else 0) + (20 if recent else 0) + (25 if identity else 0) + (20 if fit else 0)
    qualified = request and recent and identity and fit
    blocked = []
    if not quote_verified: blocked.append('Source quote not verified')
    if not request: blocked.append('No verified fashion buying request')
    if not recent: blocked.append('Publication date unknown or older than 30 days')
    if not identity: blocked.append('Requester identity needs owner review')
    if not fit: blocked.append('Fashion service fit needs review')
    if re.search(r'bridal|wedding|gown', need, re.I): package = 'Occasion & bridal design consultation'
    elif re.search(r'denim|streetwear', need, re.I): package = 'Signature denim design consultation'
    elif re.search(r'uniform|collection|brand', need, re.I): package = 'Collection development consultation'
    else: package = 'Personal fashion design consultation'
    row = {'id': hashlib.sha256((source + name).encode()).hexdigest()[:16], 'name': name, 'source_url': source,
        'checked_at': evidence.get('checked_at'), 'published_at': evidence.get('published_at'), 'source_status': evidence.get('status'),
        'quote': quote, 'quote_verified': quote_verified, 'need': need, 'skyscraper_priority_score': score,
        'score_meaning': 'Review priority only, not purchase probability', 'stage': 'Development Deal' if qualified else 'Lead',
        'qualification': 'Ready for quote review' if qualified else 'Needs review', 'ready_to_buy': False,
        'blockers': blocked, 'package': {'name': package, 'price_zar': None, 'price_status': 'Personal quote required',
            'includes': ['Design consultation', 'Concept and material direction', 'Scope, fitting and delivery discussion'],
            'personalisation': need, 'availability': 'Must be confirmed by Bonga'},
        'next_step': 'Confirm budget, measurements, timing and permission to follow up' if qualified else 'Review source, date and requester before outreach',
        'outreach_draft': f'Hello {name}. I’m Bonga Bhengu, a Durban fashion designer. Your brief mentions: {need}. I would be happy to discuss a suitable design approach, materials and a personal quote. What is your required date and budget range?',
        'draft_status': 'Unsent; owner review required'}
    return row


def dashboard(rows):
    esc = html.escape
    cards = []
    for r in rows:
        source = r['source_url']; safe_link = source.startswith(('https://', 'http://'))
        link = '<a target="_blank" rel="noopener noreferrer" href="' + esc(source, quote=True) + '">View source evidence</a>' if safe_link else 'Invalid source'
        cards.append('<article><h2>' + esc(r['name']) + '</h2><p>' + esc(r['qualification']) + ' · Review priority ' + str(r['skyscraper_priority_score']) + '/100</p><blockquote>' + esc(r['quote']) + '</blockquote>' + link + '<p>' + esc('; '.join(r['blockers']) or r['next_step']) + '</p><h3>' + esc(r['package']['name']) + '</h3><p>' + esc(r['need']) + '</p><p>Personal quote required · Not confirmed ready-to-buy</p></article>')
    body = ''.join(cards) or '<p>No source-backed prospects imported. Add public request URLs and short quotes to begin.</p>'
    return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Bonga — Customer research</title><style>body{background:#0a0c10;color:#f3eee3;font:16px/1.7 Arial;margin:0;padding:5%;max-width:1100px}h1{font-size:42px}h2{font-size:25px}article{padding:26px;margin:24px 0;border:1px solid #75623c;background:#141923}a{color:#e5c27c}blockquote{border-left:2px solid #ba9c61;padding-left:20px;margin-left:0;overflow-wrap:anywhere}p{color:#c5c1b8}</style><h1>Customer research & offers</h1><p>Private operational report. Source evidence first. Priority scores do not confirm customers.</p>' + body + '</html>'


def run(input_path, output_dir):
    source = Path(input_path)
    if source.stat().st_size > 200_000: raise ValueError('Input is too large')
    data = json.loads(source.read_text())
    if not isinstance(data.get('leads'), list): raise ValueError('Input must contain a leads array')
    rows = []; seen = set(); now = datetime.now(timezone.utc)
    for lead in data['leads'][:10]:
        if not isinstance(lead, dict): continue
        url = str(lead.get('source_url', ''))
        if url in seen: continue
        seen.add(url); rows.append(assess(lead, fetch(url), now))
    out = Path(output_dir); out.mkdir(parents=True, exist_ok=True)
    (out / 'customer-offers.json').write_text(json.dumps({'leads': rows, 'stages': STAGES}, indent=2))
    (out / 'osint-dashboard.html').write_text(dashboard(rows))
    tasks = [{'id': 'fashion-closer-' + r['id'], 'module': 'sales', 'title': 'Review fashion offer for ' + r['name'], 'deliverable': r['next_step'] + '; source: ' + r['source_url'], 'minutes': 30, 'priority': 'high' if r['qualification'] == 'Ready for quote review' else 'medium'} for r in rows]
    (out / 'jarvis-tasks.json').write_text(json.dumps({'tasks': tasks}, indent=2))
    (out / 'mirofish-seed.json').write_text(json.dumps({'status': 'Prepared, not simulated', 'question': 'Which offer positioning deserves a small real-world test?', 'offers': [r['package'] for r in rows], 'rule': 'Simulated personas are hypothetical. Do not label them customers or treat simulations as demand evidence.'}, indent=2))
    print(f'Prepared {len(rows)} evidence records; no messages sent or sales claimed.')


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__); p.add_argument('--input', required=True); p.add_argument('--out', required=True)
    args = p.parse_args(); run(args.input, args.out)
