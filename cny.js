/**
 * Chinese New Year 2026 — Year of the Fire Horse 🐎
 * Falling petals / spark animation on the hero canvas
 */
(function () {
    'use strict';

    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.querySelector('.cny-petals-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Petal / spark shapes
    const SHAPES = ['petal', 'spark', 'diamond'];

    // Fire Horse palette: reds, golds, orange sparks
    const COLORS = [
        'rgba(220, 40,  20,  %a)',   // deep red
        'rgba(200, 60,  20,  %a)',   // fire orange-red
        'rgba(255, 190, 50,  %a)',   // gold
        'rgba(255, 220, 100, %a)',   // pale gold
        'rgba(240, 100, 30,  %a)',   // warm orange
        'rgba(255, 100, 80,  %a)',   // coral-red
    ];

    function randomColor(alpha) {
        const tpl = COLORS[Math.floor(Math.random() * COLORS.length)];
        return tpl.replace('%a', alpha.toFixed(2));
    }

    let W, H, particles;

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        W = canvas.width  = rect.width;
        H = canvas.height = rect.height;
    }

    function createParticle() {
        const size = 4 + Math.random() * 8;
        return {
            x:    Math.random() * W,
            y:    -size - Math.random() * H * 0.4,
            vx:   (Math.random() - 0.5) * 0.7,
            vy:   0.5 + Math.random() * 1.0,
            rot:  Math.random() * Math.PI * 2,
            rotV: (Math.random() - 0.5) * 0.04,
            size,
            shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
            alpha: 0.6 + Math.random() * 0.4,
            color: randomColor(1),          // we'll apply alpha manually
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.02 + Math.random() * 0.02,
        };
    }

    function init() {
        resize();
        // Start with particles spread across the canvas
        particles = Array.from({ length: 60 }, () => {
            const p = createParticle();
            p.y = Math.random() * H;   // pre-scatter vertically
            return p;
        });
    }

    function drawPetal(ctx, size) {
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.bezierCurveTo( size * 0.6, -size * 0.4,  size * 0.6,  size * 0.4, 0,  size * 0.3);
        ctx.bezierCurveTo(-size * 0.6,  size * 0.4, -size * 0.6, -size * 0.4, 0, -size);
        ctx.fill();
    }

    function drawDiamond(ctx, size) {
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.5, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size * 0.5, 0);
        ctx.closePath();
        ctx.fill();
    }

    function drawSpark(ctx, size) {
        // Four-pointed star
        const inner = size * 0.35;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const r = i % 2 === 0 ? size : inner;
            if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
            else         ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();
    }

    function tick() {
        ctx.clearRect(0, 0, W, H);

        particles.forEach((p, i) => {
            // Physics
            p.wobble += p.wobbleSpeed;
            p.x  += p.vx + Math.sin(p.wobble) * 0.4;
            p.y  += p.vy;
            p.rot += p.rotV;

            // Fade out near bottom
            const fadeStart = H * 0.8;
            const alpha = p.y > fadeStart
                ? p.alpha * (1 - (p.y - fadeStart) / (H * 0.2))
                : p.alpha;

            // Parse base color and apply current alpha
            const color = p.color.replace('rgba(', '').replace(')', '').split(',');
            ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]}, ${alpha.toFixed(2)})`;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);

            if      (p.shape === 'petal')   drawPetal(ctx, p.size);
            else if (p.shape === 'diamond') drawDiamond(ctx, p.size);
            else                            drawSpark(ctx, p.size);

            ctx.restore();

            // Recycle off-screen particles
            if (p.y > H + 20 || p.x < -40 || p.x > W + 40) {
                particles[i] = createParticle();
            }
        });

        requestAnimationFrame(tick);
    }

    // Kick off after hero is visible
    window.addEventListener('load', function () {
        init();
        tick();
    });

    window.addEventListener('resize', function () {
        resize();
    });

})();
