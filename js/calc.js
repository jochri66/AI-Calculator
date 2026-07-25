// Pure calculation core — no DOM access. Unit-testable from the console.
//
// The model: four bottlenecks that alternate.
//  1. Capacity  (VRAM/RAM)  — binary: the model fits or it doesn't.
//  2. Bandwidth             — governs single-stream speed: bytes read per token / (GB/s).
//  3. Compute               — only matters with batching (10-20x throughput on GPUs).
//  4. Interconnect          — penalty at multi-GPU scale, worst for MoE expert routing.

import {
  QUANTS, USE_CASES, BUDGET_RANGES, MODELS, HARDWARE, TIER_RANK,
  CLOUD_PLANS, API_RATES, TOKEN_PROFILES, INTENSITY, WORKDAYS_PER_MONTH,
  KWH_EUR, UTILIZATION, AMORT_MONTHS, SEATS_PER_CONCURRENT,
} from "./data.js";

const MEM_HEADROOM = 0.92; // leave 8% for runtime/allocator

export function weightsGB(model, quant) {
  if (model.weightsGBOverride && model.weightsGBOverride[quant] != null) {
    return model.weightsGBOverride[quant];
  }
  return (model.totalParams * QUANTS[quant].bytesPerParam) / 1e9;
}

export function kvGBPerStream(model, ctx) {
  return (model.kvBytesPerTokenFP16 * ctx) / 1e9;
}

export function overheadGB(model, quant) {
  return Math.max(2, 0.05 * weightsGB(model, quant));
}

export function footprintGB(model, quant, ctx, streams) {
  return (
    weightsGB(model, quant) +
    streams * kvGBPerStream(model, ctx) +
    overheadGB(model, quant)
  );
}

export function usableMemGB(hw) {
  return hw.memGB * MEM_HEADROOM;
}

// Bytes read from memory per generated token (MoE only reads active experts).
export function activeGBPerToken(model, quant) {
  return (model.activeParams * QUANTS[quant].bytesPerParam) / 1e9;
}

export function interconnectInfo(hw, model) {
  if (hw.interconnect === "tb-cluster") {
    return { penalty: 0.5, flags: ["caveat.clusterFinicky"] };
  }
  if (model.moe && hw.interconnect === "pcie") {
    return { penalty: 0.6, flags: ["caveat.moePcie"] };
  }
  return { penalty: 1.0, flags: [] };
}

export function singleStreamTokS(model, quant, hw) {
  const ic = interconnectInfo(hw, model);
  return (
    (hw.bandwidthGBs * hw.bandwidthEfficiency * ic.penalty) /
    activeGBPerToken(model, quant)
  );
}

// Full capacity picture for a (model, quant, ctx, hw) combo at a requested stream count.
export function capacity(model, quant, ctx, hw, requestedStreams) {
  const inst = hw.instances || 1;
  const single = singleStreamTokS(model, quant, hw);
  const wGB = weightsGB(model, quant);
  const oGB = overheadGB(model, quant);
  const kvPer = kvGBPerStream(model, ctx);

  const flags = new Set();
  interconnectInfo(hw, model).flags.forEach((f) => flags.add(f));
  if (model.benchmarkStatus === "pending") flags.add("caveat.benchmarkPending");

  const perInstanceFree = usableMemGB(hw) - wGB - oGB;
  const fitsAtAll = perInstanceFree >= 0;

  if (!fitsAtAll) {
    return {
      fits: false, single, streams: 0, maxStreams: 0, perStream: 0,
      aggregate: 0, footprint: footprintGB(model, quant, ctx, 1),
      usable: usableMemGB(hw) * inst, flags: [...flags],
    };
  }

  const memStreams = Math.floor(perInstanceFree / kvPer);
  const perInstanceMax = Math.max(0, Math.min(memStreams, hw.maxStreams));
  const totalMax = perInstanceMax * inst;

  const streams = Math.min(requestedStreams, totalMax);
  const perInstanceUsed = Math.ceil(streams / inst) || 0;
  // Batching keeps per-stream speed near single-stream until the boost ceiling,
  // then aggregate throughput plateaus and per-stream speed degrades.
  const perStream =
    perInstanceUsed <= hw.maxBatchBoost
      ? single
      : (single * hw.maxBatchBoost) / perInstanceUsed;
  const aggregate = perStream * streams;

  if (hw.category === "cpu-server" && single < 10) flags.add("caveat.cpuSlow");

  return {
    fits: streams > 0 || requestedStreams === 0,
    single,
    streams,
    maxStreams: totalMax,
    perStream,
    aggregate,
    footprint: wGB + oGB + streams * kvPer,
    usable: usableMemGB(hw) * inst,
    flags: [...flags],
  };
}

