'use client';

import { useEffect, useRef } from 'react';

import {
    BODY,
    BODY_X,
    BODY_Y,
    H,
    LOADING_LAYOUT,
    PALETTE,
    SPRITES,
    W,
    buildOrbit,
    drawGrid,
    drawShadow,
    prefersReducedMotion,
    prerender,
} from '@/components/ui/catronaut/toast-sprites';

interface CatronautToastProps {
    scale?: number;
    className?: string;
}

// Catronaut inside a spinning orbit (toast "loading"). The ring's back half passes behind the
// helmet and its front half across the visor; two dashes chase a bright head around it.
export default function CatronautLoading({ scale = 3, className }: CatronautToastProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.imageSmoothingEnabled = false;

        const body = prerender(BODY);
        const orbit = buildOrbit(LOADING_LAYOUT.orbit);
        const n = orbit.length;
        const half = n / 2;
        const DASH = half * 0.8;
        const orange = PALETTE[8] as string;
        const glow = PALETTE[9] as string;
        const reduced = prefersReducedMotion();

        const drawOrbit = (front: boolean, head: number, bob: number) => {
            for (let i = 0; i < n; i++) {
                const p = orbit[i];
                if (p.front !== front) continue;
                // distance this point trails the head, folded so there are two dashes half a turn apart
                const behind = (((head - i) % n) + n) % n % half;
                if (behind > DASH) continue;
                ctx.fillStyle = behind < 2 ? glow : orange;
                ctx.fillRect(p.x, p.y + bob, 1, 1);
            }
        };

        let t = 0;

        const render = () => {
            const bob = reduced ? 0 : Math.round(Math.sin(t * 0.05));
            const head = (t * 0.9) % n;

            ctx.clearRect(0, 0, W, H);
            drawShadow(ctx, 1 + bob * 0.12);

            drawOrbit(false, head, bob);
            ctx.drawImage(body, BODY_X, BODY_Y + bob);
            drawOrbit(true, head, bob);

            LOADING_LAYOUT.sparkles.forEach((s, i) => {
                ctx.globalAlpha = reduced ? 1 : 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 0.06 + i * 2.1));
                drawGrid(ctx, SPRITES[s.sprite], s.x, s.y);
            });
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
