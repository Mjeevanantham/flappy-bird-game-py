"""Core game implementation for Flappy Bird (pygame).

This module keeps most game logic testable and readable for learners.
"""
import json
import os
import random
import math
import pygame
from dataclasses import dataclass
from typing import List, Tuple

# --- Configuration ---
SCREEN_WIDTH = 640
SCREEN_HEIGHT = 480
FPS = 60

BIRD_SIZE = 30
BIRD_X = 100
GRAVITY = 0.45  # slightly gentler for beginners
FLAP_STRENGTH = -8

PIPE_WIDTH = 70
PIPE_GAP = 170  # increased gap to make the game friendlier initially
PIPE_FREQ = 1500  # ms between pipes
PIPE_SPEED = 3.0

# Tutorial / difficulty tuning
TUTORIAL_PIPE_GAP_DELTA = 30
TUTORIAL_PIPE_SPEED_DELTA = -1.0
TUTORIAL_DURATION_MS = 8000  # tutorial lasts 8 seconds on first play

HIGH_SCORE_FILE = "highscore.json"


@dataclass
class Pipe:
    x: float
    gap_y: float
    passed: bool = False

    def top_rect(self) -> pygame.Rect:
        return pygame.Rect(int(self.x), 0, PIPE_WIDTH, int(self.gap_y - PIPE_GAP / 2))

    def bottom_rect(self) -> pygame.Rect:
        top = int(self.gap_y + PIPE_GAP / 2)
        return pygame.Rect(int(self.x), top, PIPE_WIDTH, SCREEN_HEIGHT - top)

    def update(self, speed=PIPE_SPEED):
        self.x -= speed

    def off_screen(self) -> bool:
        return self.x + PIPE_WIDTH < 0


class Bird:
    def __init__(self):
        self.x = BIRD_X
        self.y = SCREEN_HEIGHT // 2
        self.vel = 0.0
        self.rect = pygame.Rect(self.x, int(self.y), BIRD_SIZE, BIRD_SIZE)

    def flap(self):
        self.vel = FLAP_STRENGTH

    def update(self):
        self.vel += GRAVITY
        self.y += self.vel
        self.rect.y = int(self.y)


