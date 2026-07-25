// Minimal i18n: flat key-value dicts, data-i18n attributes for static text,
// t(key, params) for dynamic text. German is the default (informal "du").

export const STRINGS = {
  de: {
    "app.title": "Wie viel Server braucht deine lokale KI?",
    "app.tagline":
      "Finde raus, welche Hardware du wirklich brauchst, um KI-Modelle bei dir laufen zu lassen — ehrliche Zahlen statt Marketing-Versprechen.",
    "app.disclaimer":
      "Alle Werte sind Planungsschätzungen auf Basis von Speicherbandbreite, Kapazität und Batching-Heuristiken — keine Benchmarks. Reale Ergebnisse hängen von Software-Stack, Kontextlängen und Lastprofil ab (±30 % sind normal).",

    "tabs.wizard": "Bedarfs-Check",
    "tabs.expert": "Experten-Modus",

    "wizard.step.users.title": "Wie viele Leute nutzen die KI gleichzeitig?",
    "wizard.step.users.desc":
      "Gemeint sind aktive Nutzer zur gleichen Zeit, nicht dein gesamtes Team.",
    "wizard.users.opt1": "1–5",
    "wizard.users.opt1.desc": "Solo oder kleines Team",
    "wizard.users.opt2": "5–25",
    "wizard.users.opt2.desc": "Abteilung",
    "wizard.users.opt3": "25–100",
    "wizard.users.opt3.desc": "Mittlerer Betrieb",
    "wizard.users.opt4": "100–500",
    "wizard.users.opt4.desc": "Größeres Unternehmen",
    "wizard.users.custom": "Genaue Zahl (optional):",

    "wizard.step.usecase.title": "Wofür soll die KI hauptsächlich eingesetzt werden?",
    "wizard.step.usecase.desc":
      "Verteil die Nutzung mit den Reglern — Mischbetrieb ist völlig normal. Der Mix bestimmt, wie viele Leute sich einen Rechenstrom teilen können.",
    "usecase.chat": "Chat-Assistent",
    "usecase.chat.desc": "Fragen & Antworten, Texte, E-Mails — Nutzer sind meist im Leerlauf",
    "usecase.rag": "Wissensdatenbank (RAG)",
    "usecase.rag.desc": "Fragen an eigene Dokumente mit Quellenangaben",
    "usecase.coding": "Coding-Assistent",
    "usecase.coding.desc": "Code-Vervollständigung und -Erklärung, braucht mehr Tempo",
    "usecase.agentic": "KI-Agenten",
    "usecase.agentic.desc":
      "Autonome Workflows — Agenten belegen ihren Rechenstrom dauerhaft (1:1!)",

    "wizard.step.sov.title": "Wie wichtig ist dir Datensouveränität?",
    "wizard.step.sov.desc":
      "Ehrlich gesagt: Ohne harte Anforderungen ist eine Cloud-API oft die wirtschaftlichere Wahl.",
    "sov.hard": "Harte Anforderung",
    "sov.hard.desc": "Daten dürfen das Haus nicht verlassen (Regulierung, Verträge, Geheimschutz)",
    "sov.pref": "Bevorzugt lokal",
    "sov.pref.desc": "Lokal ist uns lieber, aber kein Muss",
    "sov.none": "Flexibel",
    "sov.none.desc": "Cloud wäre auch okay",

    "wizard.step.budget.title": "Welcher Budgetrahmen ist realistisch?",
    "wizard.step.budget.desc": "Einmalige Hardware-Investition (netto), ohne Betriebskosten.",
    "budget.b1": "bis 5.000 €",
    "budget.b2": "bis 15.000 €",
    "budget.b3": "bis 60.000 €",
    "budget.b4": "bis 150.000 €",
    "budget.b5": "über 150.000 €",

    "wizard.step.quality.title": "Welche Antwortqualität brauchst du?",
    "wizard.step.quality.desc":
      "Größere Modelle antworten klüger, brauchen aber überproportional mehr Hardware.",
    "quality.basic": "Solide Basis",
    "quality.basic.desc": "Kleine bis mittlere Modelle — für Standardaufgaben völlig ausreichend",
    "quality.good": "Hohe Qualität",
    "quality.good.desc": "Mittlere bis große Modelle — der wirtschaftliche Sweet Spot",
    "quality.best": "Bestmöglich",
    "quality.best.desc": "Das Beste, was lokal derzeit geht — inkl. Frontier-Modelle, wenn sinnvoll",

    "wizard.back": "Zurück",
    "wizard.next": "Weiter",
    "wizard.show": "Empfehlung berechnen",
    "wizard.restart": "Neu starten",

    "results.title": "Deine Empfehlung",
    "results.badge.primary": "Empfehlung",
    "results.badge.primaryOver": "Günstigste machbare Lösung (über Budget)",
    "results.badge.alt": "Sparsame Alternative",
    "results.badge.premium": "Premium-Option",
    "results.model": "Modell",
    "results.hardware": "Hardware",
    "results.price": "Preisrahmen",
    "results.perStream": "Tempo pro Sitzung",
    "results.streams": "Parallele Sitzungen",
    "results.maxUsers": "Versorgt bis zu",
    "results.usersUnit": "{n} Nutzer",
    "results.needLine": "Dein Bedarf: ca. {users} gleichzeitige Nutzer ≈ {streams} parallele Rechenströme.",
    "results.tokS": "{a}–{b} Tok./s",
    "results.memory": "Speicherbedarf",
    "results.ofMem": "{used} von {avail} GB",
    "results.share": "Ergebnis teilen",
    "results.shareCopied": "Kopiert!",
    "results.budgetMiss":
      "In deinem Budget gibt es keine Konfiguration, die den Bedarf erfüllt. Unten siehst du die günstigste machbare Lösung — oder geh bei der Modellqualität eine Stufe runter.",
    "results.capacityShort":
      "Kein einzelnes System im Katalog deckt diesen Bedarf voll ab. Gezeigt wird die Option mit der höchsten Kapazität — für mehr braucht es ein individuell geplantes Cluster.",
    "results.caveatsTitle": "Wichtige Hinweise — bitte lesen",
    "results.none":
      "Für diese Kombination gibt es keine sinnvolle Empfehlung. Probier andere Angaben.",

    "caveat.moePcie":
      "MoE-Modelle über reine PCIe-Verbindungen (ohne NVLink) sind für diese Modellklasse noch nicht belastbar gebenchmarkt — das Expert-Routing kann die Praxis-Leistung spürbar drücken. Der Hersteller empfiehlt für Kimi K3 64+ Beschleuniger.",
    "caveat.clusterFinicky":
      "Mac-Cluster über Thunderbolt funktionieren, sind aber fummelig im Betrieb und halbieren grob die Einzelstrom-Leistung.",
    "caveat.cpuSlow":
      "CPU-Server passen zwar vom Speicher her, liefern aber nur wenige Token pro Sekunde — gut zum Ausprobieren, nicht für den Team-Einsatz.",
    "caveat.benchmarkPending":
      "Kimi K3: Gewichte erscheinen erst am 27. Juli; belastbare Benchmarks folgen ca. 2–4 Wochen später. Vor einer Kaufentscheidung unbedingt echte Messwerte abwarten.",
    "caveat.apiCheaper":
      "Ohne harte Datensouveränitäts-Anforderung ist eine Cloud-API für die meisten Firmen deutlich günstiger als eigene Hardware. Rechne beides durch, bevor du investierst.",
    "caveat.midsizeCompare":
      "Zum Vergleich: Ein Setup der 70B–235B-Klasse (~60.000 €) erledigt dieselben Aufgaben für die meisten Mittelständler — Frontier-Modelle lohnen sich nur bei harten Anforderungen und Premium-Budget.",
    "caveat.budgetMiss": "Die gezeigte Lösung liegt über deinem angegebenen Budget.",
    "caveat.capacityShort": "Der gezeigte Bedarf übersteigt die Kapazität von Standard-Systemen.",

    "model.note.k3":
      "Kimi K3: 2,8 Billionen Parameter (MoE, ~50 Mrd. aktiv). Speicherbedarf ~350–600 GB (Q4) bis ~1,7 TB (volle Präzision). Auf Workstations nicht sinnvoll betreibbar.",
    "hw.note.used": "Gebrauchtgerät — günstigster Weg zu 1 TB RAM, aber langsam.",
    "hw.note.redundant": "Redundante Auslegung: 2 aktive Knoten + 1 Reserve, ausfallsicher.",
    "hw.note.production": "Produktionsreife Rechenzentrums-Lösung (Strom, Kühlung, Wartung einplanen).",

    "expert.title": "Experten-Modus",
    "expert.desc":
      "Modell und Parameter wählen — die Tabelle zeigt live, welche Hardware passt und was sie leistet.",
    "expert.model": "Modell",
    "expert.quant": "Quantisierung",
    "expert.context": "Kontextlänge (Token)",
    "expert.streams": "Gleichzeitige Sitzungen",
    "expert.memTitle": "Speicherbedarf",
    "expert.weights": "Gewichte",
    "expert.kv": "KV-Cache ({n} Sitzungen)",
    "expert.overhead": "Laufzeit-Overhead",
    "expert.total": "Gesamt",
    "expert.tableTitle": "Hardware im Vergleich",
    "expert.th.hw": "System",
    "expert.th.price": "Preis (ca.)",
    "expert.th.fits": "Passt?",
    "expert.th.single": "1 Sitzung",
    "expert.th.perStream": "Pro Sitzung ({n})",
    "expert.th.aggregate": "Gesamt-Durchsatz",
    "expert.fitsYes": "passt",
    "expert.fitsNo": "passt nicht",
    "expert.moeHint":
      "MoE-Modell: pro Token werden nur die aktiven Experten gelesen ({n} GB) — deshalb ist es schneller, als die Gesamtgröße vermuten lässt.",

    "quant.q4": "Q4 (Standard-Empfehlung)",
    "quant.q8": "Q8 (höhere Genauigkeit)",
    "quant.fp16": "FP16 (volle Präzision)",

    "tier.small": "Kompaktmodell",
    "tier.mid": "Mittelklasse",
    "tier.large-moe": "Großes MoE-Modell",
    "tier.frontier-moe": "Frontier-Modell",

    "cta.title": "Bock, das umzusetzen?",
    "cta.body":
      "Dieser Rechner ist ein gemeinsames Projekt: Hardware-Expertise trifft KI-Beratung. Schreib uns auf Instagram — wir rechnen dein Szenario unverbindlich durch.",
    "cta.role.hardware": "Der Hardware-Experte — plant und baut deine KI-Server, vom Workstation-Einstieg bis zum redundanten Cluster.",
    "cta.role.coach": "KI-Beratung, der große Unternehmen vertrauen — Strategie und Einführung im Betrieb.",
    "cta.follow": "Auf Instagram schreiben",

    "footer.joint": "Ein gemeinsames Projekt von",
    "footer.imprint": "Impressum",
    "footer.privacy": "Datenschutz",
    "unit.gb": "GB",
  },

  en: {
    "app.title": "How much server does your local AI need?",
    "app.tagline":
      "Find out what hardware you actually need to run AI models on your own turf — honest numbers instead of marketing promises.",
    "app.disclaimer":
      "All figures are planning estimates based on memory bandwidth, capacity and batching heuristics — not benchmarks. Real-world results depend on software stack, context lengths and load profile (±30% is normal).",

    "tabs.wizard": "Needs check",
    "tabs.expert": "Expert mode",

    "wizard.step.users.title": "How many people will use the AI at the same time?",
    "wizard.step.users.desc":
      "This means concurrently active users, not your total headcount.",
    "wizard.users.opt1": "1–5",
    "wizard.users.opt1.desc": "Solo or small team",
    "wizard.users.opt2": "5–25",
    "wizard.users.opt2.desc": "Department",
    "wizard.users.opt3": "25–100",
    "wizard.users.opt3.desc": "Mid-sized company",
    "wizard.users.opt4": "100–500",
    "wizard.users.opt4.desc": "Larger company",
    "wizard.users.custom": "Exact number (optional):",

    "wizard.step.usecase.title": "What will the AI mainly be used for?",
    "wizard.step.usecase.desc":
      "Spread the usage with the sliders — mixed workloads are totally normal. The mix determines how many people can share one compute stream.",
    "usecase.chat": "Chat assistant",
    "usecase.chat.desc": "Q&A, drafting, e-mails — users are idle most of the time",
    "usecase.rag": "Knowledge base (RAG)",
    "usecase.rag.desc": "Questions against your own documents, with sources",
    "usecase.coding": "Coding assistant",
    "usecase.coding.desc": "Code completion and explanation — needs more speed",
    "usecase.agentic": "AI agents",
    "usecase.agentic.desc":
      "Autonomous workflows — agents hold their stream continuously (1:1!)",

    "wizard.step.sov.title": "How important is data sovereignty to you?",
    "wizard.step.sov.desc":
      "Honestly: without hard requirements, a cloud API is often the more economical choice.",
    "sov.hard": "Hard requirement",
    "sov.hard.desc": "Data must not leave the premises (regulation, contracts, confidentiality)",
    "sov.pref": "Prefer local",
    "sov.pref.desc": "We'd rather run locally, but it's not a must",
    "sov.none": "Flexible",
    "sov.none.desc": "Cloud would be fine too",

    "wizard.step.budget.title": "What budget range is realistic?",
    "wizard.step.budget.desc": "One-off hardware investment (net), excluding running costs.",
    "budget.b1": "up to €5,000",
    "budget.b2": "up to €15,000",
    "budget.b3": "up to €60,000",
    "budget.b4": "up to €150,000",
    "budget.b5": "above €150,000",

    "wizard.step.quality.title": "What answer quality do you need?",
    "wizard.step.quality.desc":
      "Bigger models answer smarter but need disproportionately more hardware.",
    "quality.basic": "Solid basics",
    "quality.basic.desc": "Small to mid-size models — plenty for standard tasks",
    "quality.good": "High quality",
    "quality.good.desc": "Mid-size to large models — the economic sweet spot",
    "quality.best": "Best available",
    "quality.best.desc": "The best that runs locally today — incl. frontier models where sensible",

    "wizard.back": "Back",
    "wizard.next": "Next",
    "wizard.show": "Calculate recommendation",
    "wizard.restart": "Start over",

    "results.title": "Your recommendation",
    "results.badge.primary": "Recommendation",
    "results.badge.primaryOver": "Cheapest viable option (over budget)",
    "results.badge.alt": "Budget alternative",
    "results.badge.premium": "Premium option",
    "results.model": "Model",
    "results.hardware": "Hardware",
    "results.price": "Price range",
    "results.perStream": "Speed per session",
    "results.streams": "Parallel sessions",
    "results.maxUsers": "Serves up to",
    "results.usersUnit": "{n} users",
    "results.needLine": "Your need: ~{users} concurrent users ≈ {streams} parallel compute streams.",
    "results.tokS": "{a}–{b} tok/s",
    "results.memory": "Memory footprint",
    "results.ofMem": "{used} of {avail} GB",
    "results.share": "Share result",
    "results.shareCopied": "Copied!",
    "results.budgetMiss":
      "No configuration within your budget meets this need. Below is the cheapest viable option — or step down one model-quality tier.",
    "results.capacityShort":
      "No single catalog system fully covers this demand. Shown is the highest-capacity option — beyond that you need an individually planned cluster.",
    "results.caveatsTitle": "Important caveats — please read",
    "results.none":
      "There is no sensible recommendation for this combination. Try different inputs.",

    "caveat.moePcie":
      "MoE models over PCIe-only interconnects (no NVLink) are not yet reliably benchmarked for this model class — expert routing can noticeably reduce real-world performance. The vendor recommends 64+ accelerators for Kimi K3.",
    "caveat.clusterFinicky":
      "Mac clusters over Thunderbolt work, but are finicky to operate and roughly halve single-stream performance.",
    "caveat.cpuSlow":
      "CPU servers fit the model in memory but deliver only a few tokens per second — fine for experimentation, not for team use.",
    "caveat.benchmarkPending":
      "Kimi K3: weights release July 27; solid benchmarks follow ~2–4 weeks later. Wait for real measurements before committing capital.",
    "caveat.apiCheaper":
      "Without a hard data-sovereignty requirement, a cloud API is significantly cheaper for most companies than owning hardware. Run both numbers before investing.",
    "caveat.midsizeCompare":
      "For comparison: a 70B–235B-class setup (~€60,000) does the same job for most SMBs — frontier models only pay off with hard requirements and a premium budget.",
    "caveat.budgetMiss": "The option shown is above your stated budget.",
    "caveat.capacityShort": "The stated demand exceeds the capacity of standard systems.",

    "model.note.k3":
      "Kimi K3: 2.8 trillion parameters (MoE, ~50B active). Memory footprint ~350–600 GB (Q4) up to ~1.7 TB (full precision). Not viable on workstations.",
    "hw.note.used": "Used equipment — cheapest route to 1 TB RAM, but slow.",
    "hw.note.redundant": "Redundant design: 2 active nodes + 1 spare, fault-tolerant.",
    "hw.note.production": "Production-grade datacenter solution (plan for power, cooling, maintenance).",

    "expert.title": "Expert mode",
    "expert.desc":
      "Pick a model and parameters — the table shows live which hardware fits and what it delivers.",
    "expert.model": "Model",
    "expert.quant": "Quantization",
    "expert.context": "Context length (tokens)",
    "expert.streams": "Concurrent sessions",
    "expert.memTitle": "Memory footprint",
    "expert.weights": "Weights",
    "expert.kv": "KV cache ({n} sessions)",
    "expert.overhead": "Runtime overhead",
    "expert.total": "Total",
    "expert.tableTitle": "Hardware comparison",
    "expert.th.hw": "System",
    "expert.th.price": "Price (approx.)",
    "expert.th.fits": "Fits?",
    "expert.th.single": "1 session",
    "expert.th.perStream": "Per session ({n})",
    "expert.th.aggregate": "Total throughput",
    "expert.fitsYes": "fits",
    "expert.fitsNo": "doesn't fit",
    "expert.moeHint":
      "MoE model: each token only reads the active experts ({n} GB) — that's why it's faster than the total size suggests.",

    "quant.q4": "Q4 (standard recommendation)",
    "quant.q8": "Q8 (higher accuracy)",
    "quant.fp16": "FP16 (full precision)",

    "tier.small": "Compact model",
    "tier.mid": "Mid-size",
    "tier.large-moe": "Large MoE model",
    "tier.frontier-moe": "Frontier model",

    "cta.title": "Ready to build this?",
    "cta.body":
      "This calculator is a joint project: hardware expertise meets AI consulting. DM us on Instagram — we'll run your scenario, no strings attached.",
    "cta.role.hardware": "The hardware expert — designs and builds your AI servers, from workstation entry points to redundant clusters.",
    "cta.role.coach": "AI consulting that big corporations trust — strategy and rollout for your business.",
    "cta.follow": "DM on Instagram",

    "footer.joint": "A joint project by",
    "footer.imprint": "Imprint",
    "footer.privacy": "Privacy",
    "unit.gb": "GB",
  },
};

let currentLang = "de";

export function getLang() {
  return currentLang;
}

export function t(key, params) {
  let s = STRINGS[currentLang][key];
  if (s == null) {
    console.warn(`[i18n] missing key: ${currentLang}.${key}`);
    return key;
  }
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
  }
  return s;
}

export function fmtEUR(value) {
  return new Intl.NumberFormat(currentLang === "de" ? "de-DE" : "en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function fmtNum(value, digits = 0) {
  return new Intl.NumberFormat(currentLang === "de" ? "de-DE" : "en-GB", {
    maximumFractionDigits: digits,
  }).format(value);
}

export function applyTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
  });
}

export function setLang(lang, onChange) {
  if (!STRINGS[lang]) return;
  currentLang = lang;
  try {
    localStorage.setItem("lang", lang);
  } catch (_) { /* private mode */ }
  document.documentElement.lang = lang;
  applyTranslations();
  if (onChange) onChange();
}

export function initLang() {
  let lang = "de";
  try {
    lang = localStorage.getItem("lang") || "de";
  } catch (_) { /* private mode */ }
  currentLang = STRINGS[lang] ? lang : "de";
  document.documentElement.lang = currentLang;
}
