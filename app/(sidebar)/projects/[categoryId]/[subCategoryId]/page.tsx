import { notFound } from 'next/navigation';

import Projects from '@/views/Projects';
import { PAGE_SIZE } from '@/lib/constanst';
import { projectService } from '@/services/project-service';

interface SubCategoryPageProps {
    params: Promise<{ categoryId: string; subCategoryId: string }>;
}

export default async function SubCategoryPage({ params }: SubCategoryPageProps) {
    const { categoryId, subCategoryId } = await params;

    // Same cached request the sidebar makes, so this does not hit the API twice.
    const categories = await projectService.getCategories();
    const category = categories.find((c) => c.slug === categoryId);
    const subCategory = category?.subCategories.find((s) => s.slug === subCategoryId);

    if (!category || !subCategory) {
        notFound();
    }

    const { items, nextCursor, hasMore } = await projectService.getProjects({
        cursor: null,
        limit: PAGE_SIZE,
        categorySlug: category.slug,
        subCategorySlug: subCategory.slug,
    });

    return (
        <Projects
            key={`${category.slug}-${subCategory.slug}`}
            categorySlug={category.slug}
            subCategorySlug={subCategory.slug}
            initialProjects={items}
            initialCursor={nextCursor}
            initialHasMore={hasMore}
        />
    );
}

// Pre-render all category x sub-category pages at build time (SSG).
// If the API is unreachable during the build this is empty and pages render on demand.
export async function generateStaticParams() {
    const categories = await projectService.getCategories();
    return categories.flatMap((cat) =>
        cat.subCategories.map((sub) => ({
            categoryId: cat.slug,
            subCategoryId: sub.slug,
        })),
    );
}
