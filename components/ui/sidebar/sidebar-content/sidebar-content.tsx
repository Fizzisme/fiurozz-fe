'use client';

import { SidebarContent as SidebarContentRadix } from '@/components/animate-ui/components/radix/sidebar';

import { menuItems } from '@/mock-data/menu-items';
import { useUserStore } from '@/lib/store/user-store';
import SidebarProjectsGroup from '@/components/ui/sidebar/sidebar-content/sidebar-projects-group';
import SidebarMenuGroup from '@/components/ui/sidebar/sidebar-content/sidebar-menu-group';
import type { ProjectCategoryTree } from '@/services/project-service';

export default function SidebarContent({
    categoriesPromise,
}: {
    categoriesPromise: Promise<ProjectCategoryTree[]>;
}) {
    const user = useUserStore((state) => state.user);

    const communityGroup = menuItems.find((group) => group.label === 'Community');
    const exploreGroup = menuItems.find((group) => group.label === 'Explore');

    return (
        <SidebarContentRadix className="overflow-x-hidden thin-scrollbar">
            <SidebarProjectsGroup categoriesPromise={categoriesPromise} />

            {user && communityGroup && <SidebarMenuGroup label={communityGroup.label} items={communityGroup.items} />}

            {exploreGroup && <SidebarMenuGroup label={exploreGroup.label} items={exploreGroup.items} />}
        </SidebarContentRadix>
    );
}
