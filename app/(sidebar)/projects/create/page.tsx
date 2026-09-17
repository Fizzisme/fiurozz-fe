import type { Metadata } from 'next';
import CreateProject from '@/views/CreateProject';
import { projectService } from '@/services/project-service';

export const metadata: Metadata = {
    title: 'Create project',
};

export default async function CreateProjectPage() {

    // Same cached request the sidebar makes, so this does not hit the API twice.
    const categories = await projectService.getCategories();

    return <CreateProject categories={categories} />;
}
