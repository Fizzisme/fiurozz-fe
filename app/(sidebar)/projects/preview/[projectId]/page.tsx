import type { Metadata } from 'next';
import ProjectPreview from '@/views/ProjectPreview';
import { getProjectByIdAction } from '@/actions/projects-action';

export const metadata: Metadata = {
    title: 'Preview project',
};

interface ProjectPreviewPageProps {
    params: Promise<{ projectId: string }>;
}

// Drafts are private: the action forwards the session's accessToken cookie. While it runs,
// loading.tsx next to this file is shown.
export default async function ProjectPreviewPage({ params }: ProjectPreviewPageProps) {
    const { projectId } = await params;
    const result = await getProjectByIdAction(projectId);

    return (
        <ProjectPreview
            project={result.success ? result.data : null}
            loadError={result.success && result.data ? undefined : (result.message ?? 'Could not load this project')}
        />
    );
}
