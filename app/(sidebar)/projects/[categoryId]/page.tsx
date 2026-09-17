import { notFound } from 'next/navigation';
import Projects from '@/views/Projects';
import { PAGE_SIZE } from '@/lib/constanst';
import { projectService } from '@/services/project-service';

interface CategoryPageProps {
    params: Promise<{ categoryId: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { categoryId } = await params;

    // Same cached request the sidebar makes, so this does not hit the API twice.
    const categories = await projectService.getCategories();
    const category = categories.find((c) => c.slug === categoryId);

    if (!category) {
        notFound();
    }

    const { items, nextCursor, hasMore } = await projectService.getProjects({
        cursor: null,
        limit: PAGE_SIZE,
        categorySlug: category.slug,
    });

    return (
        <Projects
            key={category.slug}
            categorySlug={category.slug}
            initialProjects={items}
            initialCursor={nextCursor}
            initialHasMore={hasMore}
        />
    );
}

// Pre-render all category pages at build time (SSG).
// If the API is unreachable during the build this is empty and pages render on demand.
export async function generateStaticParams() {
    const categories = await projectService.getCategories();
    return categories.map((cat) => ({ categoryId: cat.slug }));
}
