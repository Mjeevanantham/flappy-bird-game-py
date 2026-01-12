// Flappy Bird - simple HTML5 Canvas implementation
// Designed to mirror the Python pygame version for learning

const SCREEN_W = 640;
const SCREEN_H = 480;
const FPS = 60;

const BIRD_SIZE = 30;
const BIRD_X = 100;
let GRAVITY = 0.45;
let FLAP = -8;

const PIPE_W = 70;
const PIPE_GAP = 170;
const PIPE_FREQ = 1500;
const PIPE_SPEED = 3;

const TUTORIAL_GAP_DELTA = 30;
const TUTORIAL_SPEED_DELTA = -1.0;
const TUTORIAL_DURATION = 8000;

const LS_KEY = 'flappy:state';

class Pipe {
    constructor(x, gapY) {
        this.x = x;
        this.gapY = gapY;
        this.passed = false;
    }
    update(speed) { this.x -= speed; }
    topRect(gap = PIPE_GAP) { return { x: this.x, y: 0, w: PIPE_W, h: this.gapY - gap / 2 }; }
    bottomRect(gap = PIPE_GAP) { return { x: this.x, y: this.gapY + gap / 2, w: PIPE_W, h: SCREEN_H - (this.gapY + gap / 2) }; }
}

class Bird {
    constructor() { this.x = BIRD_X; this.y = SCREEN_H / 2; this.vel = 0; this.size = BIRD_SIZE; }
    flap() { this.vel = FLAP; }
    update() { this.vel += GRAVITY; this.y += this.vel; }
    rect() { return { x: this.x, y: this.y, w: this.size, h: this.size }; }
}

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.bird = new Bird();
        this.pipes = [];
        this.score = 0;
        this.highscore = 0;
        this.seenTutorial = false;
        this.tutorialMode = false;
        this.tutorialExpires = 0;

        this.lastPipe = performance.now();
        this.playing = false;
        this.gameOver = false;

        this._load();

        this._bind();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    _load() {
        try { const s = JSON.parse(localStorage.getItem(LS_KEY) || '{}'); this.highscore = s.highscore || 0; this.seenTutorial = !!s.seenTutorial; } catch (e) { }
    }
    _save() { localStorage.setItem(LS_KEY, JSON.stringify({ highscore: this.highscore, seenTutorial: this.seenTutorial })); }

    _bind() {
        window.addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); this._onFlap(); } else if (e.code === 'KeyR' && this.gameOver) { this.start(); } });
        this.canvas.addEventListener('mousedown', () => this._onFlap());
        this.canvas.addEventListener('touchstart', e => { e.preventDefault(); this._onFlap(); }, { passive: false });
    }

    _onFlap() {
        if (!this.playing) { this.start(); } else if (!this.gameOver) { this.bird.flap(); }
    }

    start() {
        this.playing = true; this.gameOver = false; this.score = 0; this.bird = new Bird(); this.pipes = []; this.lastPipe = performance.now();
        if (!this.seenTutorial) { this.tutorialMode = true; this.tutorialExpires = performance.now() + TUTORIAL_DURATION; }
    }

    spawn() { const gap = PIPE_GAP + (this.tutorialMode ? TUTORIAL_GAP_DELTA : 0); const gapY = Math.floor(Math.random() * (SCREEN_H - gap - 80) + gap / 2 + 20); this.pipes.push(new Pipe(SCREEN_W, gapY)); }

    update(dt) {
        const now = performance.now();
        if (this.tutorialMode && now >= this.tutorialExpires) { this._endTutorial(); }
        if (now - this.lastPipe > PIPE_FREQ) { this.spawn(); this.lastPipe = now; }

        this.bird.update();

        const speed = PIPE_SPEED + (this.tutorialMode ? TUTORIAL_SPEED_DELTA : 0);

        for (let p of this.pipes) { p.update(speed); if (!p.passed && p.x + PIPE_W < this.bird.x) { p.passed = true; this.score++; if (this.score > this.highscore) { this.highscore = this.score; } if (this.tutorialMode && this.score >= 1) { this._endTutorial(); } } }

        this.pipes = this.pipes.filter(p => p.x + PIPE_W > 0);

        if (this._hits()) { this.playing = false; this.gameOver = true; this.seenTutorial = this.seenTutorial || !this.tutorialMode; this._save(); }
    }

    _rectsOverlap(a, b) { return !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y); }
    _hits() { const b = this.bird.rect(); if (b.y <= 0 || b.y + b.h >= SCREEN_H) return true; for (let p of this.pipes) { const gap = PIPE_GAP + (this.tutorialMode ? TUTORIAL_GAP_DELTA : 0); const top = p.topRect(gap); const bot = p.bottomRect(gap); if (this._rectsOverlap(b, top) || this._rectsOverlap(b, bot)) return true; } return false; }

    _endTutorial() { this.tutorialMode = false; this.seenTutorial = true; this._save(); }

    draw() {
        const ctx = this.ctx; ctx.clearRect(0, 0, SCREEN_W, SCREEN_H);
        // sky and ground
        ctx.fillStyle = '#5cc9ff'; ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
        ctx.fillStyle = '#78c850'; ctx.fillRect(0, SCREEN_H - 40, SCREEN_W, 40);

        // pipes
        ctx.fillStyle = '#228b22'; for (let p of this.pipes) { const gap = PIPE_GAP + (this.tutorialMode ? TUTORIAL_GAP_DELTA : 0); const t = p.topRect(gap); const b = p.bottomRect(gap); ctx.fillRect(t.x, t.y, t.w, t.h); ctx.fillRect(b.x, b.y, b.w, b.h); }

        // bird with rotation
        ctx.save(); const vel = this.bird.vel; const angle = Math.max(Math.min(-vel * 3, 25), -90); ctx.translate(this.bird.x + BIRD_SIZE / 2, this.bird.y + BIRD_SIZE / 2); ctx.rotate(angle * Math.PI / 180); ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.ellipse(0, 0, BIRD_SIZE / 2, BIRD_SIZE / 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();

        // UI
        ctx.font = '28px system-ui'; ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.fillText(this.score, SCREEN_W / 2, 36);

        if (!this.playing && !this.gameOver) { ctx.fillStyle = 'black'; ctx.textAlign = 'center'; ctx.fillText('Flappy - Learn JavaScript', SCREEN_W / 2, 100); if (!this.seenTutorial) ctx.fillText('First time? A short tutorial will start when you press Space', SCREEN_W / 2, 150); ctx.fillText('Press SPACE or Tap to start', SCREEN_W / 2, 190); }
        if (this.gameOver) { ctx.fillStyle = 'black'; ctx.fillText('Game Over', SCREEN_W / 2, 100); ctx.fillText(`Score: ${this.score}  Highscore: ${this.highscore}`, SCREEN_W / 2, 150); ctx.fillText('Press R to retry', SCREEN_W / 2, 200); }

        // tutorial overlay
        if (this.tutorialMode && this.playing) { ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(30, SCREEN_H - 120, SCREEN_W - 60, 80); ctx.fillStyle = 'white'; ctx.textAlign = 'left'; ctx.fillText('Tutorial: Tap or SPACE to flap', 40, SCREEN_H - 80); ctx.fillText('Play gently — easier pipes for a short time', 40, SCREEN_H - 50); }
    }

    loop(now) {
        if (!this._lastTime) this._lastTime = now;
        const dt = now - this._lastTime; this._lastTime = now;
        if (this.playing) this.update(dt);
        this.draw();
        requestAnimationFrame(this.loop);
    }
}

// bootstrap
const canvas = document.getElementById('game');
canvas.width = SCREEN_W; canvas.height = SCREEN_H;
const game = new Game(canvas);

// mute button placeholder (no sound for now)
document.getElementById('mute').addEventListener('click', () => { alert('Audio can be added — tell me if you want SFX/music'); });

// expose to window for debugging
window._game = game;