'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

// The draft preview owns the full width (its toolbar runs edge to edge) and has no breadcrumb,
// so it skips the padded shell every other /projects page shares.
const BARE_PREFIX = '/projects/preview';

export default function ProjectsShell({
    breadcrumb,
    children,
}: {
    breadcrumb: React.ReactNode;
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    if (pathname.startsWith(BARE_PREFIX)) {
        return <div className="w-full pb-6">{children}</div>;
    }

    return (
        <div className="w-full px-4 sm:px-8 md:pl-8 md:pr-4 lg:pl-12 lg:pr-6 pb-6">
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                {breadcrumb}
            </header>

            {children}
        </div>
    );
}
