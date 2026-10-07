import csv,json,argparse
from datetime import datetime,timezone
from pathlib import Path
from urllib.parse import urlsplit
def http(value):
    try:return str(value).strip() if urlsplit(str(value)).scheme in ('http','https') and urlsplit(str(value)).hostname else ''
    except ValueError:return ''
def normalize(rows):
    result=[];seen=set();checked=datetime.now(timezone.utc).isoformat()
    for row in rows:
        name=str(row.get('title') or row.get('name') or '').strip()[:150]
        source=http(row.get('link') or row.get('source_url') or row.get('url') or '')
        website=http(row.get('website') or '')
        if not name or not source or source in seen:continue
        seen.add(source);result.append({'name':name,'website':website,'phone':str(row.get('phone') or '').strip()[:80],'address':str(row.get('address') or '').strip()[:300],'source_url':source,'checked_at':checked,'status':'unreviewed'})
        if len(result)==25:break
    return result
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--input',required=True);p.add_argument('--out',required=True);a=p.parse_args()
    with open(a.input,encoding='utf-8-sig',newline='') as f: rows=normalize(csv.DictReader(f))
    if not rows:raise SystemExit('No business rows with names and source URLs were returned. Inspect the raw output; do not treat this as no businesses existing.')
    Path(a.out).write_text(json.dumps({'prospects':rows},ensure_ascii=False,indent=2)+'\n')
    print(f'Prepared {len(rows)} public business records for review.')
