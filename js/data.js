// Model & hardware catalog + planning constants.
// All numbers are practical estimates for planning purposes, not benchmarks.
// Prices are street-price ranges in EUR (net) as of mid-2026.

export const QUANTS = {
  q4:   { bytesPerParam: 0.56, labelKey: "quant.q4" },   // ~4.5 bits/weight (GGUF/AWQ class)
  q8:   { bytesPerParam: 1.07, labelKey: "quant.q8" },
  fp16: { bytesPerParam: 2.0,  labelKey: "quant.fp16" },
};

// usersPerStream: how many human users one concurrent inference stream serves.
// Chat users are idle most of the time (~1:8); agents hold their stream continuously (1:1).
export const USE_CASES = {
  chat:    { usersPerStream: 8, minTokS: 15, defaultCtx: 8192,  labelKey: "usecase.chat" },
  rag:     { usersPerStream: 6, minTokS: 15, defaultCtx: 16384, labelKey: "usecase.rag" },
  coding:  { usersPerStream: 4, minTokS: 25, defaultCtx: 32768, labelKey: "usecase.coding" },
  agentic: { usersPerStream: 1, minTokS: 30, defaultCtx: 32768, labelKey: "usecase.agentic" },
};

export const BUDGET_RANGES = [
  { id: "b1", max: 5000,     labelKey: "budget.b1" },
  { id: "b2", max: 15000,    labelKey: "budget.b2" },
  { id: "b3", max: 60000,    labelKey: "budget.b3" },
  { id: "b4", max: 150000,   labelKey: "budget.b4" },
  { id: "b5", max: Infinity, labelKey: "budget.b5" },
];

export const TIER_RANK = { "small": 0, "mid": 1, "large-moe": 2, "frontier-moe": 3 };

// kvBytesPerTokenFP16: KV-cache bytes per token per stream (GQA/MLA-aware approximation).
export const MODELS = [
  {
    id: "llama31-8b", name: "Llama 3.1 8B", tier: "small",
    totalParams: 8e9, activeParams: 8e9, moe: false,
    kvBytesPerTokenFP16: 131e3, maxContext: 131072,
    quants: ["q4", "q8", "fp16"], weightsGBOverride: null,
    useCaseFit: { chat: 3, rag: 2, coding: 1, agentic: 1 },
    benchmarkStatus: "released", noteKeys: [],
  },
  {
    id: "qwen3-8b", name: "Qwen3 8B", tier: "small",
    totalParams: 8.2e9, activeParams: 8.2e9, moe: false,
    kvBytesPerTokenFP16: 147e3, maxContext: 131072,
    quants: ["q4", "q8", "fp16"], weightsGBOverride: null,
    useCaseFit: { chat: 3, rag: 2, coding: 2, agentic: 1 },
    benchmarkStatus: "released", noteKeys: [],
  },
  {
    id: "mistral-small-24b", name: "Mistral Small 3.2 24B", tier: "mid",
    totalParams: 24e9, activeParams: 24e9, moe: false,
    kvBytesPerTokenFP16: 160e3, maxContext: 131072,
    quants: ["q4", "q8", "fp16"], weightsGBOverride: null,
    useCaseFit: { chat: 3, rag: 3, coding: 2, agentic: 2 },
    benchmarkStatus: "released", noteKeys: [],
  },
  {
    id: "qwen3-32b", name: "Qwen3 32B", tier: "mid",
    totalParams: 32.8e9, activeParams: 32.8e9, moe: false,
    kvBytesPerTokenFP16: 262e3, maxContext: 131072,
    quants: ["q4", "q8", "fp16"], weightsGBOverride: null,
    useCaseFit: { chat: 3, rag: 3, coding: 2, agentic: 2 },
    benchmarkStatus: "released", noteKeys: [],
  },
  {
    id: "qwen25-coder-32b", name: "Qwen2.5-Coder 32B", tier: "mid",
    totalParams: 32.8e9, activeParams: 32.8e9, moe: false,
    kvBytesPerTokenFP16: 262e3, maxContext: 131072,
    quants: ["q4", "q8", "fp16"], weightsGBOverride: null,
    useCaseFit: { chat: 1, rag: 1, coding: 3, agentic: 2 },
    benchmarkStatus: "released", noteKeys: [],
  },
  {
    id: "llama33-70b", name: "Llama 3.3 70B", tier: "mid",
    totalParams: 70.6e9, activeParams: 70.6e9, moe: false,
    kvBytesPerTokenFP16: 327e3, maxContext: 131072,
    quants: ["q4", "q8", "fp16"], weightsGBOverride: null,
    useCaseFit: { chat: 3, rag: 3, coding: 2, agentic: 2 },
    benchmarkStatus: "released", noteKeys: [],
  },
  {
    id: "qwen3-235b", name: "Qwen3 235B (A22B)", tier: "large-moe",
    totalParams: 235e9, activeParams: 22e9, moe: true,
    kvBytesPerTokenFP16: 192e3, maxContext: 131072,
    quants: ["q4", "q8", "fp16"], weightsGBOverride: null,
    useCaseFit: { chat: 3, rag: 3, coding: 3, agentic: 3 },
    benchmarkStatus: "released", noteKeys: [],
  },
  {
    id: "deepseek-v3", name: "DeepSeek-V3.x 671B (A37B)", tier: "large-moe",
    totalParams: 671e9, activeParams: 37e9, moe: true,
    kvBytesPerTokenFP16: 70e3, maxContext: 131072,
    quants: ["q4", "q8", "fp16"], weightsGBOverride: null,
    useCaseFit: { chat: 3, rag: 3, coding: 3, agentic: 3 },
    benchmarkStatus: "released", noteKeys: [],
  },
  {
    id: "kimi-k3", name: "Kimi K3 2.8T (A50B)", tier: "frontier-moe",
    totalParams: 2.8e12, activeParams: 50e9, moe: true,
    kvBytesPerTokenFP16: 90e3, maxContext: 262144,
    quants: ["q4", "q8", "fp16"],
    // Published footprint estimates (not naive params x bytes): ~350-600 GB @ Q4, ~1.7 TB full precision.
    weightsGBOverride: { q4: 560, q8: 1100, fp16: 1700 },
    useCaseFit: { chat: 3, rag: 3, coding: 3, agentic: 3 },
    benchmarkStatus: "pending",
    noteKeys: ["model.note.k3"],
  },
];

