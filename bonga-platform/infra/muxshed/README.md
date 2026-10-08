# Bonga Bhengu Studio · Muxshed

This is a deployment kit, not a running broadcast server. GitHub stores the code; an always-on Docker host runs the media service. Upstream: https://github.com/muxshed/shed (AGPL-3.0-only). Official container instructions: https://muxshed.com/docs/docker . Upstream image is used without modification.

1. Copy `.env.example` to `.env`, generate a private key, then run `docker compose up -d` here. Never commit `.env` or stream keys.
2. Put an HTTPS reverse proxy in front of localhost:8080. Do not expose the management port publicly over HTTP. Configure firewall access for RTMP 1935 and SRT UDP 9000 as required. This kit is for a Docker/VPS host with TCP/UDP support, not a static website host.
3. Add the public HTTPS origin as website runtime variable `MUXSHED_URL` and the same private key as secret `MUXSHED_API_KEY`. Keep the existing owner email setting. These are deployment settings, not fields on the public storefront.
4. In the Muxshed console create an ingest source and destinations, entering provider stream keys there. Copy the actual generated ingest URL/key into OBS Custom Stream; do not assume a source path or key. Review source selection, enabled destinations and broadcast settings, including any public watch page.
5. Open Creative Studio → Go live → Check broadcast server. The owner can review enabled destinations and open the server console, then explicitly start/stop. API status is server pipeline state, not proof each platform is receiving video.

For browser Programme uplink, create a persistent WHIP source in Muxshed and set its token as the website secret `MUXSHED_WHIP_TOKEN`. Open Creative Studio → Send Programme to server. This sends the composited Programme and selected recording audio, after confirmation; starting server fan-out remains a separate action. Configure the server’s advertised WebRTC IP/UDP range and firewall according to upstream WebRTC settings; management HTTPS alone does not carry WebRTC media. OBS/hardware ingest remains available. No broadcasts or social posts start automatically. API keys and destination stream keys are not returned to the browser. Other designers cannot control the owner's server.

`latest` follows upstream; pin a tested image digest for production. Back up the persistent volume before upgrades. Hosting/egress and social platform eligibility remain separate requirements.
