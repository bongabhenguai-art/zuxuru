# Jarvis without a paid API

Uses Ollama with qwen3:1.7b (Apache 2.0 model). Preserves the existing Bonga Bhengu application. The small model is a starting point for the owner's 8 GB laptop; actual speed and memory depend on other running applications.

## Local use

Install Ollama from https://ollama.com/download/windows . Run `ollama pull qwen3:1.7b`, then `python local_runner.py --prompt "Plan my fashion collection"`. Ollama must be running. The Python runner needs no external dependencies. It writes jarvis-local-report.md. Open this in the existing dashboard's downloaded-report reader; review a finding before turning it into a saved task.

## GitHub cloud task

Open Actions > Jarvis Open Source Task > Run workflow. This starts Ollama and the model on a temporary Ubuntu GitHub runner and saves the report as an artifact. No OpenAI key is used. This is a bounded task job, not an always-on chatbot or public inference server. GitHub standard public-repository runners are free subject to policies and limits; private repositories use their included allowance, with possible charges beyond it. No scheduled jobs added. Artifacts expire after one day.

## Honest capabilities

Local inference drafts plans, offers, captions and fashion ideas. It does not browse current trends, send messages, publish campaigns or sync results automatically into the website. Existing dashboard report import is the supported handoff. Model download and the first real inference still require verification on the target machine or GitHub runner. The Cloudflare live chat continues to use its existing protected provider connection.
