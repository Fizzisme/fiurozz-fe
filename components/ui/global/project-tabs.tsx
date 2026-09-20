import Link from 'next/link';
import type { ICurrentUser } from '@/types/user';
import { Briefcase, Mail, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/global/card';
import { Button } from '@/components/ui/global/button';
import { Separator } from '@/components/ui/global/separator';

function DetailRow({ icon: Icon, children }: { icon: typeof Briefcase; children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 text-sm">
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <span>{children}</span>
        </div>
    );
}

// LinkedIn-style nudge card for info the header doesn't have room for and
// the user hasn't filled in yet — common right after a Google/GitHub
// sign-up, where all we really know is name, email, and avatar.
function AddPrompt({ label, description }: { label: string; description: string }) {
    return (
        <div className="flex items-start justify-between gap-3 rounded border border-dashed p-3">
            <div>
                <p className="text-sm font-medium text-[#52514e] dark:text-[#c3c2b7]">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <Button variant="outline" className="shrink-0" asChild>
                <Link href="/profile/edit">
                    <Plus className="mr-1 size-3.5" />
                    Add
                </Link>
            </Button>
        </div>
    );
}

export default function ProjectTabs({ user }: { user: ICurrentUser }) {
    const hasPosition = Boolean(user.occupation || user.company);
    const showEmail = Boolean(user.settings?.showEmail);

    // Header already covers: bio, location, website, joined date, links,
    // following/followers. About only needs what's left over.
    const nothingToShowYet = !hasPosition && !showEmail;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base text-[#52514e] dark:text-[#c3c2b7]">About</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
                {hasPosition ? (
                    <DetailRow icon={Briefcase}>
                        {[user.occupation, user.company].filter(Boolean).join(' at ')}
                    </DetailRow>
                ) : (
                    <AddPrompt
                        label="Add your current position"
                        description="Let people know your title and where you work."
                    />
                )}

                {showEmail && (
                    <>
                        <Separator />
                        <DetailRow icon={Mail}>{user.email}</DetailRow>
                    </>
                )}

                {nothingToShowYet && (
                    <p className="text-xs text-muted-foreground">
                        This section is empty right now — it fills in as you complete your profile.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
