import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { getProjectByIdAction } from '@/actions/projects-action';
import type { Project as ProjectData } from '@/mock-data/projects';
import Project from '@/views/Project';

interface ProjectPageProps {
    params: Promise<{ categoryId: string; subCategoryId: string; projectSlug: string }>;
    searchParams: Promise<{ id?: string }>;
}

// The URL carries the slug (readable); the API wants the project's UUID, which the links put in `?id=`.
type ApiProject = ProjectData & {
    shortDescription?: string;
    category?: { slug: string };
    subCategory?: { slug: string };
};

// generateMetadata and the page both need it; cache() makes that a single request per render.
const getProject = cache(async (id?: string) => {
    if (!id) return null;

    const result = await getProjectByIdAction(id);
    return result.success ? (result.data as ApiProject | null) : null;
});

export async function generateMetadata({ searchParams }: ProjectPageProps): Promise<Metadata> {
    const project = await getProject((await searchParams).id);

    if (!project) {
        return { title: 'Project Not Found' };
    }

    return {
        title: project.title,
        description: project.shortDescription ?? project.description,
    };
}

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
    const { categoryId, subCategoryId, projectSlug } = await params;
    const project = await getProject((await searchParams).id);

    // The slugs in the URL must describe the project the id points at.
    if (
        !project ||
        project.slug !== projectSlug ||
        project.category?.slug !== categoryId ||
        project.subCategory?.slug !== subCategoryId
    ) {
        notFound();
    }

    return <Project project={project} />;
}
