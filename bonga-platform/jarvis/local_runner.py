"""Jarvis task drafts through local Ollama; no paid API or automatic outreach."""
import argparse, json, os, pathlib, urllib.request
from datetime import datetime, timezone
SYSTEM = 'You are Bonga Bhengu Jarvis. Help with fashion design, sourcing, sales, branding, marketing, SEO and career rebuilding. Return practical proposals for human review. Never invent customers, revenue, internet research, source links or completed actions. You have no internet search tools. State that current trends require evidence. Do not publish or contact anyone.'
def generate(prompt, opener=urllib.request.urlopen):
    if not prompt.strip() or len(prompt)>6000: raise ValueError('Enter a task of 1 to 6000 characters')
    body={'model':'qwen3:1.7b','system':SYSTEM,'prompt':prompt,'think':False,'stream':False,'options':{'num_ctx':4096,'num_predict':700}}
    req=urllib.request.Request('http://127.0.0.1:11434/api/generate',data=json.dumps(body).encode(),headers={'Content-Type':'application/json'})
    with opener(req,timeout=300) as response: data=json.loads(response.read(200000))
    answer=data.get('response','')
    if not data.get('done') or not isinstance(answer,str) or not answer.strip(): raise RuntimeError('Local model did not return a completed answer')
    return answer

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--prompt');parser.add_argument('--output',default='jarvis-local-report.md');args=parser.parse_args()
    prompt=args.prompt or os.environ.get('JARVIS_TASK') or 'Prepare three practical tasks to rebuild Bonga Bhengu fashion visibility and attract customer enquiries. No current trend claims without evidence.'
    answer=generate(prompt)
    report='# Jarvis local-model task report\n\n'+datetime.now(timezone.utc).isoformat()+'\n\nModel: qwen3:1.7b / Ollama. Draft for review; no internet research or outreach performed.\n\n'+answer+'\n'
    pathlib.Path(args.output).write_text(report,encoding='utf-8');print('Jarvis draft saved to '+args.output)
if __name__=='__main__': main()
