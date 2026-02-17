"use client";
import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import Link from "next/link";
import {
  Settings,
  ArrowLeft,
  Loader2,
  Share2,
  Smartphone,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
import {
  getChatbotRuntime,
  getChatbotSettings,
  connectChatbot,
  disconnectChatbot,
} from "@/actions/chatbot";

export default function ScanPage() {
  const [qrString, setQrString] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("loading");
  const [settings, setSettings] = useState({
    isActive: false,
    welcomeMessage: "",
    fontteToken: "",
    device: "",
    aiPrompt: "",
  });

  const fetchQR = async () => {
    try {
      const data = await getChatbotRuntime();
      console.log(data);

      setStatus(data?.status ?? "loading");
      setQrString(data?.qr ?? "");
    } catch (error) {
      console.error("Gagal ambil QR:", error);
      setStatus("error");
    }
  };

  // Polling setiap 2 detik
  useEffect(() => {
    fetchQR(); // Ambil pertama kali

    const interval = setInterval(() => {
      fetchQR();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function init() {
      const data = await getChatbotSettings();
      setSettings(data);
    }
    init();
  }, []);


  const handleConnect = async () => {
    try {
      setIsProcessing(true);

      await connectChatbot();
      const data = await getChatbotSettings();
      setSettings(data);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsProcessing(true);

      await disconnectChatbot();
      const data = await getChatbotSettings();
      setSettings(data);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    // Checkbox special handling
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "isActive") {
      try {
        if (checked) {
          await connectChatbot();
        } else {
          await disconnectChatbot();
        }
      } catch (error: any) {
        alert(
          `Failed to ${checked ? "connect" : "disconnect"} chatbot: ${error.message}`,
        );
        // Optionally revert the state here if you want to enforce consistency
        // But for now we allow the toggle to move and just alert the error
      }
    }

    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <Link
              href="/user/chatbot"
              className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="flex items-center text-3xl font-bold text-foreground">
              <Smartphone className="mr-3 h-8 w-8 text-primary" />
              Connect WhatsApp
            </h1>
            <p className="mt-2 text-muted-foreground">
              Scan QR Code dibawah ini untuk menghubungkan bot dengan WhatsApp
              Anda.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {settings.isActive ? (
              <Button
                onClick={handleDisconnect}
                disabled={isProcessing}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground min-w-[140px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  "Disconnect"
                )}
              </Button>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={isProcessing}
                className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left: Scan Area */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="relative mb-6 flex items-center justify-center rounded-xl bg-white p-4 shadow-lg ring-4 ring-border">
              {/* QR Display Logic */}
              {status === "connected" ? (
                <div className="flex h-64 w-64 flex-col items-center justify-center text-primary">
                  <ShieldCheck className="h-24 w-24 mb-4" />
                  <p className="font-bold text-lg">Connected!</p>
                </div>
              ) : status === "scan_qr" && qrString ? (
                <div className="h-64 w-64">
                  <QRCode
                    value={qrString}
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                  />
                </div>
              ) : status === "disconnected" || status === "error" ? (
                <div className="flex h-64 w-64 flex-col items-center justify-center text-destructive">
                  <AlertCircle className="h-12 w-12 mb-2" />
                  <p className="text-center text-sm font-medium">
                    Connection Lost <br />
                    or Error
                  </p>
                </div>
              ) : (
                <div className="flex h-64 w-64 flex-col items-center justify-center text-muted-foreground animate-pulse">
                  <Loader2 className="h-10 w-10 animate-spin mb-3 text-primary" />
                  <p className="text-sm">Waiting for QR...</p>
                </div>
              )}
            </div>

            {/* Status & Action */}
            <div className="text-center space-y-4">
              <div
                className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium border ${status === "connected"
                  ? "bg-primary/10 text-primary border-primary/20"
                  : status === "disconnected" || status === "error"
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                  }`}
              >
                {status === "loading"
                  ? "Initializing..."
                  : status === "scan_qr"
                    ? "Waiting for Scan"
                    : status.toUpperCase()}
              </div>

              {/* Status Message */}
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {status === "scan_qr"
                  ? "Buka WhatsApp di HP > Menu Titik 3 > Perangkat Tertaut > Tautkan Perangkat"
                  : status === "connected"
                    ? "Bot sudah terhubung dan siap digunakan."
                    : "Pastikan server backend berjalan."}
              </p>

              {/* Disconnect Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (
                    confirm(
                      "Are you sure you want to disconnect & reset session?",
                    )
                  ) {
                    try {
                      setStatus("loading");
                      await fetch(`${API_URL}/chatbot/auth/session`, {
                        method: "DELETE",
                      });
                      // Wait a bit for server restart
                      setTimeout(() => {
                        fetchQR();
                      }, 2000);
                    } catch (e) {
                      console.error("Reset failed", e);
                      alert("Failed to reset session");
                    }
                  }
                }}
                className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                Reset Connection
              </Button>
            </div>
          </div>

          {/* Right: Instructions */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">


              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Panduan Koneksi
              </h3>
              <ul className="space-y-4">
                {[
                  { step: 1, text: "Buka aplikasi WhatsApp di HP Anda." },
                  {
                    step: 2,
                    text: "Android: Ketuk titik tiga (⋮) di pojok kanan atas. iOS: Masuk ke menu Settings.",
                  },
                  {
                    step: 3,
                    text: "Pilih menu 'Perangkat Tertaut' (Linked Devices).",
                  },
                  {
                    step: 4,
                    text: "Ketuk tombol 'Tautkan Perangkat' (Link a Device).",
                  },
                  {
                    step: 5,
                    text: "Arahkan kamera HP ke QR Code di layar ini.",
                  },
                ].map((item) => (
                  <li
                    key={item.step}
                    className="flex items-start space-x-3 text-sm text-muted-foreground"
                  >
                    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-muted text-primary text-xs font-bold border border-border">
                      {item.step}
                    </span>
                    <span className="pt-0.5">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-card border border-primary/20 p-6">
              <div className="flex items-start space-x-4">
                <Share2 className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h4 className="text-base font-medium text-primary">
                    Multi-Device Support
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Gunakan fitur Multi-Device WhatsApp agar bot tetap berjalan
                    meskipun HP Anda mati atau tidak ada internet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
