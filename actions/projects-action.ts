'use server';

import { gatewayClient, ApiError } from '@/services/gateway-client';
import {
    fetchProjectsCursorPage as fetchMockProjectsCursorPage,
    getProjectBySlug as getMockProjectBySlug,
    type ProjectsCursorPage,
    type GetProjectsCursorParams, Project,
} from '@/mock-data/projects';
import type { ProjectCategoryTree } from '@/services/project-service';


const EMPTY_PAGE: ProjectsCursorPage = { items: [], nextCursor: null, hasMore: false };

export async function getProjectsCursorPageAction(
    params: GetProjectsCursorParams = {},
): Promise<ProjectsCursorPage> {
    try {
        // TODO: real url
        const envelope = await gatewayClient.get<ProjectsCursorPage>('/projects', {
            query: {
                cursor: params.cursor ?? undefined,
                limit: params.limit,
                categorySlug: params.categorySlug ?? undefined,
                subCategorySlug: params.subCategorySlug ?? undefined,
            },
        });

        return envelope.data ?? EMPTY_PAGE;
    } catch (error) {

        if (error instanceof ApiError && error.payload) {
            const envelope = error.payload as { data?: ProjectsCursorPage };
           return envelope.data ?? EMPTY_PAGE;


        }

        // MockData
        return fetchMockProjectsCursorPage(params);
    }
}

export async function getProjectBySlugAction(slug: string): Promise<Project | null> {
    try {
        // TODO: check real url
        const envelope = await gatewayClient.get<Project>(`/projects/${slug}`);
        return envelope.data ?? null;
    } catch (error) {
        if (error instanceof ApiError && error.payload) {
            const envelope = error.payload as { data?: Project | null };
            return envelope.data ?? null;
        }

        return getMockProjectBySlug(slug) ?? null;
    }
}
// Seed-like data that almost never changes, so keep it out of the per-render path.
const CATEGORY_REVALIDATE_SECONDS = 3600;

// The API serves the whole category → sub-category tree in a single call.
export async function getProjectCategoryTreeAction(): Promise<ProjectCategoryTree[]> {
    try {
        const envelope = await gatewayClient.get<{ items: ProjectCategoryTree[] }>('/api/projects/categories/tree', {
            next: { revalidate: CATEGORY_REVALIDATE_SECONDS },
        });

        return envelope.data?.items ?? [];
    } catch {
        return [];
    }
}
