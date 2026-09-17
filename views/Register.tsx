'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Input } from '@/components/ui/global/input';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { Separator } from '@/components/ui/global/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/global/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/global/card';
import { Label } from '@/components/ui/global/label';
import { Mail, Lock, Globe, Transgender, Mars, Venus, CircleHelp } from 'lucide-react';
import { useState } from 'react';
import { format, parse, isValid } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/global/popover';
import { Calendar } from '@/components/ui/global/calendar';
import { z } from 'zod';
import { ApiEnvelope } from '@/services/client';
import { authService } from '@/services/auth-service';
import { toast } from 'sonner';
import Github from '@/components/icons/github';
import OauthLogin from '@/components/ui/global/oauth-login';
import Google from '@/components/icons/google';
import Facebook from '@/components/icons/facebook';
import { OauthLoginListener } from '@/components/oauth-login-listener';
import CatronautHappy from '@/components/ui/catronaut/happy';

const GENDER_OPTIONS = [
    { label: 'Male', value: 'MALE', icon: Mars },
    { label: 'Female', value: 'FEMALE', icon: Venus },
    { label: 'Unknown', value: 'UNKNOWN', icon: CircleHelp },
];

// Zod validation schema
const registerSchema = z
    .object({
        fullName: z
            .string()
            .min(3, { message: 'Full name must be at least 3 characters' })
            .max(255),
        displayName: z
            .string()
            .min(3, { message: 'Display name must be at least 3 characters' })
            .max(255),
        email: z.string().email(),
        birthday: z.date({ message: 'Birthday is required' }),
        password: z
            .string()
            .min(8, { message: 'Password must be at least 8 characters' })
            .max(255),
        gender: z.string().min(1, { message: 'Gender is required' }),
        country: z.string().min(1, { message: 'Country is required' }),
        confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type RegisterFormData = z.infer<typeof registerSchema>;

type FormErrors = Partial<Record<keyof RegisterFormData, string>>;

export default function Register({ countries }: { countries: string[] }) {
    const [formData, setFormData] = useState<RegisterFormData>({
        fullName: '',
        displayName: '',
        email: '',
        birthday: (undefined as unknown) as Date,
        country: '',
        gender: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [birthdayOpen, setBirthdayOpen] = useState(false);

    const handleInputChange = <K extends keyof RegisterFormData>(field: K, value: RegisterFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const parsed = registerSchema.safeParse(formData);

        if (!parsed.success) {
            const fieldErrors: FormErrors = {};
            parsed.error.issues.forEach((e) => {
                fieldErrors[e.path[0] as keyof typeof fieldErrors] = e.message;
            });
            setErrors(fieldErrors);
            return;
        }

        const { confirmPassword, ...payload } = parsed.data;

        setIsSubmitting(true);
        // The button just stays disabled (no label swap); the loading state itself is
        // this toast, which then resolves in place into the success or error toast.
        const toastId = toast.loading('Creating your account…');
        const result: ApiEnvelope<null> = await authService.register(payload);
        setIsSubmitting(false);

        if (!result.success) {
            toast.error(result.message || 'Could not create your account.', { id: toastId });
            return;
        }

        toast.success(result.message || 'Account created. You can log in now.', { id: toastId });
        setFormData({
            fullName: '',
            displayName: '',
            email: '',
            birthday: (undefined as unknown) as Date,
            country: '',
            gender: '',
            password: '',
            confirmPassword: '',
        });
        setInputValue('');
    };

    const [inputValue, setInputValue] = useState(formData.birthday ? format(formData.birthday, 'dd/MM/yyyy') : '');

    const handleInputChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, ''); // bước 1: bỏ hết ký tự không phải số

        if (value.length >= 5) {
            value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4, 8)}`;
        } else if (value.length >= 3) {
            value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
        }

        setInputValue(value); // <-- gán giá trị ĐÃ xử lý, không phải e.target.value gốc

        if (value.length !== 10) {
            if (errors.birthday) {
                setErrors((prev) => ({ ...prev, birthday: '' }));
            }
            return;
        }

        const parsedDate = parse(value, 'dd/MM/yyyy', new Date());

        if (!isValid(parsedDate)) {
            // Ngày không tồn tại thật, ví dụ 31/02
            setErrors((prev) => ({ ...prev, birthday: 'Invalid date' }));
            return;
        }

        if (parsedDate > new Date()) {
            // Ngày có thật, nhưng ở tương lai -- vẫn là 1 loại lỗi riêng
            setErrors((prev) => ({ ...prev, birthday: 'Birthday cannot be in the future' }));
            return;
        }

        handleInputChange('birthday', parsedDate);
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 pt-20 pb-10 md:pt-28">
            {/* AMBIENT ACCENT */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[110px] dark:bg-primary/15" />
                <div className="absolute -bottom-40 -right-32 h-[380px] w-[380px] rounded-full bg-primary/5 blur-[110px] dark:bg-primary/10" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="z-1 w-full max-w-6xl"
            >
                <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* MAIN - ACCOUNT INFO */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <CatronautHappy scale={0.3} />
                                Create your account
                            </CardTitle>
                            <CardDescription>Tell us a bit about yourself to get started</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-5">
                            {/* FULL NAME & DISPLAY NAME */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="register-fullname">Full name</Label>
                                    <Input
                                        id="register-fullname"
                                        name="fullName"
                                        autoComplete="name"
                                        value={formData.fullName}
                                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                                        placeholder="Nguyen Le Tuan Phi"
                                        aria-invalid={!!errors.fullName}
                                    />
                                    {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-displayname">Display name</Label>
                                    <Input
                                        id="register-displayname"
                                        name="displayName"
                                        autoComplete="nickname"
                                        value={formData.displayName}
                                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                                        placeholder="Fizzisme"
                                        aria-invalid={!!errors.displayName}
                                    />
                                    {errors.displayName && (
                                        <p className="text-xs text-destructive">{errors.displayName}</p>
                                    )}
                                </div>
                            </div>

                            {/* EMAIL & BIRTHDAY */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="register-email" className="flex items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5" /> Email
                                    </Label>
                                    <Input
                                        id="register-email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="Fizz@example.com"
                                        aria-invalid={!!errors.email}
                                    />
                                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-birthday" className="flex items-center gap-1.5">
                                        <CalendarIcon className="h-3.5 w-3.5" /> Birthday
                                    </Label>

                                    <div className="relative">
                                        <Input
                                            id="register-birthday"
                                            type="text"
                                            placeholder="DD/MM/YYYY"
                                            value={inputValue}
                                            onChange={handleInputChangeText}
                                            className="pr-9"
                                            aria-invalid={!!errors.birthday}
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
                                                    selected={formData.birthday}
                                                    onSelect={(date) => {
                                                        if (date) {
                                                            handleInputChange('birthday', date);
                                                            setInputValue(format(date, 'dd/MM/yyyy'));
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

                                    {errors.birthday && <p className="text-xs text-destructive">{errors.birthday}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* COUNTRY */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1.5">
                                        <Globe className="h-3.5 w-3.5" /> Country
                                    </Label>
                                    <Select
                                        value={formData.country}
                                        onValueChange={(value) => handleInputChange('country', value)}
                                    >
                                        <SelectTrigger
                                            className="w-full cursor-pointer"
                                            aria-invalid={!!errors.country}
                                        >
                                            <SelectValue placeholder="Select your country" />
                                        </SelectTrigger>
                                        <SelectContent className="w-[var(--radix-select-trigger-width)]">
                                            {countries.map((country) => (
                                                <SelectItem key={country} value={country} className="cursor-pointer">
                                                    {country}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {errors.country && <p className="text-xs text-destructive">{errors.country}</p>}
                                </div>

                                {/*GENDER*/}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1.5">
                                        <Transgender className="h-3.5 w-3.5" /> Gender
                                    </Label>
                                    <Select
                                        value={formData.gender}
                                        onValueChange={(value) => handleInputChange('gender', value)}
                                    >
                                        <SelectTrigger className="w-full cursor-pointer" aria-invalid={!!errors.gender}>
                                            <SelectValue placeholder="Select your gender" />
                                        </SelectTrigger>
                                        <SelectContent className="w-[var(--radix-select-trigger-width)]">
                                            {GENDER_OPTIONS.map(({ label, value, icon: Icon }) => (
                                                <SelectItem key={value} value={value} className="cursor-pointer">
                                                    <div className="flex items-center gap-2">
                                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                                        {label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
                                </div>
                            </div>

                            <Separator />

                            {/* PASSWORD & CONFIRM PASSWORD */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="register-password" className="flex items-center gap-1.5">
                                        <Lock className="h-3.5 w-3.5" /> Password
                                    </Label>
                                    <Input
                                        id="register-password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        placeholder="••••••••"
                                        aria-invalid={!!errors.password}
                                    />
                                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-confirm-password" className="flex items-center gap-1.5">
                                        <Lock className="h-3.5 w-3.5" /> Confirm password
                                    </Label>
                                    <Input
                                        id="register-confirm-password"
                                        name="confirmPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                        placeholder="••••••••"
                                        aria-invalid={!!errors.confirmPassword}
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SIDEBAR */}
                    <div className="space-y-6">
                        {/* SOCIAL LOGIN */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Quick sign up</CardTitle>
                                <CardDescription>Continue with a connected account</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <OauthLoginListener>
                                    {/*Google*/}
                                    <OauthLogin provider="google" label="Continue with Google" Icon={Google} />

                                    {/*Facebook*/}
                                    <OauthLogin provider="facebook" label="Continue with Facebook" Icon={Facebook} />

                                    {/*Github*/}
                                    <OauthLogin provider="github" label="Continue with GitHub" Icon={Github} />
                                </OauthLoginListener>
                            </CardContent>
                        </Card>

                        {/* ALREADY HAVE ACCOUNT */}
                        <Card>
                            <CardContent className="space-y-3 pt-6 text-center">
                                <p className="text-sm text-muted-foreground">Already have an account?</p>
                                <Link href="/login">
                                    <Button type="button" variant="outline" className="w-full cursor-pointer">
                                        Log in instead
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full cursor-pointer"
                            variant="outline"
                        >
                            Register
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
