import os
import pygame
import pytest
from flappy.game import Bird, Pipe, Game, HIGH_SCORE_FILE


@pytest.fixture(autouse=True)
def init_pygame():
    pygame.init()
    yield
    pygame.quit()


def test_bird_hits_empty_space():
    bird = Bird()
    bird.rect = pygame.Rect(100, 100, 30, 30)
    pipes = [Pipe(300, 240)]
    assert not Game.bird_hits_pipes(bird.rect, pipes)


def test_bird_hits_top_pipe():
    bird = Bird()
    # place bird in top pipe area
    bird.rect = pygame.Rect(305, 10, 30, 30)
    pipes = [Pipe(300, 50)]
    assert Game.bird_hits_pipes(bird.rect, pipes)


def test_score_increases_on_pass():
    g = Game()
    g.start()
    # add a pipe and simulate it moving past bird
    p = Pipe(g.bird.x + 10, g.bird.y)
    p.x = g.bird.x - 100  # already passed
    g.pipes.append(p)
    # update loop should count passed pipe
    g.update(16)
    assert g.score >= 0


def test_tutorial_mode_on_first_start(tmp_path):
    # ensure no persisted file to simulate first run
    try:
        os.remove(HIGH_SCORE_FILE)
    except Exception:
        pass
    g = Game()
    g.seen_tutorial = False
    g.start()
    assert g.tutorial_mode


def test_end_tutorial_sets_seen_flag():
    g = Game()
    g.seen_tutorial = False
    g.tutorial_mode = True
    g._end_tutorial()
    assert not g.tutorial_mode and g.seen_tutorial
