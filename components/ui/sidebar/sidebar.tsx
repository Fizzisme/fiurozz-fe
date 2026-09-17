import * as React from 'react';

import { Sidebar as SidebarRadix } from '@/components/animate-ui/components/radix/sidebar';

import SidebarHeader from '@/components/ui/sidebar/sidebar-header';
import SidebarFooter from '@/components/ui/sidebar/sidebar-footer';
import SidebarContent from '@/components/ui/sidebar/sidebar-content/sidebar-content';
import { projectService } from '@/services/project-service';

export function Sidebar() {
    // Started here but NOT awaited: awaiting in the layout would block the whole
    // page. The promise streams to the client and only the category list suspends.
    const categoriesPromise = projectService.getCategories();

    return (
        <SidebarRadix collapsible="icon" className="w-[280px]">
            {/* Header */}
            <SidebarHeader />

            {/* Content */}
            <SidebarContent categoriesPromise={categoriesPromise} />

            {/*Footer*/}
            <SidebarFooter />
        </SidebarRadix>
    );
}
