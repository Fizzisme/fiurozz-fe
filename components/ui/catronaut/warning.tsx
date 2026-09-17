'use client';

import { useEffect, useRef } from 'react';

import {
    BODY_WARNING_EYES,
    BODY_X,
    BODY_Y,
    H,
    SPRITES,
    W,
    WARNING_LAYOUT,
    drawGrid,
    drawShadow,
    prefersReducedMotion,
    prerender,
} from '@/components/ui/catronaut/toast-sprites';

interface CatronautToastProps {
    scale?: number;
    className?: string;
}

// Wide-eyed Catronaut under a warning-sign bubble (toast "warning"). Every couple of seconds
// the bubble hops twice to catch the eye; the stars beside him twinkle.
export default function CatronautWarning({ scale = 3, className }: CatronautToastProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.imageSmoothingEnabled = false;

        const body = prerender(BODY_WARNING_EYES);
        const reduced = prefersReducedMotion();
        const HOP_EVERY = 130;
        // two quick hops: up 2, down, up 1, down (frames per step)
        const HOP = [0, -1, -2, -2, -1, 0, 0, -1, -1, 0];
        const HOP_STEP = 3;

        let t = 0;

        const render = () => {
            const bob = reduced ? 0 : Math.round(Math.sin(t * 0.045));
            const hopIndex = Math.floor((t % HOP_EVERY) / HOP_STEP);
            const hop = reduced || hopIndex >= HOP.length ? 0 : HOP[hopIndex];

            ctx.clearRect(0, 0, W, H);
            drawShadow(ctx, 1 + bob * 0.12);
            ctx.drawImage(body, BODY_X, BODY_Y + bob);

            WARNING_LAYOUT.sparkles.forEach((s, i) => {
                ctx.globalAlpha = reduced ? 1 : 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 0.07 + i * 2.4));
                drawGrid(ctx, SPRITES[s.sprite], s.x, s.y);
            });
            ctx.globalAlpha = 1;

            const { bubble } = WARNING_LAYOUT;
            drawGrid(ctx, SPRITES[bubble.sprite], bubble.x, bubble.y + 2 + hop);
        };

        if (reduced) {
            render();
            return;
        }

        const frame = () => {
            t += 1;
            render();
            rafRef.current = requestAnimationFrame(frame);
        };

        frame();
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className={className}
            style={{
                width: W * scale,
                height: H * scale,
                maxWidth: 'none',
                maxHeight: 'none',
                display: 'block',
                flexShrink: 0,
                boxSizing: 'content-box',
                imageRendering: 'pixelated',
            }}
        />
    );
}
