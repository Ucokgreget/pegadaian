"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Search,
  Upload,
  FileText,
  File,
  HardDrive,
  Globe,
  Link as LinkIcon,
} from "lucide-react";
import {
  getKnowledgeDocuments,
  uploadKnowledgeDocument,
  uploadKnowledgeFromUrl,
} from "@/actions/knowledge";

type ModalTab = "file" | "url";

const KnowledgePage = () => {
  const queryClient = useQueryClient();
  const token = ""; // token handled via cookies in server action

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>("file");
  const [searchTerm, setSearchTerm] = useState("");

  // --- State: Upload File ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --- State: Upload dari URL ---
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");

  // ─── Queries ────────────────────────────────────────────────────────────
  const {
    data: documents = [],
    isLoading,
    error,
  } = useQuery<any[]>({
    queryKey: ["knowledgeDocuments"],
    queryFn: async () => await getKnowledgeDocuments(token),
  });

  // ─── Mutations ───────────────────────────────────────────────────────────
  const uploadFileMutation = useMutation({
    mutationFn: (data: FormData) => uploadKnowledgeDocument(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledgeDocuments"] });
      handleCloseModal();
      alert("Dokumen berhasil diupload!");
    },
    onError: (error: any) => {
      alert(`Error: ${error.message}`);
    },
  });

  const uploadUrlMutation = useMutation({
    mutationFn: (url: string) => uploadKnowledgeFromUrl(token, url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledgeDocuments"] });
      handleCloseModal();
      alert("Website berhasil diproses sebagai knowledge!");
    },
    onError: (error: any) => {
      alert(`Error: ${error.message}`);
    },
  });

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      alert("Pilih file terlebih dahulu!");
      return;
    }

    const data = new FormData();
    data.append("file", selectedFile);

    uploadFileMutation.mutate(data);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrlInput(val);

    if (val && !val.startsWith("http://") && !val.startsWith("https://")) {
      setUrlError("URL harus diawali dengan http:// atau https://");
    } else {
      setUrlError("");
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!urlInput.trim()) {
      setUrlError("URL wajib diisi");
      return;
    }

    if (!urlInput.startsWith("http://") && !urlInput.startsWith("https://")) {
      setUrlError("URL harus diawali dengan http:// atau https://");
      return;
    }

    uploadUrlMutation.mutate(urlInput.trim());
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setUrlInput("");
    setUrlError("");
    setActiveTab("file");
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setActiveTab("file");
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const filteredDocuments = documents.filter((doc) =>
    doc.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const isAnyMutationPending =
    uploadFileMutation.isPending || uploadUrlMutation.isPending;

  // ─── Loading / Error ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Loading knowledge documents...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive mb-4">
            Error: {(error as Error).message}
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Kelola Knowledge (RAG)
            </h1>
            <p className="text-muted-foreground">
              Tambah, edit, dan kelola dokumen untuk sistem AI Anda
            </p>
          </div>
          <Button
            onClick={handleOpenModal}
            size="lg"
            className="rounded-xl shadow-lg transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Knowledge
          </Button>
        </div>

        {/* Search */}
        <div className="bg-card rounded-2xl p-6 shadow-lg border border-border mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari dokumen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                autoFocus
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 shadow-lg border border-border relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Dokumen
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {documents.length}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-lg border border-border relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Chunks
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {documents.reduce(
                    (acc, doc) => acc + (doc.totalChunks || 0),
                    0,
                  )}
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <HardDrive className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => {
            const isWebsite = doc.sourceType === "website";
            const websiteUrl = doc.metadata?.url as string | undefined;

            return (
              <div
                key={doc.id}
                className="bg-card rounded-2xl overflow-hidden shadow-lg border border-border hover:border-primary/50 transition-all duration-300 group p-6 flex flex-col justify-between h-full"
              >
                <div>
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                      isWebsite
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {isWebsite ? (
                      <Globe className="w-6 h-6" />
                    ) : (
                      <File className="w-6 h-6" />
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-card-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {doc.title}
                  </h3>

                  {/* URL link untuk dokumen website */}
                  {isWebsite && websiteUrl && (
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 hover:underline mb-2 truncate max-w-full"
                      title={websiteUrl}
                    >
                      <LinkIcon className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{websiteUrl}</span>
                    </a>
                  )}

                  <p className="text-sm text-muted-foreground mb-1">
                    Sumber:{" "}
                    <span className="font-medium">
                      {isWebsite ? "Website" : "File Upload"}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Jumlah Chunk: {doc.totalChunks}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="w-full"
                    disabled
                    title="Fitur hapus belum tersedia"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-20 bg-card rounded-3xl border border-border dashed border-2">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {searchTerm
                ? "Dokumen tidak ditemukan"
                : "Belum ada dokumen knowledge"}
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
              {searchTerm
                ? "Coba kata kunci lain"
                : "Upload dokumen (.txt, .pdf, .docx) atau tambahkan URL website sebagai referensi AI"}
            </p>
            {!searchTerm && (
              <Button
                onClick={handleOpenModal}
                size="lg"
                className="rounded-xl px-8"
              >
                <Plus className="w-5 h-5 mr-2" />
                Tambah Knowledge
              </Button>
            )}
          </div>
        )}

        {/* ─── Modal Tambah Knowledge ─────────────────────────────────────── */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl border border-border w-full max-w-lg overflow-hidden shadow-2xl">
              {/* Modal Header */}
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">
                  Tambah Knowledge
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Pilih sumber knowledge yang ingin ditambahkan ke sistem AI.
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="flex border-b border-border">
                <button
                  onClick={() => setActiveTab("file")}
                  disabled={isAnyMutationPending}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "file"
                      ? "text-primary border-b-2 border-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </button>
                <button
                  onClick={() => setActiveTab("url")}
                  disabled={isAnyMutationPending}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "url"
                      ? "text-primary border-b-2 border-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Dari URL
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {/* ── Tab: Upload File ── */}
                {activeTab === "file" && (
                  <form onSubmit={handleFileSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Pilih Dokumen
                      </label>
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-input border-dashed rounded-xl cursor-pointer bg-background hover:bg-muted transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">
                              Klik untuk upload
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            .TXT, .PDF, atau .DOCX (Wajib)
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".txt,.pdf,.docx"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>

                    {selectedFile && (
                      <div className="bg-muted p-4 rounded-xl border border-border flex items-center gap-3">
                        <FileText className="w-6 h-6 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3 pt-4 border-t border-border mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseModal}
                        className="flex-1 h-11"
                        disabled={uploadFileMutation.isPending}
                      >
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 h-11"
                        disabled={uploadFileMutation.isPending}
                      >
                        {uploadFileMutation.isPending
                          ? "Mengupload & Memproses..."
                          : "Upload Knowledge"}
                      </Button>
                    </div>
                  </form>
                )}

                {/* ── Tab: Dari URL ── */}
                {activeTab === "url" && (
                  <form onSubmit={handleUrlSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        URL Website
                      </label>
                      <div className="relative">
                        <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="url"
                          placeholder="https://example.com/halaman"
                          value={urlInput}
                          onChange={handleUrlChange}
                          disabled={uploadUrlMutation.isPending}
                          className={`w-full pl-10 pr-4 py-3 bg-background border rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
                            urlError ? "border-destructive" : "border-border"
                          }`}
                        />
                      </div>
                      {urlError && (
                        <p className="text-xs text-destructive mt-1">
                          {urlError}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Sistem akan mengambil dan memproses teks dari halaman
                        website tersebut.
                      </p>
                    </div>

                    {/* Preview URL yang dimasukkan */}
                    {urlInput &&
                      !urlError &&
                      (urlInput.startsWith("http://") ||
                        urlInput.startsWith("https://")) && (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                          <Globe className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-0.5">
                              Website yang akan diproses:
                            </p>
                            <p className="text-sm font-medium text-foreground truncate">
                              {urlInput}
                            </p>
                          </div>
                        </div>
                      )}

                    <div className="flex space-x-3 pt-4 border-t border-border mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseModal}
                        className="flex-1 h-11"
                        disabled={uploadUrlMutation.isPending}
                      >
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 h-11"
                        disabled={uploadUrlMutation.isPending || !!urlError}
                      >
                        {uploadUrlMutation.isPending ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Mengambil & memproses website...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Proses Website
                          </span>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgePage;
