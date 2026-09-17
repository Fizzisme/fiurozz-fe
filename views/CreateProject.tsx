'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { FolderPlus, Globe, Layers, Shapes } from 'lucide-react';

import { Button } from '@/components/animate-ui/components/buttons/button';
import { Input } from '@/components/ui/global/input';
import { Label } from '@/components/ui/global/label';
import { Textarea } from '@/components/ui/global/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/global/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/global/select';
import { ArrowLeft } from '@/components/animate-ui/icons/arrow-left';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import Github from '@/components/icons/github';
import CategoryIcon from '@/components/ui/project/category-icon';
import ChipInput from '@/components/ui/project/chip-input';
import TagPicker from '@/components/ui/project/tag-picker';
import { projectService, type ProjectCategoryTree } from '@/services/project-service';
import {
    DEMO_URL_MAX,
    DESCRIPTION_MAX,
    DESCRIPTION_MIN,
    EMPTY_PROJECT_FORM,
    FEATURE_ITEM_MAX,
    FEATURE_SUGGESTIONS,
    FEATURES_MAX_ITEMS,
    GITHUB_URL_MAX,
    SHORT_DESCRIPTION_MAX,
    SHORT_DESCRIPTION_MIN,
    TAGS_MAX,
    TECH_STACK_ITEM_MAX,
    TECH_STACK_MAX_ITEMS,
    TECH_STACK_SUGGESTIONS,
    TITLE_MAX,
    TITLE_MIN,
    getFieldErrors,
    getServerFieldErrors,
    projectFormSchema,
    toCreateProjectPayload,
    type ProjectFormData,
    type ProjectFormErrors,
} from '@/lib/project-form';

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

// Error wins over the hint, and both share one id so aria-describedby stays stable.
function FieldMessage({ id, error, hint }: { id: string; error?: string; hint?: string }) {
    if (error) {
        return (
            <p id={id} className="text-xs text-destructive">
                {error}
            </p>
        );
    }

    if (hint) {
        return (
            <p id={id} className="text-xs text-muted-foreground">
                {hint}
            </p>
        );
    }

    return null;
}

