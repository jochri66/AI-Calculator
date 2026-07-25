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
    "tabs.compare": "Cloud vs. Lokal",

    "wizard.step.industry.title": "In welcher Branche bist du unterwegs?",
    "wizard.step.industry.desc":
      "Optional — die Vorlage stellt Regler und Datensouveränität passend ein. Du kannst danach alles anpassen.",
    "industry.individuell": "Individuell",
    "industry.individuell.desc": "Keine Vorlage — du stellst alles selbst ein",
    "industry.kanzlei": "Kanzlei & Recht",
    "industry.kanzlei.desc": "Mandantendaten, viel Dokumentenarbeit → RAG-lastig, hohe Souveränität",
    "industry.fertigung": "Fertigung & Zulieferer",
    "industry.fertigung.desc": "Konstruktion, Code, Automatisierung → gemischter Betrieb",
    "industry.agentur": "Agentur & Marketing",
    "industry.agentur.desc": "Texte, Kampagnen, etwas Code → Cloud meist okay",
    "industry.gesundheit": "Gesundheitswesen",
    "industry.gesundheit.desc": "Patientendaten → hohe Souveränität, Chat + Wissensbasis",
    "industry.handel": "Handel & E-Commerce",
    "industry.handel.desc": "Support, Produktdaten, Automatisierung",

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

    "wizard.step.sov.title": "Wie viel deiner KI-Nutzung muss auf eigener Hardware laufen?",
    "wizard.step.sov.desc":
      "Datensouveränität heißt: Deine Daten verlassen dein Haus nicht. Schieb den Regler auf den Anteil deiner Nutzung, der sensible Daten berührt — der Rest darf in die Cloud.",
    "sov.scale.cloud": "0 % — alles Cloud",
    "sov.scale.local": "100 % — alles lokal",
    "sov.label.cloud": "Cloud ist okay",
    "sov.label.mixed": "Hybrid: Sensibles lokal, Rest Cloud",
    "sov.label.local": "Nichts verlässt das Haus",
    "sov.explain.local.title": "Gehört auf eigene Hardware:",
    "sov.explain.local":
      "Mandanten- & Patientendaten, Verträge, Quellcode, Betriebsgeheimnisse — alles mit DSGVO-Risiko.",
    "sov.explain.cloud.title": "Darf meist in die Cloud:",
    "sov.explain.cloud":
      "Generische Texte, öffentliche Recherche, Brainstorming, Marketing-Entwürfe.",

    "wizard.step.budget.title": "Welcher Budgetrahmen ist realistisch?",
    "wizard.step.budget.desc": "Einmalige Hardware-Investition (netto), ohne Betriebskosten.",
    "budget.b1": "bis 5.000 €",
    "budget.b2": "bis 15.000 €",
    "budget.b3": "bis 70.000 €",
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
      "Zum Vergleich: Ein Setup der 70B–235B-Klasse (~65.000 €) erledigt dieselben Aufgaben für die meisten Mittelständler — Frontier-Modelle lohnen sich nur bei harten Anforderungen und Premium-Budget.",
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

    "wizard.step.red.title": "Wie schlimm ist es, wenn die KI mal ausfällt?",
    "wizard.step.red.desc":
      "Auch Server fallen aus: Netzteil, GPU, Software-Update, Stromausfall. Redundanz heißt: Ein zweites System steht bereit und übernimmt.",
    "red.none": "Kann mal ausfallen",
    "red.none.desc": "Ein System reicht — ein Tag Ausfall wäre ärgerlich, aber kein Drama",
    "red.standby": "Sollte schnell wieder laufen",
    "red.standby.desc": "Zweites System als Standby — bei Ausfall manuell umschalten (Minuten bis Stunden)",
    "red.full": "Muss immer laufen",
    "red.full.desc": "Automatischer Failover — Ausfall eines Systems merkt niemand",
    "red.explain.title": "Warum das wichtig ist:",
    "red.explain":
      "Ohne Redundanz ist dein KI-Server ein Single Point of Failure — fällt er aus, steht die KI für das ganze Team, bis Ersatz läuft. Redundanz kostet grob das Doppelte an Hardware, dafür arbeitet dein Team weiter, wenn ein System stirbt. Backups ersetzen keine Redundanz: Sie retten deine Daten, nicht deine Verfügbarkeit.",

    "redcard.badge": "Ausfallsicherheit",
    "redcard.headline.standby": "Zweites System als Standby",
    "redcard.headline.full": "Zwei Systeme mit automatischem Failover",
    "redcard.builtin":
      "Schon eingebaut: Diese Konfiguration ist redundant ausgelegt (aktive Knoten + Reserve).",
    "redcard.extra": "Mehrkosten",
    "redcard.total": "Gesamt (2 Systeme)",
    "redcard.note.standby":
      "Beim Ausfall schaltest du (oder wir) manuell um — rechne mit Minuten bis Stunden Unterbrechung. Der Standby kann bis dahin als Test- oder Entwicklungssystem arbeiten.",
    "redcard.note.full":
      "Load Balancer verteilt auf beide Systeme; fällt eins aus, übernimmt das andere automatisch — dein Team merkt nichts. Etwas Einrichtungsaufwand kommt dazu.",
    "caveat.noRedundancy":
      "Ein einzelnes System ist ein Single Point of Failure. Ab ~25 Nutzern lohnt sich ein Standby-System — sonst steht bei einem Defekt das ganze Team.",

    "country.de": "Deutschland",
    "country.at": "Österreich",
    "country.ch": "Schweiz",
    "country.eu": "EU-Durchschnitt",
    "country.us": "USA",
    "cmp.country": "Strompreis",
    "results.power": "Strom/Monat",

    "cmp.title": "Cloud vs. Lokal",
    "cmp.desc":
      "Was kosten ChatGPT, Claude & Gemini im Vergleich zu eigener Hardware? Team-Größe und Nutzung einstellen — die Balken rechnen live.",
    "cmp.resultsTitle": "Zum Vergleich: Cloud statt eigener Hardware",
    "cmp.seats": "Team-Größe (Lizenzen)",
    "cmp.intensity": "Nutzungsintensität",
    "cmp.intensity.light": "Leicht (ab und zu)",
    "cmp.intensity.normal": "Normal (täglich)",
    "cmp.intensity.heavy": "Intensiv (Dauereinsatz)",
    "cmp.horizon.monthly": "Monatlich",
    "cmp.horizon.year1": "1 Jahr",
    "cmp.horizon.year3": "3 Jahre",
    "cmp.selfhost": "Eigene Hardware",
    "cmp.perMonth": "/Monat",
    "cmp.assumptions":
      "Annahmen: {seats} Lizenzen, ca. {mtok} Mio. Token pro Kopf und Monat, 21 Arbeitstage. Eigene Hardware: Strom {kwh} €/kWh bei Ø 40 % Auslastung. Preise Stand {date}, netto, gerundet.",
    "fin.label": "Hardware-Bezahlung",
    "fin.upfront": "100 % Anzahlung",
    "fin.y1": "1 Jahr Finanzierung",
    "fin.y3": "3 Jahre Finanzierung",
    "cmpsum.upfrontLine": "einmalig {price} Hardware — monatlich nur {energy} Strom",
    "cmpsum.financedLine": "davon {hw} Hardware ({n} Jahre) + {energy} Strom",
    "cmpsum.plusUpfront": "+ {price} einmalig für die Hardware",
    "cmp.fin.upfrontNote":
      "Hardware als Einmalzahlung — in den Monatskosten steckt nur der Strom.",
    "cmp.fin.financedNote":
      "Hardware auf {n} Jahre umgelegt und in den Monatskosten enthalten.",
    "cmp.caveat.quality":
      "Fairerweise: Die geschlossenen Frontier-Modelle (GPT, Claude, Gemini) sind aktuell stärker als lokale Modelle derselben Preisklasse.",
    "cmp.caveat.seats": "Annahme: ca. 3 Lizenzen je gleichzeitigem Nutzer.",
    "cmp.flag.capped": "Nutzungslimits — bei Dauerlast wirst du gedrosselt",
    "cmp.flag.noSov":
      "Erfüllt deine Souveränitäts-Anforderung nicht — Daten gehen zu US-Anbietern",
    "cmp.flag.perPerson": "Einzelplan pro Person, laut AGB nicht teilbar",
    "cmp.flag.agentsApi":
      "Für Agenten-Dauerbetrieb ungeeignet — dafür brauchst du API oder eigene Hardware",
    "cmp.flagShort.capped": "Limits",
    "cmp.flagShort.perPerson": "pro Person",
    "cmp.flagShort.noSov": "nicht souverän",
    "cmp.flagShort.agentsApi": "nicht für Agenten",

    "cmpsum.title": "Und was würde die Cloud kosten?",
    "cmpsum.sub": "Günstigstes Cloud-Abo",
    "cmpsum.api": "Günstigste Cloud-API",
    "cmpsum.breakeven":
      "Kurz gesagt: Nach ca. {n} Monaten hat sich deine eigene Hardware bezahlt gemacht — danach zahlst du nur noch Strom.",
    "cmpsum.cloudWins":
      "Kurz gesagt: Bei deiner Nutzung bleibt die Cloud rechnerisch günstiger. Eigene Hardware lohnt sich hier vor allem, wenn deine Daten das Haus nicht verlassen dürfen.",
    "cmpsum.details": "Alle Anbieter im Detail vergleichen",

    "hybrid.badge": "Hybrid-Vorschlag",
    "hybrid.headline": "{local} % lokal + {cloud} % Cloud",
    "hybrid.local": "Lokal",
    "hybrid.cloud": "Cloud",
    "hybrid.users": "Nutzer",
    "hybrid.note":
      "Sensible Daten bleiben im Haus auf kleinerer (günstigerer) Hardware — der unkritische Rest läuft über die Cloud. Oft der beste Deal.",

    "cta.title": "Bock, das umzusetzen?",
    "cta.body":
      "Zwei Leute, ein Projekt: Einer baut die Hardware, einer bringt KI in Unternehmen. Schreib uns einfach — wir schauen uns dein Szenario unverbindlich an.",
    "cta.role.hardware": "Ingenieur, kein Verkäufer — plant, baut und betreibt die Systeme, auf denen deine KI läuft. Vom ersten Server bis zum redundanten Cluster, ehrlich gerechnet statt überdimensioniert verkauft.",
    "cta.role.coach": "Bringt KI in den Arbeitsalltag — ohne Buzzword-Bingo. Auch die Großen holen sich hier Rat.",
    "cta.follow": "Auf Instagram schreiben",

    "footer.github":
      "Open-Source-Projekt: Ein ehrlicher Planungsrechner für lokale KI im Mittelstand — Rechenweg, Hardware-Katalog und Preise sind offen einsehbar auf",
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
    "tabs.compare": "Cloud vs. local",

    "wizard.step.industry.title": "What industry are you in?",
    "wizard.step.industry.desc":
      "Optional — the preset dials in the sliders and data sovereignty for you. You can change everything afterwards.",
    "industry.individuell": "Custom",
    "industry.individuell.desc": "No preset — you set everything yourself",
    "industry.kanzlei": "Law firm & legal",
    "industry.kanzlei.desc": "Client data, heavy document work → RAG-focused, high sovereignty",
    "industry.fertigung": "Manufacturing & suppliers",
    "industry.fertigung.desc": "Engineering, code, automation → mixed workloads",
    "industry.agentur": "Agency & marketing",
    "industry.agentur.desc": "Copy, campaigns, some code → cloud is usually fine",
    "industry.gesundheit": "Healthcare",
    "industry.gesundheit.desc": "Patient data → high sovereignty, chat + knowledge base",
    "industry.handel": "Retail & e-commerce",
    "industry.handel.desc": "Support, product data, automation",

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

    "wizard.step.sov.title": "How much of your AI usage must run on your own hardware?",
    "wizard.step.sov.desc":
      "Data sovereignty means: your data never leaves your premises. Set the slider to the share of your usage that touches sensitive data — the rest can go to the cloud.",
    "sov.scale.cloud": "0% — all cloud",
    "sov.scale.local": "100% — all local",
    "sov.label.cloud": "Cloud is fine",
    "sov.label.mixed": "Hybrid: sensitive local, rest cloud",
    "sov.label.local": "Nothing leaves the premises",
    "sov.explain.local.title": "Belongs on your own hardware:",
    "sov.explain.local":
      "Client & patient data, contracts, source code, trade secrets — anything with GDPR risk.",
    "sov.explain.cloud.title": "Usually fine in the cloud:",
    "sov.explain.cloud":
      "Generic copy, public research, brainstorming, marketing drafts.",

    "wizard.step.budget.title": "What budget range is realistic?",
    "wizard.step.budget.desc": "One-off hardware investment (net), excluding running costs.",
    "budget.b1": "up to €5,000",
    "budget.b2": "up to €15,000",
    "budget.b3": "up to €70,000",
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
      "For comparison: a 70B–235B-class setup (~€65,000) does the same job for most SMBs — frontier models only pay off with hard requirements and a premium budget.",
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

    "wizard.step.red.title": "How bad is it if the AI goes down for a while?",
    "wizard.step.red.desc":
      "Servers fail too: power supply, GPU, software update, outage. Redundancy means a second system stands ready and takes over.",
    "red.none": "Can go down occasionally",
    "red.none.desc": "One system is enough — a day of downtime would be annoying, not a disaster",
    "red.standby": "Should recover quickly",
    "red.standby.desc": "Second system on standby — manual switchover on failure (minutes to hours)",
    "red.full": "Must always run",
    "red.full.desc": "Automatic failover — nobody notices when one system dies",
    "red.explain.title": "Why this matters:",
    "red.explain":
      "Without redundancy your AI server is a single point of failure — if it dies, AI is down for the whole team until a replacement runs. Redundancy roughly doubles the hardware cost, but your team keeps working when one system dies. Backups are not redundancy: they save your data, not your uptime.",

    "redcard.badge": "Fault tolerance",
    "redcard.headline.standby": "Second system on standby",
    "redcard.headline.full": "Two systems with automatic failover",
    "redcard.builtin":
      "Already built in: this configuration is designed redundantly (active nodes + spare).",
    "redcard.extra": "Extra cost",
    "redcard.total": "Total (2 systems)",
    "redcard.note.standby":
      "On failure you (or we) switch over manually — expect minutes to hours of interruption. Until then the standby can double as a test or development system.",
    "redcard.note.full":
      "A load balancer spreads work across both systems; if one fails the other takes over automatically — your team notices nothing. Adds some setup effort.",
    "caveat.noRedundancy":
      "A single system is a single point of failure. From ~25 users a standby system pays off — otherwise one defect stops the whole team.",

    "country.de": "Germany",
    "country.at": "Austria",
    "country.ch": "Switzerland",
    "country.eu": "EU average",
    "country.us": "USA",
    "cmp.country": "Electricity price",
    "results.power": "Power/month",

    "cmp.title": "Cloud vs. local",
    "cmp.desc":
      "What do ChatGPT, Claude & Gemini cost compared to your own hardware? Set team size and usage — the bars recalculate live.",
    "cmp.resultsTitle": "For comparison: cloud instead of your own hardware",
    "cmp.seats": "Team size (licenses)",
    "cmp.intensity": "Usage intensity",
    "cmp.intensity.light": "Light (now and then)",
    "cmp.intensity.normal": "Normal (daily)",
    "cmp.intensity.heavy": "Heavy (constant use)",
    "cmp.horizon.monthly": "Monthly",
    "cmp.horizon.year1": "1 year",
    "cmp.horizon.year3": "3 years",
    "cmp.selfhost": "Own hardware",
    "cmp.perMonth": "/month",
    "cmp.assumptions":
      "Assumptions: {seats} licenses, ~{mtok}M tokens per person per month, 21 working days. Own hardware: power at {kwh} €/kWh, avg. 40% utilization. Prices as of {date}, net, rounded.",
    "fin.label": "Hardware payment",
    "fin.upfront": "100% upfront",
    "fin.y1": "1-year financing",
    "fin.y3": "3-year financing",
    "cmpsum.upfrontLine": "{price} hardware once — only {energy} power per month",
    "cmpsum.financedLine": "{hw} hardware ({n} yrs) + {energy} power",
    "cmpsum.plusUpfront": "+ {price} one-time for the hardware",
    "cmp.fin.upfrontNote":
      "Hardware paid upfront — the monthly cost contains only power.",
    "cmp.fin.financedNote":
      "Hardware spread over {n} years and included in the monthly cost.",
    "cmp.caveat.quality":
      "To be fair: the closed frontier models (GPT, Claude, Gemini) are currently stronger than local models in the same price class.",
    "cmp.caveat.seats": "Assumption: ~3 licenses per concurrent user.",
    "cmp.flag.capped": "Usage limits — sustained load gets you throttled",
    "cmp.flag.noSov":
      "Does not meet your sovereignty requirement — data goes to US providers",
    "cmp.flag.perPerson": "Individual plan per person, not shareable per ToS",
    "cmp.flag.agentsApi":
      "Unsuitable for continuous agent workloads — you need the API or your own hardware",
    "cmp.flagShort.capped": "limits",
    "cmp.flagShort.perPerson": "per person",
    "cmp.flagShort.noSov": "not sovereign",
    "cmp.flagShort.agentsApi": "not for agents",

    "cmpsum.title": "And what would the cloud cost?",
    "cmpsum.sub": "Cheapest cloud subscription",
    "cmpsum.api": "Cheapest cloud API",
    "cmpsum.breakeven":
      "In short: after about {n} months your own hardware has paid for itself — from then on you only pay for power.",
    "cmpsum.cloudWins":
      "In short: at your usage level the cloud stays cheaper on paper. Own hardware pays off here mainly when your data must not leave the premises.",
    "cmpsum.details": "Compare all providers in detail",

    "hybrid.badge": "Hybrid suggestion",
    "hybrid.headline": "{local}% local + {cloud}% cloud",
    "hybrid.local": "Local",
    "hybrid.cloud": "Cloud",
    "hybrid.users": "users",
    "hybrid.note":
      "Sensitive data stays in-house on smaller (cheaper) hardware — the non-critical rest runs via the cloud. Often the best deal.",

    "cta.title": "Ready to build this?",
    "cta.body":
      "Two people, one project: one builds the hardware, one gets AI into companies. Just hit us up — we'll look at your scenario, no strings attached.",
    "cta.role.hardware": "Engineer, not a salesman — designs, builds and runs the systems your AI lives on. From first server to redundant cluster, honestly calculated instead of oversold.",
    "cta.role.coach": "Gets AI into everyday work — zero buzzword bingo. Even the big players come here for advice.",
    "cta.follow": "DM on Instagram",

    "footer.github":
      "Open-source project: an honest planning calculator for local AI in SMEs — the math, hardware catalog and prices are open for inspection at",
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
