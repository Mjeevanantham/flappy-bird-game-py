"""Flappy Bird - simple pygame implementation

Run:
  python -m venv .venv
  .\.venv\Scripts\activate
  pip install -r requirements.txt
  python main.py

This file starts the game and keeps the runnable entrypoint tiny for learners.
"""

from flappy.game import Game


def main():
    game = Game()
    game.run()


if __name__ == "__main__":
    main()
