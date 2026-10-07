"""Original, offline task router. Does not run selected upstream software."""
import argparse
import datetime
import json
from pathlib import Path
from zoneinfo import ZoneInfo


def route(focus, day):
    catalog = json.loads(Path(__file__).with_name("catalog.json").read_text())
    modules = {m["id"]: m for m in catalog["modules"]}
    if focus not in modules:
        raise ValueError("Unknown module")
    chain = [focus]
    while len(chain) < 3:
        nxt = modules[chain[-1]]["handoff"]
        if nxt in chain:
            break
        chain.append(nxt)
    return {"tasks": [{"id": f"business-{day}-{key.lower()}",
        "module": modules[key]["jarvis_module"],
        "title": f'{key}: {modules[key]["capability"]}',
        "deliverable": modules[key]["deliverable"],
        "minutes": 30, "priority": "high", "status": "todo"} for key in chain]}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--focus", default="FBI")
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    day = datetime.datetime.now(ZoneInfo("Africa/Johannesburg")).date().isoformat()
    output = route(args.focus.upper(), day)
    Path(args.out).write_text(json.dumps(output, indent=2) + "\n")
    print(f'Prepared {len(output["tasks"])} tasks. No upstream services executed.')
