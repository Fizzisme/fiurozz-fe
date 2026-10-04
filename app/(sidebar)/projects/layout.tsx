import * as React from 'react';

import ProjectsBreadcrumb from '@/components/ui/project/projects-breadcrumb';
import ProjectsShell from '@/components/ui/project/projects-shell';
import { projectService } from '@/services/project-service';

interface ProjectsLayoutProps {
    children: React.ReactNode;
}

export default function ProjectsLayout({ children }: ProjectsLayoutProps) {
    // Not awaited: the breadcrumb resolves it inside Suspense, so the page is never blocked.
    const categoriesPromise = projectService.getCategories();

    return (
        <ProjectsShell breadcrumb={<ProjectsBreadcrumb categoriesPromise={categoriesPromise} />}>
            {children}
        </ProjectsShell>
    );
}
