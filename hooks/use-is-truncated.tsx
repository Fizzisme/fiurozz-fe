import * as React from 'react';

/**
 * True once the element's own content overflows its box -- e.g. a
 * `line-clamp-2` paragraph that actually cut text off. Lets a hover
 * affordance ("see full text") stay off when the text already fits in
 * full, instead of firing on every card regardless of length.
 */
function useIsTruncated<T extends HTMLElement = HTMLElement>() {
    const ref = React.useRef<T>(null);
    const [isTruncated, setIsTruncated] = React.useState(false);

    React.useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // +1px tolerance for sub-pixel rounding between scrollHeight and clientHeight.
        const measure = () => setIsTruncated(element.scrollHeight > element.clientHeight + 1);
        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return { ref, isTruncated };
}

export { useIsTruncated };
