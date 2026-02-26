import { motion } from "motion/react";
import { Zap, CheckCircle2 } from "lucide-react";

interface SubscriptionCardProps {
    planName: string;
    price: number;
    renewalDate: string;
    isActive: boolean;
}

export function SubscriptionCard({ planName, price, renewalDate, isActive }: SubscriptionCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/5 to-card p-6 border border-border shadow-sm"
        >
            <div className="absolute right-0 top-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl z-0" />

            <div className="flex items-start justify-between relative z-10">
                <div>
                    <div className="flex items-center space-x-2">
                        <Zap className="h-5 w-5 text-indigo-500" />
                        <h3 className="text-lg font-semibold text-foreground">{planName} Plan</h3>
                    </div>
                    <div className="mt-4 flex items-baseline text-3xl font-bold text-foreground">
                        Rp {(price / 1000).toLocaleString()}k
                        <span className="ml-1 text-sm font-medium text-muted-foreground">/mo</span>
                    </div>
                </div>
                <div
                    className={`flex items-center space-x-1 rounded-full px-2.5 py-1 text-xs font-semibold ${isActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                >
                    {isActive ? <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> : null}
                    <span>{isActive ? "Active" : "Expired"}</span>
                </div>
            </div>

            <div className="mt-6 relative z-10">
                <p className="text-sm text-muted-foreground">
                    Renews on <span className="font-medium text-foreground">{renewalDate}</span>
                </p>
                <button className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    Upgrade Plan
                </button>
            </div>
        </motion.div>
    );
}