function Counter({ current, max }: { current: number; max: number }) {
    return (
        <span className="text-xs text-muted-foreground tabular-nums">
            {current}/{max}
        </span>
    );
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

export default function CreateProject({ categories }: { categories: ProjectCategoryTree[] }) {
    const router = useRouter();

    const [formData, setFormData] = React.useState<ProjectFormData>(EMPTY_PROJECT_FORM);
    const [errors, setErrors] = React.useState<ProjectFormErrors>({});
    const [submitError, setSubmitError] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const subCategories = categories.find((category) => category.id === formData.categoryId)?.subCategories ?? [];

    const handleInputChange = <K extends keyof ProjectFormData>(field: K, value: ProjectFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleCategoryChange = (value: string) => {
        // Sub-category belongs to the old category, so reset it.
        setFormData((prev) => ({ ...prev, categoryId: value, subCategoryId: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');

        const parsed = projectFormSchema.safeParse(formData);
        if (!parsed.success) {
            setErrors(getFieldErrors(parsed.error));
            return;
        }

        setIsSubmitting(true);
        const result = await projectService.createProject(toCreateProjectPayload(parsed.data));
        setIsSubmitting(false);

        if (!result.success || !result.data) {
            // BE validation messages come back per field and land under the matching input.
            const serverErrors = getServerFieldErrors((result as { errors?: unknown }).errors);
            setErrors(serverErrors);
            setSubmitError(
                Object.keys(serverErrors).length > 0
                    ? 'Some fields need attention.'
                    : (result.message ?? 'Could not create the project'),
            );
            return;
        }

        // New projects start as drafts: review them, then publish from the preview.
        router.push(`/projects/preview/${result.data.id}`);
    };

    return (
        <div className="mx-auto max-w-2xl px-4">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-bold text-[#52514e] dark:text-[#c3c2b7]">Create project</h1>
                <Button
                    variant="ghost"
                    asChild
                    className="cursor-pointer text-[#52514e] dark:text-[#c3c2b7]"
                    onClick={() => router.back()}
                >
                    <AnimateIcon animateOnHover className="flex items-center justify-center gap-1">
                        <ArrowLeft />
                        Cancel
                    </AnimateIcon>
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                {/* ============================================================ */}
                {/* ABOUT                                                         */}
                {/* ============================================================ */}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl text-[#52514e] dark:text-[#c3c2b7]">
                            <FolderPlus className="h-5 w-5" />
                            About the project
                        </CardTitle>
                        <CardDescription>This is what people see first on your project page.</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[#52514e] dark:text-[#c3c2b7]">
                                <Label htmlFor="project-title">Title</Label>
                                <Counter current={formData.title.length} max={TITLE_MAX} />
                            </div>
                            <Input
                                id="project-title"
                                name="title"
                                autoComplete="off"
                                maxLength={TITLE_MAX}
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="e.g. Fiurozz"
                                aria-invalid={!!errors.title}
                                aria-describedby="project-title-message"
                            />
                            <FieldMessage
                                id="project-title-message"
                                error={errors.title}
                                hint={`At least ${TITLE_MIN} characters.`}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[#52514e] dark:text-[#c3c2b7]">
                                <Label htmlFor="project-short-description">Short description</Label>
                                <Counter current={formData.shortDescription.length} max={SHORT_DESCRIPTION_MAX} />
                            </div>
                            <Textarea
                                id="project-short-description"
                                name="shortDescription"
                                rows={2}
                                maxLength={SHORT_DESCRIPTION_MAX}
                                value={formData.shortDescription}
                                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                                placeholder="e.g. A place for developers to showcase their projects and find their next collaborator."
                                aria-invalid={!!errors.shortDescription}
                                aria-describedby="project-short-description-message"
                            />
                            <FieldMessage
                                id="project-short-description-message"
                                error={errors.shortDescription}
                                hint={`At least ${SHORT_DESCRIPTION_MIN} characters.`}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[#52514e] dark:text-[#c3c2b7]">
                                <Label htmlFor="project-description">Description</Label>
                                <Counter current={formData.description.length} max={DESCRIPTION_MAX} />
                            </div>
                            <Textarea
                                id="project-description"
                                name="description"
                                rows={8}
                                maxLength={DESCRIPTION_MAX}
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="e.g. Fiurozz gives side-project developers a home besides a GitHub repo nobody reads. Publish a project page, browse what other builders are shipping, and connect with people building in your stack."
                                aria-invalid={!!errors.description}
                                aria-describedby="project-description-message"
                            />
                            <FieldMessage
                                id="project-description-message"
                                error={errors.description}
                                hint={`At least ${DESCRIPTION_MIN} characters.`}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* ============================================================ */}
                {/* CATEGORY & TAGS                                               */}
                {/* ============================================================ */}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl text-[#52514e] dark:text-[#c3c2b7]">
                            <Shapes className="h-5 w-5" />
                            Category & tags
                        </CardTitle>
                        <CardDescription>Helps people find your project when they browse.</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2 text-[#52514e] dark:text-[#c3c2b7]">
                                <Label htmlFor="project-category">Category</Label>
                                <Select value={formData.categoryId} onValueChange={handleCategoryChange}>
                                    <SelectTrigger id="project-category" className="w-full cursor-pointer">
                                        <SelectValue placeholder="Choose a category" />
                                    </SelectTrigger>
                                    <SelectContent className="w-[var(--radix-select-trigger-width)]">
                                        {categories.map(({ id, title, icon }) => (
                                            <SelectItem
                                                key={id}
                                                value={id}
                                                className="cursor-pointer text-[#52514e] dark:text-[#c3c2b7]"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <CategoryIcon icon={icon} className="h-4 w-4 text-muted-foreground" />
                                                    {title}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 text-[#52514e] dark:text-[#c3c2b7]">
                                <Label htmlFor="project-sub-category">Sub-category</Label>
                                <Select
                                    value={formData.subCategoryId}
                                    onValueChange={(v) => handleInputChange('subCategoryId', v)}
                                    disabled={subCategories.length === 0}
                                >
                                    <SelectTrigger
                                        id="project-sub-category"
                                        className="w-full cursor-pointer"
                                        aria-invalid={!!errors.subCategoryId}
                                        aria-describedby="project-sub-category-message"
                                    >
                                        <SelectValue
                                            placeholder={formData.categoryId ? 'Choose a sub-category' : 'Pick a category first'}
                                        />
                                    </SelectTrigger>
                                    <SelectContent className="w-[var(--radix-select-trigger-width)]">
                                        {subCategories.map(({ id, title }) => (
                                            <SelectItem
                                                key={id}
                                                value={id}
                                                className="cursor-pointer text-[#52514e] dark:text-[#c3c2b7]"
                                            >
                                                {title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldMessage id="project-sub-category-message" error={errors.subCategoryId} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[#52514e] dark:text-[#c3c2b7]">
                                <Label htmlFor="project-tags">Tags</Label>
                                <Counter current={formData.tags.length} max={TAGS_MAX} />
                            </div>
                            <TagPicker
                                id="project-tags"
                                value={formData.tags}
                                onChange={(next) => handleInputChange('tags', next)}
                                maxItems={TAGS_MAX}
                                invalid={!!errors.tags}
                                describedBy="project-tags-message"
                            />
                            <FieldMessage
                                id="project-tags-message"
                                error={errors.tags}
                                hint="Optional. Pick from existing tags."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* ============================================================ */}
                {/* STACK & FEATURES                                              */}
                {/* ============================================================ */}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl text-[#52514e] dark:text-[#c3c2b7]">
                            <Layers className="h-5 w-5" />
                            Stack & features
                        </CardTitle>
                        <CardDescription>What it is built with and what it can do.</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[#52514e] dark:text-[#c3c2b7]">
                                <Label htmlFor="project-tech-stack">Tech stack</Label>
                                <Counter current={formData.techStack.length} max={TECH_STACK_MAX_ITEMS} />
                            </div>
                            <ChipInput
                                id="project-tech-stack"
                                value={formData.techStack}
                                onChange={(next) => handleInputChange('techStack', next)}
                                maxItems={TECH_STACK_MAX_ITEMS}
                                maxItemLength={TECH_STACK_ITEM_MAX}
                                suggestions={TECH_STACK_SUGGESTIONS}
                                placeholder="e.g. Next.js, TypeScript, Tailwind CSS"
                                invalid={!!errors.techStack}
                                describedBy="project-tech-stack-message"
                            />
                            <FieldMessage id="project-tech-stack-message" error={errors.techStack} hint="Optional." />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[#52514e] dark:text-[#c3c2b7]">
                                <Label htmlFor="project-features">Features</Label>
                                <Counter current={formData.features.length} max={FEATURES_MAX_ITEMS} />
                            </div>
                            <ChipInput
                                id="project-features"
                                value={formData.features}
                                onChange={(next) => handleInputChange('features', next)}
                                maxItems={FEATURES_MAX_ITEMS}
                                maxItemLength={FEATURE_ITEM_MAX}
                                suggestions={FEATURE_SUGGESTIONS}
                                placeholder="e.g. Project showcase, Community feed, Dark mode"
                                invalid={!!errors.features}
                                describedBy="project-features-message"
                            />
                            <FieldMessage id="project-features-message" error={errors.features} hint="Optional." />
                        </div>
                    </CardContent>
                </Card>

                {/* ============================================================ */}
                {/* LINKS                                                         */}
                {/* ============================================================ */}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl text-[#52514e] dark:text-[#c3c2b7]">
                            <Globe className="h-5 w-5" />
                            Links
                        </CardTitle>
                        <CardDescription>Where people can try the project and read its code.</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <div className="space-y-2 text-[#52514e] dark:text-[#c3c2b7]">
                            <Label htmlFor="project-github-url" className="flex items-center gap-1.5">
                                <Github className="h-3.5 w-3.5" /> Repository
                            </Label>
                            <Input
                                id="project-github-url"
                                name="githubUrl"
                                type="url"
                                autoComplete="url"
                                spellCheck={false}
                                maxLength={GITHUB_URL_MAX}
                                value={formData.githubUrl}
                                onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                                placeholder="https://github.com/Fizzisme/Fiurozz_FE"
                                aria-invalid={!!errors.githubUrl}
                                aria-describedby="project-github-url-message"
                            />
                            <FieldMessage
                                id="project-github-url-message"
                                error={errors.githubUrl}
                                hint="Optional. Add a public repository so people can browse the source."
                            />
                        </div>

                        <div className="space-y-2 text-[#52514e] dark:text-[#c3c2b7]">
                            <Label htmlFor="project-demo-url">Live demo</Label>
                            <Input
                                id="project-demo-url"
                                name="demoUrl"
                                type="url"
                                autoComplete="url"
                                maxLength={DEMO_URL_MAX}
                                value={formData.demoUrl}
                                onChange={(e) => handleInputChange('demoUrl', e.target.value)}
                                placeholder="https://fiurozz.com"
                                aria-invalid={!!errors.demoUrl}
                                aria-describedby="project-demo-url-message"
                            />
                            <FieldMessage id="project-demo-url-message" error={errors.demoUrl} hint="Optional." />
                        </div>
                    </CardContent>
                </Card>

                {/* ============================================================ */}
                {/* SUBMIT                                                        */}
                {/* ============================================================ */}

                <div className="space-y-3">
                    {submitError && (
                        <p role="alert" className="text-sm text-destructive">
                            {submitError}
                        </p>
                    )}

                    <p className="text-sm text-muted-foreground">
                        The project is saved as a draft. You choose who can see it when you publish.
                    </p>

                    <Button type="submit" variant="outline" disabled={isSubmitting} className="w-full cursor-pointer">
                        {isSubmitting ? 'Creating draft…' : 'Create draft'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