// Largest stream count that still meets a per-stream speed floor.
export function maxUsefulStreams(model, quant, ctx, hw, minTokS) {
  const inst = hw.instances || 1;
  const single = singleStreamTokS(model, quant, hw);
  if (single < minTokS) return 0;
  const wGB = weightsGB(model, quant);
  const oGB = overheadGB(model, quant);
  const perInstanceFree = usableMemGB(hw) - wGB - oGB;
  if (perInstanceFree < 0) return 0;
  const memStreams = Math.floor(perInstanceFree / kvGBPerStream(model, ctx));
  const speedStreams = Math.floor((hw.maxBatchBoost * single) / minTokS);
  return Math.max(0, Math.min(memStreams, hw.maxStreams, speedStreams)) * inst;
}

export function streamsNeeded(users, useCase) {
  return Math.max(1, Math.ceil(users / USE_CASES[useCase].usersPerStream));
}

export function usersServed(streams, useCase) {
  return streams * USE_CASES[useCase].usersPerStream;
}

// ---- mixed workloads (use-case sliders) ----

export function normalizeMix(mix) {
  const keys = Object.keys(USE_CASES);
  let total = keys.reduce((s, k) => s + (Number(mix?.[k]) || 0), 0);
  if (total <= 0) return { chat: 1, rag: 0, coding: 0, agentic: 0 };
  const out = {};
  keys.forEach((k) => (out[k] = (Number(mix?.[k]) || 0) / total));
  return out;
}

// Blend a normalized mix into effective planning parameters:
// - effUsersPerStream: harmonic blend (each share consumes streams at its own rate)
// - minTokS: strictest floor among meaningfully-used cases (>5% share)
// - ctx: largest default context among meaningfully-used cases (conservative KV sizing)
// - dominant: highest-share use case (drives model fit + labels)
export function blendUseCases(mix) {
  const active = Object.entries(mix).filter(([, share]) => share > 0.05);
  const inverseSum = Object.entries(mix).reduce(
    (s, [k, share]) => s + share / USE_CASES[k].usersPerStream, 0
  );
  return {
    mix,
    effUsersPerStream: 1 / inverseSum,
    minTokS: Math.max(...active.map(([k]) => USE_CASES[k].minTokS)),
    ctx: Math.max(...active.map(([k]) => USE_CASES[k].defaultCtx)),
    dominant: Object.entries(mix).sort((a, b) => b[1] - a[1])[0][0],
  };
}

// Sovereignty is a 0-100 slider ("share of AI usage that must run on own
// hardware"). Legacy string values map onto the scale.
export function normalizeSovereignty(v) {
  if (typeof v === "number" && Number.isFinite(v)) {
    return Math.min(100, Math.max(0, Math.round(v)));
  }
  return { hard: 100, preferred: 50, none: 0 }[v] ?? 50;
}

function tiersForQuality(quality, budgetIdx) {
  if (quality === "basic") return ["small", "mid"];
  if (quality === "good") return budgetIdx >= 2 ? ["mid", "large-moe"] : ["mid"];
  return ["mid", "large-moe"]; // "best"; frontier added separately when eligible
}

function buildOption(pair, blend) {
  const maxStreams = maxUsefulStreams(pair.model, pair.quant, blend.ctx, pair.hw, blend.minTokS);
  return {
    ...pair,
    maxUsefulStreams: maxStreams,
    maxUsers: Math.floor(maxStreams * blend.effUsersPerStream),
  };
}

