// Rendering: wizard results, expert mode. All text through t() so language
// switches can re-render live.

import { MODELS, HARDWARE, QUANTS, USE_CASES } from "./data.js";
import {
  weightsGB, kvGBPerStream, overheadGB, usableMemGB, activeGBPerToken,
  capacity, recommend,
} from "./calc.js";
import { t, fmtEUR, fmtNum } from "./i18n.js";

const CTX_STOPS = [4096, 8192, 16384, 32768, 65536, 131072];

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// Display estimates as honest ±30% ranges.
function tokRange(v) {
  return t("results.tokS", {
    a: fmtNum(Math.max(1, Math.round(v * 0.7))),
    b: fmtNum(Math.round(v * 1.3)),
  });
}

function priceRange(hw) {
  return `${fmtEUR(hw.priceEUR[0])} – ${fmtEUR(hw.priceEUR[1])}`;
}

function ctxLabel(ctx) {
  return `${Math.round(ctx / 1024)}k`;
}

/* ============ wizard results ============ */

let lastRecommendation = null;

export function renderWizardResults(container, answers) {
  const rec = recommend(answers);
  lastRecommendation = { container, answers };

  if (!rec.primary) {
    container.innerHTML = `
      <h2>${esc(t("results.title"))}</h2>
      <p class="miss-note">${esc(t("results.none"))}</p>
      ${restartButton()}`;
    wireRestart(container);
    return;
  }

  const missNote = rec.budgetMiss
    ? `<p class="miss-note">${esc(t("results.budgetMiss"))}</p>`
    : rec.capacityShort
      ? `<p class="miss-note">${esc(t("results.capacityShort"))}</p>`
      : "";

  const primaryBadge = rec.budgetMiss
    ? `<span class="result-badge over">${esc(t("results.badge.primaryOver"))}</span>`
    : `<span class="result-badge">${esc(t("results.badge.primary"))}</span>`;

  const cards = [
    resultCard(rec.primary, primaryBadge, "primary"),
    rec.alternative
      ? resultCard(rec.alternative, `<span class="result-badge">${esc(t("results.badge.alt"))}</span>`, "secondary")
      : "",
    rec.premium
      ? resultCard(rec.premium, `<span class="result-badge">${esc(t("results.badge.premium"))}</span>`, "secondary")
      : "",
  ].join("");

  const caveats = rec.caveats.length
    ? `<div class="caveats">
         <h4>${esc(t("results.caveatsTitle"))}</h4>
         <ul>${rec.caveats.map((k) => `<li>${esc(t(k))}</li>`).join("")}</ul>
       </div>`
    : "";

  container.innerHTML = `
    <h2>${esc(t("results.title"))}</h2>
    <p class="need-line">${esc(
      t("results.needLine", { users: fmtNum(rec.users), streams: fmtNum(rec.needStreams) })
    )}</p>
    ${missNote}
    ${cards}
    ${caveats}
    ${controlsRow()}`;
  wireRestart(container);
  wireShare(container, rec);
}

function controlsRow() {
  return `<div class="wizard-nav results-controls">
    <button class="btn secondary" data-action="restart">${esc(t("wizard.restart"))}</button>
    <button class="btn primary" data-action="share">${esc(t("results.share"))}</button>
  </div>`;
}

