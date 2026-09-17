'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Input } from '@/components/ui/global/input';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { Separator } from '@/components/ui/global/separator';
import { Label } from '@/components/ui/global/label';
import { Mail, Lock } from 'lucide-react';
import Github from '@/components/icons/github';
import { useState } from 'react';
import { z } from 'zod';
import { authService } from '@/services/auth-service';
import { ApiEnvelope } from '@/services/api-core';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Google from '@/components/icons/google';
import OauthLogin from '@/components/ui/global/oauth-login';
import Image from 'next/image';
import Facebook from '@/components/icons/facebook';
import { OauthLoginListener } from '@/components/oauth-login-listener';

const loginSchema = z.object({
    email: z.string().email(),
    password: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters' })
        .max(255),
});

type LoginFormData = z.infer<typeof loginSchema>;

type FormErrors = Partial<Record<keyof LoginFormData, string>>;

export default function LoginForm() {
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();

    const handleInputChange = <K extends keyof LoginFormData>(field: K, value: LoginFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const parsed = loginSchema.safeParse(formData);
        if (!parsed.success) {
            const fieldErrors: FormErrors = {};
            parsed.error.issues.forEach((e) => {
                fieldErrors[e.path[0] as keyof typeof fieldErrors] = e.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setIsSubmitting(true);
        // The button just stays disabled (no label swap); the loading state itself is
        // this toast, which then resolves in place into the success or error toast.
        const toastId = toast.loading('Logging you in…');
        const result: ApiEnvelope<null> = await authService.login(parsed.data);
        setIsSubmitting(false);

        if (!result.success) {
            toast.error(result.message || 'Could not log you in. Check your email and password.', { id: toastId });
            return;
        }

        toast.success('Welcome back!', { id: toastId });
        router.push('/home');
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 pt-20 pb-10 md:pt-28">
            {/* AMBIENT ACCENT */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -right-24 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[110px] dark:bg-primary/15" />
                <div className="absolute -bottom-40 -left-32 h-[380px] w-[380px] rounded-full bg-primary/5 blur-[110px] dark:bg-primary/10" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="z-1 w-full max-w-6xl"
            >
                <div className="mx-auto grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded border border-foreground/10 bg-card shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)] lg:grid-cols-2">
                    {/* LEFT - IMAGE */}
                    <div className="relative hidden bg-muted lg:block">
                        <Image
                            src="/auth/Fizz.png"
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 50vw, 0px"
                            className="pointer-events-none object-cover select-none"
                            priority
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent dark:from-black/90 dark:via-black/50 dark:to-black/20" />
                        <div className="absolute bottom-7 left-7 text-white">
                            <p className="text-lg font-semibold tracking-tight">Fiurozz</p>
                            <p className="text-sm text-white/70">Showcase your work, your way.</p>
                        </div>
                    </div>

                    {/* RIGHT - FORM */}
                    <div className="flex flex-col justify-center p-8 sm:p-10">
                        <div className="mb-7">
                            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
                            <p className="mt-1.5 text-sm text-muted-foreground">
                                Enter your credentials to access your account
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                            {/* EMAIL */}
                            <div className="space-y-2">
                                <Label htmlFor="login-email" className="flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5" /> Email
                                </Label>
                                <Input
                                    id="login-email"
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

                            {/* PASSWORD */}
                            <div className="space-y-2">
                                <Label htmlFor="login-password" className="flex items-center gap-1.5">
                                    <Lock className="h-3.5 w-3.5" /> Password
                                </Label>
                                <Input
                                    id="login-password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    placeholder="••••••••"
                                    aria-invalid={!!errors.password}
                                />
                                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                            </div>

                            <div className="mb-1 flex justify-end">
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-muted-foreground transition-colors hover:text-black dark:hover:text-white"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full cursor-pointer"
                                variant="outline"
                            >
                                Log in
                            </Button>
                        </form>

                        {/* DIVIDER */}
                        <div className="my-6 flex items-center gap-3">
                            <Separator className="flex-1" />
                            <span className="text-xs text-muted-foreground">or</span>
                            <Separator className="flex-1" />
                        </div>

                        {/* SOCIAL LOGIN */}
                        <div className="grid grid-cols-3 gap-3">
                            <OauthLoginListener>
                                <OauthLogin provider="google" label="" Icon={Google} />
                                <OauthLogin provider="facebook" label="" Icon={Facebook} />
                                <OauthLogin provider="github" label="" Icon={Github} />
                            </OauthLoginListener>
                        </div>

                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="font-medium text-black hover:underline dark:text-white">
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
