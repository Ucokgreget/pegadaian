import { motion } from "motion/react";
import { Bot, Power, Clock } from "lucide-react";

interface BotStatusCardProps {
    isActive: boolean;
    lastActive: string;
}

export function BotStatusCard({ isActive, lastActive }: BotStatusCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="rounded-2xl bg-card p-6 shadow-sm border border-border"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl bg-muted border ${isActive ? 'border-emerald-500/30' : 'border-border'}`}>
                        <Bot className={`h-6 w-6 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`} />
                        {isActive && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Bot Status</h3>
                        <p className="text-lg font-semibold text-foreground">
                            {isActive ? 'Online & Running' : 'Offline'}
                        </p>
                    </div>
                </div>
                <button
                    className={`flex h-10 items-center space-x-2 rounded-xl px-4 text-sm font-semibold transition-colors ${isActive
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                        }`}
                >
                    <Power className="h-4 w-4" />
                    <span>{isActive ? 'Turn Off' : 'Turn On'}</span>
                </button>
            </div>
            <div className="mt-4 flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last active: {lastActive}</span>
            </div>
        </motion.div>
    );
}
