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

        // UI - canvas drawing
        ctx.font = '28px system-ui'; ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.fillText(this.score, SCREEN_W / 2, 36);

        if (!this.playing && !this.gameOver) {
            ctx.fillStyle = 'black'; ctx.textAlign = 'center'; ctx.fillText('Flappy - Learn JavaScript', SCREEN_W / 2, 100);
            if (!this.seenTutorial) ctx.fillText('First time? A short tutorial will start when you press Space', SCREEN_W / 2, 150);
            ctx.fillText('Press SPACE or Tap to start', SCREEN_W / 2, 190);
        }
        if (this.gameOver) {
            ctx.fillStyle = 'black'; ctx.fillText('Game Over', SCREEN_W / 2, 100);
            ctx.fillText(`Score: ${this.score}  Highscore: ${this.highscore}`, SCREEN_W / 2, 150);
            ctx.fillText('Press R to retry', SCREEN_W / 2, 200);
        }

        // tutorial overlay
        if (this.tutorialMode && this.playing) {
            ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(30, SCREEN_H - 120, SCREEN_W - 60, 80);
            ctx.fillStyle = 'white'; ctx.textAlign = 'left'; ctx.fillText('Tutorial: Tap or SPACE to flap', 40, SCREEN_H - 80);
            ctx.fillText('Play gently — easier pipes for a short time', 40, SCREEN_H - 50);
        }

        // Sync DOM UI
        try {
            const scoreEl = document.getElementById('score'); if (scoreEl) scoreEl.textContent = String(this.score);
            const aiEl = document.getElementById('ai-indicator'); if (aiEl) { if (this.aiActive) aiEl.classList.remove('hidden'); else aiEl.classList.add('hidden'); }
        } catch (e) { /* ignore in non-browser environments */ }

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
// --- AI Auto-play feature ---
const AI_AUTO_MS = 10000; // 10 seconds autoplay
const AI_POLL_MS = 150; // ask AI every N ms

let aiInterval = null;
let aiEndTime = 0;
let aiEndpointInput = null;
let aiUsingEndpoint = false;

function downloadJSON(obj, filename = 'ai-run.json') {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

async function queryGroqAPI(payload, endpoint) {
    // Generic POST wrapper for an AI endpoint (e.g., Groq). Expects JSON response { flap: boolean }
    // This client does not include an API key by default; the user may provide a proxied endpoint if needed.
    try {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error('AI request failed');
        const j = await res.json();
        return j;
    } catch (e) {
        console.warn('AI request failed, falling back to heuristic', e);
        return null;
    }
}

Game.prototype._aiDecide = async function () {
    // Build a compact state payload for the AI
    const nearest = this.pipes.length ? this.pipes[0] : null;
    const state = {
        bird: { y: this.bird.y, vel: this.bird.vel },
        nextPipe: nearest ? { x: nearest.x, gapY: nearest.gapY } : null,
        score: this.score,
        tutorial: this.tutorialMode
    };

    // Determine endpoint: if 'use-proxy' checked, use /api/groq, otherwise use provided endpoint if present
    const useProxy = !!document.getElementById('use-proxy')?.checked;
    const endpointInput = document.getElementById('ai-endpoint')?.value?.trim();
    const endpoint = useProxy ? '/api/groq' : (endpointInput || '');

    if (endpoint) {
        const response = await queryGroqAPI(state, endpoint);
        if (response && typeof response.flap !== 'undefined') return { flap: !!response.flap, source: 'ai' };
    }

    // Heuristic fallback: flap when bird is dropping toward the gap top or approaching a pipe
    const gapY = nearest ? nearest.gapY : SCREEN_H / 2;
    const distX = nearest ? nearest.x - this.bird.x : 9999;
    const shouldFlap = (this.bird.vel > 3 && this.bird.y > gapY) || (distX < 120 && Math.abs(this.bird.y - gapY) > 20);
    return { flap: shouldFlap, source: 'heuristic' };
};

Game.prototype.startAIAutoPlay = function () {
    if (this.playing === false) { this.start(); }
    if (document.getElementById('ai-stop')) document.getElementById('ai-stop').style.display = 'inline-block';
    document.getElementById('ai-play').style.display = 'none';
    document.getElementById('ai-indicator').classList.remove('hidden');
    this.aiActive = true;
    aiEndTime = performance.now() + AI_AUTO_MS;

    // update countdown UI
    const timerEl = document.getElementById('ai-timer');
    const timerTicker = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((aiEndTime - performance.now()) / 1000));
        if (timerEl) timerEl.textContent = String(remaining);
        if (remaining <= 0) { clearInterval(timerTicker); }
    }, 250);

    aiInterval = setInterval(async () => {
        try {
            if (performance.now() >= aiEndTime) { this.stopAIAutoPlay(); return; }
            const d = await this._aiDecide();
            if (d && d.flap) { this.bird.flap(); }
        } catch (e) {
            console.warn('AI autoplayer error', e);
            this.stopAIAutoPlay();
            this._onAIFailure();
        }
    }, AI_POLL_MS);
};

