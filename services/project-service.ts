import type { GetProjectsCursorParams, Project, ProjectsCursorPage } from '@/mock-data/projects';
import {
    getProjectBySlugAction,
    getProjectCategoryTreeAction,
    getProjectsCursorPageAction,
} from '@/actions/projects-action';
import { apiClient, ApiEnvelope, ApiError } from '@/services/client';

// Body of POST /api/projects, as agreed with BE (CreateProjectRequest).
// Owner comes from the gateway's X-User-Id, BE generates the slug from the title,
// and visibility is chosen later, at publish time.
export interface CreateProjectPayload {
    subCategoryId: string;
    title: string;
    shortDescription: string;
    description: string;
    /** Omitted when empty: BE rejects "". */
    demoUrl?: string;
    /** Public repository link, so the source can be read. Omitted when empty. */
    githubUrl?: string;
    techStack: string[];
    features: string[];
    tagIds: string[];
}

// Files sent next to the JSON part: 3-5 images (required) and at most one video.
export interface CreateProjectMedia {
    images: File[];
    video?: File;
}

export type ProjectVisibility = 'PUBLIC' | 'UNLISTED' | 'PRIVATE';

// Shape returned by GET /api/projects/tags (data.items[]).
export interface TagItem {
    id: string;
    slug: string;
    displayName: string;
}

// Shapes returned by GET /api/projects/categories and .../{id}/subcategories.
export interface ProjectCategoryItem {
    id: string;
    key: string;
    slug: string;
    title: string;
    icon: string | null;
    sortOrder: number;
}

export interface ProjectSubCategoryItem {
    id: string;
    categoryId: string;
    key: string;
    slug: string;
    title: string;
    sortOrder: number;
}

export interface ProjectCategoryTree extends ProjectCategoryItem {
    subCategories: ProjectSubCategoryItem[];
}

// Turns a thrown request into the same envelope shape the BE returns.
function toFailedEnvelope(error: unknown): ApiEnvelope<null> {
    if (error instanceof ApiError && error.payload) {
        return error.payload as ApiEnvelope<null>;
    }

    return {
        success: false,
        timestamp: new Date().toISOString(),
        message: 'Cannot connect to server',
        data: null,
    };
}

// The draft endpoints below have no mock fallback: faking a saved project would be a lie.
export const projectService = {

    async getProjects(params: GetProjectsCursorParams = {}): Promise<ProjectsCursorPage> {
        return getProjectsCursorPageAction(params);
    },

    async getProjectBySlug(slug: string): Promise<Project | null> {
        return getProjectBySlugAction(slug);
    },

    // Creates the project as a draft; it stays private until publishProject.
    // multipart/form-data: append order is display order, images[0] becomes the thumbnail.
    async createProject(
        payload: CreateProjectPayload,
        media: CreateProjectMedia,
    ): Promise<ApiEnvelope<Project | null>> {
        try {
            const form = new FormData();
            // Must be a JSON Blob: a plain string part is text/plain and BE answers 415.
            form.append('project', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
            media.images.forEach((file) => form.append('images', file));
            if (media.video) form.append('video', media.video);

            // No Content-Type here: the browser adds it together with the boundary.
            return await apiClient.post<Project>('/api/projects', form);
        } catch (error) {
            return toFailedEnvelope(error);
        }
    },

    async getProjectById(id: string): Promise<ApiEnvelope<Project | null>> {
        try {
            // TODO: real url
            return await apiClient.get<Project>(`/api/projects/${id}`);
        } catch (error) {
            return toFailedEnvelope(error);
        }
    },

    // DRAFT -> PUBLISHED (ref/PUBLISH_PROJECT_API_CONTRACT.md). BE does optimistic locking with
    // `If-Match: "<version>"` (quotes required) and answers 412 PROJECT_STALE_VERSION on a mismatch.
    // Idempotent for the current version, so a retry is safe.
    // The `{ visibility }` body is NOT in that contract yet (it says "no body"): FE sends it because
    // the author picks visibility in the toolbar, and BE has to accept it for the choice to apply.
    async publishProject(
        id: string,
        version: number,
        visibility: ProjectVisibility,
    ): Promise<ApiEnvelope<Project | null>> {
        try {
            return await apiClient.post<Project>(
                `/api/projects/${id}/publish`,
                { visibility },
                { headers: { 'If-Match': `"${version}"` } },
            );
        } catch (error) {
            return toFailedEnvelope(error);
        }
    },

    // Only existing ACTIVE tags can be attached; BE has no create-by-name endpoint.
    // Returns null when the request fails, so the picker can tell "no match" from "error".
    async searchTags(query: string): Promise<TagItem[] | null> {
        try {
            const envelope = await apiClient.get<{ items: TagItem[] }>('/api/projects/tags', {
                query: { q: query.trim() || undefined },
            });
            return envelope.data?.items ?? [];
        } catch {
            return null;
        }
    },

    // Sidebar is a Server Component and apiClient's '/api/proxy' base only
    // resolves in the browser, so this goes through a server action instead.
    async getCategories(): Promise<ProjectCategoryTree[]> {
        return getProjectCategoryTreeAction();
    },
};
