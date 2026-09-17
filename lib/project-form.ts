import { z } from 'zod';
import type { CreateProjectPayload, TagItem } from '@/services/project-service';

// Limits agreed with BE for POST /api/projects (CreateProjectRequest). FE mirrors them so
// errors show next to the field instead of coming back as a 400.
// The slug is not here on purpose: BE generates it from the title.
export const TITLE_MIN = 3;
export const TITLE_MAX = 180;
export const SHORT_DESCRIPTION_MIN = 20;
export const SHORT_DESCRIPTION_MAX = 500;
export const DESCRIPTION_MIN = 100;
export const DESCRIPTION_MAX = 50_000;
export const DEMO_URL_MAX = 500;
export const GITHUB_URL_MAX = 500;
export const TECH_STACK_MAX_ITEMS = 20;
export const TECH_STACK_ITEM_MAX = 60;
export const FEATURES_MAX_ITEMS = 30;
export const FEATURE_ITEM_MAX = 200;
export const TAGS_MAX = 10;

// https://github.com/owner/repo, optionally with a trailing slash or .git
export const GITHUB_REPO_PATTERN = /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9-]+\/[A-Za-z0-9._-]+?(\.git)?\/?$/;

// Suggestions carried over from the old create form (ref/CreateForm.tsx).
export const TECH_STACK_SUGGESTIONS = [
    'Next.js',
    'React',
    'TypeScript',
    'Tailwind CSS',
    'Node.js',
    'Express',
    'NestJS',
    'MongoDB',
    'PostgreSQL',
    'Redis',
    'Socket.io',
    'GraphQL',
] as const;

export const FEATURE_SUGGESTIONS = [
    'User Authentication',
    'Dark Mode',
    'File Upload',
    'Real-time Chat',
    'Responsive Design',
    'Payment Gateway',
    'Admin Dashboard',
    'Email Notifications',
    'Search Functionality',
    'Multi-language Support',
] as const;

// Case-insensitive, keeps the first spelling the user typed.
export function uniqueItems(items: string[]) {
    const seen = new Set<string>();
    return items.filter((item) => {
        const key = item.trim().toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

export const projectFormSchema = z.object({
    // Only used to filter the sub-category list; the server derives it from subCategoryId.
    categoryId: z.string(),
    subCategoryId: z.string().uuid({ message: 'Choose a sub-category' }),
    title: z
        .string()
        .trim()
        .min(TITLE_MIN, { message: `Title must be at least ${TITLE_MIN} characters` })
        .max(TITLE_MAX, { message: `Title must be at most ${TITLE_MAX} characters` }),
    shortDescription: z
        .string()
        .trim()
        .min(SHORT_DESCRIPTION_MIN, { message: `Short description must be at least ${SHORT_DESCRIPTION_MIN} characters` })
        .max(SHORT_DESCRIPTION_MAX, { message: `Short description must be at most ${SHORT_DESCRIPTION_MAX} characters` }),
    description: z
        .string()
        .trim()
        .min(DESCRIPTION_MIN, { message: `Description must be at least ${DESCRIPTION_MIN} characters` })
        .max(DESCRIPTION_MAX, { message: `Description must be at most ${DESCRIPTION_MAX} characters` }),
    demoUrl: z.union([
        z.literal(''),
        z
            .string()
            .trim()
            .max(DEMO_URL_MAX, { message: `Link must be at most ${DEMO_URL_MAX} characters` })
            .regex(/^https?:\/\/\S+$/, { message: 'Enter a link that starts with http:// or https://' }),
    ]),
    // Optional: a public repo link lets Fiurozz read the project's source.
    githubUrl: z.union([
        z.literal(''),
        z
            .string()
            .trim()
            .max(GITHUB_URL_MAX, { message: `Link must be at most ${GITHUB_URL_MAX} characters` })
            .regex(GITHUB_REPO_PATTERN, { message: 'Enter a repository link like https://github.com/owner/repo' }),
    ]),
    techStack: z
        .array(z.string().trim().min(1).max(TECH_STACK_ITEM_MAX))
        .max(TECH_STACK_MAX_ITEMS, { message: `Add at most ${TECH_STACK_MAX_ITEMS} technologies` }),
    features: z
        .array(z.string().trim().min(1).max(FEATURE_ITEM_MAX))
        .max(FEATURES_MAX_ITEMS, { message: `Add at most ${FEATURES_MAX_ITEMS} features` }),
    // Whole tag objects so the chips can show names; only the ids are sent.
    tags: z
        .array(z.object({ id: z.string().uuid(), slug: z.string(), displayName: z.string() }))
        .max(TAGS_MAX, { message: `Choose at most ${TAGS_MAX} tags` }),
});

export type ProjectFormData = z.infer<typeof projectFormSchema>;

export type ProjectFormErrors = Partial<Record<keyof ProjectFormData, string>>;

export const EMPTY_PROJECT_FORM: ProjectFormData = {
    categoryId: '',
    subCategoryId: '',
    title: '',
    shortDescription: '',
    description: '',
    demoUrl: '',
    githubUrl: '',
    techStack: [],
    features: [],
    tags: [] as TagItem[],
};

export function toCreateProjectPayload(data: ProjectFormData): CreateProjectPayload {
    return {
        subCategoryId: data.subCategoryId,
        title: data.title,
        shortDescription: data.shortDescription,
        description: data.description,
        // Optional links are left out when empty: BE rejects "".
        ...(data.demoUrl ? { demoUrl: data.demoUrl } : {}),
        ...(data.githubUrl ? { githubUrl: data.githubUrl } : {}),
        techStack: uniqueItems(data.techStack),
        features: uniqueItems(data.features),
        tagIds: data.tags.map((tag) => tag.id),
    };
}

export function getFieldErrors(error: z.ZodError): ProjectFormErrors {
    const fieldErrors: ProjectFormErrors = {};
    error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ProjectFormErrors;
        // Keep the first message per field (e.g. an item error inside techStack).
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    });
    return fieldErrors;
}

// BE puts per-field validation messages in the envelope's `errors` object. Its exact shape
// is still an open question for BE, so accept either a string or a list of strings.
const SERVER_FIELD_MAP: Record<string, keyof ProjectFormData> = {
    subCategoryId: 'subCategoryId',
    title: 'title',
    shortDescription: 'shortDescription',
    description: 'description',
    demoUrl: 'demoUrl',
    githubUrl: 'githubUrl',
    techStack: 'techStack',
    features: 'features',
    tagIds: 'tags',
};

export function getServerFieldErrors(errors: unknown): ProjectFormErrors {
    const fieldErrors: ProjectFormErrors = {};
    if (!errors || typeof errors !== 'object') return fieldErrors;

    Object.entries(errors as Record<string, unknown>).forEach(([serverField, value]) => {
        const field = SERVER_FIELD_MAP[serverField.split(/[.[]/)[0]];
        const message = Array.isArray(value) ? value[0] : value;
        if (field && typeof message === 'string' && !fieldErrors[field]) {
            fieldErrors[field] = message;
        }
    });
    return fieldErrors;
}
