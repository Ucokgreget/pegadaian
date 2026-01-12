"use client";

import Link from "next/link";
import { BarChart3, Bot, Users, Send } from "lucide-react";

const features = [
  {
    title: "Analitik",
    description: "Pantau performa dan statistik pesan Anda secara real-time.",
    href: "/user/analitik",
    icon: BarChart3,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    title: "Chatbot",
    description: "Atur respons otomatis dan alur percakapan cerdas.",
    href: "/user/chatbot",
    icon: Bot,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    title: "Customers",
    description: "Kelola data pelanggan dan riwayat interaksi mereka.",
    href: "/user/customers",
    icon: Users,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    title: "WA Blast",
    description: "Kirim pesan massal ke ribuan kontak dalam sekali klik.",
    href: "/user/wa-blast",
    icon: Send,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
];

export default function UserDashboard() {
  return (
    <div className="min-h-screen w-full bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 text-slate-400">
            Selamat datang kembali! Pilih menu di bawah untuk mulai mengelola
            bisnis Anda.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-slate-700 hover:bg-slate-900 hover:shadow-lg"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg} mb-4`}
              >
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>

              <h3 className="mb-2 text-lg font-semibold text-slate-50 group-hover:text-emerald-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-400">{feature.description}</p>

              {/* Hover Effect Gradient */}
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-2xl transition-all group-hover:scale-150" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
