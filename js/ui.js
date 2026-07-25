// Rendering: wizard results, expert mode. All text through t() so language
// switches can re-render live.

import { MODELS, HARDWARE, QUANTS, USE_CASES, PRICING_ASOF, COUNTRIES } from "./data.js";
import {
  weightsGB, kvGBPerStream, overheadGB, usableMemGB, activeGBPerToken,
  capacity, recommend, cloudComparison, hybridPlan, seatsFromConcurrent,
  powerKWhPerMonth, redundancyEnergyFactor,
} from "./calc.js";
import { t, fmtEUR, fmtNum } from "./i18n.js";

// Comparison view state shared between wizard results and the compare tab.
// amortYears 0 = hardware paid 100% upfront (default); 1-5 = financed.
const cmpState = { horizon: "monthly", country: "de", amortYears: 0 };

function getKwh() {
  return (COUNTRIES.find((c) => c.id === cmpState.country) || COUNTRIES[0]).kwhEUR;
}

function amortMonths() {
  return cmpState.amortYears * 12;
}

const FIN_OPTIONS = [
  { years: 0, key: "fin.upfront" },
  { years: 1, key: "fin.y1" },
  { years: 3, key: "fin.y3" },
];

function finSliderHTML() {
  return `
    <div class="fin-slider">
      <span class="fin-label">${esc(t("fin.label"))}</span>
      <div class="cmp-horizon" style="margin-top:0.45rem">
        ${FIN_OPTIONS.map(
          (o) => `<button type="button" class="cmp-pill ${o.years === cmpState.amortYears ? "active" : ""}"
            data-fin-years="${o.years}">${esc(t(o.key))}</button>`
        ).join("")}
      </div>
    </div>`;
}

function wireFinSlider(container, refresh) {
  container.querySelectorAll("[data-fin-years]").forEach((btn) =>
    btn.addEventListener("click", () => {
      cmpState.amortYears = Number(btn.dataset.finYears);
      refresh();
    })
  );
}

// Self-host cost line that makes the payment model explicit.
function selfHostBreakdown(o) {
  if (o.upfront > 0) {
    return t("cmpsum.upfrontLine", {
      price: fmtEUR(Math.round(o.upfront)),
      energy: fmtEUR(Math.round(o.energy)),
    });
  }
  return t("cmpsum.financedLine", {
    hw: fmtEUR(Math.round(o.hwShare)),
    energy: fmtEUR(Math.round(o.energy)),
    n: cmpState.amortYears,
  });
}

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
    redundancyCard(rec, answers),
    rec.alternative
      ? resultCard(rec.alternative, `<span class="result-badge">${esc(t("results.badge.alt"))}</span>`, "secondary")
      : "",
    rec.premium
      ? resultCard(rec.premium, `<span class="result-badge">${esc(t("results.badge.premium"))}</span>`, "secondary")
      : "",
  ].join("");

  const caveatKeys = [...rec.caveats];
  if ((answers.redundancy ?? "none") === "none" && rec.users >= 25) {
    caveatKeys.push("caveat.noRedundancy");
  }
  const caveats = caveatKeys.length
    ? `<div class="caveats">
         <h4>${esc(t("results.caveatsTitle"))}</h4>
         <ul>${caveatKeys.map((k) => `<li>${esc(t(k))}</li>`).join("")}</ul>
       </div>`
    : "";

  container.innerHTML = `
    <h2>${esc(t("results.title"))}</h2>
    <p class="need-line">${esc(
      t("results.needLine", { users: fmtNum(rec.users), streams: fmtNum(rec.needStreams) })
    )}</p>
    ${missNote}
    ${cards}
    ${priceNote()}
    ${hybridCard(answers)}
    ${caveats}
    <div class="cmp-section" data-cmp></div>
    ${controlsRow()}`;
  wireRestart(container);
  wireShare(container, rec);

  // Simple 3-line cloud summary at the very end; full detail lives in the
  // "Cloud vs. Lokal" tab.
  renderCloudSummary(container.querySelector("[data-cmp]"), {
    seats: seatsFromConcurrent(rec.users),
    mix: answers.mix,
    intensity: "normal",
    hw: rec.primary?.hw ?? null,
    sovereigntyPct: rec.sovereigntyPct,
  });
}

