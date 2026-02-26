import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

interface Transaction {
    id: string;
    customerName: string;
    amount: number;
    status: "Success" | "Pending" | "Failed";
    date: string;
}

interface RecentTransactionsTableProps {
    transactions: Transaction[];
}

export function RecentTransactionsTable({ transactions }: RecentTransactionsTableProps) {
    const getStatusColor = (status: Transaction["status"]) => {
        switch (status) {
            case "Success":
                return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
            case "Pending":
                return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
            case "Failed":
                return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
            default:
                return "bg-muted text-muted-foreground border-border";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="col-span-1 rounded-2xl bg-card shadow-sm border border-border lg:col-span-3 overflow-hidden"
        >
            <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
                <button className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <span>View All</span>
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-muted-foreground">
                    <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-medium">ID</th>
                            <th scope="col" className="px-6 py-4 font-medium">Customer</th>
                            <th scope="col" className="px-6 py-4 font-medium">Amount</th>
                            <th scope="col" className="px-6 py-4 font-medium">Status</th>
                            <th scope="col" className="px-6 py-4 font-medium">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {transactions.slice(0, 5).map((tx) => (
                            <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                                <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">
                                    {tx.id}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-foreground">
                                    {tx.customerName}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">
                                    Rp {tx.amount.toLocaleString()}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className={`rounded-md border px-2.5 py-1 text-xs font-medium ${getStatusColor(tx.status)}`}>
                                        {tx.status}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    {tx.date}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
