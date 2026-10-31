# FixForge — controlled AI-assisted JavaScript debugging

> **Brand:** FixForge — AI-assisted JavaScript debugging with controlled patch validation.

A full-stack React + Express MVP that demonstrates a reproducible bug-to-patch workflow: select a known JavaScript issue, compare original and corrected code, run a controlled test suite, and optionally request a Gemini explanation.

## What works
- Three reproducible JavaScript bug scenarios: cart quantity, active-user filtering, pagination.
- Side-by-side original and corrected code.
- Before/after automated test results (3 tests per scenario).
- Optional Gemini-generated root-cause explanation, with a local fallback when no key is configured.
- Clear errors, mobile-responsive dark UI, API endpoint for scenarios and analysis.

## Scope and limitations — read before putting this on your resume
**This is a controlled demonstration, not a general-purpose GitHub issue resolution agent.** The patches are pre-reviewed and stored in `server/scenarios.js`. Gemini explains the fix; it does **not** generate or apply patches. The app does not clone GitHub repositories, open PRs, run arbitrary user code, or autonomously debug unseen issues. Do not claim any of those capabilities.

The built-in tests execute only developer-authored fixture code via Node `vm`. Node `vm` is **not** a security boundary; never pass user-provided or LLM-generated code to it. For real arbitrary-code execution, use a hardened isolated container with resource/network restrictions.

## Setup (Windows PowerShell or terminal)
Requires Node.js 20+.

```bash
npm install
npm run install:all
cp server/.env.example server/.env
npm run dev
```

On Windows PowerShell use `Copy-Item server/.env.example server/.env` instead of `cp` if preferred.

Visit http://localhost:5173. The backend is at http://localhost:4000.

To enable AI explanations, put a Gemini API key in `server/.env` as `GEMINI_API_KEY=...`. Set `GEMINI_MODEL` to a model available for your key. Never commit `.env`.

## Tests and build
```bash
npm test
npm --prefix client run build
```

## API
- `GET /api/health`
- `GET /api/scenarios`
- `POST /api/analyze` body: `{"scenarioId":"sum-cart"}`

## Architecture
`React UI → Express API → controlled fixture engine → test results` and optionally `Express API → Gemini explanation → fallback`.

## Evaluation
The built-in test suite is **not** a benchmark of autonomous AI performance. Each of the 3 scenarios has 3 fixture tests. Run `npm test` and interact with each scenario to verify the before/after pass counts. Do not claim AI fix success rates from these deterministic fixtures.

## Next engineering milestones
1. Allow user-supplied issue descriptions and repository context (without execution).
2. Generate structured patch proposals with Gemini and show diffs.
3. Add user approval and a genuinely isolated test runner for untrusted code.
4. Add GitHub integration and evaluation on previously unseen issues.

## Resume description (truthful MVP scope)
“Built a React and Express debugging dashboard featuring three reproducible JavaScript bug scenarios, side-by-side patch review, automated before/after tests, and optional Gemini-generated root-cause explanations.”