// Compact summary for the results page: own hardware vs the cheapest
// subscription vs the cheapest API, plus one plain-language verdict.
function renderCloudSummary(container, opts) {
  const cmp = cloudComparison({ ...opts, kwhEUR: getKwh(), amortMonths: amortMonths() });
  const self = cmp.options.find((o) => o.kind === "selfhost");
  const subs = cmp.options.filter((o) => o.kind === "seat" || o.kind === "person");
  const apis = cmp.options.filter((o) => o.kind === "api");
  const cheapSub = [...subs].sort((a, b) => a.monthly - b.monthly)[0];
  const cheapApi = [...apis].sort((a, b) => a.monthly - b.monthly)[0];

  const rows = [
    self
      ? { label: t("cmp.selfhost"), sub: selfHostBreakdown(self), value: self.monthly, self: true }
      : null,
    { label: t("cmpsum.sub"), sub: cheapSub.name, value: cheapSub.monthly, self: false },
    { label: t("cmpsum.api"), sub: cheapApi.name, value: cheapApi.monthly, self: false },
  ].filter(Boolean);
  const max = Math.max(...rows.map((r) => r.value));

  let verdict = "";
  if (self) {
    const cloudBest = Math.min(cheapSub.monthly, cheapApi.monthly);
    const saving = cloudBest - self.energy;
    if (saving > 0) {
      const months = Math.ceil(((opts.hw.priceEUR[0] + opts.hw.priceEUR[1]) / 2) / saving);
      verdict = months <= 36
        ? t("cmpsum.breakeven", { n: fmtNum(months) })
        : t("cmpsum.cloudWins");
    } else {
      verdict = t("cmpsum.cloudWins");
    }
  }

  container.innerHTML = `
    <h3>${esc(t("cmpsum.title"))}</h3>
    ${finSliderHTML()}
    <div class="cmpsum-rows">
      ${rows.map((r) => `
        <div class="cmpsum-row${r.self ? " self" : ""}">
          <div class="cmpsum-head">
            <span class="cmpsum-label">${esc(r.label)}</span>
            <span class="cmpsum-val">${esc(fmtEUR(Math.round(r.value)))}${esc(t("cmp.perMonth"))}</span>
          </div>
          <div class="cmp-bar"><div class="cmp-fill" style="width:${Math.max(2, (r.value / max) * 100)}%"></div></div>
          <span class="cmpsum-name">${esc(r.sub)}</span>
        </div>`).join("")}
    </div>
    ${verdict ? `<p class="cmpsum-verdict">${esc(verdict)}</p>` : ""}
    <div class="wizard-nav" style="margin-top:0.9rem">
      <button type="button" class="btn secondary" data-action="open-compare">${esc(t("cmpsum.details"))}</button>
    </div>`;

  container.querySelector('[data-action="open-compare"]').addEventListener("click", () => {
    container.dispatchEvent(new CustomEvent("open:compare", { bubbles: true }));
  });
  // Financing changes affect the hybrid card too — re-render the whole results.
  wireFinSlider(container, () => rerenderResults());
}

/* ============ cloud comparison ============ */

// Readable text chips instead of "!" badges — tooltips don't work on phones.
function flagLabels(flags) {
  if (!flags.length) return "";
  return `<span class="cmp-flags">${flags
    .map((f) => `<span class="flag-label" title="${esc(t(`cmp.flag.${f}`))}">${esc(t(`cmp.flagShort.${f}`))}</span>`)
    .join("")}</span>`;
}

