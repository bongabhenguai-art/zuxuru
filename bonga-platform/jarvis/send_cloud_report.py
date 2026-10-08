"""Send a report using GitHub's short-lived job identity; no stored API token."""
import json,os,pathlib,urllib.parse,urllib.request
base='https://zuxuru.bongabhenguai.workers.dev'
url=os.environ['ACTIONS_ID_TOKEN_REQUEST_URL']+'&audience='+urllib.parse.quote(base,safe='')
request=urllib.request.Request(url,headers={'Authorization':'Bearer '+os.environ['ACTIONS_ID_TOKEN_REQUEST_TOKEN']})
with urllib.request.urlopen(request,timeout=30) as response: token=json.load(response)['value']
report=pathlib.Path('jarvis-local-report.md').read_text(encoding='utf-8')
request=urllib.request.Request(base+'/api/jarvis/cloud/report',data=json.dumps({'report':report}).encode(),headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'})
with urllib.request.urlopen(request,timeout=30) as response: result=json.load(response)
if not result.get('saved'):raise RuntimeError('Dashboard did not confirm report storage')
print('Report delivered to the private Bonga Bhengu dashboard')
