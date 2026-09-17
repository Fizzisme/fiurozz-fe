import { Card, CardContent, CardHeader } from '@/components/ui/global/card';
import { Skeleton } from '@/components/ui/global/skeleton';

// Own boundary: without it this route inherits projects/loading.tsx, which is the
// project-grid skeleton and has nothing to do with a form.
// Rows per card mirror views/CreateProject.tsx:
// About the project, Category & tags, Stack & features, Links.
const CARD_FIELD_ROWS = [3, 2, 2, 2];

export default function CreateProjectLoading() {
    return (
        <div className="mx-auto max-w-2xl px-4" aria-busy="true">
            <span className="sr-only" role="status">
                Loading form…
            </span>

            <div className="mb-6 flex items-center justify-between">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-9 w-24" />
            </div>

            <div className="flex flex-col gap-6">
                {CARD_FIELD_ROWS.map((rows, card) => (
                    <Card key={card}>
                        <CardHeader className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-72 max-w-full" />
                        </CardHeader>

                        <CardContent className="space-y-5">
                            {Array.from({ length: rows }).map((_, row) => (
                                <div key={row} className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-9 w-full" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}

                <Skeleton className="h-9 w-full" />
            </div>
        </div>
    );
}
