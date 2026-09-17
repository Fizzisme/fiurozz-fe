'use client';

import * as React from 'react';
import { Suspense, use } from 'react';
import { usePathname } from 'next/navigation';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/global/breadcrumb';
import type { ProjectCategoryTree } from '@/services/project-service';

interface BreadcrumbItemData {
    label: string;
    /** No href = this is the current page (rendered as BreadcrumbPage) */
    href?: string;
}

const ROOT_ITEM: BreadcrumbItemData = { label: "Community's projects", href: '/projects' };

export default function ProjectsBreadcrumb({
    categoriesPromise,
}: {
    categoriesPromise: Promise<ProjectCategoryTree[]>;
}) {
    return (
        // Until the categories arrive, only the root crumb is known.
        <Suspense fallback={<BreadcrumbTrail items={[ROOT_ITEM]} />}>
            <ResolvedBreadcrumb categoriesPromise={categoriesPromise} />
        </Suspense>
    );
}

function ResolvedBreadcrumb({ categoriesPromise }: { categoriesPromise: Promise<ProjectCategoryTree[]> }) {
    const pathname = usePathname();
    const categories = use(categoriesPromise);

    // "/projects/e-commerce/online-store" -> ["e-commerce", "online-store"]
    const segments = pathname
        .replace(/^\/projects\/?/, '')
        .split('/')
        .filter(Boolean);

    const [categorySlug, subCategorySlug] = segments;

    const category = categorySlug ? categories.find((c) => c.slug === categorySlug) : undefined;

    const subCategory =
        category && subCategorySlug ? category.subCategories.find((s) => s.slug === subCategorySlug) : undefined;

    const categoryBreadCrumb = category?.title;
    const subBreadCrumb = subCategory?.title;

    // The last item is always the current page -> no href (BreadcrumbPage)
    const items: BreadcrumbItemData[] = [ROOT_ITEM];

    if (categoryBreadCrumb) {
        items.push({
            label: categoryBreadCrumb,
            // If a sub-category follows -> category stays a link to go back
            // If category is the last item -> no href (it's the current page)
            href: subBreadCrumb ? `/projects/${categorySlug}` : undefined,
        });
    }

    if (subBreadCrumb) {
        items.push({ label: subBreadCrumb });
    }

    return <BreadcrumbTrail items={items} />;
}

function BreadcrumbTrail({ items }: { items: BreadcrumbItemData[] }) {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const isCurrent = isLast || !item.href;

                    return (
                        <React.Fragment key={item.label}>
                            <BreadcrumbItem className={index === 0 ? 'hidden md:block' : undefined}>
                                {isCurrent ? (
                                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                                )}
                            </BreadcrumbItem>

                            {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
