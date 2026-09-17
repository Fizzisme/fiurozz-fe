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
    async createProject(payload: CreateProjectPayload): Promise<ApiEnvelope<Project | null>> {
        try {
            // TODO: real url
            return await apiClient.post<Project>('/api/projects', payload);
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

    // Publishing is where the author decides who can see the project (agreed with BE).
    async publishProject(id: string, visibility: ProjectVisibility): Promise<ApiEnvelope<Project | null>> {
        try {
            // TODO: real url, pending BE's answer on the publish endpoint
            return await apiClient.post<Project>(`/api/projects/${id}/publish`, { visibility });
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
