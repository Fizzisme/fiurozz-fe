import { SidebarInset, SidebarProvider } from '@/components/animate-ui/components/radix/sidebar';

import * as React from 'react';

import { Sidebar } from '@/components/ui/sidebar/sidebar';

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
    return (
        // Sidebar renders at 280px (components/ui/sidebar/sidebar.tsx); the gap must match,
        // otherwise the fixed sidebar overlaps the first 24px of the page.
        <SidebarProvider style={{ '--sidebar-width': '280px' } as React.CSSProperties}>
            <Sidebar />
            <SidebarInset className="bg-background">{children}</SidebarInset>
        </SidebarProvider>
    );
}
