"""Deliver a draft using GitHub's short-lived identity; never forward it through redirects."""
import json, os, pathlib, urllib.parse, urllib.request, urllib.error

BASE = 'https://zuxuru.bongabhenguai.workers.dev'

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def read_json(request, opener):
    try:
        with opener.open(request, timeout=30) as response:
            body = response.read(100001)
            if len(body) > 100000:
                raise RuntimeError('Delivery response exceeded the allowed size')
            try:
                result = json.loads(body)
            except (ValueError, UnicodeError):
                raise RuntimeError('Server returned a non-JSON response; check Cloudflare Access routing') from None
            if not isinstance(result, dict):
                raise RuntimeError('Server returned an unexpected response format')
            return result
    except urllib.error.HTTPError as error:
        if 300 <= error.code < 400:
            raise RuntimeError('Delivery blocked by a redirect. Cloudflare Access must allow the signed report request to reach the Worker GitHub OIDC verifier; dashboard login must remain protected.') from None
        raise RuntimeError('Report request rejected: HTTP ' + str(error.code)) from None

def deliver(environ=os.environ, report_path='jarvis-local-report.md', opener=None):
    opener = opener or urllib.request.build_opener(NoRedirect())
    report = pathlib.Path(report_path).read_text(encoding='utf-8')
    if not report.strip() or len(report) > 40000 or '\x00' in report:
        raise RuntimeError('Report is empty or exceeds dashboard limits')
    url = environ['ACTIONS_ID_TOKEN_REQUEST_URL']
    url += ('&' if '?' in url else '?') + urllib.parse.urlencode({'audience': BASE})
    request = urllib.request.Request(url, headers={'Authorization': 'Bearer ' + environ['ACTIONS_ID_TOKEN_REQUEST_TOKEN']})
    token = read_json(request, opener).get('value')
    if not isinstance(token, str) or not token:
        raise RuntimeError('GitHub did not issue a job identity')
    request = urllib.request.Request(BASE + '/api/jarvis/cloud/report',
        data=json.dumps({'report': report}).encode(),
        headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'User-Agent': 'Bonga-Jarvis-Report/1.1'})
    result = read_json(request, opener)
    if result.get('saved') is not True:
        raise RuntimeError('Dashboard did not confirm report storage')
    print('Report delivered to the private Bonga Bhengu dashboard')

if __name__ == '__main__':
    deliver()
