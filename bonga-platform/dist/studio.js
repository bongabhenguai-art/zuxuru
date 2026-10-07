'use strict';
(() => {
  const q = selector => document.querySelector(selector);
  const palettes = {
    luxury: ['#0b0b0b', '#d4af37', '#e5e5e5', '#ffffff'],
    denim: ['#101d36', '#d8b878', '#426fa2', '#f4efe6'],
    renewal: ['#17382e', '#c4d7a5', '#a0b5a5', '#f7f2e9']
  };
  const paletteIds = ['#colour-base', '#colour-accent', '#colour-secondary', '#colour-light'];
  const paletteLabels = ['Base', 'Accent', 'Secondary', 'Light'];
  const tabs = [...document.querySelectorAll('[data-tool]')];
  function selectTool(key, focus = false) {
    tabs.forEach(tab => {
      const selected = tab.dataset.tool === key;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      q('#tool-' + tab.dataset.tool).hidden = !selected;
      if (selected && focus) tab.focus();
    });
    if (key === 'card') drawCard();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTool(tab.dataset.tool));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      selectTool(tabs[next].dataset.tool, true);
    });
  });
  function saveFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function copyText(value, output, status, message) {
    try {
      await navigator.clipboard.writeText(value);
      status.textContent = message;
    } catch {
      output.focus();
      const range = document.createRange();
      range.selectNodeContents(output);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Automatic copy is unavailable. The text is selected; use Copy.';
    }
  }

  const directions = {
    fashion: 'Create an original fashion concept. Show a clear silhouette, credible garment construction, fabric texture and considered detailing. Present it as a concept study, not a manufactured product.',
    identity: 'Explore an original logo and brand identity concept. Use a distinctive, simple geometric mark, deliberate spacing and a clear hierarchy. Make the mark legible at small scale. Keep the background clean; use no borrowed logos.',
    product: 'Create a product presentation concept with realistic material texture, considered lighting and a clean setting. Show the object clearly. Treat it as a visual mockup rather than evidence of an existing product.',
    campaign: 'Create an original campaign visual with a strong focal point, intentional composition and room for a headline to be added afterwards. Make the image communicate a clear brand idea.'
  };
  const moods = {
    luxury: 'Luxury and futuristic: matte black, metallic gold, restrained platinum, architectural forms and precise contrast. Bold, minimal and premium.',
    heritage: 'Contemporary African: expressive materiality, indigo and earth tones, a confident silhouette and a modern editorial eye. Avoid generic cultural stereotypes.',
    minimal: 'Quiet and minimal: refined proportions, soft neutral tones, deliberate negative space and subtle texture. Let the central idea lead.'
  };
  let prompt = '';
  q('#prompt-form').addEventListener('submit', event => {
    event.preventDefault();
    const subject = q('#prompt-subject').value.trim();
    if (!subject) { q('#prompt-status').textContent = 'Describe your idea first.'; return; }
    prompt = 'CREATIVE CONCEPT\n' + subject + '\n\nDESIGN DIRECTION\n' + directions[q('#prompt-type').value] + '\n\nVISUAL LANGUAGE\n' + moods[q('#prompt-mood').value] + '\n\nCOMPOSITION\n' + q('#prompt-format').value + '. Clear focal point, considered light, high-quality detail and clean edges.\n\nFINISH\nNo watermark, extra logos or invented brand claims. Add any exact wording separately in a design editor.\n\nPrepared with the Innovative AI Design prompt composer.';
    q('#prompt-output').textContent = prompt;
    ['#copy-prompt', '#download-prompt', '#prompt-to-brief'].forEach(id => { q(id).disabled = false; });
    q('#prompt-status').textContent = 'Prompt ready. Copy it into your chosen AI image tool, or discuss it with Bonga.';
  });
  q('#copy-prompt').addEventListener('click', () => copyText(prompt, q('#prompt-output'), q('#prompt-status'), 'Prompt copied.'));
  q('#download-prompt').addEventListener('click', () => saveFile(new Blob([prompt], {type:'text/plain;charset=utf-8'}), 'Innovative-AI-Design-prompt.txt'));
  q('#prompt-to-brief').addEventListener('click', () => {
    q('#brief-service').value = 'AI visuals & content';
    q('#brief-form').hidden = false;
    q('#brief-result').hidden = true;
    q('#brief-goal').value = prompt.slice(0, 2000);
    q('#brief-status').textContent = 'Your creative direction is in the brief. Add your name to continue.';
    q('#contact').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    q('#brief-name').focus({preventScroll:true});
  });

  function customPalette() { return paletteIds.map(id => q(id).value); }
  function updatePalette() {
    const colours = customPalette();
    q('#palette-swatches').replaceChildren(...colours.map((colour, index) => {
      const swatch = document.createElement('div');
      const block = document.createElement('span');
      block.style.backgroundColor = colour;
      block.className = 'swatch-colour';
      const code = document.createElement('code');
      code.textContent = colour.toUpperCase();
      const label = document.createElement('small');
      label.textContent = paletteLabels[index];
      swatch.append(block, label, code);
      return swatch;
    }));
    const sample = q('#palette-sample');
    sample.style.backgroundColor = colours[0];
    sample.style.color = colours[3];
    sample.querySelector('strong').style.color = colours[1];
    sample.querySelector('span').style.color = colours[2];
    q('#palette-caption').style.color = colours[3];
    q('#palette-caption').textContent = q('#palette-preset').selectedOptions[0].textContent + ' · your colour study';
    if (q('#card-theme').value === 'custom') drawCard();
  }
  q('#palette-preset').addEventListener('change', () => {
    palettes[q('#palette-preset').value].forEach((colour, index) => { q(paletteIds[index]).value = colour; });
    updatePalette();
  });
  paletteIds.forEach(id => q(id).addEventListener('input', updatePalette));
  q('#copy-palette').addEventListener('click', () => {
    const text = customPalette().map((colour, index) => paletteLabels[index] + ': ' + colour.toUpperCase()).join('\n');
    copyText(text, q('#palette-swatches'), q('#palette-status'), 'Colour codes copied.');
  });
  q('#palette-to-card').addEventListener('click', () => {
    q('#card-theme').value = 'custom';
    selectTool('card', true);
    q('#card-status').textContent = 'Your palette is applied. You can now personalise the message.';
  });

  const canvas = q('#social-card');
  const ctx = canvas.getContext('2d');
  function wrapText(text, width) {
    const lines = [];
    for (const paragraph of text.split('\n')) {
      let line = '';
      for (const word of paragraph.split(/\s+/).filter(Boolean)) {
        const candidate = line ? line + ' ' + word : word;
        if (ctx.measureText(candidate).width <= width) { line = candidate; continue; }
        if (line) { lines.push(line); line = ''; }
        for (const character of word) {
          if (line && ctx.measureText(line + character).width > width) { lines.push(line); line = ''; }
          line += character;
        }
      }
      if (line) lines.push(line);
    }
    return lines.length ? lines : ['Your next chapter.'];
  }
  function drawCard() {
    if (!ctx) { q('#card-status').textContent = 'This browser cannot display the card. Please try a browser with canvas support.'; return; }
    const heights = {square:1080, portrait:1350, story:1920};
    const height = heights[q('#card-size').value];
    canvas.width = 1080;
    canvas.height = height;
    const colours = q('#card-theme').value === 'custom' ? customPalette() : palettes[q('#card-theme').value];
    const [base, accent, secondary, light] = colours;
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 1080, height);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(42, 42, 996, height - 84);
    ctx.fillStyle = accent;
    ctx.fillRect(88, 160, 76, 5);
    ctx.font = 'bold 30px Arial, sans-serif';
    ctx.fillStyle = secondary;
    const brand = q('#card-brand').value.trim() || 'YOUR BRAND';
    ctx.fillText(brand, 88, 122, 904);
    const headline = q('#card-headline').value.trim() || 'Your next chapter.';
    const maxBlock = height * .46;
    let fontSize = 98;
    let lines;
    do {
      ctx.font = 'bold ' + fontSize + 'px Arial, sans-serif';
      lines = wrapText(headline, 884);
      if (lines.length * fontSize * 1.17 <= maxBlock || fontSize <= 42) break;
      fontSize -= 2;
    } while (fontSize >= 42);
    const start = height * .39 - (lines.length - 1) * fontSize * .4;
    ctx.fillStyle = light;
    lines.forEach((line, index) => ctx.fillText(line, 88, start + index * fontSize * 1.17));
    ctx.font = '32px Arial, sans-serif';
    ctx.fillStyle = secondary;
    const subline = q('#card-subline').value.trim();
    wrapText(subline, 884).slice(0, 3).forEach((line, index) => {
      if (subline) ctx.fillText(line, 88, height - 270 + index * 46);
    });
    ctx.fillStyle = accent;
    ctx.fillRect(88, height - 140, 904, 2);
    ctx.font = '24px Arial, sans-serif';
    ctx.fillStyle = secondary;
    ctx.fillText('BONGA BHENGU  /  INNOVATIVE AI DESIGN', 88, height - 93);
    canvas.setAttribute('aria-label', 'Social card preview: ' + brand + '. ' + headline + '. ' + subline);
    q('#card-caption').textContent = '1080 × ' + height + ' · PNG EXPORT';
  }
  q('#card-form').addEventListener('input', drawCard);
  q('#card-form').addEventListener('change', drawCard);
  q('#card-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!q('#card-brand').value.trim() || !q('#card-headline').value.trim()) {
      q('#card-status').textContent = 'Add your brand and main message before downloading.';
      return;
    }
    drawCard();
    canvas.toBlob(blob => {
      if (!blob) { q('#card-status').textContent = 'PNG export is unavailable in this browser. Please try another browser.'; return; }
      saveFile(blob, 'Innovative-AI-Design-social-card-' + q('#card-size').value + '.png');
      q('#card-status').textContent = 'PNG ready. Your browser has started the download.';
    }, 'image/png');
  });

  const bios = {
    bonga: 'Healing • Learn • Rebuild. Durban fashion designer, educator & AI creative. Hope, craft and new beginnings.',
    ai: 'Innovative AI Design. Luxury logos, brand identities, fashion concepts & social visuals. Designing the Future with AI.',
    fashion: 'DONLEGEND by Bonga Bhengu. Contemporary African fashion, expressive denim & considered craft. Durban, South Africa.'
  };
  q('#bio-brand').addEventListener('change', () => { q('#bio-output').textContent = bios[q('#bio-brand').value]; q('#bio-status').textContent = ''; });
  q('#copy-bio').addEventListener('click', () => copyText(q('#bio-output').textContent, q('#bio-output'), q('#bio-status'), 'Profile bio copied.'));
  const brandNames = {bonga:'Bonga Bhengu', ai:'Innovative AI Design', fashion:'DONLEGEND'};
  const messages = {bonga:'Healing • Learn • Rebuild. Hope, craft and new beginnings.', ai:'Designing the Future with AI. Luxury, bold and futuristic.', fashion:'Contemporary African fashion. Expressive denim and considered craft.'};
  const goals = {
    visibility:['Make your name, bio, website link and contact consistent across the profiles you control.','Pin an introduction that explains who you are, what you create and how people can contact you.','Share one story, one useful process lesson and one creative showcase each week.','Record website visits, profile visits, saves and enquiries weekly; compare the results after four weeks.'],
    identity:['Choose one audience and one clear promise before exploring visual directions.','Start with a simple wordmark and a distinctive symbol that works at small size.','Test the identity in black and white, then apply a considered colour palette.','Create a profile icon, a cover layout and a social-card template with consistent spacing.'],
    fashion:['Define the wearer, occasion and central silhouette.','Explore material, colour, construction and one distinctive detail.','Use the AI prompt composer to prepare a concept study, then review it with a designer’s eye.','Check construction and fit before moving from a concept to a physical garment.']
  };
  let jarvisPlan = '';
  q('#jarvis-form').addEventListener('submit', event => {
    event.preventDefault();
    const brand = q('#jarvis-brand').value;
    const goal = q('#jarvis-goal').value;
    jarvisPlan = 'JARVIS AI — CREATIVE STARTING PLAN\n\n' + brandNames[brand] + '\n' + messages[brand] + '\n\n' + goals[goal].map((step, index) => (index + 1) + '. ' + step).join('\n\n') + '\n\nSTART TODAY\nChoose one step, create one useful asset and invite one clear next action.\n\nPrepared by the website’s guided planning rules. No social accounts have been changed.';
    q('#jarvis-output').textContent = jarvisPlan;
    q('#copy-jarvis').disabled = false;
    q('#jarvis-status').textContent = 'Your starting plan is ready.';
  });
  q('#copy-jarvis').addEventListener('click', () => copyText(jarvisPlan, q('#jarvis-output'), q('#jarvis-status'), 'Plan copied.'));
  updatePalette();
  drawCard();
})();
