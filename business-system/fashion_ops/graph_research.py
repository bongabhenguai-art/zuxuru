"""Optional FastGraphRAG adapter. Requires configured model access; never qualifies buyers."""
import argparse, json, os
from pathlib import Path
def research(records, workdir, query):
    if not os.environ.get('OPENAI_API_KEY'): raise RuntimeError('Model access missing. No AI research ran.')
    from fast_graphrag import GraphRAG
    graph=GraphRAG(working_dir=workdir,domain='Bonga Bhengu fashion business evidence. Distinguish actual requests from seller listings and hypothetical simulation. Keep source URLs and uncertainty.',example_queries='Which verified fashion requests need owner review?',entity_types=['Business','Request','Garment','Source','Location'])
    graph.insert(json.dumps(records))
    return {'status':'AI research draft; independently verify citations','answer':graph.query(query).response}
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--input',required=True);p.add_argument('--workdir',required=True);p.add_argument('--query',default='Which evidence-backed requests fit Bonga Bhengu?');p.add_argument('--out',required=True);a=p.parse_args()
    result=research(json.loads(Path(a.input).read_text()),a.workdir,a.query)
    Path(a.out).write_text(json.dumps(result,indent=2))