// Wizard recommendation.
// answers: { users, mix: {chat,rag,coding,agentic}, sovereignty: "hard"|"preferred"|"none",
//            budgetId: "b1".."b5", quality: "basic"|"good"|"best" }
// (answers.useCase is accepted as shorthand for a 100% single-use-case mix.)
export function recommend(answers) {
  const mix = normalizeMix(answers.mix || (answers.useCase ? { [answers.useCase]: 1 } : null));
  const blend = blendUseCases(mix);
  const ctx = blend.ctx;
  const needStreams = Math.max(1, Math.ceil(answers.users / blend.effUsersPerStream));
  const budgetIdx = BUDGET_RANGES.findIndex((b) => b.id === answers.budgetId);
  const budgetMax = BUDGET_RANGES[budgetIdx].max;

  const sovPct = normalizeSovereignty(answers.sovereigntyPct ?? answers.sovereignty);
  const frontierOK =
    answers.quality === "best" &&
    sovPct >= 80 &&
    budgetIdx >= 3;

  const tiers = tiersForQuality(answers.quality, budgetIdx);
  if (frontierOK) tiers.push("frontier-moe");

  const models = MODELS.filter(
    (m) => tiers.includes(m.tier) && m.useCaseFit[blend.dominant] >= 2
  );
  const quants = answers.quality === "best" ? ["q8", "q4"] : ["q4"];

  const pairs = [];
  for (const model of models) {
    for (const quant of quants) {
      if (!model.quants.includes(quant)) continue;
      for (const hw of HARDWARE) {
        const cap = capacity(model, quant, ctx, hw, needStreams);
        if (!cap.fits) continue;
        if (cap.perStream < blend.minTokS) continue;
        if (cap.streams < needStreams) continue;
        pairs.push({
          model, quant, hw, cap,
          price: hw.priceEUR[0],
          inBudget: hw.priceEUR[0] <= budgetMax,
        });
      }
    }
  }

  const byPrice = (a, b) => a.price - b.price;
  const inBudget = pairs.filter((p) => p.inBudget).sort(byPrice);
  const all = [...pairs].sort(byPrice);

  // Primary: cheapest in-budget pair at the highest tier that has one
  // (preferring q8 over q4 at equal hardware when quality === "best").
  let primary = null;
  if (inBudget.length) {
    const bestTier = Math.max(...inBudget.map((p) => TIER_RANK[p.model.tier]));
    const atTier = inBudget.filter((p) => TIER_RANK[p.model.tier] === bestTier);
    atTier.sort((a, b) => byPrice(a, b) || (a.quant === "q8" ? -1 : 1));
    primary = atTier[0];
  }

  // Budget alternative: cheapest viable pair overall, if meaningfully different.
  let alternative = null;
  const cheapest = all[0] || null;
  if (cheapest && primary && cheapest.hw.id !== primary.hw.id && cheapest.price < primary.price) {
    alternative = cheapest;
  }

  // Premium: cheapest viable pair at a tier above the primary's (frontier lands here).
  let premium = null;
  const refTier = primary ? TIER_RANK[primary.model.tier] : -1;
  const higher = all.filter((p) => TIER_RANK[p.model.tier] > refTier);
  if (higher.length) {
    const nextTier = Math.min(...higher.map((p) => TIER_RANK[p.model.tier]));
    premium = higher.filter((p) => TIER_RANK[p.model.tier] === nextTier).sort(byPrice)[0];
    if (primary && premium.hw.id === primary.hw.id && premium.model.id === primary.model.id) {
      premium = null;
    }
  }

  // Honest miss: nothing in budget -> show cheapest viable anyway, clearly marked.
  const budgetMiss = !primary && all.length > 0;
  if (budgetMiss) primary = all[0];

  // Nothing viable at all (e.g. impossible stream count): show the option that
  // serves the most users, flagged as a capacity shortfall.
  let capacityShort = false;
  if (!primary) {
    capacityShort = true;
    let best = null;
    // Most users served; ties broken by cheaper hardware, then higher model tier.
    const better = (a, b) =>
      a.maxUsers - b.maxUsers ||
      b.price - a.price ||
      TIER_RANK[a.model.tier] - TIER_RANK[b.model.tier];
    for (const model of models) {
      for (const hw of HARDWARE) {
        const opt = buildOption({ model, quant: "q4", hw, cap: null, price: hw.priceEUR[0], inBudget: hw.priceEUR[0] <= budgetMax }, blend);
        if (opt.maxUsefulStreams > 0 && (!best || better(opt, best) > 0)) best = opt;
      }
    }
    if (best) {
      best.cap = capacity(best.model, best.quant, ctx, best.hw, best.maxUsefulStreams);
      primary = best;
    }
  }

  // Assemble caveats.
  const caveats = new Set();
  if (sovPct <= 20) caveats.add("caveat.apiCheaper");
  const shown = [primary, alternative, premium].filter(Boolean);
  for (const p of shown) {
    (p.cap?.flags || []).forEach((f) => caveats.add(f));
    (p.model.noteKeys || []).forEach((f) => caveats.add(f));
    (p.hw.noteKeys || []).forEach((f) => caveats.add(f));
  }
  if (shown.some((p) => p.hw.priceEUR[0] > 150000)) caveats.add("caveat.midsizeCompare");
  if (budgetMiss) caveats.add("caveat.budgetMiss");
  if (capacityShort) caveats.add("caveat.capacityShort");

  const decorate = (p) => (p ? buildOption(p, blend) : null);

  return {
    needStreams,
    ctx,
    useCase: blend.dominant,
    mix,
    sovereigntyPct: sovPct,
    users: answers.users,
    budgetMiss,
    capacityShort,
    primary: primary ? (primary.maxUsers != null ? primary : decorate(primary)) : null,
    alternative: decorate(alternative),
    premium: decorate(premium),
    caveats: [...caveats],
  };
}

