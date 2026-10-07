"""Explicit LTX render launcher for a separately configured GPU environment."""
import argparse, json, subprocess, sys
from pathlib import Path
PIN = '4b2d053057623ddd4d0a1d3e9cd28890e9ef487f'
PROMPT = 'A fashion model takes one slow step forward in a sculptural black evening gown with architectural gold detailing. The camera gently tracks the flowing fabric and gold seams in a dark editorial studio. Soft gold rim lighting preserves the garment silhouette and realistic hands. No text or logos.'
def command(repo, image, out):
    return [sys.executable, str(Path(repo)/'inference.py'), '--prompt', PROMPT, '--conditioning_media_paths', str(Path(image).resolve()), '--conditioning_start_frames', '0', '--height', '1024', '--width', '576', '--num_frames', '121', '--seed', '2023', '--pipeline_config', 'configs/ltxv-13b-0.9.8-distilled.yaml', '--output_path', str(Path(out).resolve())]
if __name__ == '__main__':
    p=argparse.ArgumentParser(description=__doc__); p.add_argument('--repo',required=True);p.add_argument('--image',required=True);p.add_argument('--out',required=True);p.add_argument('--execute',action='store_true');p.add_argument('--weights-license-reviewed',action='store_true');a=p.parse_args()
    cmd=command(a.repo,a.image,a.out)
    if not a.execute: print(json.dumps({'status':'Prepared, not rendered','command':cmd,'requirements':['Configured GPU environment','LTX dependencies and model weights','Separate model-weight license review']},indent=2))
    else:
        if not a.weights_license_reviewed: raise SystemExit('Review the selected model-weight license before rendering.')
        if not Path(a.image).is_file(): raise SystemExit('Input image missing.')
        head=subprocess.check_output(['git','-C',a.repo,'rev-parse','HEAD'],text=True).strip()
        if head!=PIN: raise SystemExit('LTX checkout differs from reviewed revision.')
        subprocess.run(cmd,cwd=a.repo,check=True)