export function renderComparison(container, opts) {
  const horizon = cmpState.horizon;
  const cmp = cloudComparison({ ...opts, kwhEUR: getKwh(), amortMonths: amortMonths() });
  const max = Math.max(...cmp.options.map((o) => o[horizon]));

  const pills = ["monthly", "year1", "year3"]
    .map(
      (h) => `<button type="button" class="cmp-pill ${h === horizon ? "active" : ""}" data-horizon="${h}">
        ${esc(t(`cmp.horizon.${h}`))}</button>`
    )
    .join("");

  const countrySelect = `
    <label class="cmp-country">
      <span>${esc(t("cmp.country"))}</span>
      <select data-country>${COUNTRIES.map(
        (c) => `<option value="${c.id}" ${c.id === cmpState.country ? "selected" : ""}>
          ${esc(t(`country.${c.id}`))} (${fmtNum(c.kwhEUR, 2)} €/kWh)</option>`
      ).join("")}</select>
    </label>`;

  const rows = cmp.options
    .map((o) => {
      const dim = o.flags.includes("noSov") ? " dim" : "";
      const self = o.kind === "selfhost" ? " self" : "";
      const label = o.kind === "selfhost" ? t("cmp.selfhost") : o.name;
      let subLine = "";
      if (o.kind === "selfhost") {
        subLine = horizon === "monthly"
          ? `<span class="cmpsum-name">${esc(selfHostBreakdown(o))}</span>`
          : o.upfront > 0
            ? `<span class="cmpsum-name">${esc(t("cmpsum.plusUpfront", { price: fmtEUR(Math.round(o.upfront)) }))}</span>`
            : "";
      }
      return `
        <div class="cmp-row${dim}${self}">
          <div class="cmp-name">${esc(label)}${o.kind === "selfhost" ? "" : flagLabels(o.flags)}</div>
          <div class="cmp-bar">
            <div class="cmp-fill" style="width:${Math.max(1.5, (o[horizon] / max) * 100)}%"></div>
            <span class="cmp-val">${esc(fmtEUR(Math.round(o[horizon])))}</span>
          </div>
          ${subLine}
        </div>`;
    })
    .join("");

  const caveats = [
    t("cmp.caveat.quality"),
    t("cmp.caveat.seats"),
    ...(cmp.noSov ? [t("cmp.flag.noSov")] : []),
    ...(cmp.agentsHeavy ? [t("cmp.flag.agentsApi")] : []),
  ];

  const finNote =
    cmpState.amortYears === 0 ? t("cmp.fin.upfrontNote") : t("cmp.fin.financedNote", { n: cmpState.amortYears });

  container.innerHTML = `
    ${opts.titleKey ? `<h3>${esc(t(opts.titleKey))}</h3>` : ""}
    <div class="cmp-controls">
      <div class="cmp-horizon">${pills}</div>
      ${countrySelect}
    </div>
    ${opts.hw ? finSliderHTML() : ""}
    <div class="cmp-rows">${rows}</div>
    <p class="cmp-assume">${esc(
      t("cmp.assumptions", {
        seats: fmtNum(opts.seats),
        mtok: fmtNum((cmp.tokens.inTok + cmp.tokens.outTok) / 1e6, 1),
        kwh: fmtNum(getKwh(), 2),
        date: PRICING_ASOF,
      })
    )} ${esc(finNote)}</p>
    <ul class="cmp-caveats">${caveats.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`;

  const refresh = opts.onRefresh || (() => renderComparison(container, opts));
  container.querySelectorAll("[data-horizon]").forEach((btn) =>
    btn.addEventListener("click", () => {
      cmpState.horizon = btn.dataset.horizon;
      refresh();
    })
  );
  container.querySelector("[data-country]").addEventListener("change", (e) => {
    cmpState.country = e.target.value;
    refresh();
  });
  wireFinSlider(container, refresh);
}

// Standalone "Cloud vs. Local" tab: auto-picks a matching self-host config
// for the given seat count so the comparison always has a hardware row.
export function renderCompareTab(container, { seats, intensity, mix }) {
  const rec = recommend({
    users: Math.max(1, Math.ceil(seats / 3)),
    mix,
    sovereigntyPct: 100,
    budgetId: "b5",
    quality: "good",
  });
  renderComparison(container, {
    seats, intensity, mix,
    hw: rec.primary?.hw ?? null,
    sovereigntyPct: 0,
  });
}

