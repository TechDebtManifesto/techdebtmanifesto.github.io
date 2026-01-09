// Utterances repo constant for the customized generated script
const UTTERANCES_REPO = "TechDebtManifesto/techdebtmanifesto.github.io";

// Optionally set a default label applied to created/found issues
const UTTERANCES_LABEL_BASE = "paragraph"; // results in labels like "paragraph" or "paragraph-3"

// Choose an utterances theme; can be switched based on prefers-color-scheme
function currentUtterancesTheme() {
  const dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return dark ? 'github-dark' : 'github-light';
}

// Inject or move an utterances widget into the target container with a unique issue-term per paragraph.
function loadCommentsForParagraph(paragraphNumber, slotEl) {
  if (!UTTERANCES_REPO || UTTERANCES_REPO === "owner/repo") {
    console.warn("Utterances repo not configured. Set UTTERANCES_REPO in script.js");
  }

  // Clear any prior widget inside this slot
  while (slotEl.firstChild) slotEl.removeChild(slotEl.firstChild);

  // Build a unique term that clearly includes the paragraph number
  // This becomes the search term for the GitHub issue; Utterances will create/find an issue
  // whose title contains this term.
  const issueTerm = `Paragraph #${paragraphNumber} – Research Manifesto`;

  // Create a close button to hide the comments if desired
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-comments-btn';
  closeBtn.type = 'button';
  closeBtn.textContent = 'Hide comments';
  closeBtn.addEventListener('click', () => {
    while (slotEl.firstChild) slotEl.removeChild(slotEl.firstChild);
  });
  slotEl.appendChild(closeBtn);

  // Create the utterances script tag with the proper configuration
  const s = document.createElement('script');
  s.src = 'https://utteranc.es/client.js';
  s.setAttribute('repo', UTTERANCES_REPO);
  s.setAttribute('issue-term', issueTerm);
  // Add a label indicating the paragraph number explicitly
  s.setAttribute('label', `${UTTERANCES_LABEL_BASE}-${paragraphNumber}`);
  s.setAttribute('theme', currentUtterancesTheme());
  s.crossOrigin = 'anonymous';
  s.async = true;
  slotEl.appendChild(s);
}

function linkifyPlainUrls(rootEl) {
  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.nodeValue || '';
      if (!text.includes('http://') && !text.includes('https://')) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (parent.closest('a, script, style, textarea, code, pre')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const urlRe = /(https?:\/\/[^\s<>()]+[^\s<>().,;:'")\]])/g;
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  for (const textNode of nodes) {
    const text = textNode.nodeValue || '';
    const matches = [...text.matchAll(urlRe)];
    if (!matches.length) continue;

    const frag = document.createDocumentFragment();
    let lastIdx = 0;
    for (const match of matches) {
      const url = match[0];
      const idx = match.index ?? 0;
      if (idx > lastIdx) frag.appendChild(document.createTextNode(text.slice(lastIdx, idx)));
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noreferrer noopener';
      a.textContent = url;
      frag.appendChild(a);
      lastIdx = idx + url.length;
    }
    if (lastIdx < text.length) frag.appendChild(document.createTextNode(text.slice(lastIdx)));

    textNode.parentNode.replaceChild(frag, textNode);
  }
}
  
function setupDiscussButtons() {
  document.querySelectorAll('.paragraph').forEach(section => {
    const n = section.getAttribute('data-paragraph');
    const btn = section.querySelector('.discuss-btn');
    const slot = section.querySelector('.comments-slot');
    if (!btn || !slot) return;

    btn.addEventListener('click', () => {
      loadCommentsForParagraph(n, slot);
      // Keep the paragraph itself visible while opening comments
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// Update theme on the fly if system theme changes
function watchThemeChanges() {
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  if (!mql || !mql.addEventListener) return;
  mql.addEventListener('change', () => {
    // For simplicity, re-render any visible widgets to pick up new theme
    document.querySelectorAll('.comments-slot').forEach(slot => {
      const iframe = slot.querySelector('iframe.utterances-frame');
      if (iframe) {
        // Try to infer the paragraph number from the containing section
        const section = slot.closest('.paragraph');
        if (section) {
          const n = section.getAttribute('data-paragraph');
          loadCommentsForParagraph(n, slot);
        }
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupDiscussButtons();
  watchThemeChanges();
  setupSegmentedPanels();
  linkifyPlainUrls(document.body);
});

// Segmented controls: toggle panels visible/hidden and manage ARIA state
function setupSegmentedPanels() {
  const tabs = Array.from(document.querySelectorAll('.segmented .segment'));
  if (!tabs.length) return;
  const panels = new Map(
    tabs.map(t => [t.id, document.getElementById(t.getAttribute('aria-controls'))])
  );
  const tabByHash = new Map([
    ['#sign', 'tab-sign'],
    ['#overall', 'tab-overall'],
    ['#values', 'tab-values'],
    ['#beliefs', 'tab-beliefs'],
    ['#principles', 'tab-principles'],
    ['#meta', 'tab-meta']
  ]);

  function activate(tab) {
    tabs.forEach(btn => {
      const selected = btn === tab;
      btn.classList.toggle('is-active', selected);
      btn.setAttribute('aria-selected', selected ? 'true' : 'false');
      const panel = panels.get(btn.id);
      if (panel) panel.hidden = !selected;
    });
  }

  function activateFromHash() {
    const hash = (window.location.hash || '').toLowerCase();
    const tabId = tabByHash.get(hash);
    if (!tabId) return;
    const tab = document.getElementById(tabId);
    if (tab) activate(tab);
  }

  tabs.forEach((btn, idx) => {
    btn.addEventListener('click', () => activate(btn));
    btn.addEventListener('keydown', (e) => {
      const k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowDown') {
        e.preventDefault();
        const next = tabs[(idx + 1) % tabs.length];
        next.focus();
        activate(next);
      } else if (k === 'ArrowLeft' || k === 'ArrowUp') {
        e.preventDefault();
        const prev = tabs[(idx - 1 + tabs.length) % tabs.length];
        prev.focus();
        activate(prev);
      } else if (k === 'Home') {
        e.preventDefault();
        tabs[0].focus();
        activate(tabs[0]);
      } else if (k === 'End') {
        e.preventDefault();
        tabs[tabs.length - 1].focus();
        activate(tabs[tabs.length - 1]);
      }
    });
  });

  window.addEventListener('hashchange', activateFromHash);
  activateFromHash();
}
