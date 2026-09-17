'use client';

import { Suspense, use } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Folder, LayoutDashboard, Trash2, Folder as ProjectIcon } from 'lucide-react';

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from '@/components/animate-ui/components/radix/sidebar';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/animate-ui/primitives/radix/collapsible';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { Skeleton } from '@/components/ui/global/skeleton';
import CategoryIcon from '@/components/ui/project/category-icon';
import { useUserStore } from '@/lib/store/user-store';
import type { ProjectCategoryTree } from '@/services/project-service';

export default function SidebarProjectsGroup({
    categoriesPromise,
}: {
    categoriesPromise: Promise<ProjectCategoryTree[]>;
}) {
    const pathname = usePathname();
    const user = useUserStore((state) => state.user);

    return (
        <SidebarGroup>
            <SidebarGroupLabel className="text-[#898781]">Projects</SidebarGroupLabel>

            <SidebarGroupContent>
                <SidebarMenu>
                    {user && (
                        <Collapsible defaultOpen className="group/collapsible">
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <AnimateIcon animateOnHover asChild>
                                        <SidebarMenuButton className="text-[#52514e] dark:text-[#c3c2b7]">
                                            <Folder />

                                            <span className="truncate">My Projects</span>

                                            <ChevronRight className="ml-auto size-4 shrink-0 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </AnimateIcon>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {/* Published */}
                                        <SidebarMenuSubItem>
                                            <AnimateIcon animateOnHover asChild>
                                                <SidebarMenuSubButton className="text-[#52514e] dark:text-[#c3c2b7]">
                                                    <span>Published</span>
                                                </SidebarMenuSubButton>
                                            </AnimateIcon>
                                        </SidebarMenuSubItem>

                                        {/* Drafts */}
                                        <SidebarMenuSubItem>
                                            <AnimateIcon animateOnHover asChild>
                                                <SidebarMenuSubButton className="text-[#52514e] dark:text-[#c3c2b7]">
                                                    <span>Drafts</span>

                                                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                                                        3
                                                    </span>
                                                </SidebarMenuSubButton>
                                            </AnimateIcon>
                                        </SidebarMenuSubItem>

                                        {/* Archived */}
                                        <SidebarMenuSubItem>
                                            <AnimateIcon animateOnHover asChild>
                                                <SidebarMenuSubButton className="text-[#52514e] dark:text-[#c3c2b7]">
                                                    <span>Archived</span>
                                                </SidebarMenuSubButton>
                                            </AnimateIcon>
                                        </SidebarMenuSubItem>

                                        {/* Trash */}
                                        <SidebarMenuSubItem>
                                            <AnimateIcon animateOnHover asChild>
                                                <SidebarMenuSubButton className="text-[#52514e] dark:text-[#c3c2b7]">
                                                    <Trash2 className="text-[#52514e] dark:text-[#c3c2b7]" />

                                                    <span>Trash</span>
                                                </SidebarMenuSubButton>
                                            </AnimateIcon>
                                        </SidebarMenuSubItem>
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    )}

                    {/* ------------------------------------------------ */}
                    {/* Categories                                      */}
                    {/* ------------------------------------------------ */}

                    <Collapsible defaultOpen={pathname.startsWith('/projects')} className="group/collapsible">
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <AnimateIcon animateOnHover asChild>
                                    <SidebarMenuButton className="text-[#52514e] dark:text-[#c3c2b7]">
                                        <LayoutDashboard />

                                        <span>Categories</span>

                                        <ChevronRight className="ml-auto size-4 shrink-0 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </AnimateIcon>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                <SidebarMenu className="ml-3.5 pr-2 border-l border-sidebar-border pl-2.5">
                                    {/* -------------------------------- */}
                                    {/* All Projects                     */}
                                    {/* -------------------------------- */}

                                    <SidebarMenuItem>
                                        <AnimateIcon animateOnHover asChild>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={pathname === '/projects'}
                                                className="text-[#52514e] dark:text-[#c3c2b7]"
                                            >
                                                <Link href="/projects">
                                                    <ProjectIcon />

                                                    <span className="truncate">All Projects</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </AnimateIcon>
                                    </SidebarMenuItem>

                                    {/* -------------------------------- */}
                                    {/* Project Categories               */}
                                    {/* -------------------------------- */}

                                    {/* Only this list waits for the API; the rest of the sidebar and the page render immediately. */}
                                    <Suspense fallback={<CategoryListSkeleton />}>
                                        <CategoryList categoriesPromise={categoriesPromise} />
                                    </Suspense>
                                </SidebarMenu>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

function CategoryList({ categoriesPromise }: { categoriesPromise: Promise<ProjectCategoryTree[]> }) {
    const pathname = usePathname();
    // Suspends until the server finishes streaming the categories.
    const categories = use(categoriesPromise);

    return (
        <>
            {categories.map((category) => {
                const categoryPath = `/projects/${category.slug}`;

                const isOpen =
                    pathname === categoryPath || pathname.startsWith(`${categoryPath}/`);

                const isCategoryActive = pathname === categoryPath;

                return (
                    <Collapsible
                        key={category.slug}
                        defaultOpen={isOpen}
                        className="group/collapsible"
                    >
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <AnimateIcon animateOnHover asChild>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCategoryActive}
                                        className="text-[#52514e] dark:text-[#c3c2b7]"
                                    >
                                        <Link href={categoryPath}>
                                            <CategoryIcon icon={category.icon} />

                                            <span className="min-w-0 truncate">
                                                {category.title}
                                            </span>

                                            <ChevronRight className="ml-auto size-4 shrink-0 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90" />
                                        </Link>
                                    </SidebarMenuButton>
                                </AnimateIcon>
                            </CollapsibleTrigger>

                            {/* Sub Categories */}
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {category.subCategories.map((subCategory) => {
                                        const subCategoryPath = `${categoryPath}/${subCategory.slug}`;

                                        const isActive =
                                            pathname === subCategoryPath ||
                                            pathname.startsWith(`${subCategoryPath}/`);

                                        return (
                                            <SidebarMenuSubItem key={subCategory.slug}>
                                                <AnimateIcon animateOnHover asChild>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={isActive}
                                                        className="text-[#52514e] dark:text-[#c3c2b7]"
                                                    >
                                                        <Link href={subCategoryPath}>
                                                            <span className="truncate">
                                                                {subCategory.title}
                                                            </span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </AnimateIcon>
                                            </SidebarMenuSubItem>
                                        );
                                    })}
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                );
            })}
        </>
    );
}

// Fixed widths, not random: the fallback is server-rendered, so random values
// would differ at hydration. 8 rows match the real list so nothing jumps.
const SKELETON_WIDTHS = ['72%', '84%', '60%', '78%', '88%', '66%', '56%', '80%'];

function CategoryListSkeleton() {
    return (
        <>
            {SKELETON_WIDTHS.map((width, index) => (
                <SidebarMenuItem key={index} aria-hidden="true">
                    <div className="flex h-8 items-center gap-2 rounded-md px-2">
                        <Skeleton className="size-4 shrink-0 rounded-md" />
                        <Skeleton className="h-4" style={{ width }} />
                    </div>
                </SidebarMenuItem>
            ))}
        </>
    );
}
