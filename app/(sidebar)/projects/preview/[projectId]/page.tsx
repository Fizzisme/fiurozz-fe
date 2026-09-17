import type { Metadata } from 'next';
import ProjectPreview from '@/views/ProjectPreview';

export const metadata: Metadata = {
    title: 'Preview project',
};

interface ProjectPreviewPageProps {
    params: Promise<{ projectId: string }>;
}

// Drafts are private, so the view fetches through the browser proxy (which carries the session).
export default async function ProjectPreviewPage({ params }: ProjectPreviewPageProps) {
    const { projectId } = await params;

    return <ProjectPreview projectId={projectId} />;
}
