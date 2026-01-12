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
