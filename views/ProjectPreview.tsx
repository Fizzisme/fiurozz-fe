'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import ImageGallery, { getGalleryMedia } from '@/components/ui/project/image-gallery';
import AuthorCard from '@/components/ui/project/author-card';
import ProjectTabs from '@/components/ui/project/project-tabs';
import PreviewToolbar from '@/components/ui/project/preview-toolbar';
import { Input } from '@/components/ui/global/input';
import { Textarea } from '@/components/ui/global/textarea';
import type { Project } from '@/mock-data/projects';
import { projectService, type ProjectVisibility } from '@/services/project-service';
import { DESCRIPTION_MAX, TITLE_MAX } from '@/lib/project-form';

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

// Preview of the author's draft, laid out like views/Project.tsx.
// Edit mode is UI-only for now: changes stay in local state and Save is not wired to the API
// until BE settles UpdateProjectRequest / ProjectResponse.
// The page (server component) fetches the draft and passes it in; `loadError` is set instead
// of `project` when that fetch failed.
export default function ProjectPreview({ project, loadError }: { project: Project | null; loadError?: string }) {
    const router = useRouter();

    const [isEditing, setIsEditing] = React.useState(false);
    const [form, setForm] = React.useState({ title: project?.title ?? '', description: project?.description ?? '' });

    const [visibility, setVisibility] = React.useState<ProjectVisibility>('PUBLIC');
    const [publishError, setPublishError] = React.useState('');
    const [isPublishing, setIsPublishing] = React.useState(false);

    if (loadError || !project) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground">
                <p>{loadError ?? 'Could not load this project'}</p>
                <Link href="/projects" className="text-sm font-medium text-foreground hover:underline">
                    Back to projects
                </Link>
            </div>
        );
    }

    const galleryMedia = getGalleryMedia(project);

    // BE returns the owner as a nested object; avatarUrl is null until the owner sets one,
    // and AuthorCard then falls back to initials.
    const owner = (project as Project & { owner?: { id: string; displayName: string; avatarUrl: string | null } })
        .owner;
    const ownerName = owner?.displayName || 'Unknown owner';

    const isDirty = form.title !== project.title || form.description !== project.description;

    const handlePublish = async () => {
        setPublishError('');

        // `version` feeds If-Match. The mock Project type has no such field, hence the local shape.
        const { version } = project as Project & { version?: number };
        if (version === undefined) {
            setPublishError('This project has no version yet. Reload the page and try again.');
            return;
        }

        setIsPublishing(true);
        const result = await projectService.publishProject(project.id, version, visibility);
        setIsPublishing(false);

        if (!result.success || !result.data) {
            if ((result as { code?: string }).code === 'PROJECT_STALE_VERSION') {
                // Edited elsewhere: refetch the draft (new version) and let the author decide again.
                router.refresh();
                setPublishError('This project changed somewhere else. We reloaded it; press Publish again if it looks right.');
                return;
            }
            setPublishError(result.message ?? 'Could not publish the project');
            return;
        }

        // Published response uses the nested category / subCategory objects.
        const published = result.data as Project & { category?: { slug: string }; subCategory?: { slug: string } };
        router.push(
            `/projects/${published.category?.slug}/${published.subCategory?.slug}/${published.slug}?id=${published.id}`,
        );
    };

    return (
        <div>
            {/* ============================================================ */}
            {/* TOOLBAR (full width, pinned to the top)                       */}
            {/* ============================================================ */}

            <PreviewToolbar
                title={form.title}
                isEditing={isEditing}
                onToggleEdit={() => setIsEditing((prev) => !prev)}
                canSave={isDirty}
                // TODO: call the update endpoint once BE settles UpdateProjectRequest.
                onSave={() => {}}
                visibility={visibility}
                onVisibilityChange={setVisibility}
                onPublish={handlePublish}
                isPublishing={isPublishing}
            />

            <div className="container mx-auto max-w-5xl px-4 pt-8 lg:px-0">
                {publishError && (
                    <p role="alert" className="mb-6 text-sm text-destructive">
                        {publishError}
                    </p>
                )}

                {/* ============================================================ */}
                {/* HEADER, MEDIA, AUTHOR                                         */}
                {/* ============================================================ */}

                <header className="mb-8">
                    {isEditing ? (
                        <>
                            <Input
                                aria-label="Title"
                                name="title"
                                autoComplete="off"
                                maxLength={TITLE_MAX}
                                value={form.title}
                                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                                placeholder="Project title"
                                className="mb-2 h-auto text-2xl font-bold md:text-3xl"
                            />
                            <Textarea
                                aria-label="Description"
                                name="description"
                                rows={4}
                                maxLength={DESCRIPTION_MAX}
                                value={form.description}
                                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe your project"
                                className="text-sm md:text-base"
                            />
                        </>
                    ) : (
                        <>
                            {/* anywhere: a long unbroken string wraps instead of widening the page */}
                            <h1 className="mb-2 text-2xl font-bold [overflow-wrap:anywhere] md:text-3xl">{form.title}</h1>
                            <p className="text-sm text-gray-500 [overflow-wrap:anywhere] md:text-base">{form.description}</p>
                        </>
                    )}
                </header>

                {(galleryMedia.length > 0 || project.thumbnail) && (
                    // Keyed so the gallery resets its internal order if the media change.
                    <ImageGallery
                        key={galleryMedia.length > 0 ? galleryMedia.map((m) => m.url).join('|') : project.thumbnail}
                        media={galleryMedia.length > 0 ? galleryMedia : undefined}
                        thumbnail={project.thumbnail}
                        images={project.images}
                        title={project.title}
                    />
                )}

                <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex">
                        <AuthorCard name={ownerName} avatar={owner?.avatarUrl ?? undefined} />
                        <div className="ml-2 grid flex-1 text-left text-lg leading-tight">
                            <span className="truncate font-semibold">{ownerName}</span>
                            <span className="truncate text-xs text-[#6a7282]">Project owner</span>
                        </div>
                    </div>
                </div>
            </div>

            <ProjectTabs project={project} showComments={false} />
        </div>
    );
}
