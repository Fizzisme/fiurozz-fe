'use client';

import { useEffect, useRef } from 'react';

import {
    BODY,
    BODY_X,
    BODY_Y,
    H,
    SPRITES,
    SUCCESS_LAYOUT,
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

// Happy Catronaut with a heart speech bubble (toast "success"). The bubble drifts up and fades
// like the heart in CatronautCoding; the sparkles around him twinkle out of step.
export default function CatronautSuccess({ scale = 3, className }: CatronautToastProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.imageSmoothingEnabled = false;

        const body = prerender(BODY);
        const reduced = prefersReducedMotion();
        const BUBBLE_CYCLE = 220;

        let t = 0;

        const render = () => {
            const bob = reduced ? 0 : Math.round(Math.sin(t * 0.05));

            let bubbleY = 0;
            let bubbleAlpha = 1;
            if (!reduced) {
                const p = (t % BUBBLE_CYCLE) / BUBBLE_CYCLE;
                if (p < 0.12) {
                    bubbleAlpha = p / 0.12;
                } else if (p < 0.78) {
                    bubbleY = -Math.round(((p - 0.12) / 0.66) * 3);
                } else {
                    bubbleAlpha = 1 - (p - 0.78) / 0.22;
                    bubbleY = -3;
                }
            }

            ctx.clearRect(0, 0, W, H);
            drawShadow(ctx, 1 + bob * 0.12);
            ctx.drawImage(body, BODY_X, BODY_Y + bob);

            SUCCESS_LAYOUT.sparkles.forEach((s, i) => {
                ctx.globalAlpha = reduced ? 1 : 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 0.07 + i * 1.7));
                drawGrid(ctx, SPRITES[s.sprite], s.x, s.y);
            });

            const { bubble } = SUCCESS_LAYOUT;
            ctx.globalAlpha = bubbleAlpha;
            drawGrid(ctx, SPRITES[bubble.sprite], bubble.x, bubble.y + 3 + bubbleY);
            ctx.globalAlpha = 1;
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