// bandwidthGBs: effective usable memory bandwidth for decode (multi-GPU parallelism
// losses partly baked in). bandwidthEfficiency: fraction of that reachable in practice
// (CPU ~0.5, GPU ~0.65, Apple unified ~0.6).
// maxBatchBoost: throughput multiplier ceiling from batching (per instance).
// maxStreams: heuristic cap on useful concurrent streams (per instance).
export const HARDWARE = [
  {
    id: "rtx4090", category: "consumer-gpu", name: "Workstation, 1x RTX 4090 (24 GB)",
    priceEUR: [2200, 3000], memGB: 24, memType: "vram",
    bandwidthGBs: 1008, bandwidthEfficiency: 0.65,
    maxBatchBoost: 8, maxStreams: 8, interconnect: "none",
    instances: 1, redundant: false, noteKeys: [],
  },
  {
    id: "rtx5090", category: "consumer-gpu", name: "Workstation, 1x RTX 5090 (32 GB)",
    priceEUR: [3000, 4200], memGB: 32, memType: "vram",
    bandwidthGBs: 1792, bandwidthEfficiency: 0.65,
    maxBatchBoost: 8, maxStreams: 8, interconnect: "none",
    instances: 1, redundant: false, noteKeys: [],
  },
  {
    id: "rtx6000-ada", category: "workstation-gpu", name: "Workstation, 1x RTX 6000 Ada (48 GB)",
    priceEUR: [7000, 9000], memGB: 48, memType: "vram",
    bandwidthGBs: 960, bandwidthEfficiency: 0.65,
    maxBatchBoost: 10, maxStreams: 10, interconnect: "none",
    instances: 1, redundant: false, noteKeys: [],
  },
  {
    id: "rtxpro6000", category: "workstation-gpu", name: "Workstation, 1x RTX PRO 6000 Blackwell (96 GB)",
    priceEUR: [9000, 12000], memGB: 96, memType: "vram",
    bandwidthGBs: 1790, bandwidthEfficiency: 0.65,
    maxBatchBoost: 12, maxStreams: 12, interconnect: "none",
    instances: 1, redundant: false, noteKeys: [],
  },
  {
    id: "dual-rtxpro6000", category: "workstation-gpu", name: "Workstation, 2x RTX PRO 6000 (192 GB)",
    priceEUR: [20000, 25000], memGB: 192, memType: "vram",
    bandwidthGBs: 2200, bandwidthEfficiency: 0.65,
    maxBatchBoost: 12, maxStreams: 14, interconnect: "pcie",
    instances: 1, redundant: false, noteKeys: [],
  },
  {
    id: "mac-m3ultra", category: "apple", name: "Mac Studio M3 Ultra (512 GB unified)",
    priceEUR: [11000, 13000], memGB: 512, memType: "unified",
    bandwidthGBs: 819, bandwidthEfficiency: 0.6,
    maxBatchBoost: 2, maxStreams: 4, interconnect: "none",
    instances: 1, redundant: false, noteKeys: [],
  },
  {
    id: "mac-cluster", category: "apple", name: "Cluster, 4x Mac Studio M3 Ultra (2 TB unified)",
    priceEUR: [25000, 50000], memGB: 2048, memType: "unified",
    bandwidthGBs: 819, bandwidthEfficiency: 0.6,
    maxBatchBoost: 2, maxStreams: 4, interconnect: "tb-cluster",
    instances: 1, redundant: false, noteKeys: [],
  },
  {
    id: "epyc-milan-1tb", category: "cpu-server", name: "Used server, EPYC Milan, 1 TB RAM",
    priceEUR: [2500, 3500], memGB: 1024, memType: "ram",
    bandwidthGBs: 200, bandwidthEfficiency: 0.5,
    maxBatchBoost: 2, maxStreams: 2, interconnect: "none",
    instances: 1, redundant: false, noteKeys: ["hw.note.used"],
  },
  {
    id: "epyc-turin-dual", category: "cpu-server", name: "Server, 2x EPYC Turin, 1.5 TB RAM",
    priceEUR: [15000, 20000], memGB: 1536, memType: "ram",
    bandwidthGBs: 600, bandwidthEfficiency: 0.5,
    maxBatchBoost: 2, maxStreams: 4, interconnect: "none",
    instances: 1, redundant: false, noteKeys: [],
  },
  {
    id: "server-4x-pro6000", category: "gpu-node", name: "GPU server, 4x RTX PRO 6000 (384 GB)",
    priceEUR: [55000, 65000], memGB: 384, memType: "vram",
    bandwidthGBs: 2200, bandwidthEfficiency: 0.65,
    maxBatchBoost: 12, maxStreams: 16, interconnect: "pcie",
    instances: 1, redundant: false, noteKeys: [],
  },
  {
    id: "node-8x-pro6000", category: "gpu-node", name: "GPU server, 8x RTX PRO 6000 (768 GB)",
    priceEUR: [120000, 140000], memGB: 768, memType: "vram",
    bandwidthGBs: 2500, bandwidthEfficiency: 0.65,
    maxBatchBoost: 15, maxStreams: 16, interconnect: "pcie",
    instances: 1, redundant: false, noteKeys: [],
  },
  {
    id: "cluster-3node", category: "gpu-cluster", name: "Redundant cluster, 3x (8x RTX PRO 6000), 2 active + 1 spare",
    priceEUR: [380000, 420000], memGB: 768, memType: "vram",
    bandwidthGBs: 2500, bandwidthEfficiency: 0.65,
    maxBatchBoost: 15, maxStreams: 16, interconnect: "pcie",
    instances: 2, redundant: true, noteKeys: ["hw.note.redundant"],
  },
  {
    id: "cluster-8x-mi325x", category: "gpu-cluster", name: "GPU cluster, 8x AMD MI325X (2 TB HBM)",
    priceEUR: [80000, 120000], memGB: 2048, memType: "vram",
    bandwidthGBs: 3000, bandwidthEfficiency: 0.65,
    maxBatchBoost: 16, maxStreams: 24, interconnect: "fabric",
    instances: 1, redundant: false, noteKeys: ["hw.note.production"],
  },
];
