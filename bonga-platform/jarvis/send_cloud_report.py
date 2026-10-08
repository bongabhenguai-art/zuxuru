"""Deliver a draft using GitHub's short-lived identity."""
import json,os,pathlib,urllib.parse,urllib.request,urllib.error,base64
base='https://zuxuru.bongabhenguai.workers.dev'
url=os.environ['ACTIONS_ID_TOKEN_REQUEST_URL']+'&audience='+urllib.parse.quote(base,safe='')
request=urllib.request.Request(url,headers={'Authorization':'Bearer '+os.environ['ACTIONS_ID_TOKEN_REQUEST_TOKEN']})
with urllib.request.urlopen(request,timeout=30) as response: token=json.load(response)['value']
report=pathlib.Path('jarvis-local-report.md').read_text(encoding='utf-8')
request=urllib.request.Request(base+'/api/jarvis/cloud/report',data=json.dumps({'report':report}).encode(),headers={'Authorization':'Bearer '+token,'Content-Type':'application/json','User-Agent':'Bonga-Jarvis-Report/1.0'})
try:
    with urllib.request.urlopen(request,timeout=30) as response: result=json.load(response)
except urllib.error.HTTPError as error:
    body=error.read(2000).decode('utf-8',errors='replace')
    try: message=json.loads(body).get('error','Dashboard rejected delivery')
    except ValueError: message='Delivery was rejected before reaching the dashboard'
    claims=json.loads(base64.urlsafe_b64decode(token.split('.')[1]+'==='))
    print('Job identity routing:',json.dumps({k:claims.get(k) for k in ['repository','ref','workflow_ref','sub','aud']}))
    raise RuntimeError(str(error.code)+': '+message) from None
if not result.get('saved'):raise RuntimeError('Dashboard did not confirm report storage')
print('Report delivered to the private Bonga Bhengu dashboard')
