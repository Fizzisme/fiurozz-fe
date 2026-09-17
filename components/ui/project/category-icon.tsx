import {
    BrainCog,
    Code,
    CreditCard,
    Folder,
    GraduationCap,
    HeartPulse,
    PlayCircle,
    ShoppingCart,
    Users,
    type LucideIcon,
    type LucideProps,
} from 'lucide-react';

// The API names category icons in kebab-case ("shopping-cart"). A component cannot be
// passed through props from a Server Component, so the name is resolved here instead.
const CATEGORY_ICONS: Record<string, LucideIcon> = {
    'shopping-cart': ShoppingCart,
    users: Users,
    'graduation-cap': GraduationCap,
    'credit-card': CreditCard,
    'heart-pulse': HeartPulse,
    'play-circle': PlayCircle,
    'brain-cog': BrainCog,
    code: Code,
};

export default function CategoryIcon({ icon, ...props }: { icon: string | null } & LucideProps) {
    const Icon = CATEGORY_ICONS[icon ?? ''] ?? Folder;

    return <Icon {...props} />;
}
