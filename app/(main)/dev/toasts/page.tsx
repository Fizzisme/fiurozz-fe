import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import ToastPlayground from '@/views/ToastPlayground';

export const metadata: Metadata = {
    title: 'Toast playground',
    robots: { index: false, follow: false },
};

// Dev-only surface for checking the toast banner and its Catronaut states by hand.
// A production build answers 404, so it never ships as a real page.
export default function ToastPlaygroundPage() {
    if (process.env.NODE_ENV === 'production') {
        notFound();
    }

    return <ToastPlayground />;
}