Game.prototype.stopAIAutoPlay = function () {
    if (aiInterval) clearInterval(aiInterval);
    aiInterval = null;
    this.aiActive = false;
    if (document.getElementById('ai-stop')) document.getElementById('ai-stop').style.display = 'none';
    if (document.getElementById('ai-play')) document.getElementById('ai-play').style.display = 'inline-block';
};

// When AI run fails (game over while aiActive), show modal to ask user for details and optionally continue
Game.prototype._onAIFailure = function () {
    this.stopAIAutoPlay();
    const modal = document.getElementById('ai-fail-modal');
    modal.classList.remove('hidden'); modal.setAttribute('aria-hidden', 'false');
    // pre-fill name from localStorage if available
    const stored = JSON.parse(localStorage.getItem('aiUser') || '{}');
    if (stored && stored.name) document.getElementById('ai-user-name').value = stored.name;
};

function hideAIModal() { const modal = document.getElementById('ai-fail-modal'); modal.classList.add('hidden'); modal.setAttribute('aria-hidden', 'true'); }

document.getElementById('ai-play').addEventListener('click', () => { game.startAIAutoPlay(); });
document.getElementById('ai-stop').addEventListener('click', () => { game.stopAIAutoPlay(); });

// modal actions
document.getElementById('ai-submit').addEventListener('click', async () => {
    const name = document.getElementById('ai-user-name').value || 'anonymous';
    const feedback = document.getElementById('ai-feedback').value || '';
    const payload = { name, feedback, score: game.score, highscore: game.highscore, timestamp: new Date().toISOString(), aiActive: !!game.aiActive };
    // save locally
    const store = JSON.parse(localStorage.getItem('aiFailedRuns') || '[]'); store.push(payload); localStorage.setItem('aiFailedRuns', JSON.stringify(store));
    // save user name for convenience
    localStorage.setItem('aiUser', JSON.stringify({ name }));

    // attempt to POST to server-side report endpoint (if present)
    try {
        await fetch('/api/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } catch (e) { console.warn('report failed', e); }

    // trigger download
    downloadJSON(payload, `ai-failed-run-${Date.now()}.json`);
    hideAIModal();
    // optionally resume auto-play for another duration
    game.startAIAutoPlay();
});

document.getElementById('ai-cancel').addEventListener('click', () => { hideAIModal(); });

// hook into game over: when game becomes gameOver and aiActive was true, prompt
const origUpdate = Game.prototype.update;
Game.prototype.update = function (dt) {
    const wasPlaying = this.playing;
    origUpdate.call(this, dt);
    if (this.gameOver && this.aiActive) { this._onAIFailure(); }
};
// expose to window for debugging
window._game = game;