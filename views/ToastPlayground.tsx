'use client';

import { toast } from 'sonner';

import { Button } from '@/components/animate-ui/components/buttons/button';

// Messages are the real ones the auth and create-project forms send, so what shows here is
// what users see. Timings roughly match a slow API round trip.
const RESOLVE_AFTER_MS = 2500;

interface Trigger {
    label: string;
    run: () => void;
}

interface TriggerGroup {
    title: string;
    hint: string;
    triggers: Trigger[];
}

const GROUPS: TriggerGroup[] = [
    {
        title: 'Request flows',
        hint: 'One banner that starts as loading and resolves in place.',
        triggers: [
            {
                label: 'Create draft → success',
                run: () => {
                    const id = toast.loading('Creating your draft…');
                    window.setTimeout(
                        () => toast.success('Draft created. Review it, then publish when you are ready.', { id }),
                        RESOLVE_AFTER_MS,
                    );
                },
            },
            {
                label: 'Log in → error',
                run: () => {
                    const id = toast.loading('Logging you in…');
                    window.setTimeout(
                        () => toast.error('Could not log you in. Check your email and password.', { id }),
                        RESOLVE_AFTER_MS,
                    );
                },
            },
            {
                label: 'Register → success',
                run: () => {
                    const id = toast.loading('Creating your account…');
                    window.setTimeout(
                        () => toast.success('Account created. You can log in now.', { id }),
                        RESOLVE_AFTER_MS,
                    );
                },
            },
            {
                label: 'Loading that stays',
                run: () => {
                    toast.loading('Creating your draft…');
                },
            },
        ],
    },
    {
        title: 'Single states',
        hint: 'Each type on its own.',
        triggers: [
            { label: 'Success', run: () => toast.success('Welcome back!') },
            { label: 'Error', run: () => toast.error('Some fields need attention.') },
            { label: 'Warning', run: () => toast.warning('Logout failed.') },
            { label: 'Info', run: () => toast.info('This is an info toast.') },
        ],
    },
    {
        title: 'Edge cases',
        hint: 'Wrapping, stacking and swipe-to-dismiss.',
        triggers: [
            {
                label: 'Long message',
                run: () =>
                    toast.error(
                        'Could not create the project. The server did not answer in time, so nothing was saved — check your connection and try again.',
                    ),
            },
            {
                label: 'Stack of three',
                run: () => {
                    toast.success('Draft created. Review it, then publish when you are ready.');
                    window.setTimeout(() => toast.error('Could not log you in. Check your email and password.'), 250);
                    window.setTimeout(() => toast.warning('Logout failed.'), 500);
                },
            },
            { label: 'Dismiss all', run: () => toast.dismiss() },
        ],
    },
];

export default function ToastPlayground() {
    return (
        <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 px-4 pt-20 pb-16 md:px-6 md:pt-28">
            <header className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">Toast playground</h1>
                <p className="text-sm text-muted-foreground">
                    Dev only — this page 404s in production. Toggle the theme from the header to check both.
                </p>
            </header>

            {GROUPS.map((group) => (
                <section key={group.title} className="space-y-3">
                    <div className="space-y-1">
                        <h2 className="text-base font-medium">{group.title}</h2>
                        <p className="text-xs text-muted-foreground">{group.hint}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {group.triggers.map((trigger) => (
                            <Button
                                key={trigger.label}
                                type="button"
                                variant="outline"
                                className="w-full cursor-pointer justify-start"
                                onClick={trigger.run}
                            >
                                {trigger.label}
                            </Button>
                        ))}
                    </div>
                </section>
            ))}
        </main>
    );
}
