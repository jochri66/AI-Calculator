// Console sanity suite — calibration anchors from real-world estimates.
// Browser: open ?test=1. Node: `node js/selftest.js` (module check at bottom).

import { MODELS, HARDWARE, INDUSTRIES, CLOUD_PLANS, COUNTRIES } from "./data.js";
import {
  weightsGB, capacity, singleStreamTokS, maxUsefulStreams,
  usersServed, recommend, normalizeSovereignty, monthlyTokensPerSeat,
  cloudComparison, hybridPlan, selfHostMonthly, selfHostHorizons, powerKWhPerMonth,
  redundancyEnergyFactor, rebalanceMix, cloudVerdict,
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

  // --- AMD MI350P (144 GB HBM3E PCIe, 05/2026) ---
  const mi1 = hw("server-1x-mi350p");
  const mi4 = hw("server-4x-mi350p");
  check("MI350P 1x margined price = 33000", mi1.priceEUR[0] === 33000, String(mi1.priceEUR[0]));
  check("MI350P 4x margined price = 132000", mi4.priceEUR[0] === 132000, String(mi4.priceEUR[0]));
  const llama70 = model("llama33-70b");
  const mi1cap = capacity(llama70, "q8", 8192, mi1, 1);
  check("1x MI350P fits Llama 70B Q8", mi1cap.fits, `footprint ${mi1cap.footprint.toFixed(0)} GB`);
  check("1x MI350P outruns 1x PRO 6000 per stream",
    singleStreamTokS(llama70, "q4", mi1) > singleStreamTokS(llama70, "q4", hw("rtxpro6000")),
    `${singleStreamTokS(llama70, "q4", mi1).toFixed(0)} vs ${singleStreamTokS(llama70, "q4", hw("rtxpro6000")).toFixed(0)}`);
  // 576 GB * 0.92 usable = ~530 GB — honestly NOT enough for K3 Q4 (560 GB
  // weights), but plenty for DeepSeek-V3.x Q4 (~376 GB).
  check("4x MI350P does NOT fit K3 Q4", !capacity(k3, "q4", 8192, mi4, 1).fits);
  check("4x MI350P fits DeepSeek-V3 Q4", capacity(model("deepseek-v3"), "q4", 8192, mi4, 1).fits);

  // --- Budget miss must not duplicate the primary as "premium" ---
  const recMiss = recommend({
    users: 60, mix: { chat: 40, rag: 30, coding: 20, agentic: 10 },
    sovereignty: "hard", budgetId: "b2", quality: "good",
  });
  check("Budget miss: flagged", recMiss.budgetMiss === true);
  check("Budget miss: premium is not a duplicate of primary",
    !recMiss.premium ||
      recMiss.premium.hw.id !== recMiss.primary.hw.id ||
      recMiss.premium.model.id !== recMiss.primary.model.id,
    recMiss.premium ? `${recMiss.premium.model.id}+${recMiss.premium.hw.id}` : "null");

  // --- H200 as a winnable recommendation ---
  // 250 pure-chat users need 32 streams: the H200 node covers that and is
  // cheaper than the 3-node cluster, so it wins as a regular primary.
  const recChat250 = recommend({ users: 250, useCase: "chat", sovereignty: "hard", budgetId: "b5", quality: "best" });
  check("250 chat users: no capacity shortfall", !recChat250.capacityShort,
    recChat250.primary?.hw.id);
  check("250 chat users: primary = H200 node", recChat250.primary?.hw.id === "node-8x-h200",
    recChat250.primary?.hw.id);

  // Agentic-heavy 250 users blow past every system: shortfall shows the two
  // strongest options on different hardware (H200 node + redundant cluster).
  const recMix250 = recommend({
    users: 250, mix: { chat: 40, rag: 10, coding: 30, agentic: 20 },
    sovereignty: "hard", budgetId: "b5", quality: "best",
  });
  check("250 mixed users: capacity shortfall", recMix250.capacityShort === true);
  const shortIds = [recMix250.primary?.hw.id, recMix250.alternative?.hw.id];
  check("Shortfall shows two different systems",
    !!recMix250.alternative && shortIds[0] !== shortIds[1], shortIds.join(" + "));
  check("Shortfall includes H200 node and 3-node cluster",
    shortIds.includes("node-8x-h200") && shortIds.includes("cluster-3node"),
    shortIds.join(" + "));

  // --- Cloud-vs-hardware verdict: subs and API judged separately ---
  // User-reported case: hardware beats every sub in ~8 months, only the API
  // is cheaper -> must NOT claim "cloud is cheaper" wholesale.
  const v1 = cloudVerdict({ priceAvg: 6325, energyMonthly: 66, subMonthly: 945, apiMonthly: 131 });
  check("Verdict: beats subs only", v1.kind === "beatsSubs" && v1.months === 8, `${v1.kind} ${v1.months}`);
  const v2 = cloudVerdict({ priceAvg: 6325, energyMonthly: 66, subMonthly: 945, apiMonthly: 500 });
  check("Verdict: beats all within 36mo", v2.kind === "beatsAll" && v2.months <= 36, `${v2.kind} ${v2.months}`);
  const v3 = cloudVerdict({ priceAvg: 6325, energyMonthly: 66, subMonthly: 70, apiMonthly: 60 });
  check("Verdict: cloud wins when all cheap", v3.kind === "cloudWins");
  const v4 = cloudVerdict({ priceAvg: 6000, energyMonthly: 200, subMonthly: 150, apiMonthly: 100 });
  check("Verdict: sub below energy -> cloud wins (no blowup)", v4.kind === "cloudWins");
  const v5 = cloudVerdict({ priceAvg: 72000, energyMonthly: 219, subMonthly: 630, apiMonthly: 942, agentsHeavy: true });
  check("Verdict: agentsHeavy ignores capped subs", v5.kind !== "beatsSubs", v5.kind);

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
