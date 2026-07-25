# AI Server Calculator

**Live: <https://jochri66.github.io/AI-Calculator/>**

A bilingual (DE/EN) calculator that helps small and mid-sized companies figure
out what hardware they need to run large language models on-premises — with
honest, physics-based estimates instead of marketing promises.

## Features

- **Needs wizard** — answer five business questions (concurrent users, use case,
  data sovereignty, budget, quality tier) and get a recommended model + hardware
  configuration with price range, expected speed, and honest caveats.
- **Expert mode** — pick a model, quantization, context length and concurrency,
  and see live which hardware fits, plus memory breakdown and throughput
  estimates for every system in the catalog.
- **Cloud vs. local** — honest cost comparison against ChatGPT (Plus/Team),
  Claude (Pro/Max 5x/Max 20x/Team), Gemini, and pay-per-token APIs, derived
  from the use-case mix; monthly / 1-year / 3-year views.
- **Sovereignty slider & hybrid plans** — data sovereignty is a 0–100% share;
  in between, the calculator proposes a hybrid split (sensitive workloads on
  smaller local hardware, the rest via cloud) with the cost breakdown.
- **Industry presets** — law firm, manufacturing, agency, healthcare, retail
  presets prefill the sliders and sovereignty level.
- **Honest by design** — every estimate is shown as a ±30% range; caveats
  (unbenchmarked MoE-over-PCIe routing, pending Kimi K3 benchmarks, "a cloud
  API is cheaper without sovereignty requirements", "closed frontier models
  are currently stronger") are first-class output.

## The calculation model

Four bottlenecks that alternate — which is why doubling one resource almost
never doubles performance:

1. **Capacity** (VRAM/RAM) — binary: the model fits or it doesn't.
   Footprint = weights (at quantization) + KV cache (per stream × context) + overhead.
2. **Bandwidth** — governs single-stream speed: effective GB/s ÷ bytes read per
   token. MoE models only read their *active* experts per token.
3. **Compute** — only matters with batching, which boosts aggregate throughput
   10–20× on GPUs (and is why cloud APIs are cheap).
4. **Interconnect** — the fourth bottleneck at multi-GPU scale; expert routing
   over PCIe-only links carries an explicit penalty and uncertainty flag.

Calibration anchors (encoded as self-tests): a used 1 TB EPYC Milan server runs
a Kimi-K3-class model at ~2–4 tok/s, dual EPYC Turin at ~8–15 tok/s, an
8× RTX PRO 6000 node at ~30–40 tok/s, and a 3-node redundant cluster serves
~150–300 chat users but only ~30–50 agentic users.

## Running locally

No build step. ES modules require an HTTP server (not `file://`):

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Deploys as-is to GitHub Pages (all paths are relative).

## Self-tests

Calibration anchors are asserted in `js/selftest.js`:

```bash
node js/selftest.js          # in the terminal
# or open http://localhost:8000/?test=1 and check the browser console
```

## Structure

```
index.html       page skeleton (wizard, expert mode, CTA)
css/style.css    styling, responsive layout
js/data.js       model & hardware catalogs, planning constants
js/calc.js       pure calculation core (no DOM)
js/i18n.js       DE/EN strings + helpers
js/ui.js         rendering
js/main.js       wiring: tabs, wizard flow, language toggle
js/selftest.js   calibration sanity checks
```

All figures are planning estimates, not benchmarks. Adjust the catalogs in
`js/data.js` as prices and models evolve.

## License

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Winterbloom GmbH.
The software is provided "as is", without warranty of any kind.
