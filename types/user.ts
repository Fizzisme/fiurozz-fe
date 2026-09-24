// ============================================================
// USER — the single source of truth for the user domain.
// Mock fixtures, services, actions and components all import from here,
// so there is one shape per concept no matter where the data came from.
// Runtime values that go with these types (OCCUPATION_LABELS, USER_ROLES…)
// live in mock-data/users.ts.
// ============================================================

export type Gender = 'UNKNOWN' | 'MALE' | 'FEMALE' | 'OTHER';

export type Occupation =
    | 'STUDENT'
    | 'FRONTEND_DEVELOPER'
    | 'BACKEND_DEVELOPER'
    | 'FULLSTACK_DEVELOPER'
    | 'MOBILE_DEVELOPER'
    | 'SOFTWARE_ENGINEER'
    | 'DEVOPS_ENGINEER'
    | 'DATA_ENGINEER'
    | 'DATA_ANALYST'
    | 'UI_UX_DESIGNER'
    | 'PRODUCT_MANAGER'
    | 'QA'
    | 'AI_ENGINEER'
    | 'BA'
    | 'OTHER';

// ============================================================
// ENTITY
// ============================================================

/** A user as the directory and profile surfaces know them. */
export interface IUser {
    id: string;

    displayName: string;
    fullName: string | null;

    avatarUrl: string | null;
    coverUrl: string | null;

    email?: string;

    bio: string | null;

    occupation: Occupation | null;

    company: string | null;
    location: string | null;
    website: string | null;

    gender: Gender;

    skills: string[];

    birthday?: string | null;

    createdAt: string;

    /** Denormalized off UserStats — always present on a real response (defaults to 0 server-side). */
    followersCount: number;
    followingCount: number;
}

/**
 * Aggregates the real user-service does NOT return yet (no project or like
 * count exists there). Mock-only decoration for the directory card footer —
 * a real response leaves this undefined.
 */
export interface IUserStats {
    projects: number;
    likes: number;
}

/**
 * IUser plus the directory UI's extras. `stats` is optional because it's
 * mock-only (see above); `isFollowing` is optional because the real
 * user-service doesn't report follow-state on this endpoint yet, only the
 * fixture fills it.
 */
export interface IUserSummary extends IUser {
    stats?: IUserStats;
    isFollowing?: boolean;
}

// ============================================================
// SIGNED-IN ACCOUNT
// The richer view returned by /api/users/me. Shares most of IUser's fields
// but types occupation/gender loosely, since it mirrors the endpoint as-is.
// ============================================================

export interface ISocialLink {
    id: string;
    platform: string;
    title: string | null;
    url: string;
    order: number;
}

export interface IUserSettings {
    isPrivate: boolean;
    showEmail: boolean;
    showBirthday: boolean;
    allowMessage: boolean;
    locale: string;
    theme: string;
}

/**
 * Reuses IUser for the fields that are identical, and overrides the ones
 * that aren't: `/me` always has an email and a birthday (nothing to hide
 * from yourself) and mirrors occupation/gender as loose strings rather
 * than the public endpoint's enums.
 */
export interface ICurrentUser extends Omit<IUser, 'email' | 'occupation' | 'gender' | 'birthday'> {
    email: string;
    occupation: string | null;
    gender: string;
    birthday: string | null;
    language: string;
    timezone: string;
    settings: IUserSettings | null;
    links: ISocialLink[];
}

// ============================================================
// QUERIES / TRANSPORT
// ============================================================

/** Sort order for the user list */
export type UserSort = 'followers' | 'projects' | 'recent' | 'name';

export interface IUsersQueries {
    /** id of the last user loaded, null = start from the beginning */
    cursor?: string | null;
    /** number of items per load */
    limit?: number;
    /** search by name / displayName / role / skill, null|undefined = no filter */
    q?: string | null;
    /** filter by role, null|undefined = all */
    role?: string | null;
    /** filter by skill, null|undefined = all */
    skill?: string | null;
    /** sort order, default 'followers' */
    sort?: UserSort | null;
}

export interface IUsersCursorPage {
    items: IUserSummary[];
    nextCursor: string | null;
    hasMore: boolean;
    total: number;
}

/** POST/DELETE :id/follow response — follow state plus the target's refreshed counts. */
export interface IFollowResult {
    isFollowing: boolean;
    followersCount: number;
    followingCount: number;
}

/**
 * Body for PATCH /api/users/me, mirroring the User Service's UpdateProfileDto.
 * Partial update: omit a field to leave it untouched. Note the DTO has no
 * displayName, links or settings — those are not editable through this endpoint.
 */
export interface IUpdateCurrentUserPayload {
    /** max 150 */
    fullName?: string;
    /** must be a valid URL — an empty string fails validation */
    avatarUrl?: string;
    /** must be a valid URL — an empty string fails validation */
    coverUrl?: string;
    /** max 500 */
    bio?: string;
    occupation?: Occupation;
    /** max 100 */
    company?: string;
    /** max 100 */
    location?: string;
    /** ISO date string */
    birthday?: string;
    /** must be a valid URL — an empty string fails validation */
    website?: string;
    gender?: Gender;
    /** max 10 */
    language?: string;
    /** max 50 */
    timezone?: string;
    /** Replaces the whole list rather than appending: [] clears every skill. Max 20, each max 50. */
    skills?: string[];
}

export type UpdateCurrentUserResult = { ok: true; user: ICurrentUser } | { ok: false; message: string };