class Game:
    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("Flappy - Learn Python")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.SysFont(None, 36)

        self.bird = Bird()
        self.pipes: List[Pipe] = []
        self.score = 0
        self.highscore = 0
        self.seen_tutorial = False
        self._load_persistence()

        self.running = True
        self.playing = False
        self.game_over = False

        # tutorial state
        self.tutorial_mode = False
        self._tutorial_expires_at = 0

        self._last_pipe_time = pygame.time.get_ticks()

    # --- Persistence ---
    def _load_persistence(self):
        # loads highscore and tutorial-flag if present
        self.highscore = 0
        self.seen_tutorial = False
        if os.path.exists(HIGH_SCORE_FILE):
            try:
                with open(HIGH_SCORE_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.highscore = int(data.get("highscore", 0))
                    self.seen_tutorial = bool(data.get("seen_tutorial", False))
            except Exception:
                pass

    def _save_persistence(self):
        try:
            with open(HIGH_SCORE_FILE, "w", encoding="utf-8") as f:
                json.dump({"highscore": self.highscore, "seen_tutorial": self.seen_tutorial}, f)
        except Exception:
            pass

    # backward-compatible alias
    def save_highscore(self):
        self._save_persistence()

    def _end_tutorial(self):
        if self.tutorial_mode:
            self.tutorial_mode = False
            self.seen_tutorial = True
            self._save_persistence()

    # --- Game mechanics (kept small & testable) ---
    @staticmethod
    def bird_hits_pipes(bird_rect: pygame.Rect, pipes: List[Pipe]) -> bool:
        for p in pipes:
            if bird_rect.colliderect(p.top_rect()) or bird_rect.colliderect(p.bottom_rect()):
                return True
        # ground / ceiling
        if bird_rect.top <= 0 or bird_rect.bottom >= SCREEN_HEIGHT:
            return True
        return False

    def spawn_pipe(self):
        gap = PIPE_GAP + (TUTORIAL_PIPE_GAP_DELTA if self.tutorial_mode else 0)
        gap_y = random.randint(gap // 2 + 20, SCREEN_HEIGHT - gap // 2 - 20)
        p = Pipe(SCREEN_WIDTH, gap_y)
        self.pipes.append(p)

    # --- Main loop ---
    def run(self):
        while self.running:
            dt = self.clock.tick(FPS)
            self.handle_events()
            if self.playing:
                self.update(dt)
            self.draw()
        pygame.quit()

    def start(self):
        self.playing = True
        self.game_over = False
        self.score = 0
        self.bird = Bird()
        self.pipes = []
        self._last_pipe_time = pygame.time.get_ticks()

        # enable tutorial mode for first-time players
        if not self.seen_tutorial:
            self.tutorial_mode = True
            self._tutorial_expires_at = pygame.time.get_ticks() + TUTORIAL_DURATION_MS

    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    if not self.playing:
                        self.start()
                    else:
                        self.bird.flap()
                elif event.key == pygame.K_r and self.game_over:
                    self.start()
                elif event.key == pygame.K_ESCAPE:
                    self.running = False
            elif event.type == pygame.MOUSEBUTTONDOWN:
                if not self.playing:
                    self.start()
                else:
                    self.bird.flap()

    def update(self, dt_ms: int):
        now = pygame.time.get_ticks()

        # check tutorial expiration
        if self.tutorial_mode and now >= self._tutorial_expires_at:
            self._end_tutorial()

        if now - self._last_pipe_time > PIPE_FREQ:
            self.spawn_pipe()
            self._last_pipe_time = now

        self.bird.update()

        # tune speed and gap when in tutorial mode to make the start easier
        current_speed = PIPE_SPEED + (TUTORIAL_PIPE_SPEED_DELTA if self.tutorial_mode else 0)

        for p in list(self.pipes):
            p.update(speed=current_speed)
            if not p.passed and p.x + PIPE_WIDTH < self.bird.x:
                p.passed = True
                self.score += 1
                if self.score > self.highscore:
                    self.highscore = self.score

                # end tutorial when player has successfully passed one pipe
                if self.tutorial_mode and self.score >= 1:
                    self._end_tutorial()

            if p.off_screen():
                self.pipes.remove(p)

        if self.bird_hits_pipes(self.bird.rect, self.pipes):
            self.playing = False
            self.game_over = True
            self.save_highscore()

    def draw(self):
        self.screen.fill((92, 197, 255))  # sky blue

        # draw ground
        pygame.draw.rect(self.screen, (120, 200, 80), pygame.Rect(0, SCREEN_HEIGHT - 40, SCREEN_WIDTH, 40))

        # draw pipes
        for p in self.pipes:
            pygame.draw.rect(self.screen, (34, 139, 34), p.top_rect())
            pygame.draw.rect(self.screen, (34, 139, 34), p.bottom_rect())

        # draw bird with rotation
        # on start screen, show a small bobbing animation to draw attention
        if not self.playing and not self.game_over:
            bob = int(math.sin(pygame.time.get_ticks() / 300) * 8)
            self.bird.rect.y = SCREEN_HEIGHT // 2 + bob
        bird_surf = pygame.Surface((BIRD_SIZE, BIRD_SIZE), pygame.SRCALPHA)
        pygame.draw.ellipse(bird_surf, (255, 215, 0), (0, 0, BIRD_SIZE, BIRD_SIZE))
        angle = max(min(-self.bird.vel * 3, 25), -90)
        rotated = pygame.transform.rotate(bird_surf, angle)
        r = rotated.get_rect(center=self.bird.rect.center)
        self.screen.blit(rotated, r.topleft)

        # draw UI with subtle shadow for readability
        def draw_centered(text, y, color=(0, 0, 0)):
            s = self.font.render(text, True, color)
            shadow = self.font.render(text, True, (255, 255, 255))
            x = SCREEN_WIDTH // 2 - s.get_width() // 2
            self.screen.blit(shadow, (x + 2, y + 2))
            self.screen.blit(s, (x, y))

        if not self.playing and not self.game_over:
            draw_centered("Flappy - Learn Python", 100)
            if not self.seen_tutorial:
                draw_centered("First time? A short tutorial will start when you press SPACE", 150)
            draw_centered("Press SPACE or Click to start", 190)
        elif self.game_over:
            draw_centered("Game Over", 100)
            draw_centered(f"Score: {self.score}  Highscore: {self.highscore}", 150)
            draw_centered("Press R to retry", 200)
        else:
            sc = self.font.render(str(self.score), True, (255, 255, 255))
            shadow = self.font.render(str(self.score), True, (0, 0, 0))
            self.screen.blit(shadow, (SCREEN_WIDTH // 2 - shadow.get_width() // 2 + 2, 22))
            self.screen.blit(sc, (SCREEN_WIDTH // 2 - sc.get_width() // 2, 20))

        # draw tutorial overlay when active
        if self.tutorial_mode and self.playing:
            overlay = pygame.Surface((SCREEN_WIDTH - 60, 80), pygame.SRCALPHA)
            overlay.fill((0, 0, 0, 160))
            ox = 30
            oy = SCREEN_HEIGHT - 120
            self.screen.blit(overlay, (ox, oy))
            t1 = self.font.render("Tutorial: Tap or SPACE to flap", True, (255, 255, 255))
            t2 = self.font.render("Play gently — easier pipes for a short time", True, (255, 255, 255))
            self.screen.blit(t1, (ox + 10, oy + 10))
            self.screen.blit(t2, (ox + 10, oy + 40))

        pygame.display.flip()
