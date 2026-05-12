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
  HardDrive
} from "lucide-react";
import {
  getKnowledgeDocuments,
  uploadKnowledgeDocument,
} from "@/actions/knowledge";

const KnowledgePage = () => {
  const queryClient = useQueryClient();
  const token = ""; // token handled via cookies in server action usually

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    data: documents = [],
    isLoading,
    error,
  } = useQuery<any[]>({
    queryKey: ["knowledgeDocuments"],
    queryFn: async () => await getKnowledgeDocuments(token),
  });

  // Mutations
  const uploadMutation = useMutation({
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

  // Event handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      alert("Pilih file terlebih dahulu!");
      return;
    }

    const data = new FormData();
    data.append("file", selectedFile);

    uploadMutation.mutate(data);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  // Filter products based on search term
  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading knowledge documents...</p>
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
            onClick={() => setIsModalOpen(true)}
            size="lg"
            className="rounded-xl shadow-lg transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Dokumen
          </Button>
        </div>

        {/* Search and Filter */}
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

        {/* Stats Cards */}
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
                <p className="text-sm font-medium text-muted-foreground">Total Chunks</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {documents.reduce((acc, doc) => acc + (doc.totalChunks || 0), 0)}
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
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-card rounded-2xl overflow-hidden shadow-lg border border-border hover:border-primary/50 transition-all duration-300 group p-6 flex flex-col justify-between h-full"
            >
              <div>
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                  <File className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-card-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {doc.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-1">
                  Sumber: {doc.sourceType}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Jumlah Chunk: {doc.totalChunks}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                {/* Note: Delete document is not implemented yet in this snippet, you can add it later if needed */}
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
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-20 bg-card rounded-3xl border border-border dashed border-2">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {searchTerm ? "Dokumen tidak ditemukan" : "Belum ada dokumen knowledge"}
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
              {searchTerm
                ? "Coba kata kunci lain"
                : "Mulai upload dokumen (.txt, .pdf, .docx) sebagai referensi AI"}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setIsModalOpen(true)}
                size="lg"
                className="rounded-xl px-8"
              >
                <Plus className="w-5 h-5 mr-2" />
                Upload Dokumen
              </Button>
            )}
          </div>
        )}

        {/* Modal for Upload Document */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl border border-border w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">
                  Upload Dokumen Knowledge
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Dokumen akan diproses otomatis untuk digunakan oleh AI.
                </p>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Pilih Dokumen
                    </label>
                    <div className="flex gap-4 items-start">
                      <div className="flex-1">
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-input border-dashed rounded-xl cursor-pointer bg-background hover:bg-muted transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Klik untuk upload</span>
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
                    </div>
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
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-11"
                      disabled={uploadMutation.isPending}
                    >
                      {uploadMutation.isPending
                        ? "Mengupload & Memproses..."
                        : "Upload Knowledge"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgePage;