function wireShare(container, rec) {
  const btn = container.querySelector('[data-action="share"]');
  if (!btn || !rec.primary) return;
  btn.addEventListener("click", async () => {
    const p = rec.primary;
    const text = `${p.model.name} + ${p.hw.name} (${priceRange(p.hw)}) — ${t("app.title")}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: t("app.title"), text, url: location.href });
      } else {
        await navigator.clipboard.writeText(`${text}\n${location.href}`);
        const old = btn.textContent;
        btn.textContent = t("results.shareCopied");
        setTimeout(() => { btn.textContent = old; }, 1600);
      }
    } catch (_) { /* user cancelled */ }
  });
}

function resultCard(opt, badge, kind) {
  const cap = opt.cap;
  const memLine = t("results.ofMem", {
    used: fmtNum(cap.footprint, 0),
    avail: fmtNum(cap.usable, 0),
  });
  return `
    <div class="result-card ${kind}">
      ${badge}
      <div class="result-headline">${esc(opt.model.name)} · ${esc(t(QUANTS[opt.quant].labelKey))}</div>
      <div class="result-sub">${esc(t(`tier.${opt.model.tier}`))} · ${esc(opt.hw.name)}</div>
      <div class="stat-grid">
        <div class="stat"><div class="label">${esc(t("results.price"))}</div>
          <div class="value">${esc(priceRange(opt.hw))}</div></div>
        <div class="stat"><div class="label">${esc(t("results.perStream"))}</div>
          <div class="value">${esc(tokRange(cap.perStream))}</div></div>
        <div class="stat"><div class="label">${esc(t("results.streams"))}</div>
          <div class="value">${fmtNum(cap.streams)} / ${fmtNum(opt.maxUsefulStreams)}</div></div>
        <div class="stat"><div class="label">${esc(t("results.maxUsers"))}</div>
          <div class="value">${esc(t("results.usersUnit", { n: fmtNum(opt.maxUsers) }))}</div></div>
        <div class="stat"><div class="label">${esc(t("results.memory"))}</div>
          <div class="value">${esc(memLine)}</div></div>
      </div>
    </div>`;
}

function restartButton() {
  return `<div class="wizard-nav"><button class="btn secondary" data-action="restart">${esc(t("wizard.restart"))}</button></div>`;
}


function wireRestart(container) {
  container.querySelector('[data-action="restart"]')?.addEventListener("click", () => {
    container.dispatchEvent(new CustomEvent("wizard:restart", { bubbles: true }));
  });
}

// Re-render the last shown results after a language switch (even if the
// results panel is currently hidden behind the expert tab).
export function rerenderResults() {
  if (lastRecommendation) {
    renderWizardResults(lastRecommendation.container, lastRecommendation.answers);
  }
}

/* ============ expert mode ============ */

export function initExpert() {
  const modelSel = document.getElementById("expert-model");
  const quantSel = document.getElementById("expert-quant");
  const ctxRange = document.getElementById("expert-ctx");
  const ctxOut = document.getElementById("expert-ctx-value");
  const streamsInput = document.getElementById("expert-streams");

  modelSel.innerHTML = MODELS.map(
    (m) => `<option value="${esc(m.id)}">${esc(m.name)}</option>`
  ).join("");

  function currentModel() {
    return MODELS.find((m) => m.id === modelSel.value) || MODELS[0];
  }

  function syncQuants() {
    const m = currentModel();
    const prev = quantSel.value;
    quantSel.innerHTML = m.quants.map(
      (q) => `<option value="${esc(q)}">${esc(t(QUANTS[q].labelKey))}</option>`
    ).join("");
    quantSel.value = m.quants.includes(prev) ? prev : m.quants[0];
  }

  function syncCtx() {
    const m = currentModel();
    const maxIdx = CTX_STOPS.reduce(
      (acc, v, i) => (v <= m.maxContext ? i : acc), 0
    );
    ctxRange.max = String(maxIdx);
    if (Number(ctxRange.value) > maxIdx) ctxRange.value = String(maxIdx);
    ctxOut.textContent = ctxLabel(CTX_STOPS[Number(ctxRange.value)]);
  }

  function render() {
    syncCtx();
    const m = currentModel();
    const quant = quantSel.value;
    const ctx = CTX_STOPS[Number(ctxRange.value)];
    const streams = Math.max(1, Math.min(200, Number(streamsInput.value) || 1));
    renderExpertOutput(document.getElementById("expert-output"), m, quant, ctx, streams);
  }

  modelSel.addEventListener("change", () => { syncQuants(); render(); });
  quantSel.addEventListener("change", render);
  ctxRange.addEventListener("input", render);
  streamsInput.addEventListener("input", render);

  syncQuants();
  render();

  // expose for language-switch re-render
  return { render, syncQuants };
}

function renderExpertOutput(container, model, quant, ctx, streams) {
  const w = weightsGB(model, quant);
  const kv = kvGBPerStream(model, ctx) * streams;
  const oh = overheadGB(model, quant);
  const total = w + kv + oh;

  const pct = (v) => Math.max(1, (v / total) * 100);
  const memBlock = `
    <h3>${esc(t("expert.memTitle"))}</h3>
    <div class="mem-bar" title="${fmtNum(total, 0)} GB">
      <div class="seg-weights" style="width:${pct(w)}%"></div>
      <div class="seg-kv" style="width:${pct(kv)}%"></div>
      <div class="seg-overhead" style="width:${pct(oh)}%"></div>
    </div>
    <div class="mem-legend">
      <span><span class="swatch" style="background:var(--seg-weights)"></span>${esc(t("expert.weights"))}: ${fmtNum(w, 0)} GB</span>
      <span><span class="swatch" style="background:var(--seg-kv)"></span>${esc(t("expert.kv", { n: fmtNum(streams) }))}: ${fmtNum(kv, 1)} GB</span>
      <span><span class="swatch" style="background:var(--seg-overhead)"></span>${esc(t("expert.overhead"))}: ${fmtNum(oh, 0)} GB</span>
      <span><strong>${esc(t("expert.total"))}: ${fmtNum(total, 0)} GB</strong></span>
    </div>
    ${model.moe
      ? `<p class="moe-hint">${esc(t("expert.moeHint", { n: fmtNum(activeGBPerToken(model, quant), 0) }))}</p>`
      : ""}`;

  const rows = [...HARDWARE]
    .sort((a, b) => a.priceEUR[0] - b.priceEUR[0])
    .map((hw) => {
      const cap = capacity(model, quant, ctx, hw, streams);
      const fits = cap.fits && cap.streams >= Math.min(streams, 1);
      const badges = [...cap.flags, ...(hw.noteKeys || [])]
        .map((k) => `<span class="badge" title="${esc(t(k))}">!</span>`)
        .join("");
      return `
        <tr class="${fits ? "" : "nofit"}">
          <td>${esc(hw.name)}${badges}</td>
          <td>${esc(priceRange(hw))}</td>
          <td class="${fits ? "fit-yes" : "fit-no"}">${esc(t(fits ? "expert.fitsYes" : "expert.fitsNo"))}</td>
          <td>${fits ? esc(tokRange(cap.single)) : "—"}</td>
          <td>${fits ? esc(tokRange(cap.perStream)) + (cap.streams < streams ? ` (${fmtNum(cap.streams)}×)` : "") : "—"}</td>
          <td>${fits ? esc(tokRange(cap.aggregate)) : "—"}</td>
        </tr>`;
    })
    .join("");

  container.innerHTML = `
    ${memBlock}
    <h3 style="margin-top:1.2rem">${esc(t("expert.tableTitle"))}</h3>
    <div class="hw-table-wrap">
      <table class="hw-table">
        <thead><tr>
          <th>${esc(t("expert.th.hw"))}</th>
          <th>${esc(t("expert.th.price"))}</th>
          <th>${esc(t("expert.th.fits"))}</th>
          <th>${esc(t("expert.th.single"))}</th>
          <th>${esc(t("expert.th.perStream", { n: fmtNum(streams) }))}</th>
          <th>${esc(t("expert.th.aggregate"))}</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}
