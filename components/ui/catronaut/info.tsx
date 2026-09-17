'use client';

import { useEffect, useRef } from 'react';

import {
    BODY_INFO_EYES,
    BODY_X,
    BODY_Y,
    H,
    INFO_LAYOUT,
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

// Curious Catronaut with an "i" speech bubble (toast "info"). The bubble floats gently up and
// down and the four stars around him twinkle out of step — calm, nothing to act on.
export default function CatronautInfo({ scale = 3, className }: CatronautToastProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.imageSmoothingEnabled = false;

        const body = prerender(BODY_INFO_EYES);
        const reduced = prefersReducedMotion();

        let t = 0;

        const render = () => {
            const bob = reduced ? 0 : Math.round(Math.sin(t * 0.045));
            const float = reduced ? 0 : Math.round(Math.sin(t * 0.035 + 1.2) * 1.4);

            ctx.clearRect(0, 0, W, H);
            drawShadow(ctx, 1 + bob * 0.12);
            ctx.drawImage(body, BODY_X, BODY_Y + bob);

            INFO_LAYOUT.sparkles.forEach((s, i) => {
                ctx.globalAlpha = reduced ? 1 : 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 0.05 + i * 1.6));
                drawGrid(ctx, SPRITES[s.sprite], s.x, s.y);
            });
            ctx.globalAlpha = 1;

            const { bubble } = INFO_LAYOUT;
            drawGrid(ctx, SPRITES[bubble.sprite], bubble.x, bubble.y + 2 + float);
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
