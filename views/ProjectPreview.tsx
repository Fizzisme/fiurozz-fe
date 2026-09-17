'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';

import ImageGallery from '@/components/ui/project/image-gallery';
import AuthorCard from '@/components/ui/project/author-card';
import ProjectTabs from '@/components/ui/project/project-tabs';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { ArrowLeft } from '@/components/animate-ui/icons/arrow-left';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { Label } from '@/components/ui/global/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/global/select';
import type { Project } from '@/mock-data/projects';
import { projectService, type ProjectVisibility } from '@/services/project-service';

const VISIBILITY_OPTIONS: { value: ProjectVisibility; label: string; hint: string }[] = [
    { value: 'PUBLIC', label: 'Public', hint: 'Anyone can find and open it.' },
    { value: 'UNLISTED', label: 'Unlisted', hint: 'Only people with the link can open it.' },
    { value: 'PRIVATE', label: 'Private', hint: 'Only you can see it.' },
];

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

// Read-only preview of the author's draft, laid out like views/Project.tsx.
// Editing returns once BE settles UpdateProjectRequest / ProjectResponse
// (see the FE <-> BE field report); until then the author reviews and publishes here.
export default function ProjectPreview({ projectId }: { projectId: string }) {
    const router = useRouter();

    const [project, setProject] = React.useState<Project | null>(null);
    const [loadError, setLoadError] = React.useState('');

    const [visibility, setVisibility] = React.useState<ProjectVisibility>('PUBLIC');
    const [publishError, setPublishError] = React.useState('');
    const [isPublishing, setIsPublishing] = React.useState(false);

    React.useEffect(() => {
        let cancelled = false;

        projectService.getProjectById(projectId).then((result) => {
            if (cancelled) return;
            if (!result.success || !result.data) {
                setLoadError(result.message ?? 'Could not load this project');
                return;
            }
            setProject(result.data);
        });

        return () => {
            cancelled = true;
        };
    }, [projectId]);

    if (loadError) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground">
                <p>{loadError}</p>
                <Link href="/projects" className="text-sm font-medium text-foreground hover:underline">
                    Back to projects
                </Link>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
                Loading your project…
            </div>
        );
    }

    const visibilityHint = VISIBILITY_OPTIONS.find((option) => option.value === visibility)?.hint;

    const handlePublish = async () => {
        setPublishError('');

        setIsPublishing(true);
        const result = await projectService.publishProject(project.id, visibility);
        setIsPublishing(false);

        if (!result.success) {
            setPublishError(result.message ?? 'Could not publish the project');
            return;
        }

        const published = result.data ?? project;
        router.push(`/projects/${published.categorySlug}/${published.subCategorySlug}/${published.slug}`);
    };

    return (
        <div className="py-5">
            <div className="container mx-auto max-w-5xl px-4 lg:px-0">
                <Button
                    variant="ghost"
                    asChild
                    className="cursor-pointer !px-0 text-[#52514e] dark:text-[#c3c2b7]"
                    onClick={() => router.back()}
                >
                    <AnimateIcon animateOnHover className="flex items-center justify-center gap-1">
                        <ArrowLeft />
                        Back
                    </AnimateIcon>
                </Button>

                {/* ============================================================ */}
                {/* DRAFT BAR                                                     */}
                {/* ============================================================ */}

                <div className="mb-6 flex flex-col gap-4 rounded border border-foreground/10 bg-card p-4 md:flex-row md:items-end md:justify-between">
                    <div className="flex items-start gap-3">
                        <Eye className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-semibold text-[#52514e] dark:text-[#c3c2b7]">Draft preview</p>
                            <p className="text-xs text-muted-foreground">
                                Only you can see this project until you publish it.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                        <div className="space-y-1 text-[#52514e] dark:text-[#c3c2b7]">
                            <Label htmlFor="preview-visibility" className="text-xs">
                                Who can see it after publishing
                            </Label>
                            <Select
                                value={visibility}
                                onValueChange={(value) => setVisibility(value as ProjectVisibility)}
                                disabled={isPublishing}
                            >
                                <SelectTrigger
                                    id="preview-visibility"
                                    className="w-full cursor-pointer sm:w-40"
                                    aria-describedby="preview-visibility-hint"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="w-[var(--radix-select-trigger-width)]">
                                    {VISIBILITY_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                            className="cursor-pointer text-[#52514e] dark:text-[#c3c2b7]"
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            disabled={isPublishing}
                            onClick={handlePublish}
                            className="cursor-pointer"
                        >
                            {isPublishing ? 'Publishing…' : 'Publish'}
                        </Button>
                    </div>
                </div>

                <p id="preview-visibility-hint" className="-mt-4 mb-6 text-xs text-muted-foreground md:text-right">
                    {visibilityHint}
                </p>

                {publishError && (
                    <p role="alert" className="mb-6 text-sm text-destructive">
                        {publishError}
                    </p>
                )}

                {/* ============================================================ */}
                {/* HEADER, MEDIA, AUTHOR                                         */}
                {/* ============================================================ */}

                <header className="mb-8">
                    <h1 className="mb-2 text-2xl font-bold md:text-3xl">{project.title}</h1>
                    <p className="text-sm text-gray-500 md:text-base">{project.description}</p>
                </header>

                {project.thumbnail && (
                    // Keyed so the gallery resets its internal order if the images change.
                    <ImageGallery
                        key={[project.thumbnail, ...(project.images ?? [])].join('|')}
                        thumbnail={project.thumbnail}
                        images={project.images}
                        title={project.title}
                    />
                )}

                <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex">
                        <AuthorCard
                            name={project.author.name}
                            email={project.author.email}
                            avatar={project.author.avatar}
                        />
                        <div className="ml-2 grid flex-1 text-left text-lg leading-tight">
                            <span className="truncate font-semibold">{project.author.name}</span>
                            <span className="truncate text-xs text-[#6a7282]">{project.author.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            <ProjectTabs project={project} />
        </div>
    );
}
