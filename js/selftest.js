// Console sanity suite — calibration anchors from real-world estimates.
// Browser: open ?test=1. Node: `node js/selftest.js` (module check at bottom).

import { MODELS, HARDWARE } from "./data.js";
import {
  weightsGB, capacity, singleStreamTokS, maxUsefulStreams,
  usersServed, recommend,
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

  const failed = results.filter((r) => !r.pass);
  console.log(`\nSelf-test: ${results.length - failed.length}/${results.length} passed`);
  return failed.length === 0;
}

// Allow `node js/selftest.js`
if (typeof document === "undefined") {
  const ok = run();
  if (typeof process !== "undefined") process.exit(ok ? 0 : 1);
}
