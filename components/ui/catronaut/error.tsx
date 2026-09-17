'use client';

import { useEffect, useRef } from 'react';

import {
    BODY_X,
    BODY_X_EYES,
    BODY_Y,
    ERROR_LAYOUT,
    H,
    SPRITES,
    W,
    drawGrid,
    drawShadow,
    prefersReducedMotion,
    prerender,
} from '@/components/ui/catronaut/toast-sprites';

interface CatronautToastProps {
    scale?: number;
    className?: string;
}

// Knocked-out Catronaut with x x eyes and a sad speech bubble (toast "error"). Every few
// seconds he jolts side to side and the zap marks beside him flash.
export default function CatronautError({ scale = 3, className }: CatronautToastProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.imageSmoothingEnabled = false;

        const body = prerender(BODY_X_EYES);
        const reduced = prefersReducedMotion();
        const SHAKE_EVERY = 150;
        const SHAKE_LEN = 20;

        let t = 0;

        const render = () => {
            const phase = t % SHAKE_EVERY;
            const shaking = !reduced && phase < SHAKE_LEN;
            // jolt left/right every 2 frames while shaking
            const dx = shaking ? (Math.floor(phase / 2) % 2 === 0 ? -1 : 1) : 0;
            const bubbleBob = reduced ? 0 : Math.round(Math.sin(t * 0.04));

            ctx.clearRect(0, 0, W, H);
            drawShadow(ctx);
            ctx.drawImage(body, BODY_X + dx, BODY_Y);

            ERROR_LAYOUT.bolts.forEach((s, i) => {
                ctx.globalAlpha = reduced || shaking ? 1 : 0.35 + 0.25 * (0.5 + 0.5 * Math.sin(t * 0.08 + i));
                drawGrid(ctx, SPRITES[s.sprite], s.x + (shaking ? dx : 0), s.y);
            });

            ctx.globalAlpha = 1;
            const { bubble } = ERROR_LAYOUT;
            drawGrid(ctx, SPRITES[bubble.sprite], bubble.x, bubble.y + 1 + bubbleBob);
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
