import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    change: number;
    icon: LucideIcon;
    subtext?: string;
    delay?: number;
}

export function StatsCard({ title, value, change, icon: Icon, subtext, delay = 0 }: StatsCardProps) {
    const isPositive = change >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="relative overflow-hidden rounded-2xl bg-card p-6 shadow-sm border border-border transition-all hover:-translate-y-1 hover:shadow-md hover:shadow-primary/10"
        >
            <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <Icon className="h-6 w-6" />
                </div>
                <div
                    className={`flex items-center space-x-1 rounded-full px-2.5 py-1 text-xs font-semibold ${isPositive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                >
                    <span>{isPositive ? "+" : ""}{change}%</span>
                </div>
            </div>
            <div className="mt-4">
                <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                    {value}
                </p>
                {subtext && (
                    <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
                )}
            </div>
        </motion.div>
    );
}