// ---- cloud comparison (OpenAI / Anthropic / Google vs self-hosting) ----

// Tokens per seat per month for a normalized mix at a given intensity.
export function monthlyTokensPerSeat(mix, intensity = "normal") {
  const m = normalizeMix(mix);
  const factor = INTENSITY[intensity] ?? 1;
  let inTok = 0;
  let outTok = 0;
  for (const [k, share] of Object.entries(m)) {
    inTok += share * TOKEN_PROFILES[k].inTok;
    outTok += share * TOKEN_PROFILES[k].outTok;
  }
  return {
    inTok: inTok * WORKDAYS_PER_MONTH * factor,
    outTok: outTok * WORKDAYS_PER_MONTH * factor,
  };
}

// Self-host running cost: hardware amortized over AMORT_MONTHS + electricity.
export function selfHostMonthly(hw) {
  const price = (hw.priceEUR[0] + hw.priceEUR[1]) / 2;
  const energy = ((hw.powerW * UTILIZATION * 24 * 365) / 12 / 1000) * KWH_EUR;
  return {
    hardware: price / AMORT_MONTHS,
    energy,
    monthly: price / AMORT_MONTHS + energy,
  };
}

function horizons(monthly) {
  return { monthly, year1: monthly * 12, year3: monthly * 36 };
}

// Full comparison: subscriptions + APIs (+ optional self-host row).
// sovereigntyPct >= 80 marks every cloud option as violating the requirement.
export function cloudComparison({ seats, mix, intensity = "normal", hw = null, sovereigntyPct = 0 }) {
  const m = normalizeMix(mix);
  const tokens = monthlyTokensPerSeat(m, intensity);
  const noSov = normalizeSovereignty(sovereigntyPct) >= 80;
  const agentsHeavy = m.agentic > 0.25;
  const options = [];

  if (hw) {
    const sh = selfHostMonthly(hw);
    options.push({
      id: "selfhost", kind: "selfhost", provider: "", name: hw.name,
      ...horizons(sh.monthly), flags: [],
    });
  }
  for (const plan of CLOUD_PLANS) {
    const flags = [...plan.flags];
    if (agentsHeavy) flags.push("agentsApi");
    if (noSov) flags.push("noSov");
    options.push({
      id: plan.id, kind: plan.kind, provider: plan.provider, name: plan.name,
      ...horizons(seats * plan.priceEURMonth), flags,
    });
  }
  for (const api of API_RATES) {
    const monthly =
      seats *
      ((tokens.inTok / 1e6) * api.inEURPerMTok + (tokens.outTok / 1e6) * api.outEURPerMTok);
    options.push({
      id: api.id, kind: "api", provider: api.provider, name: api.name,
      ...horizons(monthly), flags: noSov ? ["noSov"] : [],
    });
  }
  return { tokens, options, agentsHeavy, noSov };
}

export function seatsFromConcurrent(users) {
  return Math.max(1, Math.ceil(users * SEATS_PER_CONCURRENT));
}

// Hybrid plan for 0 < sovereigntyPct < 100: size hardware for the local share
// of the workload, price the remaining share via the cheapest suitable cloud
// option, and report the cost split.
export function hybridPlan(answers) {
  const sovPct = normalizeSovereignty(answers.sovereigntyPct ?? answers.sovereignty);
  if (sovPct <= 0 || sovPct >= 100) return null;

  const localUsers = Math.max(1, Math.ceil((answers.users * sovPct) / 100));
  const cloudUsers = Math.max(0, answers.users - localUsers);
  if (cloudUsers === 0) return null;

  const rec = recommend({ ...answers, users: localUsers, sovereigntyPct: 100 });
  if (!rec.primary) return null;

  const cloudSeats = seatsFromConcurrent(cloudUsers);
  const cmp = cloudComparison({ seats: cloudSeats, mix: answers.mix, sovereigntyPct: 0 });
  // Agent-heavy mixes need the API; otherwise pick the cheapest seat/API option.
  const candidates = cmp.options.filter((o) =>
    cmp.agentsHeavy ? o.kind === "api" : o.kind === "seat" || o.kind === "api"
  );
  const cloud = candidates.sort((a, b) => a.monthly - b.monthly)[0];

  const local = selfHostMonthly(rec.primary.hw);
  const monthly = local.monthly + cloud.monthly;
  return {
    sovereigntyPct: sovPct,
    localUsers, cloudUsers, cloudSeats,
    rec, hw: rec.primary.hw,
    local, cloud,
    ...horizons(monthly),
    split: {
      localPct: Math.round((local.monthly / monthly) * 100),
      cloudPct: 100 - Math.round((local.monthly / monthly) * 100),
    },
  };
}
