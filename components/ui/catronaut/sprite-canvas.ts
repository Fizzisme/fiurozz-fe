// Canvas helpers shared by every pixel Catronaut (idle, happy, coding and the toast set).

/**
 * The dark-theme rim: a 1px greige outline (DESIGN.md "Greige Edge") drawn around a sprite's
 * silhouette, so the black suit and ink outline stay separate from a near-black page instead
 * of the character being recoloured.
 */
export const DARK_RIM = '#d8d2ca';

export function isDarkTheme() {
    return document.documentElement.classList.contains('dark');
}

export function prefersReducedMotion() {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Paints a palette grid once into an offscreen canvas. With `rim`, every transparent cell that
 * touches the shape (8 neighbours) is filled with that colour.
 */
export function renderSprite(
    grid: number[][],
    palette: Record<number, string | null>,
    options: { rim?: string } = {},
): HTMLCanvasElement {
    const h = grid.length;
    const w = grid[0].length;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const opaque = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && !!palette[grid[y][x]];

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const color = palette[grid[y][x]];

            if (color) {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, 1, 1);
                continue;
            }

            if (!options.rim) continue;

            let touches = false;
            for (let dy = -1; dy <= 1 && !touches; dy++) {
                for (let dx = -1; dx <= 1 && !touches; dx++) {
                    if ((dx || dy) && opaque(x + dx, y + dy)) touches = true;
                }
            }

            if (touches) {
                ctx.fillStyle = options.rim;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    return canvas;
}

export interface ThemedSprite {
    light: HTMLCanvasElement;
    dark: HTMLCanvasElement;
}

/** Both theme versions of a sprite, built once; pick with `isDarkTheme()` each frame. */
export function themedSprite(grid: number[][], palette: Record<number, string | null>): ThemedSprite {
    return {
        light: renderSprite(grid, palette),
        dark: renderSprite(grid, palette, { rim: DARK_RIM }),
    };
}
