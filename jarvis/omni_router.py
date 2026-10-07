"""Route daily business work into Bonga Bhengu's eight explicit modules."""
from __future__ import annotations
import argparse
import json
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent

def route_module(title: str, modules: list[dict]) -> str:
    value = title.lower()
    best, score = "career", 0
    for module in modules:
        matches = sum(signal in value for signal in module["signals"])
        if matches > score:
            best, score = module["id"], matches
    return best

def daily_tasks(day: str, registry: dict) -> list[dict]:
    weekday = datetime.strptime(day, "%Y-%m-%d").weekday()
    # Monday through Sunday; mirrors the website's South Africa date rotation.
    rotations = [
        ("marketing", "ai_skills"), ("visibility_seo", "products"),
        ("branding", "opportunities"), ("marketing", "career"),
        ("visibility_seo", "ai_skills"), ("products", "opportunities"),
        ("branding", "career"),
    ]
    by_id = {m["id"]:m for m in registry["modules"]}
    tasks = []
    for module_id in ("sales", *rotations[weekday]):
        module = by_id[module_id]
        tasks.append({"id":f"daily-{day}-{module_id}", "module":module_id,
                      "title":module["task"], "deliverable":module["deliverable"],
                      "minutes":module["minutes"], "priority":module["priority"],
                      "due":day, "done":False, "instruction_path":module["instruction_path"],
                      "execution":"task assigned; deliverable requires review and completion"})
    return tasks

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", default=datetime.now(ZoneInfo("Africa/Johannesburg")).date().isoformat())
    parser.add_argument("--registry", type=Path, default=ROOT/"data/omni-modules.json")
    parser.add_argument("--out", type=Path, default=Path("output/jarvis"))
    parser.add_argument("--task", help="Route one custom task by visible keyword rules")
    args = parser.parse_args()
    registry = json.loads(args.registry.read_text(encoding="utf-8"))
    if args.task:
        result = {"task":args.task, "module":route_module(args.task,registry["modules"]), "algorithm":"Highest number of matching module keywords; registry order breaks ties; unmatched tasks go to career."}
        print(json.dumps(result,ensure_ascii=False,indent=2)); return
    tasks = daily_tasks(args.date,registry)
    output = {"name":registry["name"], "assistant":"Jarvis", "date":args.date,
              "mode":"guided rules; no AI inference in this step", "tasks":tasks,
              "customer_and_analytics_data":"unknown unless provided by the owner",
              "source_snapshot":"Public presence checked 2026-10-07; research must be refreshed before making current factual claims."}
    args.out.mkdir(parents=True,exist_ok=True)
    (args.out/"tasks.json").write_text(json.dumps(output,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    lines = ["# Bonga Bhengu Omni Route", "", f"Jarvis daily route — {args.date}", "", output["mode"], ""]
    for task in tasks:
        lines += [f"## {task['module']}: {task['title']}", "", task["deliverable"], f"\nEstimated time: {task['minutes']} minutes. Status: assigned, not completed.", ""]
    (args.out/"plan.md").write_text("\n".join(lines),encoding="utf-8")
    module_text=[]
    for task in tasks:
        path=ROOT/"modules"/(task["module"]+".md")
        module_text.append(path.read_text(encoding="utf-8"))
    prompt = "Act as Jarvis for Bonga Bhengu Omni Route. Use the three module assignments and instructions below to prepare concrete draft deliverables: an offer/intro draft, useful marketing or branding copy, and a practical supporting exercise. Preserve facts and uncertainty. Use no tools, execute no commands and publish nothing. If current research is needed and not supplied, write a specific research task rather than inventing an opportunity, deadline, product demand, customer or result. Label all content as draft for owner review.\n\n"+json.dumps(output,ensure_ascii=False,indent=2)+"\n\nMODULE INSTRUCTIONS\n"+"\n\n".join(module_text)
    (args.out/"ai-prompt.txt").write_text(prompt+"\n",encoding="utf-8")
    print("Jarvis routed three daily tasks and prepared a module-aware draft prompt.")

if __name__ == "__main__":
    main()
