// Console sanity suite — calibration anchors from real-world estimates.
// Browser: open ?test=1. Node: `node js/selftest.js` (module check at bottom).

import { MODELS, HARDWARE, INDUSTRIES, CLOUD_PLANS, COUNTRIES } from "./data.js";
import {
  weightsGB, capacity, singleStreamTokS, maxUsefulStreams,
  usersServed, recommend, normalizeSovereignty, monthlyTokensPerSeat,
  cloudComparison, hybridPlan, selfHostMonthly, selfHostHorizons, powerKWhPerMonth,
  redundancyEnergyFactor, rebalanceMix,
} from "./calc.js";

const model = (id) => MODELS.find((m) => m.id === id);
const hw = (id) => HARDWARE.find((h) => h.id === id);

export function run() {
  const results = [];
  const check = (name, cond, detail) => {
    results.push({ name, pass: !!cond, detail });
    console[cond ? "log" : "error"](`${cond ? "PASS" : "FAIL"}  ${name}  ${detail ?? ""}`);
  };

  const k3 = model("kimi-k3");

  // --- Anchor: used EPYC Milan runs K3 Q4 at 2-4 tok/s ---
  const milan = hw("epyc-milan-1tb");
  const milanCap = capacity(k3, "q4", 8192, milan, 1);
  check("Milan fits K3 Q4", milanCap.fits, `footprint ${milanCap.footprint.toFixed(0)} GB`);
  const milanTokS = singleStreamTokS(k3, "q4", milan);
  check("Milan K3 Q4 = 2-4 tok/s", milanTokS >= 2 && milanTokS <= 4, milanTokS.toFixed(1));

  // --- Anchor: dual EPYC Turin at 8-15 tok/s ---
  const turin = singleStreamTokS(k3, "q4", hw("epyc-turin-dual"));
  check("Turin K3 Q4 = 8-15 tok/s", turin >= 8 && turin <= 15, turin.toFixed(1));

  // --- Anchor: 8x PRO 6000 node, K3 Q4 fits, 30-40 tok/s, PCIe-MoE flagged ---
  const node = hw("node-8x-pro6000");
  const nodeCap = capacity(k3, "q4", 8192, node, 4);
  check("8x node fits K3 Q4", nodeCap.fits, `footprint ${nodeCap.footprint.toFixed(0)} GB / usable ${nodeCap.usable.toFixed(0)}`);
  check("8x node K3 Q4 = 30-40 tok/s", nodeCap.single >= 30 && nodeCap.single <= 40, nodeCap.single.toFixed(1));
  check("8x node flags PCIe-MoE risk", nodeCap.flags.includes("caveat.moePcie"), nodeCap.flags.join(","));
  check("K3 flags pending benchmarks", nodeCap.flags.includes("caveat.benchmarkPending"));

  // --- Anchor: 3-node redundant cluster serves 150-300 chat users, only 30-50 agentic ---
  const cluster = hw("cluster-3node");
  const chatStreams = maxUsefulStreams(k3, "q4", 8192, cluster, 15);
  const chatUsers = usersServed(chatStreams, "chat");
  check("3-node chat streams 20-35", chatStreams >= 20 && chatStreams <= 35, String(chatStreams));
  check("3-node chat users 150-300", chatUsers >= 150 && chatUsers <= 300, String(chatUsers));
  const agStreams = maxUsefulStreams(k3, "q4", 32768, cluster, 30);
  const agUsers = usersServed(agStreams, "agentic");
  check("3-node agentic users 30-50", agUsers >= 30 && agUsers <= 50, String(agUsers));

  // --- Anchor: RTX 4090 runs 8B Q4 fast, cannot fit 70B Q4 ---
  const m8b = model("llama31-8b");
  const m70b = model("llama33-70b");
  const g4090 = hw("rtx4090");
  const t8b = singleStreamTokS(m8b, "q4", g4090);
  check("4090 8B Q4 = 90-160 tok/s", t8b >= 90 && t8b <= 160, t8b.toFixed(0));
  check("4090 does NOT fit 70B Q4", !capacity(m70b, "q4", 8192, g4090, 1).fits,
    `weights ${weightsGB(m70b, "q4").toFixed(0)} GB > 22 GB usable`);

  // --- K3 footprint override honored ---
  check("K3 Q4 weights ~560 GB (override)", weightsGB(k3, "q4") === 560);
  check("K3 FP16 weights 1.7 TB (override)", weightsGB(k3, "fp16") === 1700);

  // --- Wizard: 20 chat users, no sovereignty, <=15k, good quality -> mid model in budget ---
  const rec1 = recommend({ users: 20, useCase: "chat", sovereignty: "none", budgetId: "b2", quality: "good" });
  check("Wizard b2/good -> has primary", !!rec1.primary && !rec1.budgetMiss,
    rec1.primary ? `${rec1.primary.model.name} on ${rec1.primary.hw.name}` : "none");
  check("Wizard b2/good -> mid tier", rec1.primary?.model.tier === "mid", rec1.primary?.model.tier);
  check("Wizard b2/good -> price <= 15k", rec1.primary?.hw.priceEUR[0] <= 15000, String(rec1.primary?.hw.priceEUR[0]));
  check("Wizard no-sovereignty -> API caveat", rec1.caveats.includes("caveat.apiCheaper"));

  // --- Wizard: K3 never recommended without hard sovereignty + premium budget ---
  const rec2 = recommend({ users: 100, useCase: "chat", sovereignty: "preferred", budgetId: "b5", quality: "best" });
  const rec2Models = [rec2.primary, rec2.alternative, rec2.premium].filter(Boolean).map((p) => p.model.tier);
  check("No frontier without hard sovereignty", !rec2Models.includes("frontier-moe"), rec2Models.join(","));

  // --- Wizard: K3 eligible with hard sovereignty + b5 + best ---
  const rec3 = recommend({ users: 100, useCase: "chat", sovereignty: "hard", budgetId: "b5", quality: "best" });
  const rec3All = [rec3.primary, rec3.alternative, rec3.premium].filter(Boolean);
  check("Frontier reachable with hard+b5+best", rec3All.some((p) => p.model.tier === "frontier-moe"),
    rec3All.map((p) => `${p.model.name}@${p.hw.name}`).join(" | "));

  // --- Mixed workload: 40 users at 50% chat / 50% agents ---
  // streams = 40*(0.5/8 + 0.5/1) = 22.5 -> 23; agents dominate the floor (30 tok/s)
  const rec4 = recommend({
    users: 40, mix: { chat: 50, rag: 0, coding: 0, agentic: 50 },
    sovereignty: "preferred", budgetId: "b5", quality: "good",
  });
  check("Mixed 50/50 chat+agents -> 23 streams", rec4.needStreams === 23, String(rec4.needStreams));
  check("Mixed dominant use case resolves", ["chat", "agentic"].includes(rec4.useCase), rec4.useCase);

  // --- Sovereignty slider: legacy strings map onto the 0-100 scale ---
  check("Sovereignty 'hard' -> 100", normalizeSovereignty("hard") === 100);
  check("Sovereignty 'none' -> 0", normalizeSovereignty("none") === 0);
  check("Sovereignty 73 stays 73", normalizeSovereignty(73) === 73);

  // --- Cloud comparison: pure chat, 15 seats ---
  const chatTok = monthlyTokensPerSeat({ chat: 1 }, "normal");
  check("Chat tokens/seat/mo = 12k x 21", chatTok.inTok + chatTok.outTok === 252000,
    String(chatTok.inTok + chatTok.outTok));
  const cmp1 = cloudComparison({ seats: 15, mix: { chat: 1 } });
  const team = cmp1.options.find((o) => o.id === "chatgpt-team");
  check("ChatGPT Team 3yr = seats x price x 36", team.year3 === 15 * 29 * 36, String(team.year3));
  const gptApi = cmp1.options.find((o) => o.id === "api-gpt");
  check("Light chat: API cheaper than seats", gptApi.monthly < team.monthly,
    `api ${Math.round(gptApi.monthly)} vs team ${Math.round(team.monthly)}`);

  // --- Agent-heavy mix: subscriptions flagged, API cost explodes ---
  const cmpAg = cloudComparison({ seats: 15, mix: { agentic: 1 } });
  check("Agent mix flags subscriptions", cmpAg.options.some((o) => o.flags.includes("agentsApi")));
  const agApi = cmpAg.options.find((o) => o.id === "api-claude");
  const chatApi = cmp1.options.find((o) => o.id === "api-claude");
  check("Agent API cost >> chat API cost", agApi.monthly > chatApi.monthly * 20,
    `${Math.round(agApi.monthly)} vs ${Math.round(chatApi.monthly)}`);

  // --- Sovereignty >= 80 marks every cloud option ---
  const cmpSov = cloudComparison({ seats: 10, mix: { chat: 1 }, sovereigntyPct: 90 });
  check("Sov 90: all cloud options flagged noSov",
    cmpSov.options.filter((o) => o.kind !== "selfhost").every((o) => o.flags.includes("noSov")));

  // --- Hybrid: 40 users at 50% -> hardware for 20, split sums, cost adds up ---
  const hy = hybridPlan({
    users: 40, mix: { chat: 60, rag: 30, coding: 10, agentic: 0 },
    sovereigntyPct: 50, budgetId: "b3", quality: "good",
  });
  check("Hybrid local users = ceil(40*0.5)", hy.localUsers === 20, String(hy.localUsers));
  check("Hybrid split sums to 100", hy.split.localPct + hy.split.cloudPct === 100);
  check("Hybrid monthly = local + cloud",
    Math.abs(hy.monthly - (hy.local.monthly + hy.cloud.monthly)) < 0.01);
  check("Hybrid absent at 100%",
    hybridPlan({ users: 40, mix: { chat: 1 }, sovereigntyPct: 100, budgetId: "b3", quality: "good" }) === null);

  // --- Industry preset: law firm = RAG-dominant + high sovereignty ---
  const kanzlei = INDUSTRIES.find((p) => p.id === "kanzlei");
  check("Kanzlei preset sovereignty >= 80", kanzlei.sovereigntyPct >= 80);
  check("Kanzlei preset RAG-dominant",
    Object.entries(kanzlei.mix).sort((a, b) => b[1] - a[1])[0][0] === "rag");

  // --- Power by country ---
  const server4x = hw("server-4x-pro6000");
  const kwhMo = powerKWhPerMonth(server4x);
  check("4x server ~730 kWh/month at 40% util", kwhMo > 700 && kwhMo < 760, kwhMo.toFixed(0));
  const de = COUNTRIES.find((c) => c.id === "de");
  const us = COUNTRIES.find((c) => c.id === "us");
  const shDe = selfHostMonthly(server4x, de.kwhEUR);
  const shUs = selfHostMonthly(server4x, us.kwhEUR);
  check("Energy cost scales with country rate",
    Math.abs(shDe.energy / shUs.energy - de.kwhEUR / us.kwhEUR) < 0.01,
    `de ${shDe.energy.toFixed(0)} vs us ${shUs.energy.toFixed(0)}`);

  // --- Financing model: upfront by default, hardware in monthly only when financed ---
  const avgPrice = (server4x.priceEUR[0] + server4x.priceEUR[1]) / 2;
  check("Default: monthly = energy only", shDe.monthly === shDe.energy && shDe.hardware === 0,
    `monthly ${shDe.monthly.toFixed(0)}`);
  check("Default: upfront = full price", shDe.upfront === avgPrice, String(shDe.upfront));
  const fin3 = selfHostMonthly(server4x, de.kwhEUR, 36);
  check("Financed 3yrs: monthly includes hardware/36",
    Math.abs(fin3.monthly - (avgPrice / 36 + shDe.energy)) < 0.01 && fin3.upfront === 0,
    fin3.monthly.toFixed(0));

  // Horizon totals: upfront stays OUT of year figures (shown separately);
  // financing installments are IN.
  const hzUp = selfHostHorizons(server4x, de.kwhEUR, 0);
  check("Upfront: year3 = running costs only",
    Math.abs(hzUp.year3 - 36 * hzUp.energy) < 0.01 && hzUp.upfront === avgPrice,
    hzUp.year3.toFixed(0));
  const hzFin1 = selfHostHorizons(server4x, de.kwhEUR, 12);
  check("1yr financing: year1 includes full price",
    Math.abs(hzFin1.year1 - (avgPrice + 12 * hzFin1.energy)) < 0.01,
    hzFin1.year1.toFixed(0));
  check("1yr financing: year3 adds no further hardware",
    Math.abs(hzFin1.year3 - (avgPrice + 36 * hzFin1.energy)) < 0.01,
    hzFin1.year3.toFixed(0));

  // --- 10% margin baked into hardware prices (base 3200 / 60000) ---
  check("Margin: RTX 4090 system = 3520", hw("rtx4090").priceEUR[0] === 3520, String(hw("rtx4090").priceEUR[0]));
  check("Margin: 4x server = 66000", server4x.priceEUR[0] === 66000, String(server4x.priceEUR[0]));

  // --- Full-system sanity: complete system must cost more than its GPUs alone ---
  // RTX PRO 6000 street price ~11.5k EUR/card (07/2026, memory shortage).
  check("2x PRO 6000 system > 2 bare cards", hw("dual-rtxpro6000").priceEUR[0] > 2 * 11500,
    String(hw("dual-rtxpro6000").priceEUR[0]));
  check("1x PRO 6000 system > 1 bare card", hw("rtxpro6000").priceEUR[0] > 11500,
    String(hw("rtxpro6000").priceEUR[0]));

  // --- Redundancy energy: cold spare off, hot spare doubles ---
  check("Cold spare: no extra energy", redundancyEnergyFactor("standby") === 0);
  check("Hot spare: doubles energy", redundancyEnergyFactor("full") === 1);

  // --- Enterprise H200 node ---
  const h200 = hw("node-8x-h200");
  check("H200 node margined price = 363000", h200.priceEUR[0] === 363000, String(h200.priceEUR[0]));
  const h200cap = capacity(k3, "q4", 8192, h200, 1);
  check("H200 node fits K3 Q4", h200cap.fits, `footprint ${h200cap.footprint.toFixed(0)} GB`);
  const h200TokS = singleStreamTokS(k3, "q4", h200);
  const proNodeTokS = singleStreamTokS(k3, "q4", hw("node-8x-pro6000"));
  check("H200 node faster than 8x PRO 6000 (NVLink, no PCIe penalty)",
    h200TokS > proNodeTokS, `${h200TokS.toFixed(1)} vs ${proNodeTokS.toFixed(1)}`);

  // --- Mix slider auto-balance: equal spread, clamping, un-stuck zeros ---
  const sum = (a) => a.reduce((s, n) => s + n, 0);
  const eq = rebalanceMix([49, 14, 37, 0], 3, 12);
  check("Rebalance: equal spread moves every slider", eq.join() === "45,10,33,12", eq.join());
  const cl = rebalanceMix([80, 10, 10, 0], 0, 95);
  check("Rebalance: clamps at 0, sums to 100", sum(cl) === 100 && cl[0] === 95 && cl[3] === 0, cl.join());
  const un = rebalanceMix([100, 0, 0, 0], 0, 40);
  check("Rebalance: zero sliders come back up", un.join() === "40,20,20,20", un.join());

  const failed = results.filter((r) => !r.pass);
  console.log(`\nSelf-test: ${results.length - failed.length}/${results.length} passed`);
  return failed.length === 0;
}

// Allow `node js/selftest.js`
if (typeof document === "undefined") {
  const ok = run();
  if (typeof process !== "undefined") process.exit(ok ? 0 : 1);
}
