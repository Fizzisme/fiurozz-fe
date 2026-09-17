import * as React from 'react';

import ProjectsBreadcrumb from '@/components/ui/project/projects-breadcrumb';
import { projectService } from '@/services/project-service';

interface ProjectsLayoutProps {
    children: React.ReactNode;
}

export default function ProjectsLayout({ children }: ProjectsLayoutProps) {
    // Not awaited: the breadcrumb resolves it inside Suspense, so the page is never blocked.
    const categoriesPromise = projectService.getCategories();

    return (
        <div className="w-full px-4 sm:px-8 md:pl-8 md:pr-4 lg:pl-12 lg:pr-6 pb-6">
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <ProjectsBreadcrumb categoriesPromise={categoriesPromise} />
            </header>

            {children}
        </div>
    );
}
