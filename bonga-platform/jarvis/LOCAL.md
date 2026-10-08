# Jarvis: local and cloud execution

The SAME local_runner.py, model and task instructions run on either machine. This adds execution choices without replacing the Bonga Bhengu app.

## Cloud

Open https://github.com/bongabhenguai-art/zuxuru/actions/workflows/jarvis-open-source.yml . Select Run workflow, leave execution=cloud, enter a task, then start. A temporary Ubuntu runner installs Ollama and runs the small model. After the job completes, open the private Bonga Bhengu dashboard and click Open latest cloud report. The downloadable artifact remains available as a fallback. Standard public runners are free subject to GitHub limits; private-repository usage depends on included allowances.

## Laptop, standalone

Install Ollama and Python on Windows. Download this Jarvis folder from the repository, open Ollama, then double-click start-local.cmd. It checks installed tools, downloads qwen3:1.7b, generates a default business plan and opens the report. For a custom task use python local_runner.py --prompt "your task". Once the model is downloaded, inference works without a paid API and without internet access. Performance depends on the laptop; this has not been tested on your physical device.

## Laptop, controlled by GitHub

Register a self-hosted Windows runner for this repository through Settings > Actions > Runners > New self-hosted runner. Add the custom label jarvis. Install Ollama and Python for that runner's Windows account and leave Ollama and the GitHub runner running. In Run workflow choose execution=local. GitHub sends the job to your laptop, not its cloud runner. Until this runner is registered and online, local jobs remain queued. Run only trusted repository code on your laptop.

## Shared dashboard handoff

GitHub workflow jobs deliver their Markdown report to the owner's private dashboard using a signed, short-lived GitHub job identity. No copied GitHub token is required. Click Open latest cloud report, review a finding, then add it to daily work. Standalone laptop runs can still use the downloaded-report reader. Automatic cloud/local switching and direct live-chat connection are not implemented. Current-trend research, external publishing and customer outreach are not performed by this offline model. Neither mode runs as a permanent public server.

Cloud installation, model inference and private report delivery passed an actual GitHub Actions run. Laptop inference remains unverified on the owner's physical device.
