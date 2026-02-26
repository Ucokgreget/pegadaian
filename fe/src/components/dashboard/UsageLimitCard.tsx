import { motion } from "motion/react";
import { MessageSquareWarning } from "lucide-react";

interface UsageLimitCardProps {
    monthlyLimit: number;
    used: number;
}

export function UsageLimitCard({ monthlyLimit, used }: UsageLimitCardProps) {
    const remaining = monthlyLimit - used;
    const percentage = Math.min(100, Math.round((used / monthlyLimit) * 100));
    const isWarning = percentage > 80;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="rounded-2xl bg-card p-6 shadow-sm border border-border"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Monthly Usage Limit</h3>
                    <p className="mt-1 text-2xl font-bold text-foreground">
                        {used.toLocaleString()}{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                            / {monthlyLimit.toLocaleString()} msgs
                        </span>
                    </p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-muted`}>
                    <MessageSquareWarning className={`h-5 w-5 ${isWarning ? 'text-amber-500' : 'text-blue-500'}`} />
                </div>
            </div>

            <div className="relative mt-2 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                    className={`h-full rounded-full ${isWarning ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        }`}
                />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs font-medium">
                <span className={isWarning ? "text-amber-500" : "text-muted-foreground"}>
                    {percentage}% Used
                </span>
                <span className="text-muted-foreground">
                    {remaining.toLocaleString()} remaining
                </span>
            </div>
        </motion.div>
    );
}
