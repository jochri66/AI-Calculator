// Entry point: language, tabs, wizard flow, expert mode, cloud comparison.

import { INDUSTRIES } from "./data.js";
import { initLang, setLang, getLang, applyTranslations, t } from "./i18n.js";
import { renderWizardResults, rerenderResults, initExpert, renderCompareTab } from "./ui.js";

const STEPS = 7;
let currentStep = 0;
let expertApi = null;
let wizardSliders = null;
let compareSliders = null;
let resultsShown = false;

const $ = (id) => document.getElementById(id);

function showStep(n) {
  currentStep = n;
  document.querySelectorAll(".wizard-step").forEach((fs) => {
    fs.hidden = Number(fs.dataset.step) !== n;
  });
  $("wizard-back").hidden = n === 0;
  $("wizard-next").setAttribute(
    "data-i18n",
    n === STEPS - 1 ? "wizard.show" : "wizard.next"
  );
  applyTranslations($("wizard"));
  renderProgress();
}

function renderProgress() {
  $("wizard-progress").innerHTML = Array.from({ length: STEPS }, (_, i) => {
    const cls = i < currentStep ? "dot done" : i === currentStep ? "dot current" : "dot";
    return `<span class="${cls}"></span>`;
  }).join("");
}

function collectAnswers() {
  const fd = new FormData($("wizard-form"));
  const custom = Number(fd.get("usersCustom"));
  return {
    users: custom > 0 ? custom : Number(fd.get("users")),
    mix: wizardSliders.values(),
    sovereigntyPct: Number($("sov-range").value),
    budgetId: fd.get("budgetId"),
    quality: fd.get("quality"),
    redundancy: fd.get("redundancy"),
  };
}

// Auto-balancing sliders scoped to a container: the four shares always sum
// to 100%. Dragging one slider redistributes the remainder across the others.
function initMixSliders(root, onChange) {
  const sliders = [...root.querySelectorAll("[data-mix]")];

  const paint = () => {
    sliders.forEach((el) => {
      el.style.setProperty("--pct", `${el.value}%`);
      const out = root.querySelector(`[data-mix-out="${el.dataset.mix}"]`);
      if (out) out.textContent = `${el.value}%`;
    });
  };

  const rebalance = (changed) => {
    const v = Math.min(100, Math.max(0, Math.round(Number(changed.value))));
    changed.value = String(v);
    const others = sliders.filter((el) => el !== changed);
    const rest = 100 - v;
    const sumOthers = others.reduce((s, el) => s + Number(el.value), 0);

    const raw = others.map((el) =>
      sumOthers > 0 ? (Number(el.value) / sumOthers) * rest : rest / others.length
    );
    const floors = raw.map(Math.floor);
    let leftover = rest - floors.reduce((s, n) => s + n, 0);
    raw
      .map((r, i) => ({ i, frac: r - floors[i] }))
      .sort((a, b) => b.frac - a.frac)
      .forEach(({ i }) => { if (leftover > 0) { floors[i] += 1; leftover -= 1; } });

    others.forEach((el, i) => { el.value = String(floors[i]); });
    paint();
    if (onChange) onChange();
  };

  sliders.forEach((el) => el.addEventListener("input", () => rebalance(el)));
  paint();

  return {
    paint,
    values: () => {
      const out = {};
      sliders.forEach((el) => { out[el.dataset.mix] = Number(el.value); });
      return out;
    },
    set: (mix) => {
      sliders.forEach((el) => { el.value = String(mix[el.dataset.mix] ?? 0); });
      paint();
      if (onChange) onChange();
    },
  };
}

// Sovereignty slider: gradient fill + live label.
function paintSovereignty() {
  const el = $("sov-range");
  const v = Number(el.value);
  el.style.setProperty("--pct", `${v}%`);
  $("sov-value").textContent = `${v}%`;
  const key = v <= 20 ? "sov.label.cloud" : v >= 80 ? "sov.label.local" : "sov.label.mixed";
  $("sov-label").textContent = t(key);
}

// Industry preset: prefill mix sliders + sovereignty; user can change everything later.
function applyIndustry(id) {
  const preset = INDUSTRIES.find((p) => p.id === id);
  if (!preset) return;
  if (preset.mix) wizardSliders.set(preset.mix);
  if (preset.sovereigntyPct != null) {
    $("sov-range").value = String(preset.sovereigntyPct);
    paintSovereignty();
  }
}

function showResults() {
  const results = $("wizard-results");
  resultsShown = true;
  $("wizard").hidden = true;
  results.hidden = false;
  renderWizardResults(results, collectAnswers());
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

function restartWizard() {
  resultsShown = false;
  $("wizard-results").hidden = true;
  $("wizard").hidden = false;
  showStep(0);
}

function activateTab(which) {
  const tabs = { wizard: $("tab-wizard"), expert: $("tab-expert"), compare: $("tab-compare") };
  Object.entries(tabs).forEach(([name, btn]) => {
    btn.classList.toggle("active", name === which);
    btn.setAttribute("aria-selected", String(name === which));
  });
  $("expert").hidden = which !== "expert";
  $("compare").hidden = which !== "compare";
  $("wizard").hidden = which !== "wizard" || resultsShown;
  $("wizard-results").hidden = which !== "wizard" || !resultsShown;
  if (which === "compare") {
    // start the tab from the wizard's current mix
    compareSliders.set(wizardSliders.values());
    updateCompare();
  }
}

function updateCompare() {
  renderCompareTab($("compare-output"), {
    seats: Math.max(1, Number($("cmp-seats").value) || 1),
    intensity: $("cmp-intensity").value,
    mix: compareSliders.values(),
  });
}

function updateLangToggle() {
  $("lang-toggle").textContent = getLang() === "de" ? "EN" : "DE";
}

function init() {
  initLang();
  applyTranslations();
  updateLangToggle();

  wizardSliders = initMixSliders($("wizard"));
  compareSliders = initMixSliders($("compare"), () => updateCompare());
  showStep(0);
  paintSovereignty();
  expertApi = initExpert();

  $("sov-range").addEventListener("input", paintSovereignty);
  document.querySelectorAll('input[name="industry"]').forEach((el) =>
    el.addEventListener("change", () => applyIndustry(el.value))
  );

  $("lang-toggle").addEventListener("click", () => {
    setLang(getLang() === "de" ? "en" : "de", () => {
      updateLangToggle();
      showStep(currentStep);
      paintSovereignty();
      rerenderResults();
      if (expertApi) { expertApi.syncQuants(); expertApi.render(); }
      if (!$("compare").hidden) updateCompare();
    });
  });

  $("tab-wizard").addEventListener("click", () => activateTab("wizard"));
  $("tab-expert").addEventListener("click", () => activateTab("expert"));
  $("tab-compare").addEventListener("click", () => activateTab("compare"));

  $("wizard-next").addEventListener("click", () => {
    if (currentStep < STEPS - 1) showStep(currentStep + 1);
    else showResults();
  });
  $("wizard-back").addEventListener("click", () => {
    if (currentStep > 0) showStep(currentStep - 1);
  });

  $("cmp-seats").addEventListener("input", updateCompare);
  $("cmp-intensity").addEventListener("change", updateCompare);

  document.addEventListener("wizard:restart", restartWizard);
  document.addEventListener("open:compare", () => {
    activateTab("compare");
    $("compare").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Console sanity suite: append ?test=1 to the URL.
  if (new URLSearchParams(location.search).get("test") === "1") {
    import("./selftest.js").then((m) => m.run());
  }
}

init();
