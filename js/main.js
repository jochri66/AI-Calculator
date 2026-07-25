// Entry point: language, tabs, wizard flow, expert mode.

import { initLang, setLang, getLang, applyTranslations } from "./i18n.js";
import { renderWizardResults, rerenderResults, initExpert } from "./ui.js";

const STEPS = 5;
let currentStep = 0;
let expertApi = null;
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
  applyTranslations($("wizard").parentElement ? $("wizard") : document);
  renderProgress();
}

function renderProgress() {
  $("wizard-progress").innerHTML = Array.from({ length: STEPS }, (_, i) => {
    const cls = i < currentStep ? "dot done" : i === currentStep ? "dot current" : "dot";
    return `<span class="${cls}"></span>`;
  }).join("");
}

function collectAnswers() {
  const form = $("wizard-form");
  const fd = new FormData(form);
  const custom = Number(fd.get("usersCustom"));
  return {
    users: custom > 0 ? custom : Number(fd.get("users")),
    useCase: fd.get("useCase"),
    sovereignty: fd.get("sovereignty"),
    budgetId: fd.get("budgetId"),
    quality: fd.get("quality"),
  };
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
  const wizardActive = which === "wizard";
  $("tab-wizard").classList.toggle("active", wizardActive);
  $("tab-expert").classList.toggle("active", !wizardActive);
  $("tab-wizard").setAttribute("aria-selected", String(wizardActive));
  $("tab-expert").setAttribute("aria-selected", String(!wizardActive));
  $("expert").hidden = wizardActive;
  $("wizard").hidden = !wizardActive || resultsShown;
  $("wizard-results").hidden = !wizardActive || !resultsShown;
}

function updateLangToggle() {
  $("lang-toggle").textContent = getLang() === "de" ? "EN" : "DE";
}

function init() {
  initLang();
  applyTranslations();
  updateLangToggle();
  showStep(0);
  expertApi = initExpert();

  $("lang-toggle").addEventListener("click", () => {
    setLang(getLang() === "de" ? "en" : "de", () => {
      updateLangToggle();
      showStep(currentStep);
      rerenderResults();
      if (expertApi) { expertApi.syncQuants(); expertApi.render(); }
    });
  });

  $("tab-wizard").addEventListener("click", () => activateTab("wizard"));
  $("tab-expert").addEventListener("click", () => activateTab("expert"));

  $("wizard-next").addEventListener("click", () => {
    if (currentStep < STEPS - 1) showStep(currentStep + 1);
    else showResults();
  });
  $("wizard-back").addEventListener("click", () => {
    if (currentStep > 0) showStep(currentStep - 1);
  });

  document.addEventListener("wizard:restart", restartWizard);

  // Console sanity suite: append ?test=1 to the URL.
  if (new URLSearchParams(location.search).get("test") === "1") {
    import("./selftest.js").then((m) => m.run());
  }
}

init();
