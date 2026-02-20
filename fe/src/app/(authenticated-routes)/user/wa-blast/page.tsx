"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Send,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  X
} from "lucide-react";
import { getBlastMessages, createBlast, Blast } from "@/actions/wablast";

export default function WaBlastPage() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  const [blasts, setBlasts] = useState<Blast[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch blast history
  const loadBlasts = async () => {
    setIsLoading(true);
    try {
      const data = await getBlastMessages(token);
      setBlasts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBlasts();
  }, []);

  const handleCreateBlast = async () => {
    if (!message || !recipients) {
      alert("Pesan dan Tujuan harus diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      const recipientList = recipients
        .split(/\n|,/)
        .map((n) => n.trim())
        .filter((n) => n.length > 0);

      await createBlast(token, message, recipientList);

      alert("Broadcast berhasil ditambahkan!");
      setIsModalOpen(false);
      setMessage("");
      setRecipients("");
      loadBlasts(); // Refresh list
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Badge untuk status
  const statusBadge = (status: string) => {
    if (status === "PENDING")
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-500">
          <Clock className="h-3 w-3" /> Pending
        </span>
      );

    if (status === "COMPLETED")
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          <CheckCircle className="h-3 w-3" /> Selesai
        </span>
      );

    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
        <XCircle className="h-3 w-3" /> Gagal
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading broadcasts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center text-3xl font-bold text-foreground">
              <Send className="mr-3 h-8 w-8 text-primary" />
              WA Blast
            </h1>
            <p className="mt-2 text-muted-foreground">
              Kirim pesan broadcast ke banyak nomor WhatsApp sekaligus.
            </p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Buat Broadcast
          </Button>
        </div>

        {/* Table / List */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-6 flex items-center text-lg font-semibold text-foreground">
            <MessageSquare className="mr-2 h-5 w-5 text-primary" />
            Daftar Broadcast
          </h2>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-sm font-medium text-muted-foreground">
                  <th className="py-4 px-6">Pesan</th>
                  <th className="py-4 px-6 text-center">Jumlah Tujuan</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Dibuat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {blasts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-12 text-center text-muted-foreground"
                    >
                      Belum ada riwayat broadcast.
                    </td>
                  </tr>
                ) : (
                  blasts.map((item) => {
                    // Try parsing recipients if it is a string JSON, else use as is
                    let recipientCount = 0;
                    try {
                      const parsed = typeof item.recipients === 'string' ? JSON.parse(item.recipients) : item.recipients;
                      recipientCount = Array.isArray(parsed) ? parsed.length : 0;
                    } catch (e) {
                      recipientCount = 0;
                    }

                    return (
                      <tr
                        key={item.id}
                        className="transition hover:bg-muted/50"
                      >
                        <td className="max-w-md py-4 px-6">
                          <p className="truncate text-foreground">{item.message}</p>
                        </td>
                        <td className="py-4 px-6 text-center text-muted-foreground">
                          {recipientCount} nomor
                        </td>
                        <td className="py-4 px-6">{statusBadge(item.status)}</td>
                        <td className="py-4 px-6 text-right text-sm text-muted-foreground">
                          {new Date(item.createdAt).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  Buat Broadcast Baru
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Pesan Broadcast
                  </label>
                  <textarea
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tulis pesan broadcast Anda di sini..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Nomor Tujuan (pisahkan dengan ENTER atau koma)
                  </label>
                  <textarea
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono text-sm"
                    rows={6}
                    placeholder={`6281234567890\n628998887766\n628777...`}
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                  />
                </div>

                <div className="mt-6 flex space-x-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-input text-muted-foreground hover:bg-accent"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isSubmitting}
                    onClick={handleCreateBlast}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Kirim Broadcast
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
