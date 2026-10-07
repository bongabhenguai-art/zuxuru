import argparse,json,ipaddress,socket
from datetime import datetime,timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit,urljoin
from urllib.request import Request,build_opener,HTTPRedirectHandler
from urllib.error import HTTPError
def public_url(value):
    u=urlsplit(value)
    if u.scheme not in ('http','https') or not u.hostname or u.username or u.password or u.port not in (None,80,443):raise ValueError('Use a public HTTP(S) URL.')
    addresses=socket.getaddrinfo(u.hostname,u.port or (443 if u.scheme=='https' else 80))
    if not addresses or any(not ipaddress.ip_address(a[4][0]).is_global for a in addresses):raise ValueError('Private network addresses are excluded.')
    return value
class Redirects(HTTPRedirectHandler):
    def redirect_request(self,req,fp,code,msg,headers,newurl):
        public_url(newurl);return super().redirect_request(req,fp,code,msg,headers,newurl)
class Links(HTMLParser):
    def __init__(self,base,target):super().__init__();self.base=base;self.target=urlsplit(target);self.matches=[]
    def handle_starttag(self,tag,attrs):
        if tag!='a':return
        a=dict(attrs);u=urlsplit(urljoin(self.base,a.get('href','')))
        if u.scheme in ('http','https') and u.hostname==self.target.hostname and u.path.rstrip('/')==self.target.path.rstrip('/'):
            self.matches.append({'url':u.geturl(),'rel':a.get('rel','')})
def check(source,target):
    row={'source_url':source,'target_url':target,'checked_at':datetime.now(timezone.utc).isoformat(),'status':'error','links':[]}
    try:
        public_url(source);opener=build_opener(Redirects());request=Request(source,headers={'User-Agent':'BongaVisibilityChecker/1.0'})
        with opener.open(request,timeout=15) as r:
            row['http_status']=r.status;row['final_url']=r.url
            if 'text/html' not in r.headers.get('content-type',''):row['status']='unsupported';return row
            content=r.read(1_000_001)
            if len(content)>1_000_000:row['status']='too_large';return row
            parser=Links(r.url,target);parser.feed(content.decode('utf-8',errors='replace'));row['links']=parser.matches;row['status']='found' if parser.matches else 'missing'
    except HTTPError as e:row['http_status']=e.code;row['status']='blocked' if e.code in (401,403,429,999) else 'error'
    except Exception as e:row['error']=str(e)[:200]
    return row
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--target',required=True);p.add_argument('--sources',required=True);p.add_argument('--out',required=True);a=p.parse_args();public_url(a.target)
    sources=list(dict.fromkeys(Path(a.sources).read_text().splitlines()))[:10]
    rows=[check(s.strip(),a.target) for s in sources if s.strip()]
    Path(a.out).write_text(json.dumps({'backlinks':rows},indent=2)+'\n');print(f'Checked {len(rows)} known source pages; results are not an internet-wide backlink inventory.')
