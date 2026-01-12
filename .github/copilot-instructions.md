# Copilot Instructions — flappy-bird

Purpose: Help AI coding agents be immediately productive in this repository by describing the project's structure, key workflows, and specific patterns to follow. This is a living document — update it with concrete examples as the codebase grows.

## Quick snapshot ✅
- Repo status: **Python learning project (pygame)** — small Flappy Bird clone.
- Entry points: `main.py` (runner), core logic in `flappy/game.py`.
- How to run:
  - Create virtualenv, install deps: `pip install -r requirements.txt`
  - Run: `python main.py`
  - Run tests: `pytest`
- Test runner: **pytest** (see `tests/`).
- CI: GitHub Actions workflow at `.github/workflows/python-app.yml` runs tests on push.
- Persistence: high score stored in `highscore.json`.


## High-level guidance (what to discover first) 🔎
1. Find the entry points:
   - Search for `src/`, `app/`, `game.py`, `index.html`, `main.*`, `server.*`.
   - Note how the app is started (NPM script, `python -m`, `cargo run`, `dotnet run`, etc.).
2. Locate build & test config:
   - Look for `package.json`, `pyproject.toml`, `Makefile`, `build.gradle`, `.github/workflows`.
   - Identify the test runner: `pytest`, `jest`, `mocha`, `go test`, `cargo test`.
3. Identify key integrations:
   - Check for `Dockerfile`, `docker-compose.yml`, `.env.example`, and CI workflows.
   - Search for network calls or external APIs (HTTP clients, SDKs, env var names like `API_KEY`, `DB_URL`).

## Actionable rules for edits ✏️
- When adding code, mirror the repository’s top-level module layout (e.g., `src/` or flat `*.py` files).
- Before proposing changes, run the project's test suite locally using discovered commands and only include code that keeps tests green.
- Prefer minimal, well-scoped PRs with one logical change per branch and a short, descriptive title.

## Conventions & style checks 🔧
- Detect formatting/lint config files (e.g., `.eslintrc`, `pyproject.toml` with `black/flake8`, `.clang-format`) and follow them automatically.
- If no rules found, ask the maintainers which linter/formatter to use before making formatting-only changes.

## Tests & CI 📋
- If a GitHub Actions workflow exists, replicate its local steps when verifying changes (install deps, run tests, build artifacts).
- If tests are absent, add tests for any non-trivial change and include instructions to run them in the PR description.

## Debugging hints 🐞
- Look for `logging` usage or debug flags (e.g., `--verbose`, `DEBUG=true`) and follow existing logging patterns.
- If the project is a game loop (likely given the repo name), prefer deterministic seeds in tests and avoid time-based sleeps where possible.

## Hotspots & places to look for examples 🔍
- `README.md` — quick-start and run/test commands (see run instructions for learners).
- `main.py` — tiny runnable entrypoint; good place for a learner to start.
- `flappy/game.py` — core game loop, Bird/Pipe classes, and testable functions (e.g., `bird_hits_pipes`).
- `tests/` — unit tests for pure logic (collision, scoring) show how to make game logic testable.
- `.github/workflows/*` — CI config that runs `pytest` on push.
- `web/` — HTML5 Canvas port for browser deployment; contains `web/index.html`, `web/game.js`, and `web/styles.css`. Deployable to Vercel using `vercel.json`.

### Project-specific guidance 🔧
- Keep game logic small and testable: move pure functions (collision, scoring) out of the draw/update code so they can be unit tested.
- Constants at top of `flappy/game.py` make tuning easy for learners (gravity, pipe gap, FPS, etc.).
- Prefer simple built-in shapes for first assets (rects/ellipses) so contributors don't need image assets to run the project.
- Persistence: high score is stored to `highscore.json` in the repo root (ignored in `.gitignore` for typical contributors).
- If adding assets (images/sounds), create an `assets/` folder and reference relative paths from `main.py` or `flappy/game.py`.


## When you're uncertain — ask clarifying questions ❓
- If you cannot find how to run or build the project, ask: “Which command starts the app locally?” and “Which test command should I run?”
- If multiple languages/toolchains are present, ask which is the source-of-truth for new features.

## PR checklist for contributors ✅
- Runs locally: provide exact commands to reproduce build/test.
- Tests: include/update tests when changing behavior.
- CI: ensure GitHub Actions passes and include a note if additional secrets are required.

## Stub-to-real workflow (how to flesh this file out) ⚡
- Replace the "no source files detected" snapshot with real entries once code is added.
- Add small, concrete examples (commands, file references) as you discover them.

---

If you'd like, I can: (a) keep this draft and create the file in the repo (currently empty), or (b) wait and re-run discovery after you add source files and then emit a more specific version with real examples.

Please tell me which you prefer or add missing files and I’ll re-scan and update the instructions with concrete, repository-specific rules.