# Flappy Bird — Python (pygame) learning project

A small, well-documented Flappy Bird clone implemented in Python using pygame. The goal is to be a compact, easy-to-read project that demonstrates a small game loop, basic physics, collision detection, and persistence (high score) — suitable for learning.

Quick start
-----------

1. Create and activate a virtualenv:
   - Windows: python -m venv .venv && .\.venv\Scripts\activate
2. Install dependencies:
   pip install -r requirements.txt
3. Run:
   python main.py

Testing
-------

Run unit tests with:

    pytest

Project layout
--------------

- `main.py` — tiny runner that imports the game and starts it
- `flappy/game.py` — core game logic, classes, and testable functions
- `tests/` — unit tests for pure logic (collision, scoring)

Features added for learners
---------------------------
- First-time tutorial: the first run enables a short, easier tutorial (larger gaps, slower pipes) for a few seconds to help new players learn controls.
- Friendly defaults: constants tuned for a gentler learning curve (lower gravity, larger pipe gap).
- Simple UI polish: readable prompts, subtle shadows, and a rotating bird sprite for clearer feedback.

Learning notes
--------------
- The graphical parts are in `flappy/game.py`, but logic like `bird_hits_pipes` is intentionally small and unit-testable.
- Prefer modifying constants for experimentation (gravity, pipe gap, etc.)

Web port and deployment
-----------------------
- A web port (HTML5 Canvas + JS) is included in `web/` (`web/index.html`, `web/game.js`, `web/styles.css`). It preserves the tutorial and friendly defaults from the Python version.
- Deploy to Vercel by connecting the repository in https://vercel.com/new (select the `main` branch), or install the Vercel CLI and run `vercel` from the repo root. The provided `vercel.json` routes the root to `web/index.html`.

Packaging & releases (Python app)
---------------------------------
- The Python/pygame app can be packaged and published as native artifacts. A workflow (`.github/workflows/release.yml`) builds executables using PyInstaller for Windows, Linux and macOS when you push a tag like `v1.0.0`.
- Released artifacts will be attached to the GitHub Release and linked from `web/download.html` for convenience.
- To create a release: tag the repo (e.g., `git tag v1.0.0 && git push origin v1.0.0`) and the CI will build and attach the artifacts automatically.
