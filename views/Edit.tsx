'use client';

import * as React from 'react';
import Image from 'next/image';
import { format, parse, isValid } from 'date-fns';
import {
    Camera,
    Plus,
    Trash2,
    Loader2,
    User,
    MapPin,
    Link as LinkIcon,
    Calendar as CalendarIcon,
    Globe,
    Mars,
    Venus,
    CircleHelp,
    Transgender,
    X,
    type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { useUserStore } from '@/lib/store/user-store';
import { userService } from '@/services/user-service';
import { OCCUPATION_LABELS } from '@/mock-data/users';
import type { Gender, IUpdateCurrentUserPayload, ISocialLink, IUserSettings, Occupation } from '@/types/user';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/global/avatar';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { Input } from '@/components/ui/global/input';
import { Label } from '@/components/ui/global/label';
import { Textarea } from '@/components/ui/global/textarea';
import { Separator } from '@/components/ui/global/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/global/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/global/popover';
import { Calendar } from '@/components/ui/global/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/global/select';
import { getInitials } from '@/lib/utils';
import { ArrowLeft } from '@/components/animate-ui/icons/arrow-left';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { useRouter } from 'next/navigation';

/* -------------------------------------------------------------------------- */
/*                                 Constants                                  */
/* -------------------------------------------------------------------------- */

// Values are the User Service's Gender enum, not display strings — the DTO
// validates them with @IsEnum, so a friendly lowercase value would be rejected.
const GENDER_OPTIONS: { label: string; value: Gender; icon: LucideIcon }[] = [
    { label: 'Male', value: 'MALE', icon: Mars },
    { label: 'Female', value: 'FEMALE', icon: Venus },
    { label: 'Other', value: 'OTHER', icon: Transgender },
    { label: 'Prefer not to say', value: 'UNKNOWN', icon: CircleHelp },
];

/** Radix Select forbids an empty string value, so "no occupation" needs a sentinel. */
const NO_OCCUPATION = '__none__';

const OCCUPATION_OPTIONS = (Object.entries(OCCUPATION_LABELS) as [Occupation, string][]).map(([value, label]) => ({
    value,
    label,
}));

const LANGUAGE_OPTIONS = [
    { value: 'en', label: 'English' },
    { value: 'vi', label: 'Vietnamese' },
];

const TIMEZONE_OPTIONS = [
    'UTC',
    'Asia/Ho_Chi_Minh',
    'Asia/Bangkok',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Europe/London',
    'America/New_York',
    'America/Los_Angeles',
];

const PLATFORM_OPTIONS = [
    { value: 'github', label: 'GitHub' },
    { value: 'twitter', label: 'Twitter / X' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'website', label: 'Website / Other' },
];

const BIO_MAX_LENGTH = 220;

/* -------------------------------------------------------------------------- */
/*                              Form value type                               */
/* -------------------------------------------------------------------------- */

// Mirrors UpdateProfileDto, so everything here is actually savable. displayName
// is deliberately absent: PATCH /api/users/me does not accept it.
type EditableFields = {
    fullName: string;
    bio: string;
    occupation: Occupation | '';
    company: string;
    location: string;
    website: string;
    birthday: Date | undefined;
    gender: Gender;
    skills: string[];
    language: string;
    timezone: string;
};

/** Matches the DTO's @ArrayMaxSize(20) / @MaxLength(50, { each: true }). */
const MAX_SKILLS = 20;
const SKILL_MAX_LENGTH = 50;

export default function Edit() {
    const user = useUserStore((state) => state.user);
    const updateUser = useUserStore((state) => state.updateUser);

    const [fields, setFields] = React.useState<EditableFields | null>(null);
    const [links, setLinks] = React.useState<ISocialLink[]>([]);
    const [settings, setSettings] = React.useState<IUserSettings | null>(null);

    /** The last state the server confirmed, to diff against when saving. */
    const savedRef = React.useRef<EditableFields | null>(null);

    const [birthdayInput, setBirthdayInput] = React.useState('');
    const [birthdayOpen, setBirthdayOpen] = React.useState(false);
    const [birthdayError, setBirthdayError] = React.useState('');

    const [skillInput, setSkillInput] = React.useState('');

    const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
    const [coverPreview, setCoverPreview] = React.useState<string | null>(null);

    const [saving, setSaving] = React.useState(false);

    const router = useRouter();

    // Hydrate local form state once the client-side store has the user.
    React.useEffect(() => {
        if (!user || fields) return;
        const birthday = user.birthday ? new Date(user.birthday) : undefined;

        // ICurrentUser types these two as plain strings while the service stores
        // enums, so anything unrecognised falls back instead of leaving a Select
        // with a value none of its items match (which renders an empty trigger).
        const gender = GENDER_OPTIONS.some((o) => o.value === user.gender) ? (user.gender as Gender) : 'UNKNOWN';
        const occupation =
            user.occupation && user.occupation in OCCUPATION_LABELS ? (user.occupation as Occupation) : '';

        const loaded: EditableFields = {
            fullName: user.fullName ?? '',
            bio: user.bio ?? '',
            occupation,
            company: user.company ?? '',
            location: user.location ?? '',
            website: user.website ?? '',
            birthday,
            gender,
            skills: user.skills ?? [],
            language: user.language ?? 'en',
            timezone: user.timezone ?? 'UTC',
        };

        // Kept so handleSave can send only what actually changed — a PATCH that
        // echoes every field back would rewrite untouched NULLs into ''.
        savedRef.current = loaded;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFields(loaded);
        setBirthdayInput(birthday ? format(birthday, 'dd/MM/yyyy') : '');
        setLinks(user.links ?? []);
        setSettings(
            user.settings ?? {
                isPrivate: false,
                showEmail: false,
                showBirthday: false,
                allowMessage: true,
                locale: user.language ?? 'en',
                theme: 'system',
            },
        );
    }, [user, fields]);

    if (!user || !fields || !settings) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
                Loading your profile…
            </div>
        );
    }

    function setField<K extends keyof EditableFields>(key: K, value: EditableFields[K]) {
        setFields((prev) => (prev ? { ...prev, [key]: value } : prev));
    }

    function handleBirthdayText(e: React.ChangeEvent<HTMLInputElement>) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 5) {
            value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4, 8)}`;
        } else if (value.length >= 3) {
            value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
        }
        setBirthdayInput(value);

        if (value.length !== 10) {
            setBirthdayError('');
            return;
        }

        const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
        if (!isValid(parsedDate)) {
            setBirthdayError('Invalid date');
            return;
        }
        if (parsedDate > new Date()) {
            setBirthdayError('Birthday cannot be in the future');
            return;
        }
        setBirthdayError('');
        setField('birthday', parsedDate);
    }

    function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarPreview(URL.createObjectURL(file));
    }

    function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setCoverPreview(URL.createObjectURL(file));
    }

    function addLink() {
        setLinks((prev) => [
            ...prev,
            { id: `tmp_${Date.now()}`, platform: 'website', title: null, url: '', order: prev.length },
        ]);
    }

    function updateLink(id: string, patch: Partial<ISocialLink>) {
        setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    }

    function removeLink(id: string) {
        setLinks((prev) => prev.filter((l) => l.id !== id).map((l, i) => ({ ...l, order: i })));
    }

    /**
     * The BE matches/stores skills case-insensitively (lowercased), so "React"
     * and "react" are the same skill there — de-duping here too avoids a chip
     * list that looks fine locally but collapses to fewer entries after save.
     */
    function addSkill() {
        if (!fields) return;
        const value = skillInput.trim();
        if (!value) return;

        if (fields.skills.some((s) => s.toLowerCase() === value.toLowerCase())) {
            setSkillInput('');
            return;
        }
        if (value.length > SKILL_MAX_LENGTH) {
            toast.error(`Skill must be under ${SKILL_MAX_LENGTH} characters.`);
            return;
        }
        if (fields.skills.length >= MAX_SKILLS) {
            toast.error(`You can list up to ${MAX_SKILLS} skills.`);
            return;
        }

        setField('skills', [...fields.skills, value]);
        setSkillInput('');
    }

    function removeSkill(skill: string) {
        if (!fields) return;
        setField(
            'skills',
            fields.skills.filter((s) => s !== skill),
        );
    }

    /**
     * Only the fields that actually changed since the last save go in the
     * PATCH body — echoing every field back would overwrite values other
     * clients (or this same form, mid-edit) changed in between.
     *
     * occupation/website/birthday are NOT cleared by assigning `undefined`:
     * confirmed against the real BE that `payload.field = undefined` still
     * trips @IsUrl()/@IsEnum()/@IsDateString() ("website must be a URL
     * address" even when the key held `undefined`, not a string) — the DTO
     * must be resolving the field to '' before validation runs, not skipping
     * it via @IsOptional() the way an absent key would. So clearing one of
     * these three via this endpoint isn't wired yet: the field is simply
     * left out of the diff, and clearedFields reports it so the caller can
     * tell the user their edit didn't round-trip.
     */
    function buildUpdatePayload(
        saved: EditableFields,
        current: EditableFields,
    ): { payload: IUpdateCurrentUserPayload; clearedFields: string[] } {
        const payload: IUpdateCurrentUserPayload = {};
        const clearedFields: string[] = [];

        if (current.fullName !== saved.fullName) payload.fullName = current.fullName;
        if (current.bio !== saved.bio) payload.bio = current.bio;
        if (current.company !== saved.company) payload.company = current.company;
        if (current.location !== saved.location) payload.location = current.location;
        if (current.language !== saved.language) payload.language = current.language;
        if (current.timezone !== saved.timezone) payload.timezone = current.timezone;
        if (current.gender !== saved.gender) payload.gender = current.gender;

        if (current.occupation !== saved.occupation) {
            if (current.occupation) payload.occupation = current.occupation;
            else clearedFields.push('Title');
        }
        if (current.website !== saved.website) {
            if (current.website) payload.website = current.website;
            else clearedFields.push('Website');
        }

        const savedTime = saved.birthday?.getTime();
        const currentTime = current.birthday?.getTime();
        if (currentTime !== savedTime) {
            if (current.birthday) payload.birthday = current.birthday.toISOString();
            else clearedFields.push('Birthday');
        }

        // skills is a full replacement, not a diff/append server-side — order
        // doesn't change the set, so compare case-insensitively regardless of it.
        const sortedSaved = [...saved.skills].map((s) => s.toLowerCase()).sort();
        const sortedCurrent = [...current.skills].map((s) => s.toLowerCase()).sort();
        const skillsChanged =
            sortedSaved.length !== sortedCurrent.length || sortedSaved.some((s, i) => s !== sortedCurrent[i]);
        if (skillsChanged) payload.skills = current.skills;

        return { payload, clearedFields };
    }

    async function handleSave() {
        if (!fields || !savedRef.current) return;

        if (birthdayError) {
            toast.error('Fix the birthday field before saving.');
            return;
        }

        // TODO: avatar/cover go through a real upload endpoint once it exists —
        // avatarPreview/coverPreview here are local blob: URLs, not something
        // the User Service could store, so they are never sent in the PATCH body.

        const { payload, clearedFields } = buildUpdatePayload(savedRef.current, fields);
        if (Object.keys(payload).length === 0) {
            if (clearedFields.length > 0) {
                toast.error(`Clearing ${clearedFields.join(', ')} isn't supported yet — leave a value or reload to discard.`);
            } else {
                toast.info('Nothing to save.');
            }
            return;
        }

        setSaving(true);
        const toastId = toast.loading('Saving your profile…');

        try {
            const result = await userService.updateMe(payload);
            if (!result.ok) {
                toast.error(result.message, { id: toastId });
                return;
            }

            updateUser(result.user);

            // A cleared occupation/website/birthday never made it into payload,
            // so the server still holds the old value — snap those three back
            // to what savedRef had before this save, in both the new baseline
            // and the visible inputs. Otherwise the box would sit empty while
            // the real value is unchanged, and the next diff would try (and
            // fail) to send the same clear again.
            const nextSaved: EditableFields = { ...fields };
            if (clearedFields.includes('Title')) nextSaved.occupation = savedRef.current.occupation;
            if (clearedFields.includes('Website')) nextSaved.website = savedRef.current.website;
            if (clearedFields.includes('Birthday')) nextSaved.birthday = savedRef.current.birthday;

            savedRef.current = nextSaved;
            setFields(nextSaved);
            if (clearedFields.includes('Birthday')) {
                setBirthdayInput(nextSaved.birthday ? format(nextSaved.birthday, 'dd/MM/yyyy') : '');
            }

            if (clearedFields.length > 0) {
                toast.success(`Profile updated. ${clearedFields.join(', ')} could not be cleared and stayed as-is.`, {
                    id: toastId,
                });
            } else {
                toast.success('Profile updated.', { id: toastId });
            }
        } catch {
            toast.error('Could not save your profile. Try again.', { id: toastId });
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="mx-auto max-w-2xl px-4">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-bold text-[#52514e] dark:text-[#c3c2b7]">Edit profile</h1>
                <Button
                    variant="ghost"
                    asChild
                    className="cursor-pointer text-[#52514e] dark:text-[#c3c2b7]"
                    onClick={() => router.back()}
                >
                    <AnimateIcon animateOnHover className="flex gap-1 items-center justify-center">
                        <ArrowLeft />
                        Cancel
                    </AnimateIcon>
                </Button>
            </div>

            {/* Single column: Photo -> About -> Save */}
            <div className="flex flex-col gap-6">
                {/* ============================================================ */}
                {/* PHOTO                                                         */}
                {/* ============================================================ */}

                <Card className="overflow-hidden py-0">
                    <div className="group relative h-28 w-full bg-muted">
                        {(coverPreview ?? user.coverUrl) && (
                            <Image src={coverPreview ?? user.coverUrl!} alt="" fill className="object-cover" />
                        )}
                        <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 text-[#52514e] dark:text-[#c3c2b7] opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                            <Camera className="size-5" />
                            <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                        </label>
                    </div>

                    <CardContent className="-mt-10 pb-6">
                        <label className="group relative block h-20 w-20 cursor-pointer">
                            <Avatar className="h-20 w-20 rounded ring-4 ring-background">
                                <AvatarImage
                                    src={avatarPreview ?? user.avatarUrl ?? undefined}
                                    alt={user.displayName}
                                />
                                <AvatarFallback className="text-xl">
                                    {getInitials(fields.fullName || user.displayName)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="absolute inset-0 flex items-center justify-center rounded bg-black/0 text-[#52514e] dark:text-[#c3c2b7] opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                                <Camera className="size-4" />
                            </span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        </label>
                        <p className="mt-2 text-xs text-muted-foreground">Hover the cover or avatar to change it.</p>
                    </CardContent>
                </Card>

                {/* ============================================================ */}
                {/* ABOUT YOU                                                     */}
                {/* ============================================================ */}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl text-[#52514e] dark:text-[#c3c2b7]">
                            <User className="h-5 w-5" />
                            About you
                        </CardTitle>
                        <CardDescription>This is what other people will see on your profile.</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <div className="space-y-2 text-[#52514e] dark:text-[#c3c2b7]">
                            <div className="flex items-center justify-between">
                                <Label>Full name</Label>
                                {/* Handle is read-only here: PATCH /api/users/me has no displayName field. */}
                                <span className="font-mono text-xs text-muted-foreground">@{user.displayName}</span>
                            </div>
                            <Input
                                value={fields.fullName}
                                maxLength={80}
                                onChange={(e) => setField('fullName', e.target.value)}
                                placeholder="Nguyen Le Tuan Phi"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[#52514e] dark:text-[#c3c2b7]">
                                <Label>Bio / headline</Label>
                                <span className="text-xs text-muted-foreground">
                                    {fields.bio.length}/{BIO_MAX_LENGTH}
                                </span>
                            </div>
                            <Textarea
                                value={fields.bio}
                                maxLength={BIO_MAX_LENGTH}
                                rows={3}
                                placeholder="e.g. Frontend engineer building developer tools. Ex-startup, now indie."
                                onChange={(e) => setField('bio', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2 text-[#52514e] dark:text-[#c3c2b7]">
                                <Label>Occupation</Label>
                                <Select
                                    value={fields.occupation || NO_OCCUPATION}
                                    onValueChange={(v) =>
                                        setField('occupation', v === NO_OCCUPATION ? '' : (v as Occupation))
                                    }
                                >
                                    <SelectTrigger className="w-full cursor-pointer">
                                        <SelectValue placeholder="e.g. Software Engineer" />
                                    </SelectTrigger>
                                    <SelectContent className="w-[var(--radix-select-trigger-width)]">
                                        <SelectItem value={NO_OCCUPATION} className="cursor-pointer">
                                            None
                                        </SelectItem>
                                        {OCCUPATION_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 text-[#52514e] dark:text-[#c3c2b7]">
                                <Label>Company</Label>
                                <Input
                                    value={fields.company}
                                    onChange={(e) => setField('company', e.target.value)}
                                    placeholder="e.g. Freelance"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 text-[#52514e] dark:text-[#c3c2b7]">
                            <div className="flex items-center justify-between">
                                <Label>Skills</Label>
                                <span className="text-xs text-muted-foreground">
                                    {fields.skills.length}/{MAX_SKILLS}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={skillInput}
                                    maxLength={SKILL_MAX_LENGTH}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key !== 'Enter') return;
                                        e.preventDefault();
                                        addSkill();
                                    }}
                                    placeholder="e.g. TypeScript"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addSkill}
                                    className="shrink-0 cursor-pointer"
                                    aria-label="Add skill"
                                >
                                    <Plus className="size-4" />
                                </Button>
                            </div>
                            {fields.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {fields.skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="flex items-center gap-1.5 rounded border border-foreground/10 px-2 py-1 font-mono text-xs text-muted-foreground"
                                        >
                                            {skill}
                                            <button
                                                type="button"
                                                onClick={() => removeSkill(skill)}
                                                aria-label={`Remove ${skill}`}
                                                className="cursor-pointer text-muted-foreground hover:text-foreground"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2 text-[#52514e] dark:text-[#c3c2b7]">
                                <Label className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5" /> Location
                                </Label>
                                <Input
                                    value={fields.location}
                                    onChange={(e) => setField('location', e.target.value)}
                                    placeholder="e.g. Da Nang, Vietnam"
                                />
                            </div>
                            <div className="space-y-2 text-[#52514e] dark:text-[#c3c2b7]">
                                <Label className="flex items-center gap-1.5">
                                    <LinkIcon className="h-3.5 w-3.5" /> Website
                                </Label>
                                <Input
                                    value={fields.website}
                                    onChange={(e) => setField('website', e.target.value)}
                                    placeholder="e.g. yourdomain.dev"
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                            <div className="space-y-2 text-[#52514e] dark:text-[#c3c2b7]">
                                <Label className="flex items-center gap-1.5">
                                    <CalendarIcon className="h-3.5 w-3.5" /> Birthday
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder="DD/MM/YYYY"
                                        value={birthdayInput}
                                        onChange={handleBirthdayText}
                                        className="pr-9"
                                    />
                                    <Popover open={birthdayOpen} onOpenChange={setBirthdayOpen}>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                <CalendarIcon className="h-4 w-4 cursor-pointer" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="end">
                                            <Calendar
                                                mode="single"
                                                selected={fields.birthday}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        setField('birthday', date);
                                                        setBirthdayInput(format(date, 'dd/MM/yyyy'));
                                                        setBirthdayError('');
                                                    }
                                                    setBirthdayOpen(false);
                                                }}
                                                captionLayout="dropdown"
                                                startMonth={new Date(1950, 0)}
                                                endMonth={new Date()}
                                                disabled={(date) => date > new Date()}
                                                className="[--cell-size:1.75rem]"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                {birthdayError && <p className="mt-1 text-xs text-destructive">{birthdayError}</p>}
                            </div>

                            <div className="space-y-2 text-[#52514e] dark:text-[#c3c2b7]">
                                <Label className="flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5" /> Gender
                                </Label>
                                <Select value={fields.gender} onValueChange={(v) => setField('gender', v as Gender)}>
                                    <SelectTrigger className="w-full cursor-pointer">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="w-[var(--radix-select-trigger-width)]">
                                        {GENDER_OPTIONS.map(({ label, value, icon: Icon }) => (
                                            <SelectItem
                                                key={value}
                                                value={value}
                                                className="cursor-pointer text-[#52514e] dark:text-[#c3c2b7]"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                                    {label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 text-[#52514e] dark:text-[#c3c2b7]">
                                <Label className="flex items-center gap-1.5">
                                    <Globe className="h-3.5 w-3.5" /> Language
                                </Label>
                                <Select value={fields.language} onValueChange={(v) => setField('language', v)}>
                                    <SelectTrigger className="w-full cursor-pointer">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="w-[var(--radix-select-trigger-width)]">
                                        {LANGUAGE_OPTIONS.map((opt) => (
                                            <SelectItem
                                                key={opt.value}
                                                value={opt.value}
                                                className="cursor-pointer text-[#52514e] dark:text-[#c3c2b7]"
                                            >
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2 md:max-w-xs text-[#52514e] dark:text-[#c3c2b7]">
                            <Label>Timezone</Label>
                            <Select value={fields.timezone} onValueChange={(v) => setField('timezone', v)}>
                                <SelectTrigger className="w-full cursor-pointer">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="w-[var(--radix-select-trigger-width)]">
                                    {TIMEZONE_OPTIONS.map((tz) => (
                                        <SelectItem
                                            key={tz}
                                            value={tz}
                                            className="cursor-pointer text-[#52514e] dark:text-[#c3c2b7]"
                                        >
                                            {tz}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator />

                        <div className="space-y-3 text-[#52514e] dark:text-[#c3c2b7]">
                            <div className="flex items-center justify-between">
                                <Label>Social links</Label>
                                {/* PATCH /api/users/me has no links field yet — edits here don't persist. */}
                                <span className="text-xs text-muted-foreground">Not saved yet</span>
                            </div>
                            {links.map((link) => (
                                <div key={link.id} className="flex items-start gap-2">
                                    <Select
                                        value={link.platform}
                                        onValueChange={(v) => updateLink(link.id, { platform: v })}
                                    >
                                        <SelectTrigger className="w-36 shrink-0 cursor-pointer">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PLATFORM_OPTIONS.map((opt) => (
                                                <SelectItem
                                                    key={opt.value}
                                                    value={opt.value}
                                                    className="cursor-pointer"
                                                >
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Input
                                        placeholder="https://…"
                                        value={link.url}
                                        onChange={(e) => updateLink(link.id, { url: e.target.value })}
                                        className="flex-1"
                                    />

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeLink(link.id)}
                                        aria-label="Remove link"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            ))}

                            <Button type="button" variant="outline" className="w-fit cursor-pointer" onClick={addLink}>
                                <Plus className="mr-1.5 size-4" />
                                Add link
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* ============================================================ */}
                {/* SAVE                                                          */}
                {/* ============================================================ */}

                <Button variant="outline" onClick={handleSave} disabled={saving} className="w-full cursor-pointer">
                    {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Save changes
                </Button>
            </div>
        </div>
    );
}
