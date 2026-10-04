import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Project } from '@/mock-data/projects';

interface ProjectCardProps {
    project: Project;
    /** Grid cha (masonry) truyền span/style riêng cho từng card qua đây */
    className?: string;
    style?: React.CSSProperties;
}

// Item of GET /api/projects (data.items[]); only the fields the card reads.
interface ApiListItem {
    shortDescription: string;
    thumbnailUrl: string | null;
    category: { slug: string; title: string };
    subCategory: { slug: string; title: string };
    owner: { displayName: string; avatarUrl: string | null };
}

/** Chips past this many collapse into a `+N`, matching the home hero artifact card. */
const VISIBLE_STACK = 3;

export default function ProjectCard({ project, className, style }: ProjectCardProps) {
    // GET /api/projects items use nested objects and different names from the mock Project type.
    // The mock fields stay as fallbacks because the list action falls back to mock data when BE is down.
    const item = project as Project & Partial<ApiListItem>;
    const owner = item.owner;
    const ownerName = owner?.displayName || item.author?.name || 'Unknown owner';
    const thumbnail = item.thumbnailUrl ?? item.thumbnail;
    const categorySlug = item.category?.slug ?? item.categorySlug;
    const subCategorySlug = item.subCategory?.slug ?? item.subCategorySlug;
    const subCategoryTitle = item.subCategory?.title ?? item.subCategoryTitle;
    const description = item.shortDescription ?? item.description;

    return (
        <Link
            // The detail page is addressed by slug but loads the project by id, so the id rides along.
            href={`/projects/${categorySlug}/${subCategorySlug}/${project.slug}?id=${project.id}`}
            style={style}
            className={`group/card block overflow-hidden rounded bg-card ring-1 ring-foreground/10 shadow-[0_20px_60px_-30px_rgba(30,25,20,0.35)] transition-shadow duration-300 hover:shadow-[0_28px_70px_-30px_rgba(30,25,20,0.45)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)] ${className ?? ''}`}
        >
            {/* COVER — `aspect-video` rather than a fixed height so it scales with
                the masonry's own flex-basis span instead of letterboxing wide cards. */}
            <div className="relative aspect-video overflow-hidden border-b border-foreground/10 bg-primary/10">
                {thumbnail && (
                    <Image
                        src={thumbnail}
                        alt={project.title}
                        fill
                        // BE-hosted files (MinIO) skip the optimizer, so no remotePatterns entry is needed.
                        unoptimized={!!item.thumbnailUrl}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.05]"
                    />
                )}

                {project.featured && (
                    <span className="absolute left-3 top-3 rounded bg-primary px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground">
                        Featured
                    </span>
                )}
            </div>

            {/* META */}
            <div className="px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
                <div className="flex items-baseline justify-between gap-3">
                    <h3 className="line-clamp-1 text-base font-semibold tracking-tight sm:text-lg">
                        {project.title}
                    </h3>

                    <span className="shrink-0 font-mono text-[11px] tracking-tight text-muted-foreground">
                        {subCategoryTitle}
                    </span>
                </div>

                <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground">{description}</p>

                {/* STACK — mono chips, the rest collapsed into a count */}
                <ul className="mt-4 flex flex-wrap items-center gap-2">
                    {project.techStack.slice(0, VISIBLE_STACK).map((tech) => (
                        <li
                            key={tech}
                            className="rounded border border-foreground/10 px-2 py-1 font-mono text-[11px] leading-none text-muted-foreground"
                        >
                            {tech}
                        </li>
                    ))}

                    {project.techStack.length > VISIBLE_STACK && (
                        <li className="font-mono text-[11px] leading-none text-muted-foreground/70">
                            +{project.techStack.length - VISIBLE_STACK}
                        </li>
                    )}
                </ul>
            </div>

            {/* FOOTER — who made it, and the way in */}
            <div className="flex items-center justify-between gap-3 border-t border-foreground/10 px-4 py-3 sm:px-5">
                <span className="flex min-w-0 items-center gap-2.5">
                    <span className="relative size-5 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-foreground/10">
                        {owner?.avatarUrl ? (
                            // unoptimized: the avatar can live on any host, none of which is in images.remotePatterns.
                            <Image src={owner.avatarUrl} alt="" fill sizes="20px" unoptimized className="object-cover" />
                        ) : (
                            <span
                                aria-hidden
                                className="flex size-full items-center justify-center text-[10px] font-medium uppercase text-muted-foreground"
                            >
                                {ownerName[0]}
                            </span>
                        )}
                    </span>

                    <span className="truncate font-mono text-[11px] tracking-tight text-muted-foreground">
                        {ownerName}
                    </span>
                </span>

                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-hover/card:text-foreground" />
            </div>
        </Link>
    );
}