function hybridCard(answers) {
  const h = hybridPlan(answers, getKwh(), amortMonths());
  if (!h) return "";
  const upfrontLine = h.local.upfront > 0
    ? `<p class="rc-desc" style="margin-top:0.4rem"><strong>${esc(
        t("cmpsum.plusUpfront", { price: fmtEUR(Math.round(h.local.upfront)) })
      )}</strong></p>`
    : "";
  return `
    <div class="result-card hybrid">
      <span class="result-badge">${esc(t("hybrid.badge"))}</span>
      <div class="result-headline">${esc(
        t("hybrid.headline", { local: h.sovereigntyPct, cloud: 100 - h.sovereigntyPct })
      )}</div>
      <div class="result-sub">${esc(h.rec.primary.model.name)} · ${esc(h.hw.name)} + ${esc(h.cloud.name)}</div>
      <div class="split-bar" aria-hidden="true">
        <div class="split-local" style="width:${h.split.localPct}%"></div>
        <div class="split-cloud" style="width:${h.split.cloudPct}%"></div>
      </div>
      <div class="mem-legend">
        <span><span class="swatch" style="background:var(--seg-weights)"></span>${esc(t("hybrid.local"))}: ${esc(fmtEUR(Math.round(h.local.monthly)))}${esc(t("cmp.perMonth"))} (${fmtNum(h.localUsers)} ${esc(t("hybrid.users"))})</span>
        <span><span class="swatch" style="background:var(--seg-overhead)"></span>${esc(t("hybrid.cloud"))}: ${esc(fmtEUR(Math.round(h.cloud.monthly)))}${esc(t("cmp.perMonth"))} (${fmtNum(h.cloudUsers)} ${esc(t("hybrid.users"))})</span>
      </div>
      <div class="stat-grid" style="margin-top:0.8rem">
        <div class="stat"><div class="label">${esc(t("cmp.horizon.monthly"))}</div>
          <div class="value">${esc(fmtEUR(Math.round(h.monthly)))}</div></div>
        <div class="stat"><div class="label">${esc(t("cmp.horizon.year1"))}</div>
          <div class="value">${esc(fmtEUR(Math.round(h.year1)))}</div></div>
        <div class="stat"><div class="label">${esc(t("cmp.horizon.year3"))}</div>
          <div class="value">${esc(fmtEUR(Math.round(h.year3)))}</div></div>
      </div>
      ${upfrontLine}
      <p class="rc-desc" style="margin-top:0.6rem">${esc(t("hybrid.note"))}</p>
    </div>`;
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
        <div class="stat"><div class="label">${esc(t("results.power"))}</div>
          <div class="value">~${fmtNum(powerKWhPerMonth(opt.hw), 0)} kWh · ${esc(
            fmtEUR(Math.round(powerKWhPerMonth(opt.hw) * getKwh()))
          )}</div></div>
      </div>
      ${priceCheckLink(opt.hw)}
    </div>`;
}

// One-line transparency note: prices are complete systems, not bare GPUs,
// with links to price-comparison sites so nobody has to take our word for it.
function priceNote() {
  return `<p class="price-note">${esc(t("results.priceNote", { asof: PRICING_ASOF }))}
    <a href="https://geizhals.de" target="_blank" rel="noopener">Geizhals</a> ·
    <a href="https://www.idealo.de" target="_blank" rel="noopener">Idealo</a></p>`;
}

// External price-comparison link so people can verify our numbers themselves.
function priceCheckLink(hw) {
  if (!hw.priceCheck) return "";
  const url = `https://geizhals.de/?fs=${encodeURIComponent(hw.priceCheck)}`;
  return `<a class="price-check" href="${url}" target="_blank" rel="noopener">${esc(
    t("results.priceCheck", { part: hw.priceCheck })
  )} ↗</a>`;
}

// Redundancy add-on card: what fault tolerance costs on top of the primary pick.
function redundancyCard(rec, answers) {
  const level = answers.redundancy ?? "none";
  if (level === "none" || !rec.primary) return "";
  const hw = rec.primary.hw;

  if (level === "full" && hw.redundant) {
    return `
      <div class="result-card secondary">
        <span class="result-badge">${esc(t("redcard.badge"))}</span>
        <div class="result-headline">${esc(t("redcard.builtin"))}</div>
        <p class="rc-desc">${esc(t("red.explain"))}</p>
      </div>`;
  }

  const extra = `${fmtEUR(hw.priceEUR[0])} – ${fmtEUR(hw.priceEUR[1])}`;
  const total = `${fmtEUR(hw.priceEUR[0] * 2)} – ${fmtEUR(hw.priceEUR[1] * 2)}`;
  // Cold spare sits powered off (no extra energy); hot spare doubles the bill.
  const extraKwh = powerKWhPerMonth(hw) * redundancyEnergyFactor(level);
  const powerValue = extraKwh > 0
    ? `+~${fmtNum(extraKwh, 0)} kWh · ${fmtEUR(Math.round(extraKwh * getKwh()))}`
    : t("redcard.power.none");
  return `
    <div class="result-card secondary">
      <span class="result-badge">${esc(t("redcard.badge"))}</span>
      <div class="result-headline">${esc(t(`redcard.headline.${level}`))}</div>
      <div class="result-sub">2× ${esc(hw.name)}</div>
      <div class="stat-grid">
        <div class="stat"><div class="label">${esc(t("redcard.extra"))}</div>
          <div class="value">${esc(extra)}</div></div>
        <div class="stat"><div class="label">${esc(t("redcard.total"))}</div>
          <div class="value">${esc(total)}</div></div>
        <div class="stat"><div class="label">${esc(t("redcard.power"))}</div>
          <div class="value">${esc(powerValue)}</div></div>
      </div>
      <p class="rc-desc" style="margin-top:0.6rem">${esc(t(`redcard.note.${level}`))}</p>
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
          <td>${esc(priceRange(hw))}${hw.priceCheck ? ` <a class="price-check-sm" href="https://geizhals.de/?fs=${encodeURIComponent(hw.priceCheck)}" target="_blank" rel="noopener" title="${esc(t("results.priceCheck", { part: hw.priceCheck }))}">↗</a>` : ""}</td>
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
    </div>
    ${priceNote()}`;
}
