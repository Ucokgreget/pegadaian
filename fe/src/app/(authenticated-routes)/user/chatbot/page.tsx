"use client";

import Link from "next/link";

import React, { useState, useEffect } from "react";
// Removed useSession (not used in this arch)
// Removed React Query (using useEffect/useState)
import { Button } from "@/components/ui/button";
import {
  Bot,
  Settings,
  TestTube,
  Smartphone,
  MessageCircle,
  CheckCircle,
  XCircle,
  Send,
  Save,
  Loader2,
  QrCode,
} from "lucide-react";
import {
  getChatbotSettings,
  updateChatbotSettings,
  testChatbot,
  connectChatbot,
  disconnectChatbot,
} from "@/actions/chatbot";

export default function ChatbotPage() {
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [isChatbotOn, setIsChatbotOn] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    isActive: false,
    welcomeMessage: "",
    fontteToken: "",
    device: "",
    aiPrompt: "",
  });

  // Fetch settings on mount
  useEffect(() => {
    async function init() {
      try {
        const data = await getChatbotSettings();
        if (data) setSettings(data);
      } catch (e) {
        console.error("Failed to load settings", e);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

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

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateChatbotSettings(settings);
      alert("Settings updated successfully!");
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestBot = async () => {
    if (!testMessage.trim()) {
      alert("Please enter a test message");
      return;
    }

    setIsTestLoading(true);
    setTestResponse(""); // Clear previous
    try {
      const result = await testChatbot(testMessage, settings.aiPrompt);
      setTestResponse(result.response);
    } catch (error: any) {
      setTestResponse(`Test failed: ${error.message}`);
    } finally {
      setIsTestLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-slate-400">Loading chatbot settings...</p>
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
              <Bot className="mr-3 h-8 w-8 text-primary" />
              WhatsApp AI Chatbot
            </h1>
            <p className="mt-2 text-muted-foreground">
              Konfigurasi dan kelola chatbot AI untuk auto-reply WhatsApp Anda.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/user/chatbot/scan">
              <Button
                variant="outline"
                className="border-input bg-background/50 text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <QrCode className="mr-2 h-4 w-4" />
                Scan QR
              </Button>
            </Link>
            <Button
              onClick={() => setIsTestModalOpen(true)}
              variant="outline"
              className="border-input bg-background/50 text-primary hover:bg-accent hover:text-primary"
            >
              <TestTube className="mr-2 h-4 w-4" />
              Test Bot
            </Button>
            <div
              className={`flex items-center space-x-2 rounded-full px-3 py-1.5 text-sm font-medium ${settings.isActive
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}
            >
              {settings.isActive ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Active</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  <span>Inactive</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Settings Panel */}
          <div className="space-y-6 lg:col-span-2">

            {/* Message Settings */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-6 flex items-center text-lg font-semibold text-foreground">
                <MessageCircle className="mr-2 h-5 w-5 text-primary" />
                Message Settings
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Welcome Message
                  </label>
                  <textarea
                    name="welcomeMessage"
                    value={settings.welcomeMessage}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Pesan pembuka untuk customer baru"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    AI Prompt Template
                  </label>
                  <textarea
                    name="aiPrompt"
                    value={settings.aiPrompt}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Anda adalah asisten virtual yang ramah..."
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Instruksi sistem untuk AI dalam menjawab pertanyaan
                    customer.
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="bg-primary px-8 py-6 text-base font-medium text-primary-foreground hover:bg-primary/90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <span className="text-sm text-muted-foreground">Total Messages</span>
                  <span className="font-mono text-lg font-semibold text-primary">
                    0
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <span className="text-sm text-muted-foreground">AI Responses</span>
                  <span className="font-mono text-lg font-semibold text-primary">
                    0
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <span className="text-sm text-muted-foreground">Active Chats</span>
                  <span className="font-mono text-lg font-semibold text-primary">
                    0
                  </span>
                </div>
              </div>
            </div>

            {/* Setup Guide */}
            <div className="rounded-2xl bg-gradient-to-br from-card to-background p-6 shadow-lg border border-border">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Setup Guide
              </h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start space-x-3">
                  <div className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold ring-1 ring-primary/50">
                    1
                  </div>
                  <span>
                    Klik <strong>Scan QR Code</strong> diatas
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold ring-1 ring-primary/50">
                    2
                  </div>
                  <span>Scan QR Code untuk menghubungkan WhatsApp.</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold ring-1 ring-primary/50">
                    3
                  </div>
                  <span>
                    Salin <strong>Token</strong> ke form konfigurasi ini.
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold ring-1 ring-primary/50">
                    4
                  </div>
                  <span>Aktifkan Chatbot di atas.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Modal */}
        {isTestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  Test Chatbot
                </h2>
                <button
                  onClick={() => setIsTestModalOpen(false)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Test Message
                  </label>
                  <input
                    type="text"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Ketik pesan seolah-olah Anda customer..."
                  />
                </div>

                {testResponse && (
                  <div className="animate-in fade-in slide-in-from-bottom-2">
                    <label className="mb-2 block text-sm font-medium text-primary">
                      AI Response
                    </label>
                    <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
                      <p className="text-sm text-foreground">{testResponse}</p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsTestModalOpen(false)}
                    className="flex-1 border-input text-muted-foreground hover:bg-accent"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleTestBot}
                    disabled={isTestLoading}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isTestLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Test Bot
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
}
