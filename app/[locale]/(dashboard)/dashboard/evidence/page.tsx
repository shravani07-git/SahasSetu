"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FolderLock,
  Upload,
  Search,
  Filter,
  Grid,
  List,
  Lock,
  Share2,
  Download,
  Trash2,
  Eye,
  Calendar,
  FileText,
  Image,
  Mic,
  Video,
  File,
  Plus,
  MoreVertical,
  Clock,
  Shield,
  Users,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { cn } from "@/lib/utils";

interface EvidenceFile {
  id: string;
  name: string;
  type: "image" | "audio" | "video" | "document";
  size: string;
  uploadDate: string;
  incidentId?: string;
  incidentTitle?: string;
  encrypted: boolean;
  sharedWith: string[];
  accessExpiry?: string;
  complaintId?: string;
  receiptHash?: string;
  evidenceTimestamp?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getFileCategory(mimeType: string): "image" | "audio" | "video" | "document" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("video/")) return "video";
  return "document";
}

const getFileIcon = (type: string) => {
  switch (type) {
    case "image":
      return Image;
    case "audio":
      return Mic;
    case "video":
      return Video;
    case "document":
      return FileText;
    default:
      return File;
  }
};

const getFileColor = (type: string) => {
  switch (type) {
    case "image":
      return "bg-blue-100 text-blue-600";
    case "audio":
      return "bg-purple-100 text-purple-600";
    case "video":
      return "bg-pink-100 text-pink-600";
    case "document":
      return "bg-orange-100 text-orange-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export default function EvidenceVaultPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedFile, setSelectedFile] = useState<EvidenceFile | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);
  const [complaints, setComplaints] = useState<{ _id: string; caseId: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadComplaintId, setUploadComplaintId] = useState("");
  const [uploadCategory, setUploadCategory] = useState("document");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchEvidence();
    fetchComplaints();
  }, []);

  async function fetchEvidence() {
    try {
      setLoading(true);
      const res = await fetch("/api/evidence");
      if (res.ok) {
        const data = await res.json();
        const mapped: EvidenceFile[] = (data.files || []).map((e: Record<string, unknown>) => ({
          id: e._id as string,
          name: e.originalName as string || "Unknown file",
          type: getFileCategory(e.mimeType as string || "application/octet-stream"),
          size: formatFileSize(e.fileSize as number || 0),
          uploadDate: e.createdAt as string || new Date().toISOString(),
          complaintId: e.complaintId as string || undefined,
          encrypted: true,
          sharedWith: ((e.sharedWith as Array<{ entity: string }>) || []).map((s) => s.entity),
          receiptHash: e.receiptHash as string || undefined,
          evidenceTimestamp: e.evidenceTimestamp as string || undefined,
        }));
        setEvidenceFiles(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch evidence:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchComplaints() {
    try {
      const res = await fetch("/api/complaints");
      if (res.ok) {
        const data = await res.json();
        setComplaints((data.complaints || []).map((c: Record<string, string>) => ({ _id: c._id, caseId: c.caseId })));
      }
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
    }
  }

  async function handleUpload() {
    if (uploadFiles.length === 0) return;
    setUploading(true);
    try {
      for (const file of uploadFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", uploadCategory);
        if (uploadComplaintId) formData.append("complaintId", uploadComplaintId);
        await fetch("/api/evidence/upload", { method: "POST", body: formData });
      }
      setShowUploadModal(false);
      setUploadFiles([]);
      setUploadComplaintId("");
      fetchEvidence();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(fileId: string, fileName: string) {
    try {
      const res = await fetch(`/api/evidence/${fileId}/download`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Download failed:", err);
    }
  }

  const filteredFiles = evidenceFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || file.type === filterType;
    return matchesSearch && matchesType;
  });

  const stats = [
    { label: "Total Files", value: evidenceFiles.length, icon: FolderLock },
    { label: "Images", value: evidenceFiles.filter((f) => f.type === "image").length, icon: Image },
    { label: "Documents", value: evidenceFiles.filter((f) => f.type === "document").length, icon: FileText },
    { label: "Audio/Video", value: evidenceFiles.filter((f) => f.type === "audio" || f.type === "video").length, icon: Video },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FolderLock className="w-8 h-8 text-primary-600" />
            Evidence Vault
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your encrypted digital locker for sensitive documents
          </p>
        </div>
        <Button
          leftIcon={<Upload className="w-5 h-5" />}
          onClick={() => setShowUploadModal(true)}
        >
          Upload Evidence
        </Button>
      </div>

      {/* Security Banner */}
      <Card className="bg-gradient-to-r from-secondary-600 to-secondary-700 text-white border-0">
        <CardContent className="flex flex-col md:flex-row items-center gap-4 py-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-semibold">Encrypted & Verifiable Evidence</h3>
            <p className="text-sm text-secondary-100">
              Evidence is encrypted at rest with AES-256-GCM. New uploads also receive a SHA-256 integrity hash and signed timestamp receipt.
            </p>
          </div>
          <Badge className="bg-white/20 text-white border-0">
            <Lock className="w-3 h-3 mr-1" />
            AES-256 Encrypted
          </Badge>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
          />
        </div>
        <div className="flex gap-2">
          <Select
            options={[
              { value: "all", label: "All Types" },
              { value: "image", label: "Images" },
              { value: "audio", label: "Audio" },
              { value: "video", label: "Video" },
              { value: "document", label: "Documents" },
            ]}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-40"
          />
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2.5 transition-colors",
                viewMode === "grid"
                  ? "bg-primary-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2.5 transition-colors",
                viewMode === "list"
                  ? "bg-primary-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Files Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => {
            const FileIcon = getFileIcon(file.type);
            return (
              <Card key={file.id} hover className="group">
                <CardContent>
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", getFileColor(file.type))}>
                      <FileIcon className="w-6 h-6" />
                    </div>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  <h3 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
                    {file.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {file.size} • {new Date(file.uploadDate).toLocaleDateString()}
                  </p>

                  {file.incidentTitle && (
                    <Badge variant="info" size="sm" className="mb-3">
                      {file.incidentId}
                    </Badge>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Lock className="w-4 h-4 text-success" />
                      <span>Encrypted</span>
                    </div>
                    {file.receiptHash && (
                      <div className="flex items-center gap-1 text-sm text-success">
                        <CheckCircle className="w-4 h-4" />
                        <span>Signed receipt</span>
                      </div>
                    )}
                    {file.sharedWith.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{file.sharedWith.length}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedFile(file);
                        setShowShareModal(true);
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownload(file.id, file.name)}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredFiles.map((file) => {
              const FileIcon = getFileIcon(file.type);
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", getFileColor(file.type))}>
                    <FileIcon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {file.size} • {new Date(file.uploadDate).toLocaleDateString()}
                    </p>
                  </div>

                  {file.incidentId && (
                    <Badge variant="info" size="sm" className="hidden md:flex">
                      {file.incidentId}
                    </Badge>
                  )}

                  <div className="flex items-center gap-1 text-sm text-gray-500 hidden md:flex">
                    <Lock className="w-4 h-4 text-success" />
                  </div>
                  {file.receiptHash && (
                    <div className="items-center gap-1 text-sm text-success hidden md:flex" title="Cryptographic timestamp receipt present">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}

                  {file.sharedWith.length > 0 && (
                    <Badge variant="secondary" size="sm" className="hidden md:flex">
                      <Users className="w-3 h-3 mr-1" />
                      {file.sharedWith.length}
                    </Badge>
                  )}

                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(file);
                        setShowShareModal(true);
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(file.id, file.name)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-error hover:text-error">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {filteredFiles.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderLock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              No files found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Upload your first piece of evidence to get started"}
            </p>
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="w-5 h-5 mr-2" />
              Upload Evidence
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Access"
        description="Control who can view this evidence"
      >
        <div className="space-y-4">
          <Select
            label="Share with"
            options={[
              { value: "counselor", label: "My Counselor" },
              { value: "ngo", label: "NGO Representative" },
              { value: "icc", label: "Internal Complaints Committee" },
              { value: "lawyer", label: "Legal Representative" },
            ]}
            placeholder="Select recipient"
          />

          <Select
            label="Access Duration"
            options={[
              { value: "7", label: "7 days" },
              { value: "14", label: "14 days" },
              { value: "30", label: "30 days" },
              { value: "90", label: "90 days" },
            ]}
          />

          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="flex gap-3 py-3">
              <AlertCircle className="w-5 h-5 text-warning shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Access will automatically expire after the selected duration. You can revoke access at any time.
              </p>
            </CardContent>
          </Card>

          {selectedFile?.sharedWith && selectedFile.sharedWith.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currently shared with:
              </p>
              {selectedFile.sharedWith.map((person, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {person}
                  </span>
                  <Button variant="ghost" size="sm" className="text-error">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowShareModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share Access
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Evidence"
        description="Add files to your encrypted vault"
      >
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) setUploadFiles(Array.from(e.target.files));
            }}
          />
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            {uploadFiles.length > 0 ? (
              <>
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  {uploadFiles.length} file(s) selected
                </p>
                <p className="text-sm text-gray-500">
                  {uploadFiles.map((f) => f.name).join(", ")}
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  Drop files here or click to upload
                </p>
                <p className="text-sm text-gray-500">
                  Images, audio, video, or documents up to 10MB
                </p>
              </>
            )}
          </div>

          <Select
            label="File Category"
            options={[
              { value: "document", label: "Document" },
              { value: "image", label: "Image" },
              { value: "audio", label: "Audio" },
              { value: "video", label: "Video" },
              { value: "screenshot", label: "Screenshot" },
              { value: "communication", label: "Communication Record" },
            ]}
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
          />

          <Select
            label="Link to Complaint (Optional)"
            options={[
              { value: "", label: "No complaint linked" },
              ...complaints.map((c) => ({ value: c._id, label: c.caseId })),
            ]}
            value={uploadComplaintId}
            onChange={(e) => setUploadComplaintId(e.target.value)}
          />

          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="flex gap-3 py-3">
              <Shield className="w-5 h-5 text-success shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-300">
                Files are encrypted with AES-256-GCM before storage. Your data is secure.
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => { setShowUploadModal(false); setUploadFiles([]); }}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleUpload} disabled={uploadFiles.length === 0 || uploading}>
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              {uploading ? "Encrypting & Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
